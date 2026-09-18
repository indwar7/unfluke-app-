/**
 * components/MarketTerminal/PriceBandHitters.tsx
 * Price Band Hitters page (spec §5): Upper / Lower circuit tabs, corporate-
 * action guarded (§2.1). Both-circuits view intentionally omitted (live-only,
 * no snapshot exists per spec).
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
  { key: "price_band_upper", label: "Upper Circuit" },
  { key: "price_band_lower", label: "Lower Circuit" },
];

// "close" is confirmed (same snapshot shape as gainers/losers, docs.md).
// "bandPct" is an unconfirmed field-name guess — no real payload sample seen
// for this snapshot feature. If the Band % column is blank in production,
// check the real field name rather than assuming missing backend data.
const COLUMNS: Column[] = [
  { key: "symbol", label: "Symbol", flex: 1.4 },
  { key: "close", label: "LTP", flex: 1, align: "right" },
  { key: "bandPct", label: "Band %", flex: 1, align: "right", format: (v) => (v != null ? `${v}%` : "—") },
];

export default function PriceBandHitters() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const [tab, setTab] = useState<SnapshotFeature>("price_band_upper");
  const [date, setDate] = useState<string | undefined>(undefined);

  const snapshot = useSnapshot(tab, date);
  const actualDate: string | undefined = snapshot.data?.date ?? snapshot.data?.snapshotDate;
  const rows: any[] = Array.isArray(snapshot.data) ? snapshot.data : Array.isArray(snapshot.data?.rows) ? snapshot.data.rows : [];

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Price Band Hitters</Text>

      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

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
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
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
