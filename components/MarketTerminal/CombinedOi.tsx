/**
 * components/MarketTerminal/CombinedOi.tsx
 * Combined OI (Option Mastery, doc3.md §1.4) — /api/v2/nse/options/combined-oi.
 * Table view of 5-minute points per spec §1.8.
 */

import React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useOptionsCombinedOi } from "../../hooks/useMarketTerminal";
import { useOptionInstrumentPicker, OptionInstrumentPickerRow } from "./OptionInstrumentPicker";

function fiveMinutePoints(points: any[]): any[] {
  if (!points.length) return points;
  const filtered = points.filter((p) => p.t?.endsWith(":00") || p.t?.endsWith(":05"));
  const last = points[points.length - 1];
  if (filtered[filtered.length - 1]?.t !== last.t) filtered.push(last);
  return filtered;
}

export default function CombinedOi() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const picker = useOptionInstrumentPicker();

  const combined = useOptionsCombinedOi(picker.name ?? "", picker.expiry ?? "");
  const data: any = combined.data;
  const points: any[] = fiveMinutePoints(Array.isArray(data?.points) ? data.points : []);

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Combined OI</Text>

      <OptionInstrumentPickerRow
        nameList={picker.nameList} name={picker.name} onNameChange={picker.setName}
        expiryList={picker.expiryList} expiry={picker.expiry} onExpiryChange={picker.setExpiry}
      />

      {data?.latest && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            {data.latest.t} · Spot {data.latest.spot} · PCR {data.latest.pcr}
          </Text>
        </View>
      )}

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {(combined.isLoading || picker.isLoading) && <ActivityIndicator color={c.gold} style={{ paddingVertical: 30 }} />}
        {combined.isError && <Text style={styles.errorText}>Couldn't load combined OI.</Text>}
        {!combined.isLoading && points.length === 0 && <Text style={styles.empty}>No data for this selection.</Text>}
        {points.length > 0 && (
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, { flex: 0.7 }]}>Time</Text>
              <Text style={[styles.headerCell, { flex: 1, textAlign: "right" }]}>Call OI</Text>
              <Text style={[styles.headerCell, { flex: 1, textAlign: "right" }]}>Put OI</Text>
              <Text style={[styles.headerCell, { flex: 0.7, textAlign: "right" }]}>PCR</Text>
            </View>
            {points.map((p) => (
              <View key={p.t} style={styles.row}>
                <Text style={[styles.cell, { flex: 0.7 }]}>{p.t ?? "—"}</Text>
                <Text style={[styles.cell, { flex: 1, textAlign: "right" }]}>{p.callOi?.toLocaleString("en-IN") ?? "—"}</Text>
                <Text style={[styles.cell, { flex: 1, textAlign: "right" }]}>{p.putOi?.toLocaleString("en-IN") ?? "—"}</Text>
                <Text style={[styles.cell, { flex: 0.7, textAlign: "right" }]}>{p.pcr ?? "—"}</Text>
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
  summaryRow: { marginBottom: 10 },
  summaryText: { fontSize: 12.5, color: c.textSecondary, fontWeight: "600" },
  list: { flex: 1 },
  listContent: {
    flexGrow: 1,
    backgroundColor: c.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: c.border,
  },
  headerRow: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.border },
  headerCell: { fontSize: 11, fontWeight: "700", color: c.textSecondary, textTransform: "uppercase" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: c.border },
  cell: { fontSize: 12.5, color: c.text },
  empty: { color: c.textMuted, fontSize: 13, paddingVertical: 20, textAlign: "center" },
  errorText: { color: c.loss, fontSize: 13, paddingVertical: 20, textAlign: "center" },
});
