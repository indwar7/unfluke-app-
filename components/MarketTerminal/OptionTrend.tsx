/**
 * components/MarketTerminal/OptionTrend.tsx
 * Option Trend (Option Mastery, doc3.md §1.7) — /api/v2/nse/options/trend.
 * EOD F&O Bhavcopy data — date picker only, no time picker (unlike the
 * minute-data Option Mastery screens).
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useOptionsTrend } from "../../hooks/useMarketTerminal";
import type { OptionTrendTab } from "../../api/marketTerminal";
import { MarketDatePicker, DateNotice } from "./MarketDatePicker";
import { GenericTable, type Column } from "./GenericTable";

const TABS: { key: OptionTrendTab; label: string }[] = [
  { key: "active_contracts", label: "Active Contracts" },
  { key: "active_value", label: "Active Value" },
  { key: "oi_gainers", label: "OI Gainers" },
  { key: "oi_losers", label: "OI Losers" },
  { key: "price_gainers", label: "Price Gainers" },
  { key: "price_losers", label: "Price Losers" },
  { key: "volume_gainers", label: "Volume Gainers" },
];

const COLUMNS: Column[] = [
  { key: "symbol", label: "Symbol", flex: 1 },
  { key: "contract", label: "Contract", flex: 1.6 },
  { key: "ltp", label: "LTP", flex: 0.8, align: "right" },
  { key: "pctChange", label: "Chg %", flex: 0.8, align: "right", format: (v) => (v != null ? `${v}%` : "—") },
  { key: "oiChangePct", label: "OI Chg %", flex: 0.9, align: "right", format: (v) => (v != null ? `${v}%` : "—") },
  { key: "buildup", label: "Buildup", flex: 0.8 },
];

export default function OptionTrend() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const [tab, setTab] = useState<OptionTrendTab>("active_contracts");
  const [date, setDate] = useState<string | undefined>(undefined);

  const trend = useOptionsTrend(tab, undefined, "ALL", "all", date);
  const data: any = trend.data;
  const rows: any[] = Array.isArray(data?.rows) ? data.rows : [];

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Option Trend</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow} contentContainerStyle={styles.tabRowContent}>
        {TABS.map((t) => (
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
      <DateNotice requestedDate={date} actualDate={data?.date} />

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <GenericTable rows={rows} columns={COLUMNS} c={c} isLoading={trend.isLoading} isError={trend.isError} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: AppColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background, padding: 16 },
  heading: { fontSize: 22, fontWeight: "700", color: c.text, marginBottom: 14 },
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
