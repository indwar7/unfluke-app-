/**
 * components/MarketTerminal/IpoCalendar.tsx
 * IPO Calendar page (spec §5): stage derived client-side from dates, not a
 * status field (§2.1) — /ipos gives no `status` field to trust.
 */

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useIpos } from "../../hooks/useMarketTerminal";
import { GenericTable, type Column } from "./GenericTable";

// Dates may come as bare YYYY-MM-DD or full ISO timestamps — normalize to
// YYYY-MM-DD before comparing, otherwise a same-day boundary (e.g. listing
// date == today) compares wrong since "2026-09-18T..." > "2026-09-18".
function isoDate(v: any): string {
  return typeof v === "string" ? v.slice(0, 10) : v;
}

function deriveStage(row: any): string {
  const today = new Date().toISOString().slice(0, 10);
  const open = isoDate(row?.openDate), close = isoDate(row?.closeDate), listing = isoDate(row?.listingDate);
  if (listing && listing <= today) return "Listed";
  if (close && close < today) return "Closed";
  if (open && open <= today && (!close || close >= today)) return "Open";
  if (open && open > today) return "Upcoming";
  return "—";
}

const COLUMNS: Column[] = [
  { key: "symbol", label: "Company", flex: 1.6 },
  { key: "openDate", label: "Open", flex: 1, format: (v) => isoDate(v) ?? "—" },
  { key: "closeDate", label: "Close", flex: 1, format: (v) => isoDate(v) ?? "—" },
  { key: "stage", label: "Stage", flex: 1, format: (_, row) => deriveStage(row) },
];

export default function IpoCalendar() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const ipos = useIpos();
  const rows: any[] = Array.isArray(ipos.data) ? ipos.data : Array.isArray(ipos.data?.rows) ? ipos.data.rows : [];

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>IPO Calendar</Text>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <GenericTable rows={rows} columns={COLUMNS} c={c} isLoading={ipos.isLoading} isError={ipos.isError} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: AppColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background, padding: 16 },
  heading: { fontSize: 22, fontWeight: "700", color: c.text, marginBottom: 14 },
  list: { flex: 1 },
  listContent: { flexGrow: 1, backgroundColor: c.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: c.border },
});
