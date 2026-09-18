/**
 * components/MarketTerminal/ReturnsHeatmap.tsx
 *
 * Returns Heatmap page (spec §5): 4 fixed symbols (sensex/gold/nifty/
 * banknifty), Weekly/Monthly/Yearly tabs — Monthly/Yearly are the weekly
 * bars re-bucketed client-side (last week's close per month/year), per spec
 * — no separate monthly/yearly endpoint exists. Calls /api/v2/historical
 * /weekly[/:symbol] ONLY, per the spec's explicit product-owner requirement
 * ("nothing invented, app data only", §5) — no other endpoint, no
 * server-side computation.
 *
 * Grid: years × months (weekly/monthly tabs bucket into a month cell each;
 * yearly tab is a single-row years strip) — a simplified read of the web
 * terminal's 3-grid layout (years×months, years×weeks, years strip), since
 * a years×weeks grid doesn't fit a phone width usefully.
 */

import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useWeeklyInstrument } from "../../hooks/useMarketTerminal";
import type { WeeklySymbol } from "../../api/marketTerminal";

const SYMBOLS: { key: WeeklySymbol; label: string }[] = [
  { key: "nifty", label: "Nifty" },
  { key: "banknifty", label: "BankNifty" },
  { key: "sensex", label: "Sensex" },
  { key: "gold", label: "Gold" },
];

type Periodicity = "weekly" | "monthly" | "yearly";
const DOMAIN: Record<Periodicity, number> = { weekly: 6, monthly: 12, yearly: 35 };
const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function heatColor(pct: number, domain: number, isDark: boolean): string {
  const clamped = Math.max(-domain, Math.min(domain, pct));
  const t = clamped / domain;
  const neutral = isDark ? [42, 45, 51] : [230, 232, 236];
  const red = isDark ? [242, 97, 87] : [224, 72, 59];
  const green = isDark ? [45, 212, 160] : [14, 158, 110];
  const mix = (a: number[], b: number[], f: number) => a.map((v, i) => Math.round(v + (b[i] - v) * f));
  const [r, g, b] = t < 0 ? mix(neutral, red, -t) : mix(neutral, green, t);
  return `rgb(${r},${g},${b})`;
}

// Re-bucket weekly rows into month/year cells using the last week's close per bucket.
// weekStart/open/close/changePct field names are not independently confirmed
// against a real payload — guard against a wrong/missing field producing an
// Invalid Date or NaN, so a bad row is skipped rather than corrupting the cell.
function bucket(rows: any[], periodicity: Periodicity): { key: string; year: number; month?: number; changePct: number }[] {
  if (periodicity === "weekly") {
    return rows
      .map((r) => {
        const d = new Date(r.weekStart);
        if (isNaN(d.getTime()) || typeof r.changePct !== "number") return null;
        return { key: r.weekStart, year: d.getFullYear(), month: d.getMonth(), changePct: r.changePct };
      })
      .filter((c): c is { key: string; year: number; month: number; changePct: number } => c !== null);
  }
  const groups = new Map<string, any[]>();
  for (const r of rows) {
    const d = new Date(r.weekStart);
    if (isNaN(d.getTime())) continue;
    const key = periodicity === "monthly" ? `${d.getFullYear()}-${d.getMonth()}` : `${d.getFullYear()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }
  const out: { key: string; year: number; month?: number; changePct: number }[] = [];
  for (const [key, group] of groups) {
    const sorted = [...group].sort((a, b) => String(a.weekStart).localeCompare(String(b.weekStart)));
    const first = sorted[0]?.open, last = sorted[sorted.length - 1]?.close;
    if (typeof first !== "number" || typeof last !== "number" || first === 0) continue;
    const changePct = ((last - first) / first) * 100;
    const [year, month] = key.split("-").map(Number);
    out.push({ key, year, month: periodicity === "monthly" ? month : undefined, changePct });
  }
  return out;
}

export default function ReturnsHeatmap() {
  const { colors: c, isDark } = useTheme();
  const styles = makeStyles(c, isDark);
  const [symbol, setSymbol] = useState<WeeklySymbol>("nifty");
  const [periodicity, setPeriodicity] = useState<Periodicity>("monthly");

  const weekly = useWeeklyInstrument(symbol, undefined, undefined, 2000);
  const rows: any[] = Array.isArray(weekly.data?.rows) ? weekly.data.rows : [];
  const cells = useMemo(() => bucket(rows, periodicity), [rows, periodicity]);

  const years = useMemo(() => Array.from(new Set(cells.map((cell) => cell.year))).sort((a, b) => b - a), [cells]);

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Returns Heatmap</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={styles.chipRowContent}>
        {SYMBOLS.map((s) => (
          <TouchableOpacity key={s.key} style={[styles.chip, symbol === s.key && styles.chipActive]} onPress={() => setSymbol(s.key)}>
            <Text style={[styles.chipText, symbol === s.key && styles.chipTextActive]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.periodRow}>
        {(["weekly", "monthly", "yearly"] as Periodicity[]).map((p) => (
          <TouchableOpacity key={p} style={[styles.periodTab, periodicity === p && styles.periodTabActive]} onPress={() => setPeriodicity(p)}>
            <Text style={[styles.periodText, periodicity === p && styles.periodTextActive]}>{p[0].toUpperCase() + p.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {weekly.isLoading && <ActivityIndicator color={c.gold} style={{ paddingVertical: 40 }} />}
      {weekly.isError && <Text style={styles.errorText}>Couldn't load weekly data.</Text>}

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {periodicity === "yearly" ? (
          <View style={styles.yearStrip}>
            {cells.sort((a, b) => a.year - b.year).map((cell) => (
              <View key={cell.key} style={[styles.yearCell, { backgroundColor: heatColor(cell.changePct, DOMAIN.yearly, isDark) }]}>
                <Text style={styles.yearCellLabel}>{cell.year}</Text>
                <Text style={styles.yearCellPct}>{cell.changePct >= 0 ? "+" : ""}{cell.changePct.toFixed(1)}%</Text>
              </View>
            ))}
          </View>
        ) : (
          years.map((year) => {
            const yearCells = cells.filter((cell) => cell.year === year);
            return (
              <View key={year} style={styles.yearRow}>
                <Text style={styles.yearRowLabel}>{year}</Text>
                <View style={styles.monthGrid}>
                  {periodicity === "monthly"
                    ? MONTH_ABBR.map((label, m) => {
                        const cell = yearCells.find((cc) => cc.month === m);
                        return (
                          <View key={m} style={[styles.monthCell, { backgroundColor: cell ? heatColor(cell.changePct, DOMAIN.monthly, isDark) : c.surfaceElevated }]}>
                            <Text style={styles.monthCellLabel}>{label}</Text>
                            {cell && <Text style={styles.monthCellPct}>{cell.changePct >= 0 ? "+" : ""}{cell.changePct.toFixed(1)}%</Text>}
                          </View>
                        );
                      })
                    : yearCells.map((cell) => (
                        <View key={cell.key} style={[styles.weekCell, { backgroundColor: heatColor(cell.changePct, DOMAIN.weekly, isDark) }]} />
                      ))}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: AppColors, isDark: boolean) => {
  const heatLabelColor = isDark ? "#fff" : "#111"; // sits on a computed heat cell, not a theme surface — mirrors Treemap.tsx
  return StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background, padding: 16 },
  heading: { fontSize: 22, fontWeight: "700", color: c.text, marginBottom: 14 },
  chipRow: { flexGrow: 0, marginBottom: 10 },
  chipRowContent: { gap: 8, paddingRight: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: c.surfaceElevated, borderWidth: 1, borderColor: c.border },
  chipActive: { backgroundColor: c.goldLight, borderColor: c.gold },
  chipText: { color: c.textSecondary, fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: c.gold },
  periodRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  periodTab: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 10, backgroundColor: c.surfaceElevated, borderWidth: 1, borderColor: c.border },
  periodTabActive: { backgroundColor: c.goldLight, borderColor: c.gold },
  periodText: { color: c.textSecondary, fontSize: 12.5, fontWeight: "700" },
  periodTextActive: { color: c.gold },
  errorText: { color: c.loss, fontSize: 13, paddingVertical: 20, textAlign: "center" },
  yearRow: { marginBottom: 10 },
  yearRowLabel: { fontSize: 12, fontWeight: "700", color: c.textSecondary, marginBottom: 4 },
  monthGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  monthCell: { width: "15%", aspectRatio: 1, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  monthCellLabel: { fontSize: 9, fontWeight: "700", color: heatLabelColor },
  monthCellPct: { fontSize: 8, color: heatLabelColor },
  weekCell: { width: 8, height: 20, borderRadius: 2 },
  yearStrip: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  yearCell: { width: 90, height: 50, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  yearCellLabel: { fontSize: 12, fontWeight: "700", color: heatLabelColor },
  yearCellPct: { fontSize: 11, color: heatLabelColor },
  });
};
