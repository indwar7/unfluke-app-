/**
 * components/MarketTerminal/FiftyTwoWeek.tsx
 *
 * 52W High/Low page (spec §5, Equity › 52-week): two tabs over
 * snapshot features 52w_high / 52w_low. Same shape as Movers, simpler
 * (no gap/volume tabs, no direction ambiguity — high is always "up",
 * low is always "down" for row coloring purposes).
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
  { key: "52w_high", label: "52W High", direction: "up" },
  { key: "52w_low", label: "52W Low", direction: "down" },
];

export default function FiftyTwoWeek() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const [tab, setTab] = useState<SnapshotFeature>("52w_high");
  const [date, setDate] = useState<string | undefined>(undefined);

  const active = TABS.find((t) => t.key === tab)!;
  const snapshot = useSnapshot(tab, date);
  const actualDate: string | undefined = snapshot.data?.date ?? snapshot.data?.snapshotDate;

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>52 Week High / Low</Text>

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
  errorText: { color: c.loss, fontSize: 13, paddingVertical: 20, textAlign: "center" },
});
