/**
 * components/MarketTerminal/DepositoryStats.tsx
 * Depository Stats page (spec §5): NSDL only, no CDSL column (no feed, §7).
 */

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useDepositoryReports } from "../../hooks/useMarketTerminal";
import { GenericTable, type Column } from "./GenericTable";

// month/demat_accounts/value are unconfirmed field-name guesses (no real
// /depository/reports payload sample seen). demat_accounts kept snake_case
// since that's NSDL's own standard report terminology, but falls back to
// dematAccounts in case the API camelCases it instead.
const COLUMNS: Column[] = [
  { key: "month", label: "Month", flex: 1 },
  { key: "demat_accounts", label: "Demat A/Cs", flex: 1, align: "right", format: (v, row) => v ?? row?.dematAccounts ?? "—" },
  { key: "value", label: "Value", flex: 1, align: "right" },
];

export default function DepositoryStats() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const reports = useDepositoryReports();
  const rows: any[] = Array.isArray(reports.data) ? reports.data : Array.isArray(reports.data?.rows) ? reports.data.rows : [];

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Depository Stats</Text>
      <Text style={styles.note}>NSDL only — no CDSL feed exists.</Text>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <GenericTable rows={rows} columns={COLUMNS} c={c} isLoading={reports.isLoading} isError={reports.isError} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: AppColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background, padding: 16 },
  heading: { fontSize: 22, fontWeight: "700", color: c.text, marginBottom: 4 },
  note: { fontSize: 11.5, color: c.textMuted, marginBottom: 14 },
  list: { flex: 1 },
  listContent: { flexGrow: 1, backgroundColor: c.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: c.border },
});
