/**
 * components/MarketTerminal/PcrMaxPain.tsx
 *
 * PCR & Max Pain page (spec §5, Derivatives) — the one genuinely new
 * backend capability (§2.1's /pcr/:symbol, computed nightly from stored
 * minute option data). Intraday (minute, one day) + History (1M/3M/6M/1Y)
 * tabs. Client-side closed-day fallback lives in hooks/useMarketTerminal's
 * usePcr (spec §4.3 — the backend has none for this endpoint).
 *
 * Chart: chart-kit LineChart with two overlaid datasets (all-expiries PCR +
 * near-expiry PCR), matching the web terminal's area+line overlay described
 * in spec §5. chart-kit has no native horizontal reference-line primitive,
 * so the "reference line at 1.0" from the spec is approximated with a
 * flat third dataset rather than a real annotation layer.
 * Max Pain is fetched but not yet rendered — mirrors the web terminal's own
 * current state ("Max Pain chart/columns currently hidden", spec §5).
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, useWindowDimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { usePcr, usePcrHistory } from "../../hooks/useMarketTerminal";
import { MarketDatePicker } from "./MarketDatePicker";

const SYMBOL = "NIFTY";
const RANGES: { key: "1M" | "3M" | "6M" | "1Y"; label: string; days: number }[] = [
  { key: "1M", label: "1M", days: 30 },
  { key: "3M", label: "3M", days: 90 },
  { key: "6M", label: "6M", days: 180 },
  { key: "1Y", label: "1Y", days: 365 },
];

function hexToRgba(hex: string, opacity = 1) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((ch) => ch + ch).join("") : clean;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
function daysAgoIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function PcrMaxPain() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState<"intraday" | "history">("intraday");
  const [date, setDate] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<typeof RANGES[number]["key"]>("1M");

  const intraday = usePcr(SYMBOL, date ?? todayIso());
  const activeRange = RANGES.find((r) => r.key === range)!;
  const history = usePcrHistory(SYMBOL, daysAgoIso(activeRange.days), todayIso());

  const chartConfig = {
    backgroundColor: c.card,
    backgroundGradientFrom: c.card,
    backgroundGradientTo: c.card,
    decimalPlaces: 3,
    color: (opacity = 1) => hexToRgba(c.gold, opacity),
    labelColor: (opacity = 1) => hexToRgba(c.textSecondary, opacity),
    style: { borderRadius: 16 },
    propsForDots: { r: "0", strokeWidth: "0" },
    propsForBackgroundLines: { strokeWidth: 1, stroke: c.border, strokeDasharray: "0" },
    propsForLabels: { fontSize: 9, fontWeight: "500" as const },
  };

  const intradayMinutes: any[] = Array.isArray(intraday.data?.minutes) ? intraday.data.minutes : [];
  const historyRows: any[] = Array.isArray(history.data?.rows) ? history.data.rows : [];

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>PCR & Max Pain</Text>
      <Text style={styles.note}>{SYMBOL} — put/call OI ratio (all expiries + near expiry)</Text>

      <View style={styles.modeRow}>
        <TouchableOpacity style={[styles.modeTab, mode === "intraday" && styles.modeTabActive]} onPress={() => setMode("intraday")}>
          <Text style={[styles.modeText, mode === "intraday" && styles.modeTextActive]}>Intraday</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.modeTab, mode === "history" && styles.modeTabActive]} onPress={() => setMode("history")}>
          <Text style={[styles.modeText, mode === "history" && styles.modeTextActive]}>History</Text>
        </TouchableOpacity>
      </View>

      {mode === "intraday" ? (
        <ScrollView contentContainerStyle={styles.content}>
          <MarketDatePicker date={date} onChange={setDate} />
          {intraday.data?.moved && (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>
                No PCR data for the requested day — showing the nearest earlier day with data.
              </Text>
            </View>
          )}

          {intraday.isLoading && <ActivityIndicator color={c.gold} style={{ paddingVertical: 40 }} />}
          {intraday.isError && <Text style={styles.errorText}>No PCR data found in the last 20 days.</Text>}

          {intradayMinutes.length > 0 && (
            <LineChart
              data={{
                labels: intradayMinutes.filter((_, i) => i % 30 === 0).map((m) => m.t),
                datasets: [
                  { data: intradayMinutes.map((m) => m.pcr), color: (o = 1) => hexToRgba(c.gold, o) },
                  { data: intradayMinutes.map((m) => m.near?.pcr ?? m.pcr), color: (o = 1) => hexToRgba(c.profit, o) },
                ],
              }}
              width={width - 32}
              height={260}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withDots={false}
              withInnerLines
              withOuterLines={false}
              fromZero={false}
            />
          )}

          {intraday.data?.close && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Close ({intraday.data.close.t})</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>PCR (all expiries)</Text>
                <Text style={styles.summaryValue}>{intraday.data.close.pcr}</Text>
              </View>
              {intraday.data.close.near && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Near-expiry PCR</Text>
                  <Text style={styles.summaryValue}>{intraday.data.close.near.pcr}</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.rangeRow}>
            {RANGES.map((r) => (
              <TouchableOpacity key={r.key} style={[styles.rangeChip, range === r.key && styles.rangeChipActive]} onPress={() => setRange(r.key)}>
                <Text style={[styles.rangeText, range === r.key && styles.rangeTextActive]}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {history.isLoading && <ActivityIndicator color={c.gold} style={{ paddingVertical: 40 }} />}
          {history.isError && <Text style={styles.errorText}>Couldn't load PCR history.</Text>}
          {!history.isLoading && historyRows.length === 0 && <Text style={styles.empty}>No PCR history for this range.</Text>}

          {historyRows.length > 0 && (
            <LineChart
              data={{
                labels: historyRows.filter((_, i) => i % Math.max(1, Math.floor(historyRows.length / 8)) === 0).map((r) => r.date?.slice(5)),
                datasets: [
                  { data: historyRows.map((r) => r.pcr), color: (o = 1) => hexToRgba(c.gold, o) },
                  { data: historyRows.map((r) => r.near?.pcr ?? r.nearPcr ?? r.pcr), color: (o = 1) => hexToRgba(c.profit, o) },
                ],
              }}
              width={width - 32}
              height={260}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withDots={false}
              withInnerLines
              withOuterLines={false}
              fromZero={false}
            />
          )}
        </ScrollView>
      )}
    </View>
  );
}

const makeStyles = (c: AppColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background, padding: 16 },
  heading: { fontSize: 22, fontWeight: "700", color: c.text, marginBottom: 4 },
  note: { fontSize: 12, color: c.textMuted, marginBottom: 14 },
  modeRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  modeTab: {
    flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 10,
    backgroundColor: c.surfaceElevated, borderWidth: 1, borderColor: c.border,
  },
  modeTabActive: { backgroundColor: c.goldLight, borderColor: c.gold },
  modeText: { color: c.textSecondary, fontSize: 13, fontWeight: "700" },
  modeTextActive: { color: c.gold },
  content: { paddingBottom: 30 },
  chart: { borderRadius: 16, marginVertical: 8 },
  notice: { backgroundColor: c.warningLight, borderRadius: 8, padding: 10, marginBottom: 12 },
  noticeText: { color: c.warning, fontSize: 12 },
  errorText: { color: c.loss, fontSize: 13, paddingVertical: 20, textAlign: "center" },
  empty: { color: c.textMuted, fontSize: 13, paddingVertical: 20, textAlign: "center" },
  summaryCard: {
    backgroundColor: c.surface, borderRadius: 12, borderWidth: 1, borderColor: c.border,
    padding: 14, marginTop: 8,
  },
  summaryTitle: { fontSize: 13, fontWeight: "700", color: c.textSecondary, marginBottom: 8 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  summaryLabel: { fontSize: 13, color: c.text },
  summaryValue: { fontSize: 13, fontWeight: "700", color: c.gold },
  rangeRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  rangeChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16,
    backgroundColor: c.surfaceElevated, borderWidth: 1, borderColor: c.border,
  },
  rangeChipActive: { backgroundColor: c.goldLight, borderColor: c.gold },
  rangeText: { color: c.textSecondary, fontSize: 12.5, fontWeight: "600" },
  rangeTextActive: { color: c.gold },
});
