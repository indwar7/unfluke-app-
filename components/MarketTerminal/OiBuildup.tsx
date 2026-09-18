/**
 * components/MarketTerminal/OiBuildup.tsx
 * OI Buildup page (spec §5, Derivatives): 4 buckets — long/short buildup,
 * short covering, long unwinding. Reads F&O Bhavcopy, not equity (§2.1).
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useSnapshot } from "../../hooks/useMarketTerminal";
import type { SnapshotFeature } from "../../api/marketTerminal";
import { MarketDatePicker, DateNotice } from "./MarketDatePicker";
import { GenericTable, type Column } from "./GenericTable";

const TABS: { key: SnapshotFeature; label: string }[] = [
  { key: "buildup_long", label: "Long Buildup" },
  { key: "buildup_short", label: "Short Buildup" },
  { key: "buildup_short_covering", label: "Short Covering" },
  { key: "buildup_long_unwinding", label: "Long Unwinding" },
];

const COLUMNS: Column[] = [
  { key: "symbol", label: "Symbol", flex: 1.4 },
  { key: "oiChangePct", label: "OI Chg %", flex: 1, align: "right", format: (v) => (v != null ? `${v}%` : "—") },
  { key: "pctChange", label: "Price %", flex: 1, align: "right", format: (v) => (v != null ? `${v}%` : "—") },
];

export default function OiBuildup() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const [tab, setTab] = useState<SnapshotFeature>("buildup_long");
  const [date, setDate] = useState<string | undefined>(undefined);

  const snapshot = useSnapshot(tab, date);
  const actualDate: string | undefined = snapshot.data?.date ?? snapshot.data?.snapshotDate;
  const rows: any[] = Array.isArray(snapshot.data) ? snapshot.data : Array.isArray(snapshot.data?.rows) ? snapshot.data.rows : [];

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>OI Buildup</Text>

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
      <DateNotice requestedDate={date} actualDate={actualDate} />

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <GenericTable rows={rows} columns={COLUMNS} c={c} isLoading={snapshot.isLoading} isError={snapshot.isError} />
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
