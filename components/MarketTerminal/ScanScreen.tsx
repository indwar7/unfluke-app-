/**
 * components/MarketTerminal/ScanScreen.tsx
 *
 * Shared screen for the Watch List's tab-based scans (RSI/ADX/Bollinger/MACD/
 * Supertrend/Moving Average/Pivots) — /api/v2/nse/scans/:scan (doc3.md §2.2-2.8).
 * All seven share one envelope: { scan, date, universe, excluded, tab, tabs,
 * settings, count, rows }, tabs differ per scan, so the screen is generic and
 * each page just wires its own tab list + columns.
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useScan } from "../../hooks/useMarketTerminal";
import type { ScanName } from "../../api/marketTerminal";
import { MarketDatePicker, DateNotice } from "./MarketDatePicker";
import { GenericTable, type Column } from "./GenericTable";

export type ScanTab = { key: string; label: string };

export function ScanScreen({
  scan, heading, tabs, defaultTab, columns,
}: {
  scan: ScanName;
  heading: string;
  tabs: ScanTab[];
  defaultTab: string;
  columns: Column[];
}) {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const [tab, setTab] = useState(defaultTab);
  const [date, setDate] = useState<string | undefined>(undefined);

  const result = useScan(scan, tab, date);
  const data: any = result.data;
  const actualDate: string | undefined = data?.date;
  const rows: any[] = Array.isArray(data?.rows) ? data.rows : [];
  const excluded = data?.excluded;

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>{heading}</Text>
      {excluded && (
        <Text style={styles.note}>
          {data.universe} stocks scanned — {excluded.flat} flat, {excluded.thin} thin excluded.
        </Text>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow} contentContainerStyle={styles.tabRowContent}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <MarketDatePicker date={date} onChange={setDate} />
      <DateNotice requestedDate={date} actualDate={actualDate} />

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <GenericTable rows={rows} columns={columns} c={c} isLoading={result.isLoading} isError={result.isError} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: AppColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background, padding: 16 },
  heading: { fontSize: 22, fontWeight: "700", color: c.text, marginBottom: 4 },
  note: { fontSize: 11, color: c.textMuted, marginBottom: 10 },
  tabRow: { flexGrow: 0, marginBottom: 12 },
  tabRowContent: { gap: 8, paddingRight: 8 },
  tab: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: c.surfaceElevated, borderWidth: 1, borderColor: c.border,
  },
  tabActive: { backgroundColor: c.goldLight, borderColor: c.gold },
  tabText: { color: c.textSecondary, fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: c.gold },
  list: { flex: 1 },
  listContent: {
    flexGrow: 1,
    backgroundColor: c.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: c.border,
  },
});
