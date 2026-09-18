/**
 * components/MarketTerminal/IndexHistory.tsx
 * Index History page (spec §5): daily index OHLC + P/E, P/B, div yield,
 * vs 3-year average; 1M/3M/6M/1Y/3Y CAGR.
 *
 * Note: /indices/:name returns row.date as a full ISO timestamp
 * ("2026-08-17T00:00:00.000Z"), not a bare YYYY-MM-DD string. This screen
 * never reads row.date today (no x-axis labels), but if date labels/tooltips
 * are ever added, slice to the first 10 characters first.
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, useWindowDimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useIndexHistory } from "../../hooks/useMarketTerminal";

const INDEX_NAME = "NIFTY 50";
// /nse/indices/:name caps ranges at 400 days (RANGE_TOO_LARGE past that) —
// "Max" replaces "3Y" since the backend can't actually serve 3 years in one call.
const RANGES = [
  { key: "1M", days: 30 }, { key: "3M", days: 90 }, { key: "6M", days: 180 },
  { key: "1Y", days: 365 }, { key: "Max", days: 400 },
] as const;

function hexToRgba(hex: string, opacity = 1) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((ch) => ch + ch).join("") : clean;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
function daysAgoIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function IndexHistory() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const { width: screenWidth } = useWindowDimensions();
  const [range, setRange] = useState<typeof RANGES[number]["key"]>("1Y");
  const activeRange = RANGES.find((r) => r.key === range)!;

  const history = useIndexHistory(INDEX_NAME, daysAgoIso(activeRange.days), new Date().toISOString().slice(0, 10));
  const rows: any[] = Array.isArray(history.data) ? history.data : Array.isArray(history.data?.rows) ? history.data.rows : [];
  const latest = rows[rows.length - 1];

  const cagr = (() => {
    if (rows.length < 2) return null;
    const first = rows[0]?.close, last = rows[rows.length - 1]?.close;
    if (!first || !last) return null;
    const years = activeRange.days / 365;
    return (Math.pow(last / first, 1 / years) - 1) * 100;
  })();

  const chartConfig = {
    backgroundColor: c.card, backgroundGradientFrom: c.card, backgroundGradientTo: c.card,
    decimalPlaces: 0, color: (o = 1) => hexToRgba(c.gold, o),
    labelColor: (o = 1) => hexToRgba(c.textSecondary, o),
    style: { borderRadius: 16 },
    propsForDots: { r: "0", strokeWidth: "0" },
    propsForBackgroundLines: { strokeWidth: 1, stroke: c.border, strokeDasharray: "0" },
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Index History</Text>
      <Text style={styles.note}>{INDEX_NAME}</Text>

      <View style={styles.rangeRow}>
        {RANGES.map((r) => (
          <TouchableOpacity key={r.key} style={[styles.rangeChip, range === r.key && styles.rangeChipActive]} onPress={() => setRange(r.key)}>
            <Text style={[styles.rangeText, range === r.key && styles.rangeTextActive]}>{r.key}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {history.isLoading && <ActivityIndicator color={c.gold} style={{ paddingVertical: 40 }} />}
      {history.isError && <Text style={styles.errorText}>Couldn't load index history.</Text>}
      {!history.isLoading && !history.isError && rows.length <= 1 && (
        <Text style={styles.errorText}>No history for this range.</Text>
      )}

      {!history.isLoading && rows.length > 1 && (
        <LineChart
          data={{ labels: [], datasets: [{ data: rows.map((r) => r.close) }] }}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withDots={false}
          withHorizontalLabels
          withVerticalLabels={false}
          withInnerLines
          withOuterLines={false}
          fromZero={false}
        />
      )}

      {latest && (
        <View style={styles.statsCard}>
          <StatRow label="P/E" value={latest?.pe} c={c} />
          <StatRow label="P/B" value={latest?.pb} c={c} />
          <StatRow label="Div Yield" value={latest?.divYield != null ? `${latest.divYield}%` : undefined} c={c} />
          <StatRow label={`${range} CAGR`} value={cagr != null ? `${cagr.toFixed(2)}%` : undefined} c={c} />
        </View>
      )}
    </View>
  );
}

function StatRow({ label, value, c }: { label: string; value: any; c: AppColors }) {
  const styles = makeStyles(c);
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value ?? "—"}</Text>
    </View>
  );
}

const makeStyles = (c: AppColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background, padding: 16 },
  heading: { fontSize: 22, fontWeight: "700", color: c.text, marginBottom: 2 },
  note: { fontSize: 12, color: c.textMuted, marginBottom: 14 },
  rangeRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  rangeChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: c.surfaceElevated, borderWidth: 1, borderColor: c.border },
  rangeChipActive: { backgroundColor: c.goldLight, borderColor: c.gold },
  rangeText: { color: c.textSecondary, fontSize: 12.5, fontWeight: "600" },
  rangeTextActive: { color: c.gold },
  chart: { borderRadius: 16 },
  errorText: { color: c.loss, fontSize: 13, paddingVertical: 20, textAlign: "center" },
  statsCard: { backgroundColor: c.surface, borderRadius: 12, borderWidth: 1, borderColor: c.border, padding: 14, marginTop: 14 },
  statRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  statLabel: { fontSize: 13, color: c.textSecondary },
  statValue: { fontSize: 13, fontWeight: "700", color: c.text },
});
