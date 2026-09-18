/**
 * components/MarketTerminal/MaxPain.tsx
 * Max Pain (Option Mastery, doc3.md §1.3) — same /api/v2/nse/options/oi
 * endpoint as Open Interest, rendering maxPain.rows/maxPain.strike instead
 * of the OI table. Strikes ±25 around max pain by default.
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useOptionsOi } from "../../hooks/useMarketTerminal";
import { useOptionInstrumentPicker, OptionInstrumentPickerRow } from "./OptionInstrumentPicker";

const STRIKE_WINDOW = 25;

export default function MaxPain() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const picker = useOptionInstrumentPicker();
  const [showAll, setShowAll] = useState(false);

  const oi = useOptionsOi(picker.name ?? "", picker.expiry ?? "");
  const data: any = oi.data;
  // Sort by strike ascending before slicing a ±N window off centerIdx — the
  // API doesn't guarantee row order, so an unsorted array would slice an
  // arbitrary window rather than a true strike range.
  const rows: any[] = (Array.isArray(data?.maxPain?.rows) ? data.maxPain.rows : [])
    .slice()
    .sort((a: any, b: any) => a.strike - b.strike);
  const painStrike = data?.maxPain?.strike;

  const centerIdx = rows.findIndex((r) => r.strike === painStrike);
  const visibleRows = showAll || centerIdx < 0 ? rows : rows.slice(
    Math.max(0, centerIdx - STRIKE_WINDOW),
    centerIdx + STRIKE_WINDOW + 1,
  );

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Max Pain</Text>

      <OptionInstrumentPickerRow
        nameList={picker.nameList} name={picker.name} onNameChange={picker.setName}
        expiryList={picker.expiryList} expiry={picker.expiry} onExpiryChange={picker.setExpiry}
      />

      {painStrike != null && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Max Pain Strike</Text>
          <Text style={styles.summaryValue}>{painStrike}</Text>
        </View>
      )}

      {rows.length > 0 && (
        <View style={styles.toggleRow}>
          <TouchableOpacity onPress={() => setShowAll((v) => !v)}>
            <Text style={styles.toggleText}>{showAll ? "±25 strikes" : "Show all"}</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {(oi.isLoading || picker.isLoading) && <ActivityIndicator color={c.gold} style={{ paddingVertical: 30 }} />}
        {oi.isError && <Text style={styles.errorText}>Couldn't load max pain.</Text>}
        {!oi.isLoading && rows.length === 0 && <Text style={styles.empty}>No data for this selection.</Text>}
        {visibleRows.length > 0 && (
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, { flex: 0.8 }]}>Strike</Text>
              <Text style={[styles.headerCell, { flex: 1, textAlign: "right" }]}>Call Pain</Text>
              <Text style={[styles.headerCell, { flex: 1, textAlign: "right" }]}>Put Pain</Text>
              <Text style={[styles.headerCell, { flex: 1, textAlign: "right" }]}>Total</Text>
            </View>
            {visibleRows.map((row) => (
              <View key={row.strike} style={[styles.row, row.strike === painStrike && styles.rowHighlight]}>
                <Text style={[styles.cell, styles.strikeCell, { flex: 0.8 }]}>{row.strike}</Text>
                <Text style={[styles.cell, { flex: 1, textAlign: "right" }]}>{row.callPain != null ? `${(row.callPain / 1e7).toFixed(2)}Cr` : "—"}</Text>
                <Text style={[styles.cell, { flex: 1, textAlign: "right" }]}>{row.putPain != null ? `${(row.putPain / 1e7).toFixed(2)}Cr` : "—"}</Text>
                <Text style={[styles.cell, { flex: 1, textAlign: "right" }]}>{row.total != null ? `${(row.total / 1e7).toFixed(2)}Cr` : "—"}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: AppColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background, padding: 16 },
  heading: { fontSize: 22, fontWeight: "700", color: c.text, marginBottom: 14 },
  summaryCard: {
    backgroundColor: c.surface, borderRadius: 12, borderWidth: 1, borderColor: c.border,
    padding: 14, marginBottom: 10, alignItems: "center",
  },
  summaryLabel: { fontSize: 12, color: c.textSecondary, marginBottom: 4 },
  summaryValue: { fontSize: 24, fontWeight: "800", color: c.gold },
  toggleRow: { alignItems: "flex-end", marginBottom: 8 },
  toggleText: { fontSize: 12.5, color: c.gold, fontWeight: "700" },
  list: { flex: 1 },
  listContent: {
    flexGrow: 1,
    backgroundColor: c.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: c.border,
  },
  headerRow: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.border },
  headerCell: { fontSize: 11, fontWeight: "700", color: c.textSecondary, textTransform: "uppercase" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: c.border },
  rowHighlight: { backgroundColor: c.goldLight },
  cell: { fontSize: 12.5, color: c.text },
  strikeCell: { fontWeight: "700", color: c.gold },
  empty: { color: c.textMuted, fontSize: 13, paddingVertical: 20, textAlign: "center" },
  errorText: { color: c.loss, fontSize: 13, paddingVertical: 20, textAlign: "center" },
});
