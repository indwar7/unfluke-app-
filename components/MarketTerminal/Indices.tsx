/**
 * components/MarketTerminal/Indices.tsx
 * Indices page (spec §5): full list of ~165 NSE indices, date picker.
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useIndices } from "../../hooks/useMarketTerminal";
import { MarketDatePicker, DateNotice } from "./MarketDatePicker";
import { GenericTable, type Column } from "./GenericTable";

const COLUMNS: Column[] = [
  { key: "name", label: "Index", flex: 2 },
  { key: "close", label: "Close", flex: 1, align: "right" },
  {
    key: "pctChange", label: "Chg %", flex: 1, align: "right",
    format: (v) => (typeof v === "number" ? `${v >= 0 ? "+" : ""}${v.toFixed(2)}%` : "—"),
  },
];

export default function Indices() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const [date, setDate] = useState<string | undefined>(undefined);

  const indices = useIndices(date);
  const actualDate: string | undefined = indices.data?.date ?? indices.data?.snapshotDate;
  const rows: any[] = Array.isArray(indices.data) ? indices.data : Array.isArray(indices.data?.rows) ? indices.data.rows : [];

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Indices</Text>

      <MarketDatePicker date={date} onChange={setDate} />
      <DateNotice requestedDate={date} actualDate={actualDate} />

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <GenericTable rows={rows} columns={COLUMNS} c={c} isLoading={indices.isLoading} isError={indices.isError} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: AppColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background, padding: 16 },
  heading: { fontSize: 22, fontWeight: "700", color: c.text, marginBottom: 14 },
  list: { flex: 1 },
  listContent: {
    flexGrow: 1,
    backgroundColor: c.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: c.border,
  },
});
