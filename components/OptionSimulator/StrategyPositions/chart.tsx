import React, { useEffect, useRef, useState } from "react";
import { postPayOffChartData } from "../../../Unfluke_helpers/backend_helper";
import { createSelector } from "reselect";
import { useSelector } from "react-redux";
import { useTheme } from "@/constants/ThemeContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Utility to split PnL values into positive/negative
function splitPositiveNegative(data) {
  return data.map((d) => ({
    price: d.price,
    pnl: d.pnl,
    posPnl: d.pnl > 0 ? d.pnl : null,
    negPnl: d.pnl < 0 ? d.pnl : null,
  }));
}

const PayoffChart = ({
  selectedInstrument,
  currentPrice,
  positions,
  updatePNLData,
}) => {
  const { colors: c, isDark } = useTheme();
  const [plData, setPlData] = useState([]);
  const [xDomain, setXDomain] = useState([null, null]);
  const [initialDomain, setInitialDomain] = useState([null, null]);
  const chartRef = useRef(null);
  const panState = useRef({ dragging: false, startX: null, startDomain: null });

  const colors = {
    grid: c.border,
    axis: c.textSecondary,
    label: c.text,
    tooltipBg: c.surfaceElevated,
    tooltipText: c.text,
    background: c.card,
  };

  const selectDashboardData = createSelector(
    (state) => state.Layout,
    (state) => ({ layoutMode: state.layoutModeType })
  );
  const { layoutMode } = useSelector(selectDashboardData);

  useEffect(() => {
    const minPrice = parseInt(currentPrice - selectedInstrument.multiple * 45);
    const maxPrice = parseInt(currentPrice + selectedInstrument.multiple * 45);

    const fetchChartData = async () => {
      try {
        const data = await postPayOffChartData({
          minPrice,
          maxPrice,
          optionsPositions: positions.filter((x) => x.isActive),
        });

        let maxProfit = 0;
        let maxLoss = 0;
        let breakevensList = [];

        if (data) {
          const lotSize = positions[0]?.lotSize ?? 0;
          const prepared = data.map((item) => {
            if (item.totalPayoff <= lotSize && item.totalPayoff > 0) {
              breakevensList.push(item.price);
            }
            maxProfit = Math.max(maxProfit, item.totalPayoff);
            maxLoss = Math.min(maxLoss, item.totalPayoff);
            return { price: item.price, pnl: item.totalPayoff };
          });

          setPlData(prepared);
          updatePNLData(maxLoss, maxProfit, breakevensList);
        }
      } catch (err) {
        console.error("PayoffChart fetch error:", err);
      }
    };

    if (positions.length > 0) fetchChartData();
  }, [positions, currentPrice]);

  useEffect(() => {
    if (plData.length > 1) {
      const min = plData[0].price;
      const max = plData[plData.length - 1].price;
      setXDomain([min, max]);
      setInitialDomain([min, max]);
    }
  }, [plData]);

  const onMouseDown = (e) => {
    if (!plData.length) return;
    panState.current.dragging = true;
    panState.current.startX = e.clientX;
    panState.current.startDomain = [...xDomain];
    document.body.style.cursor = "grabbing";
  };

  const onMouseMove = (e) => {
    if (!panState.current.dragging) return;
    const dx = e.clientX - panState.current.startX;
    const [min, max] = panState.current.startDomain;
    const width = chartRef.current?.offsetWidth || 1;
    const perPixel = (max - min) / width;
    const shift = -dx * perPixel;
    setXDomain([min + shift, max + shift]);
  };

  const onMouseUp = () => {
    panState.current.dragging = false;
    document.body.style.cursor = "";
  };

  const onWheel = (e) => {
    if (!plData.length) return;
    e.preventDefault();
    const [min, max] = xDomain;
    const mouseX = e.clientX - (chartRef.current?.getBoundingClientRect().left || 0);
    const width = chartRef.current?.offsetWidth || 1;
    const rel = mouseX / width;
    const range = max - min;
    const factor = e.deltaY < 0 ? 0.8 : 1.25;
    const newRange = Math.max(range * factor, 1);
    const center = min + rel * range;
    let newMin = center - rel * newRange;
    let newMax = center + (1 - rel) * newRange;
    const dataMin = plData[0].price;
    const dataMax = plData[plData.length - 1].price;
    if (newMin < dataMin) {
      newMax += dataMin - newMin;
      newMin = dataMin;
    }
    if (newMax > dataMax) {
      newMin -= newMax - dataMax;
      newMax = dataMax;
    }
    setXDomain([Math.max(dataMin, newMin), Math.min(dataMax, newMax)]);
  };

  const handleResetZoom = () => {
    setXDomain(initialDomain);
  };

  useEffect(() => {
    const node = chartRef.current;
    if (!node) return;
    node.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      node.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      node.removeEventListener("wheel", onWheel);
    };
  }, [xDomain]);

  const processedData = splitPositiveNegative(plData);

  return (
    <div className="p-6 sm:p-8 border rounded-lg" style={{ backgroundColor: c.card, borderColor: c.border, color: c.text }}>
      <button
        className="mb-3 px-4 py-1.5 text-sm font-semibold rounded-md float-right"
        style={{ backgroundColor: c.gold, color: c.onGold, border: 'none' }}
        onClick={handleResetZoom}
      >
        Reset Zoom
      </button>
      <div
        className="h-64 sm:h-80 lg:h-96 mb-4 select-none"
        ref={chartRef}
        style={{ cursor: panState.current.dragging ? "grabbing" : "grab" }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={processedData}>
            <CartesianGrid strokeDasharray="4 4" stroke={colors.grid}   />
            <XAxis
              dataKey="price"
              type="number"
              domain={xDomain[0] !== null && xDomain[1] !== null ? xDomain : undefined}
              stroke={colors.axis}
              ticks={
                processedData.length > 10
                  ? processedData
                      .filter((_, i) => i % Math.floor(processedData.length / 10) === 0)
                      .map((d) => d.price)
                  : processedData.map((d) => d.price)
              }
              axisLine={{ stroke: colors.grid }}
              tickLine={{ stroke: colors.grid }}
              tick={{ fill: colors.axis, fontSize: 14, fontWeight: 600, fontFamily: "Inter, sans-serif" }}
              label={{
                value: "Price",
                position: "insideBottom",
                offset: -5,
                fill: colors.label,
                fontSize: 16,
                fontWeight: 700,
              }}
              padding={{ left: 15, right: 15 }}
            />
            <YAxis
              stroke={colors.axis}
              axisLine={{ stroke: colors.grid }}
              tickLine={{ stroke: colors.grid }}
              tick={{ fill: colors.axis, fontSize: 14, fontWeight: 600, fontFamily: "Inter, sans-serif" }}
              padding={{ top: 15, bottom: 15 }}
              label={{
                value: "P&L",
                angle: -90,
                position: "insideLeft",
                offset: 10,
                fill: colors.label,
                fontSize: 16,
                fontWeight: 700,
              }}
            />
            <Tooltip
              formatter={(val) => [`₹${val?.toLocaleString?.() || val}`, "P&L"]}
              labelFormatter={(label) => `Price: ₹${label}`}
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                border: `1px solid ${colors.grid}`,
                color: colors.tooltipText,
                borderRadius: "6px",
              }}
            />
            <Area
              type="monotone"
              dataKey="posPnl"
              stroke={c.profit}
              fill="url(#gradientGreen)"
              strokeWidth={2}
              connectNulls
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="negPnl"
              stroke={c.loss}
              fill="url(#gradientRed)"
              strokeWidth={2}
              connectNulls
              isAnimationActive={false}
            />
            <defs>
              <linearGradient id="gradientGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c.profit} stopOpacity={0.3} />
                <stop offset="100%" stopColor={c.profit} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c.loss} stopOpacity={0.3} />
                <stop offset="100%" stopColor={c.loss} stopOpacity={0} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PayoffChart;
