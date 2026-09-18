/**
 * components/MarketTerminal/DerivativesActivity.tsx
 * Derivatives Activity page (spec §5): Most Active Contracts / Active
 * Underlyings / OI Spurts tabs. Most Active Contracts is a live-only
 * feature (not in the snapshot set); the other two are snapshot features.
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useSnapshot, useLiveFeature } from "../../hooks/useMarketTerminal";
import type { SnapshotFeature } from "../../api/marketTerminal";
import { GenericTable, type Column } from "./GenericTable";

const TABS = [
  { key: "most_active_contracts", label: "Most Active Contracts", live: true },
  { key: "most_active_underlying", label: "Active Underlyings", live: false },
  { key: "oi_spurts", label: "OI Spurts", live: false },
] as const;

const COLUMNS: Column[] = [
  { key: "symbol", label: "Symbol", flex: 1.6 },
  { key: "oi", label: "OI", flex: 1, align: "right" },
];

export default function DerivativesActivity() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const [tab, setTab] = useState<typeof TABS[number]["key"]>("most_active_contracts");

  const active = TABS.find((t) => t.key === tab)!;
  // Both hooks are always called (Rules of Hooks) — the inactive one is
  // disabled via `enabled` so it doesn't actually fetch.
  const live = useLiveFeature(active.live ? tab : "most_active_contracts", undefined, undefined, active.live);
  const snapshot = useSnapshot(!active.live ? (tab as SnapshotFeature) : "most_active_underlying", undefined, undefined, undefined, !active.live);
  const query = active.live ? live : snapshot;
  const rows: any[] = Array.isArray(query.data) ? query.data : Array.isArray((query.data as any)?.rows) ? (query.data as any).rows : [];

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Derivatives Activity</Text>

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

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <GenericTable rows={rows} columns={COLUMNS} c={c} isLoading={query.isLoading} isError={query.isError} />
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
