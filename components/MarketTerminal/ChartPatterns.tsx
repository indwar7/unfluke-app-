/**
 * components/MarketTerminal/ChartPatterns.tsx
 * Chart Patterns (Watch List, doc3.md §2.9) — /api/v2/nse/scans/patterns.
 * Ten geometric formations over the last 250 sessions. Filters (age/bias/
 * types/universe) apply on "Apply", not per click, per spec §2.12 — all ten
 * type boxes ticked is sent as no type filter (omit `types`).
 */

import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useChartPatterns } from "../../hooks/useMarketTerminal";
import { MarketDatePicker, DateNotice } from "./MarketDatePicker";

type Age = "recent" | "historical" | "all";
type Bias = "bullish" | "bearish" | "neutral" | "all";
type Universe = "all" | "nifty50" | "niftynext50" | "niftybank" | "fno";

const AGE_OPTIONS: { key: Age; label: string }[] = [
  { key: "all", label: "All" },
  { key: "recent", label: "Recent (30d)" },
  { key: "historical", label: "Historical" },
];

const BIAS_OPTIONS: { key: Bias; label: string }[] = [
  { key: "all", label: "All" },
  { key: "bullish", label: "Bullish" },
  { key: "bearish", label: "Bearish" },
  { key: "neutral", label: "Neutral" },
];

const UNIVERSE_OPTIONS: { key: Universe; label: string }[] = [
  { key: "all", label: "All" },
  { key: "nifty50", label: "Nifty 50" },
  { key: "niftynext50", label: "Nifty Next 50" },
  { key: "niftybank", label: "Nifty Bank" },
  { key: "fno", label: "F&O" },
];

const TYPE_KEYS = [
  "double_bottom", "descending_channel", "falling_wedge", "bullish_flag",
  "double_top", "ascending_channel", "rising_wedge", "bearish_flag",
  "rectangle", "symmetrical_triangle",
];
const TYPE_LABELS: Record<string, string> = {
  double_bottom: "Double Bottom", descending_channel: "Descending Channel",
  falling_wedge: "Falling Wedge", bullish_flag: "Bullish Flag",
  double_top: "Double Top", ascending_channel: "Ascending Channel",
  rising_wedge: "Rising Wedge", bearish_flag: "Bearish Flag",
  rectangle: "Rectangle", symmetrical_triangle: "Symmetrical Triangle",
};

function biasColor(bias: string, c: AppColors) {
  if (bias === "bullish") return c.profit;
  if (bias === "bearish") return c.loss;
  return c.textSecondary;
}

export default function ChartPatterns() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);

  // Draft filters (edited via chips/checkboxes), applied to the query only on "Apply".
  const [draftAge, setDraftAge] = useState<Age>("recent");
  const [draftBias, setDraftBias] = useState<Bias>("all");
  const [draftUniverse, setDraftUniverse] = useState<Universe>("all");
  const [draftTypes, setDraftTypes] = useState<Set<string>>(new Set());

  const [age, setAge] = useState<Age>("recent");
  const [bias, setBias] = useState<Bias>("all");
  const [universe, setUniverse] = useState<Universe>("all");
  const [types, setTypes] = useState<Set<string>>(new Set());
  const [date, setDate] = useState<string | undefined>(undefined);

  const dirty = draftAge !== age || draftBias !== bias || draftUniverse !== universe
    || draftTypes.size !== types.size || [...draftTypes].some((t) => !types.has(t));

  const typesParam = types.size > 0 && types.size < TYPE_KEYS.length ? [...types].join(",") : undefined;
  const result = useChartPatterns(age, bias, typesParam, universe, date, 100);
  const data: any = result.data;
  const rows: any[] = Array.isArray(data?.rows) ? data.rows : [];

  const applyFilters = () => {
    setAge(draftAge); setBias(draftBias); setUniverse(draftUniverse); setTypes(new Set(draftTypes));
  };

  const resetFilters = () => {
    setDraftAge("recent"); setDraftBias("all"); setDraftUniverse("all"); setDraftTypes(new Set());
    setAge("recent"); setBias("all"); setUniverse("all"); setTypes(new Set());
    setDate(undefined);
  };

  const toggleType = (key: string) => {
    setDraftTypes((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const sorted = useMemo(() => [...rows].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)), [rows]);

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Chart Patterns</Text>
      <Text style={styles.note}>{data?.note ?? "Research context only — a pattern describes past trading, not what happens next."}</Text>

      <MarketDatePicker date={date} onChange={setDate} />
      <DateNotice requestedDate={date} actualDate={data?.date} />

      <ChipRow<Age> label="Age" options={AGE_OPTIONS} value={draftAge} onChange={setDraftAge} c={c} styles={styles} />
      <ChipRow<Bias> label="Bias" options={BIAS_OPTIONS} value={draftBias} onChange={setDraftBias} c={c} styles={styles} />
      <ChipRow<Universe> label="Universe" options={UNIVERSE_OPTIONS} value={draftUniverse} onChange={setDraftUniverse} c={c} styles={styles} />

      <Text style={styles.filterLabel}>Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={styles.chipRowContent}>
        {TYPE_KEYS.map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.typeChip, draftTypes.has(key) && styles.chipActive]}
            onPress={() => toggleType(key)}
          >
            <Text style={[styles.chipText, draftTypes.has(key) && styles.chipTextActive]}>{TYPE_LABELS[key]}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.applyButton, !dirty && styles.applyButtonDisabled]} onPress={applyFilters} disabled={!dirty}>
          <Text style={styles.applyText}>Apply</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {data?.count != null && (
        <Text style={styles.countText}>{data.count} of {data.total} patterns</Text>
      )}

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {result.isLoading && <ActivityIndicator color={c.gold} style={{ paddingVertical: 30 }} />}
        {result.isError && <Text style={styles.errorText}>Couldn't load chart patterns.</Text>}
        {!result.isLoading && sorted.length === 0 && <Text style={styles.empty}>No patterns matched.</Text>}
        {sorted.map((row, i) => (
          <View key={`${row.symbol}-${row.type}-${i}`} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardSymbol}>{row.symbol}</Text>
              <Text style={[styles.cardPct, { color: (row.pctChange ?? 0) >= 0 ? c.profit : c.loss }]}>
                {row.pctChange != null ? `${row.pctChange >= 0 ? "+" : ""}${row.pctChange.toFixed(2)}%` : "—"}
              </Text>
            </View>
            <View style={styles.cardMeta}>
              <View style={[styles.biasPill, { backgroundColor: biasColor(row.bias, c) + "22" }]}>
                <Text style={[styles.biasText, { color: biasColor(row.bias, c) }]}>{row.label}</Text>
              </View>
              <Text style={styles.cardDaysAgo}>{row.daysAgo === 0 ? "Today" : `${row.daysAgo}d ago`}</Text>
            </View>
            <Text style={styles.cardWindow}>{row.windowFrom} → {row.windowTo} · {row.bars} bars</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function ChipRow<T extends string>({
  label, options, value, onChange, c, styles,
}: {
  label: string; options: { key: T; label: string }[]; value: T; onChange: (v: T) => void;
  c: AppColors; styles: any;
}) {
  return (
    <>
      <Text style={styles.filterLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={styles.chipRowContent}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.chip, value === opt.key && styles.chipActive]}
            onPress={() => onChange(opt.key)}
          >
            <Text style={[styles.chipText, value === opt.key && styles.chipTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
}

const makeStyles = (c: AppColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background, padding: 16 },
  heading: { fontSize: 22, fontWeight: "700", color: c.text, marginBottom: 2 },
  note: { fontSize: 11, color: c.textMuted, marginBottom: 10 },
  filterLabel: { fontSize: 11, fontWeight: "700", color: c.textSecondary, textTransform: "uppercase", marginBottom: 6, marginTop: 4 },
  chipRow: { flexGrow: 0, marginBottom: 6 },
  chipRowContent: { gap: 8, paddingRight: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16,
    backgroundColor: c.surfaceElevated, borderWidth: 1, borderColor: c.border,
  },
  typeChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16,
    backgroundColor: c.surfaceElevated, borderWidth: 1, borderColor: c.border,
  },
  chipActive: { backgroundColor: c.goldLight, borderColor: c.gold },
  chipText: { color: c.textSecondary, fontSize: 12, fontWeight: "600" },
  chipTextActive: { color: c.gold },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 10, marginBottom: 6 },
  applyButton: { flex: 1, backgroundColor: c.gold, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  applyButtonDisabled: { backgroundColor: c.surfaceElevated },
  applyText: { color: c.onGold, fontSize: 13, fontWeight: "700" },
  resetButton: { flex: 1, backgroundColor: c.surfaceElevated, borderRadius: 10, paddingVertical: 10, alignItems: "center", borderWidth: 1, borderColor: c.border },
  resetText: { color: c.textSecondary, fontSize: 13, fontWeight: "700" },
  countText: { fontSize: 11.5, color: c.textMuted, marginBottom: 8 },
  list: { flex: 1 },
  listContent: { paddingBottom: 20 },
  card: {
    backgroundColor: c.surface, borderRadius: 12, borderWidth: 1, borderColor: c.border,
    padding: 12, marginBottom: 8,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  cardSymbol: { fontSize: 14, fontWeight: "700", color: c.text },
  cardPct: { fontSize: 13, fontWeight: "700" },
  cardMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  biasPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  biasText: { fontSize: 11, fontWeight: "700" },
  cardDaysAgo: { fontSize: 11, color: c.textMuted },
  cardWindow: { fontSize: 11, color: c.textMuted },
  empty: { color: c.textMuted, fontSize: 13, paddingVertical: 20, textAlign: "center" },
  errorText: { color: c.loss, fontSize: 13, paddingVertical: 20, textAlign: "center" },
});
