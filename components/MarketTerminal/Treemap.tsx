/**
 * components/MarketTerminal/Treemap.tsx
 *
 * Minimal SVG treemap — no heatmap/treemap component existed anywhere in the
 * app before this (confirmed by grep). Uses a simple "squarified-ish" slice
 * layout: sort by weight descending, lay out in rows that best match the
 * available width, sized by `weight`, colored by `pctChange` via the same
 * diverging-domain approach as the web terminal's theme.js#HEATMAP scale
 * (spec §4.5) — reimplemented locally rather than shared, since no shared
 * theme module exists between the web and mobile repos.
 */

import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";
import type { AppColors } from "@/constants/Colors";

export type TreemapCell = { symbol: string; weight: number; pctChange: number };

type LaidOutCell = TreemapCell & { x: number; y: number; w: number; h: number };

// 7-stop diverging red→grey→green, domain configurable per periodicity (§4.5).
function heatColor(pct: number, domain: number, isDark: boolean): string {
  const clamped = Math.max(-domain, Math.min(domain, pct));
  const t = clamped / domain; // -1..1
  const neutral = isDark ? [42, 45, 51] : [230, 232, 236];
  const red = isDark ? [242, 97, 87] : [224, 72, 59];
  const green = isDark ? [45, 212, 160] : [14, 158, 110];
  const mix = (a: number[], b: number[], f: number) => a.map((v, i) => Math.round(v + (b[i] - v) * f));
  const [r, g, b] = t < 0 ? mix(neutral, red, -t) : mix(neutral, green, t);
  return `rgb(${r},${g},${b})`;
}

// Simple row-based squarify: sort desc by weight, greedily fill rows.
function layout(cells: TreemapCell[], width: number, height: number): LaidOutCell[] {
  const sorted = [...cells].sort((a, b) => b.weight - a.weight);
  const total = sorted.reduce((s, c) => s + Math.max(c.weight, 0.0001), 0) || 1;
  const rows: TreemapCell[][] = [];
  let cur: TreemapCell[] = [];
  let curSum = 0;
  const targetRowSum = total / Math.max(1, Math.ceil(Math.sqrt(sorted.length)));
  for (const cell of sorted) {
    cur.push(cell);
    curSum += cell.weight;
    if (curSum >= targetRowSum && cur.length > 0) {
      rows.push(cur);
      cur = [];
      curSum = 0;
    }
  }
  if (cur.length) rows.push(cur);

  const out: LaidOutCell[] = [];
  let y = 0;
  for (const row of rows) {
    const rowWeight = row.reduce((s, c) => s + c.weight, 0);
    const rowHeight = (rowWeight / total) * height;
    let x = 0;
    for (const cell of row) {
      const w = (cell.weight / rowWeight) * width;
      out.push({ ...cell, x, y, w, h: rowHeight });
      x += w;
    }
    y += rowHeight;
  }
  return out;
}

export function Treemap({
  cells, c, isDark, domain = 6, width = 340, height = 340,
}: {
  cells: TreemapCell[];
  c: AppColors;
  isDark: boolean;
  domain?: number; // ± pct at full color saturation (weekly ±6, monthly ±12, yearly ±35 per spec §4.5)
  width?: number;
  height?: number;
}) {
  const laid = useMemo(() => layout(cells, width, height), [cells, width, height]);

  if (!cells.length) {
    return <Text style={{ color: c.textMuted, fontSize: 13, paddingVertical: 20 }}>No data to display.</Text>;
  }

  return (
    <View style={styles.wrap}>
      <Svg width={width} height={height}>
        {laid.map((cell) => (
          <React.Fragment key={cell.symbol}>
            <Rect
              x={cell.x} y={cell.y} width={Math.max(cell.w - 1, 0)} height={Math.max(cell.h - 1, 0)}
              fill={heatColor(cell.pctChange, domain, isDark)}
              stroke={c.background}
              strokeWidth={1}
            />
            {cell.w > 26 && cell.h > 16 && (
              <SvgText
                x={cell.x + cell.w / 2} y={cell.y + cell.h / 2}
                fontSize={cell.w > 40 && cell.h > 24 ? 11 : 8} fontWeight="700" fill={isDark ? "#fff" : "#111"}
                textAnchor="middle" alignmentBaseline="middle"
              >
                {cell.symbol}
              </SvgText>
            )}
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
});
