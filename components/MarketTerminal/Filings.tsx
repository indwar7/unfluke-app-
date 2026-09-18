/**
 * components/MarketTerminal/Filings.tsx
 * Filings page (spec §5).
 */

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useFilings } from "../../hooks/useMarketTerminal";
import { GenericTable, isoDateFormat, type Column } from "./GenericTable";

const COLUMNS: Column[] = [
  { key: "symbol", label: "Symbol", flex: 1 },
  { key: "subject", label: "Subject", flex: 2 },
  { key: "date", label: "Date", flex: 1, format: isoDateFormat },
];

export default function Filings() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const filings = useFilings();
  const rows: any[] = Array.isArray(filings.data) ? filings.data : Array.isArray(filings.data?.rows) ? filings.data.rows : [];

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Filings</Text>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <GenericTable rows={rows} columns={COLUMNS} c={c} isLoading={filings.isLoading} isError={filings.isError} />
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
