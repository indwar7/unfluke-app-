/**
 * components/MarketTerminal/LargeDeals.tsx
 * Large Deals page (spec §5): Bulk / Block / Short-selling tabs.
 * Short-selling rows carry no client name/price by design (§2.1).
 *
 * `clientName`/`buySell`/`quantity`/`price` are unconfirmed field-name
 * guesses — no real /large-deals sample payload has been seen. GenericTable's
 * `row?.[col.key] ?? "—"` means a wrong guess renders "—" for that column
 * rather than crashing, but if these columns are ever blank in production,
 * check the real field names against a live payload before assuming a data
 * gap on the backend side.
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useLargeDeals } from "../../hooks/useMarketTerminal";
import { GenericTable, type Column } from "./GenericTable";

const TABS: { key: "bulk" | "block" | "short_selling"; label: string }[] = [
  { key: "bulk", label: "Bulk Deals" },
  { key: "block", label: "Block Deals" },
  { key: "short_selling", label: "Short Selling" },
];

const COLUMNS: Record<string, Column[]> = {
  bulk: [
    { key: "symbol", label: "Symbol", flex: 1.2 },
    { key: "clientName", label: "Client", flex: 1.6 },
    { key: "buySell", label: "B/S", flex: 0.6 },
    { key: "quantity", label: "Qty", flex: 1, align: "right" },
    { key: "price", label: "Price", flex: 0.8, align: "right" },
  ],
  block: [
    { key: "symbol", label: "Symbol", flex: 1.2 },
    { key: "clientName", label: "Client", flex: 1.6 },
    { key: "quantity", label: "Qty", flex: 1, align: "right" },
    { key: "price", label: "Price", flex: 0.8, align: "right" },
  ],
  short_selling: [
    { key: "symbol", label: "Symbol", flex: 1.6 },
    { key: "quantity", label: "Qty", flex: 1, align: "right" },
  ],
};

export default function LargeDeals() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const [tab, setTab] = useState<"bulk" | "block" | "short_selling">("bulk");

  const deals = useLargeDeals(tab);
  const rows: any[] = Array.isArray(deals.data) ? deals.data : Array.isArray(deals.data?.rows) ? deals.data.rows : [];

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Large Deals</Text>

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

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <GenericTable
          rows={rows}
          columns={COLUMNS[tab]}
          c={c}
          isLoading={deals.isLoading}
          isError={deals.isError}
        />
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
});
