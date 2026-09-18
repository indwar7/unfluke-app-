/**
 * components/MarketTerminal/IndexConstituents.tsx
 * Index Constituents page (spec §5/§7): the close×volume column is
 * deliberately labelled "Market Cap" per explicit product-owner instruction
 * — it's traded value, not a true float-adjusted market cap. Not a bug.
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useIndexConstituents } from "../../hooks/useMarketTerminal";
import { MarketDatePicker, DateNotice } from "./MarketDatePicker";
import { GenericTable, type Column } from "./GenericTable";

const INDEX_NAME = "NIFTY 50";

const COLUMNS: Column[] = [
  { key: "symbol", label: "Symbol", flex: 1.4 },
  { key: "volume", label: "Volume", flex: 1, align: "right" },
  {
    key: "marketCap", label: "Market Cap", flex: 1.2, align: "right",
    format: (_, row) => (row?.close != null && row?.volume != null ? (row.close * row.volume).toLocaleString("en-IN") : "—"),
  },
];

export default function IndexConstituents() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const [date, setDate] = useState<string | undefined>(undefined);

  const constituents = useIndexConstituents(INDEX_NAME, date);
  const actualDate: string | undefined = constituents.data?.date ?? constituents.data?.asOf;
  const rows: any[] = Array.isArray(constituents.data) ? constituents.data : Array.isArray(constituents.data?.rows) ? constituents.data.rows : [];

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Index Constituents</Text>
      <Text style={styles.note}>{INDEX_NAME} — "Market Cap" here is traded value (close × volume), not float-adjusted.</Text>

      <MarketDatePicker date={date} onChange={setDate} />
      <DateNotice requestedDate={date} actualDate={actualDate} />

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <GenericTable rows={rows} columns={COLUMNS} c={c} isLoading={constituents.isLoading} isError={constituents.isError} />
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
