/**
 * components/MarketTerminal/WatchList52Week.tsx
 *
 * Watch List › 52 Week High/Low (doc3.md §2.11) — same snapshot/live
 * endpoints as Equity's FiftyTwoWeek.tsx, with a Live/EOD toggle per the
 * doc's two-endpoint pairing (/live/52w_high|low, /snapshot/52w_high|low).
 *
 * Real snapshot payload (confirmed 17 Sep 2026): { sessions, symbol, close,
 * high, low, week52High, turnover } — no pctChange, no previous-level field,
 * no "set on" date, despite doc3.md describing a "previous level" / "cleared
 * by %" column. That column is real, `week52High` is the new level and
 * `close` the current price, but there is no previous-level field in the
 * actual response — so "cleared %" is left out here rather than guessed.
 * `sessions` (days since the high/low) is shown instead, since it's the one
 * genuinely useful extra field this endpoint provides.
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useSnapshot, useLiveFeature } from "../../hooks/useMarketTerminal";
import type { SnapshotFeature } from "../../api/marketTerminal";
import { MarketDatePicker, DateNotice } from "./MarketDatePicker";
import { GenericTable, type Column } from "./GenericTable";

const TABS: { key: SnapshotFeature; label: string; direction: "up" | "down" }[] = [
  { key: "52w_high", label: "52W High", direction: "up" },
  { key: "52w_low", label: "52W Low", direction: "down" },
];

export default function WatchList52Week() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const params = useLocalSearchParams<{ tab?: string }>();
  const initialTab: SnapshotFeature = params.tab === "52w_low" ? "52w_low" : "52w_high";
  const [tab, setTab] = useState<SnapshotFeature>(initialTab);
  const [live, setLive] = useState(false);
  const [date, setDate] = useState<string | undefined>(undefined);

  const active = TABS.find((t) => t.key === tab)!;
  const snapshot = useSnapshot(tab, date, undefined, undefined, !live);
  const liveFeature = useLiveFeature(tab, undefined, undefined, live);
  const result = live ? liveFeature : snapshot;

  const data: any = result.data;
  const actualDate: string | undefined = live ? undefined : data?.date;
  const rows: any[] = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];

  // "week52High" and "sessions" are confirmed from a real /snapshot/52w_high
  // sample; "week52Low" for the low tab is inferred by naming symmetry, not
  // independently confirmed. The /live/ variant's row shape (used when the
  // Live toggle is on) has no confirmed sample at all — it may use `ltp`
  // instead of `close`, or omit `sessions`/`week52High` entirely, since live
  // feeds elsewhere in this app are lighter than their snapshot counterparts
  // (see MoversList.tsx). Every column here falls back defensively so a
  // mismatched live field renders "—" instead of crashing.
  const levelKey = active.key === "52w_high" ? "week52High" : "week52Low";
  const columns: Column[] = [
    { key: "symbol", label: "Symbol", flex: 1.3 },
    { key: "close", label: "LTP", flex: 0.9, align: "right", format: (v, row) => v ?? row?.ltp ?? "—" },
    {
      key: levelKey, label: active.label, flex: 1, align: "right",
      format: (v, row) => (v ?? (active.key === "52w_high" ? row?.high : row?.low) ?? "—"),
    },
    { key: "sessions", label: "Sessions", flex: 0.8, align: "right", format: (v) => v ?? "—" },
  ];

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>52 Week High / Low</Text>

      <View style={styles.headerRow}>
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
        <TouchableOpacity style={styles.liveToggle} onPress={() => setLive((l) => !l)}>
          <View style={[styles.liveDot, live && styles.liveDotActive]} />
          <Text style={[styles.liveToggleText, live && styles.liveToggleTextActive]}>{live ? "Live" : "EOD"}</Text>
        </TouchableOpacity>
      </View>

      {!live && (
        <>
          <MarketDatePicker date={date} onChange={setDate} />
          <DateNotice requestedDate={date} actualDate={actualDate} />
        </>
      )}

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <GenericTable rows={rows} columns={columns} c={c} isLoading={result.isLoading} isError={result.isError} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: AppColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background, padding: 16 },
  heading: { fontSize: 22, fontWeight: "700", color: c.text, marginBottom: 14 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12 },
  tabRow: { flexDirection: "row", gap: 8 },
  tab: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: c.surfaceElevated, borderWidth: 1, borderColor: c.border,
  },
  tabActive: { backgroundColor: c.goldLight, borderColor: c.gold },
  tabText: { color: c.textSecondary, fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: c.gold },
  liveToggle: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20,
    backgroundColor: c.surfaceElevated, borderWidth: 1, borderColor: c.border,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.textMuted },
  liveDotActive: { backgroundColor: c.profit },
  liveToggleText: { color: c.textSecondary, fontSize: 12, fontWeight: "700" },
  liveToggleTextActive: { color: c.profit },
  list: { flex: 1 },
  listContent: {
    flexGrow: 1,
    backgroundColor: c.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: c.border,
  },
});
