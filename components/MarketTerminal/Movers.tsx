/**
 * components/MarketTerminal/Movers.tsx
 *
 * Movers page (spec §5, Equity › movers): tabs for Gainers / Losers /
 * Volume Gainers / Most Active / Gap Up / Gap Down, date picker + closed-day
 * fallback banner. Intraday tab intentionally omitted (removed per spec §5).
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useSnapshot } from "../../hooks/useMarketTerminal";
import type { SnapshotFeature } from "../../api/marketTerminal";
import { MoversList } from "./MoversList";
import { MarketDatePicker, DateNotice } from "./MarketDatePicker";

const TABS: { key: SnapshotFeature; label: string; direction: "up" | "down" }[] = [
  { key: "gainers", label: "Gainers", direction: "up" },
  { key: "losers", label: "Losers", direction: "down" },
  { key: "volume_gainers", label: "Volume", direction: "up" },
  { key: "most_active_value", label: "Most Active", direction: "up" },
  { key: "gap_up", label: "Gap Up", direction: "up" },
  { key: "gap_down", label: "Gap Down", direction: "down" },
];

export default function Movers() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const [tab, setTab] = useState<SnapshotFeature>("gainers");
  const [date, setDate] = useState<string | undefined>(undefined);

  const active = TABS.find((t) => t.key === tab)!;
  const snapshot = useSnapshot(tab, date);
  const actualDate: string | undefined = snapshot.data?.date ?? snapshot.data?.snapshotDate;

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Movers</Text>

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
        {snapshot.isLoading && <ActivityIndicator color={c.gold} style={{ paddingVertical: 30 }} />}
        {snapshot.isError && <Text style={styles.errorText}>Couldn't load {active.label.toLowerCase()}.</Text>}
        {snapshot.data && <MoversList data={snapshot.data} direction={active.direction} c={c} />}
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
  errorText: { color: c.loss, fontSize: 13, paddingVertical: 20, textAlign: "center" },
});
