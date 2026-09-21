/**
 * components/MarketTerminal/OpenInterest.tsx
 * Open Interest (Option Mastery, doc3.md §1.3) — /api/v2/nse/options/oi.
 * Strikes ±15 around spot by default (spec: "±15 strikes or all").
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useOptionsOi } from "../../hooks/useMarketTerminal";
import { useOptionInstrumentPicker, OptionInstrumentPickerRow } from "./OptionInstrumentPicker";

const STRIKE_WINDOW = 15;

export default function OpenInterest() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const picker = useOptionInstrumentPicker();
  const [showAll, setShowAll] = useState(false);

  const oi = useOptionsOi(picker.name ?? "", picker.expiry ?? "");
  const data: any = oi.data;
  const strikes: any[] = Array.isArray(data?.strikes) ? data.strikes : [];

  // Without a spot price there's no ATM to center the window on — show
  // everything rather than silently slicing an arbitrary (non-ATM) window.
  const hasSpot = data?.spot != null;
  const nearest = hasSpot
    ? strikes.reduce((best, s, i) => {
        const d = Math.abs(s.strike - data.spot);
        return d < best.d ? { i, d } : best;
      }, { i: 0, d: Infinity }).i
    : 0;

  const visibleStrikes = showAll || !hasSpot ? strikes : strikes.slice(
    Math.max(0, nearest - STRIKE_WINDOW),
    nearest + STRIKE_WINDOW + 1,
  );

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Open Interest</Text>

      <OptionInstrumentPickerRow
        nameList={picker.nameList} name={picker.name} onNameChange={picker.setName}
        expiryList={picker.expiryList} expiry={picker.expiry} onExpiryChange={picker.setExpiry}
      />

      {data?.moved && (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>No data at the requested time — showing the latest stored minute before it.</Text>
        </View>
      )}

      {data?.totals && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Spot {data.spot ?? "—"} · PCR {data.totals.pcr ?? "—"}</Text>
          <TouchableOpacity onPress={() => setShowAll((v) => !v)}>
            <Text style={styles.toggleText}>{showAll ? "±15 strikes" : "Show all"}</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {(oi.isLoading || picker.isLoading) && <ActivityIndicator color={c.gold} style={{ paddingVertical: 30 }} />}
        {oi.isError && <Text style={styles.errorText}>Couldn't load open interest.</Text>}
        {!oi.isLoading && strikes.length === 0 && <Text style={styles.empty}>No data for this selection.</Text>}
        {visibleStrikes.length > 0 && (
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, { flex: 1 }]}>Call OI</Text>
              <Text style={[styles.headerCell, { flex: 0.8, textAlign: "center" }]}>Strike</Text>
              <Text style={[styles.headerCell, { flex: 1, textAlign: "right" }]}>Put OI</Text>
            </View>
            {visibleStrikes.map((row) => (
              <View key={row.strike} style={styles.row}>
                <Text style={[styles.cell, { flex: 1 }]}>{row.call?.oi != null ? row.call.oi.toLocaleString("en-IN") : "—"}</Text>
                <Text style={[styles.cell, styles.strikeCell, { flex: 0.8, textAlign: "center" }]}>{row.strike}</Text>
                <Text style={[styles.cell, { flex: 1, textAlign: "right" }]}>{row.put?.oi != null ? row.put.oi.toLocaleString("en-IN") : "—"}</Text>
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
  notice: { backgroundColor: c.warningLight, borderRadius: 8, padding: 10, marginBottom: 10 },
  noticeText: { color: c.warning, fontSize: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  summaryText: { fontSize: 12.5, color: c.textSecondary, fontWeight: "600" },
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
  cell: { fontSize: 13, color: c.text },
  strikeCell: { fontWeight: "700", color: c.gold },
  empty: { color: c.textMuted, fontSize: 13, paddingVertical: 20, textAlign: "center" },
  errorText: { color: c.loss, fontSize: 13, paddingVertical: 20, textAlign: "center" },
});
