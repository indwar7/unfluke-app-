/**
 * components/cryptoFundamentals/charts.tsx
 *
 * Shared chart primitives for the Crypto Fundamentals screens.
 * - SvgLineChart is re-exported from the existing fundamentals module so the
 *   crypto screens match the Indian fundamentals look exactly (no duplication).
 * - SvgBarChart is new (no bar component existed) — same SVG/theme pattern.
 */

import React from "react";
import { View, useWindowDimensions } from "react-native";
import Svg, { Line, Text as SvgText, G, Rect } from "react-native-svg";
import { useTheme } from "@/constants/ThemeContext";

// Re-export the existing line chart so crypto components import from one place.
export { SvgLineChart } from "../fundamentals/DataTabs";

// Width is derived per-render (see the note in fundamentals/DataTabs.tsx): a
// module-scope Dimensions.get() is captured once and never updates on rotation.
const CH = 200;
const CHART_H_MARGIN = 48;

export function SvgBarChart({
  data,
  width: widthProp,
  height: h = CH,
  color,
  showLabels = true,
}: {
  data: { x: string; y: number }[];
  width?: number;
  height?: number;
  color?: string;
  showLabels?: boolean;
}) {
  const { colors: c } = useTheme();
  // Must run before the early return below — hooks cannot be conditional.
  const { width: winW } = useWindowDimensions();
  const w = widthProp ?? winW - CHART_H_MARGIN;
  const barColor = color ?? c.gold;
  if (!data.length) return null;

  const padL = 60,
    padR = 16,
    padT = 16,
    padB = 40;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const vals = data.map((d) => d.y);
  const minY = Math.min(0, ...vals);
  const maxY = Math.max(...vals);
  const rangeY = maxY - minY || 1;

  const n = data.length;
  const slot = plotW / n;
  const barW = Math.max(1, slot * 0.6);
  const toY = (v: number) => padT + plotH - ((v - minY) / rangeY) * plotH;

  const yTicks = 5;
  const yStep = rangeY / yTicks;
  const xTickStep = Math.max(1, Math.floor(n / 5));

  const fmtAxis = (v: number) =>
    Math.abs(v) >= 1e9
      ? `${(v / 1e9).toFixed(0)}B`
      : Math.abs(v) >= 1e6
      ? `${(v / 1e6).toFixed(0)}M`
      : Math.abs(v) >= 1e3
      ? `${(v / 1e3).toFixed(0)}K`
      : v % 1 === 0
      ? v.toString()
      : v.toFixed(1);

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={w} height={h}>
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const yVal = minY + i * yStep;
          const py = toY(yVal);
          return (
            <G key={`grid-${i}`}>
              <Line
                x1={padL}
                y1={py}
                x2={w - padR}
                y2={py}
                stroke={c.border}
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <SvgText x={padL - 6} y={py + 3} fontSize={9} fill={c.textMuted} textAnchor="end">
                {fmtAxis(yVal)}
              </SvgText>
            </G>
          );
        })}
        {data.map((d, i) => {
          const x = padL + i * slot + (slot - barW) / 2;
          const y = toY(d.y);
          const bh = padT + plotH - y;
          return (
            <Rect
              key={`bar-${i}`}
              x={x}
              y={y}
              width={barW}
              height={Math.max(0, bh)}
              fill={barColor}
              rx={2}
            />
          );
        })}
        {showLabels &&
          data.map((d, i) => {
            if (i % xTickStep !== 0 && i !== n - 1) return null;
            return (
              <SvgText
                key={`xl-${i}`}
                x={padL + i * slot + slot / 2}
                y={h - 8}
                fontSize={9}
                fill={c.textMuted}
                textAnchor="middle"
              >
                {d.x.length > 4 ? d.x.slice(-4) : d.x}
              </SvgText>
            );
          })}
        <Line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke={c.border} strokeWidth={1} />
        <Line
          x1={padL}
          y1={padT + plotH}
          x2={w - padR}
          y2={padT + plotH}
          stroke={c.border}
          strokeWidth={1}
        />
      </Svg>
    </View>
  );
}
