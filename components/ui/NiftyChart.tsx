// Unfluke Pro — Interactive live NIFTY 50 index chart for the dashboard.
// Real candle data from backend (api/historicData/data/historicalChartIndexMinute,
// NIFTY 50 token 256265, type "index"). Touch-scrub to read any point's price,
// animated line draw, auto-refresh, light + dark. No fake data.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
  PanResponder,
  Animated,
} from "react-native";
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgGrad,
  Stop,
  Line,
  Circle,
} from "react-native-svg";
import { useSelector } from "react-redux";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react-native";
import { fetchStrategyChartData } from "@/Unfluke_helpers/backend_helper";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

const NIFTY_TOKEN = "256265";
const NIFTY_NAME = "NIFTY 50";
const REFRESH_MS = 60_000;

function formatDateToCustomFormat(date: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} ` +
    `${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`
  );
}

const TIMEFRAMES = [
  { label: "1D", resolution: "5", points: 78 },
  { label: "1W", resolution: "15", points: 130 },
  { label: "1M", resolution: "60", points: 150 },
];

type Candle = { time: number; close: number };

const AnimatedPath = Animated.createAnimatedComponent(Path);

const NiftyChart: React.FC = () => {
  const { colors: c } = useTheme();
  const s = makeStyles(c);
  const { width } = useWindowDimensions();
  const userId = useSelector((state: any) => state?.Login?.user?._id);

  const [tf, setTf] = useState(TIMEFRAMES[0]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [scrubIdx, setScrubIdx] = useState<number | null>(null);
  const mounted = useRef(true);

  const chartWidth = width - 64;
  const chartHeight = 130;

  const draw = useRef(new Animated.Value(0)).current;

  const load = useCallback(
    async (silent = false) => {
      if (!userId) return;
      if (!silent) {
        setLoading(true);
        setError(false);
      }
      try {
        const res: any = await fetchStrategyChartData(
          "api/historicData/data/historicalChartIndexMinute",
          {
            i: userId,
            e: NIFTY_TOKEN,
            currentDateTime: formatDateToCustomFormat(new Date()),
            type: "index",
            name: NIFTY_NAME,
            resolution: tf.resolution,
            nxt: false,
          }
        );
        if (!mounted.current) return;

        // Response may be a raw array of candles, or wrapped as { data: [...] }.
        const rows: any[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : [];

        if (rows.length === 0 || res?.Error) {
          console.log("[NiftyChart] empty/err response:", JSON.stringify(res)?.slice(0, 160));
          if (!silent) setError(true);
          setLoading(false);
          return;
        }

        // Candle fields: { a:time, b:low, c:high, d:open, e:close, f:vol }.
        // Be tolerant of alternative close keys just in case.
        const parsed: Candle[] = rows
          .map((el: any) => {
            const t = new Date(el.a ?? el.time ?? el.date).getTime();
            const close = Number(el.e ?? el.close ?? el.c);
            return { time: t, close };
          })
          .filter((d: Candle) => !isNaN(d.close) && !isNaN(d.time))
          .sort((a: Candle, b: Candle) => a.time - b.time);

        if (parsed.length < 2) {
          if (!silent) setError(true);
          setLoading(false);
          return;
        }

        setCandles(parsed.slice(-tf.points));
        setError(false);
        setLoading(false);
        draw.setValue(0);
        Animated.timing(draw, { toValue: 1, duration: 900, useNativeDriver: true }).start();
      } catch (err) {
        console.log("[NiftyChart] fetch error:", (err as any)?.message || err);
        if (!mounted.current) return;
        if (!silent) setError(true);
        setLoading(false);
      }
    },
    [userId, tf]
  );

  useEffect(() => {
    mounted.current = true;
    load();
    const id = setInterval(() => load(true), REFRESH_MS);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [load]);

  const geo = useMemo(() => {
    if (candles.length < 2) return null;
    const vals = candles.map((d) => d.close);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const stepX = chartWidth / (candles.length - 1);
    const pts = candles.map((d, i) => {
      const x = i * stepX;
      const y = chartHeight - ((d.close - min) / range) * (chartHeight - 16) - 8;
      return { x, y };
    });
    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const area = `${line} L${chartWidth},${chartHeight} L0,${chartHeight} Z`;
    return { pts, line, area, stepX };
  }, [candles, chartWidth]);

  const last = candles[candles.length - 1]?.close;
  const first = candles[0]?.close;
  const change = last != null && first != null ? last - first : 0;
  const changePct = first ? (change / first) * 100 : 0;
  const up = change >= 0;
  const lineColor = up ? c.profit : c.loss;

  // Touch-scrub
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => updateScrub(e.nativeEvent.locationX),
      onPanResponderMove: (e) => updateScrub(e.nativeEvent.locationX),
      onPanResponderRelease: () => setScrubIdx(null),
      onPanResponderTerminate: () => setScrubIdx(null),
    })
  ).current;

  const geoRef = useRef(geo);
  geoRef.current = geo;
  const updateScrub = (x: number) => {
    const g = geoRef.current;
    if (!g) return;
    const i = Math.max(0, Math.min(candles.length - 1, Math.round(x / g.stepX)));
    setScrubIdx(i);
  };

  const scrubPoint = scrubIdx != null && geo ? geo.pts[scrubIdx] : null;
  const scrubCandle = scrubIdx != null ? candles[scrubIdx] : null;
  const headValue = scrubCandle?.close ?? last;
  const headTime = scrubCandle?.time;

  const dashOffset = draw.interpolate({ inputRange: [0, 1], outputRange: [chartWidth * 2, 0] });

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <View style={s.titleRow}>
            <Text style={s.title}>{NIFTY_NAME}</Text>
            <View style={s.liveDot} />
            <Text style={s.liveText}>LIVE</Text>
          </View>
          <Text style={s.exchange}>NSE · INDEX</Text>
        </View>
        <TouchableOpacity onPress={() => load()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={s.refreshBtn}>
          <RefreshCw size={15} color={c.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Price (or scrubbed value) */}
      {!loading && !error && headValue != null && (
        <View style={s.priceRow}>
          <View>
            <Text style={s.price}>
              {headValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            {scrubIdx != null && headTime != null && (
              <Text style={s.scrubTime}>
                {new Date(headTime).toLocaleString("en-IN", {
                  day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                })}
              </Text>
            )}
          </View>
          {scrubIdx == null && (
            <View style={[s.changePill, { backgroundColor: up ? c.profitBg : c.lossBg }]}>
              {up ? <TrendingUp size={13} color={c.profit} /> : <TrendingDown size={13} color={c.loss} />}
              <Text style={[s.changeText, { color: lineColor }]}>
                {up ? "+" : ""}{change.toFixed(2)} ({up ? "+" : ""}{changePct.toFixed(2)}%)
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Chart */}
      <View style={[s.chartArea, { height: chartHeight }]} {...(geo ? pan.panHandlers : {})}>
        {loading ? (
          <ActivityIndicator color={c.gold} style={{ flex: 1 }} />
        ) : error ? (
          <View style={s.stateBox}>
            <Text style={s.stateText}>Couldn't load chart</Text>
            <TouchableOpacity onPress={() => load()} style={s.retryBtn}>
              <Text style={s.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : !geo ? (
          <View style={s.stateBox}>
            <Text style={s.stateText}>No data available right now</Text>
          </View>
        ) : (
          <Svg width={chartWidth} height={chartHeight}>
            <Defs>
              <SvgGrad id="niftyArea" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={lineColor} stopOpacity={0.24} />
                <Stop offset="1" stopColor={lineColor} stopOpacity={0} />
              </SvgGrad>
            </Defs>
            <Line x1="0" y1={chartHeight - 8} x2={chartWidth} y2={chartHeight - 8} stroke={c.borderLight} strokeWidth={1} />
            <Path d={geo.area} fill="url(#niftyArea)" />
            <AnimatedPath
              d={geo.line}
              fill="none"
              stroke={lineColor}
              strokeWidth={2.4}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={chartWidth * 2}
              strokeDashoffset={dashOffset as any}
            />
            {/* Scrub crosshair */}
            {scrubPoint && (
              <>
                <Line x1={scrubPoint.x} y1={0} x2={scrubPoint.x} y2={chartHeight} stroke={c.gold} strokeWidth={1} strokeDasharray="4 4" />
                <Circle cx={scrubPoint.x} cy={scrubPoint.y} r={5} fill={c.gold} stroke={c.card} strokeWidth={2} />
              </>
            )}
          </Svg>
        )}
      </View>

      {/* Timeframe selector */}
      <View style={s.tfRow}>
        {TIMEFRAMES.map((t) => {
          const active = t.label === tf.label;
          return (
            <TouchableOpacity key={t.label} onPress={() => setTf(t)} style={[s.tfChip, active && s.tfChipActive]} activeOpacity={0.85}>
              <Text style={[s.tfText, active && s.tfTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
        <View style={{ flex: 1 }} />
        <Text style={s.scrubHint}>Hold & drag to inspect</Text>
      </View>
    </View>
  );
};

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      marginBottom: 16,
    },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
    title: { fontSize: 16, fontWeight: "800", color: c.text, letterSpacing: -0.3 },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.profit },
    liveText: { fontSize: 9, fontWeight: "800", color: c.profit, letterSpacing: 0.8 },
    exchange: { fontSize: 10.5, fontWeight: "600", color: c.textMuted, marginTop: 3, letterSpacing: 0.6 },
    refreshBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: c.inputBg, alignItems: "center", justifyContent: "center" },
    priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12, marginBottom: 6, minHeight: 40 },
    price: { fontSize: 26, fontWeight: "800", color: c.text, fontVariant: ["tabular-nums"], letterSpacing: -0.5 },
    scrubTime: { fontSize: 11, color: c.gold, fontWeight: "600", marginTop: 1 },
    changePill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
    changeText: { fontSize: 12, fontWeight: "700", fontVariant: ["tabular-nums"] },
    chartArea: { marginTop: 8, justifyContent: "center" },
    stateBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
    stateText: { fontSize: 13, color: c.textMuted, fontWeight: "500" },
    retryBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999, backgroundColor: c.goldLight },
    retryText: { fontSize: 12, fontWeight: "700", color: c.gold },
    tfRow: { flexDirection: "row", gap: 8, marginTop: 14, alignItems: "center" },
    tfChip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999, backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.border },
    tfChipActive: { backgroundColor: c.gold, borderColor: c.gold },
    tfText: { fontSize: 12, fontWeight: "700", color: c.textSecondary },
    tfTextActive: { color: c.onGold },
    scrubHint: { fontSize: 10, color: c.textMuted, fontStyle: "italic" },
  });

export default NiftyChart;
