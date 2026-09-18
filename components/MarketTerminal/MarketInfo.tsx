/**
 * components/MarketTerminal/MarketInfo.tsx
 * Market Info page (spec §5): New Listings / Pre-Open / CAS / Corporate
 * Actions tabs. ETF tab removed (per spec). New Listings/Pre-Open/CAS are
 * live features (no dedicated snapshot hook yet); Corporate Actions has one.
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useLiveFeature, useCorporateActions } from "../../hooks/useMarketTerminal";
import { GenericTable, type Column } from "./GenericTable";

const TABS = [
  { key: "new_listings", label: "New Listings" },
  { key: "pre_open", label: "Pre-Open" },
  { key: "cas", label: "CAS" },
  { key: "corporate_actions", label: "Corp. Actions" },
] as const;

type TabKey = typeof TABS[number]["key"];

// symbol/actionType/exDate confirmed against a real /corporate-actions sample (docs2.md).
const CORP_ACTION_COLUMNS: Column[] = [
  { key: "symbol", label: "Symbol", flex: 1.2 },
  { key: "actionType", label: "Type", flex: 1 },
  { key: "exDate", label: "Ex-Date", flex: 1, format: (v) => (typeof v === "string" ? v.slice(0, 10) : v ?? "—") },
];

// "ltp" is an unconfirmed guess reused across 3 different live endpoints
// (new_listings, pre_open, cas) with no real sample payload for any of them —
// pre-open feeds in particular often use `iep`/`finalPrice` rather than `ltp`.
// GenericTable's fallback means a wrong guess renders "—", not a crash.
const GENERIC_COLUMNS: Column[] = [
  { key: "symbol", label: "Symbol", flex: 1.4 },
  { key: "ltp", label: "LTP", flex: 1, align: "right" },
];

export default function MarketInfo() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const [tab, setTab] = useState<TabKey>("new_listings");

  const live = useLiveFeature(tab, undefined, undefined, tab !== "corporate_actions");
  const corpActions = useCorporateActions();

  const isCorpActions = tab === "corporate_actions";
  const query = isCorpActions ? corpActions : live;
  const rows: any[] = Array.isArray(query.data) ? query.data : Array.isArray((query.data as any)?.rows) ? (query.data as any).rows : [];

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Market Info</Text>

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
        <GenericTable
          rows={rows}
          columns={isCorpActions ? CORP_ACTION_COLUMNS : GENERIC_COLUMNS}
          c={c}
          isLoading={query.isLoading}
          isError={query.isError}
        />
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
