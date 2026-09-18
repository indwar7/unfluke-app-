/**
 * components/MarketTerminal/FiiDii.tsx
 * FII/DII Activity page (spec §5): ₹ crore, unconverted (§2.1).
 *
 * API returns one row per date: { date, fii: {grossBuy,grossSell,netValue},
 * dii: {grossBuy,grossSell,netValue} } — flattened here into two table rows
 * per date (FII, DII) since GenericTable is a flat row/column grid.
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useFiiDii } from "../../hooks/useMarketTerminal";
import { GenericTable, type Column } from "./GenericTable";

const COLUMNS: Column[] = [
  { key: "date", label: "Date", flex: 1 },
  { key: "category", label: "Category", flex: 1 },
  { key: "buyValue", label: "Buy (₹cr)", flex: 1, align: "right" },
  { key: "sellValue", label: "Sell (₹cr)", flex: 1, align: "right" },
  { key: "netValue", label: "Net (₹cr)", flex: 1, align: "right" },
];

function flatten(apiRows: any[]): any[] {
  const out: any[] = [];
  for (const r of apiRows) {
    if (r?.fii) out.push({ date: r.date, category: "FII", buyValue: r.fii.grossBuy, sellValue: r.fii.grossSell, netValue: r.fii.netValue });
    if (r?.dii) out.push({ date: r.date, category: "DII", buyValue: r.dii.grossBuy, sellValue: r.dii.grossSell, netValue: r.dii.netValue });
  }
  return out;
}

export default function FiiDii() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const [range] = useState<{ from?: string; to?: string }>({});

  const fiiDii = useFiiDii(range.from, range.to);
  const apiRows: any[] = Array.isArray(fiiDii.data?.rows) ? fiiDii.data.rows : Array.isArray(fiiDii.data) ? fiiDii.data : [];
  const rows = flatten(apiRows).reverse();

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>FII / DII Activity</Text>
      <Text style={styles.note}>Values in ₹ crore, as published (not converted).</Text>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <GenericTable rows={rows} columns={COLUMNS} c={c} isLoading={fiiDii.isLoading} isError={fiiDii.isError} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: AppColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background, padding: 16 },
  heading: { fontSize: 22, fontWeight: "700", color: c.text, marginBottom: 4 },
  note: { fontSize: 12, color: c.textMuted, marginBottom: 14 },
  list: { flex: 1 },
  listContent: {
    flexGrow: 1,
    backgroundColor: c.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: c.border,
  },
});
