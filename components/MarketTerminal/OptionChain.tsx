/**
 * components/MarketTerminal/OptionChain.tsx
 *
 * Option Chain page (spec §5, Derivatives): mirrors the Option Simulator's
 * own 4 endpoints (instruments/expiries/context/option-chain) — no OI in
 * this data source (§2.3), so no PCR/Max Pain columns here (that's the
 * dedicated PCR & Max Pain page, §2.1's /pcr/* endpoints instead).
 * Read-only: no trade-placement UI, unlike components/OptionSimulator's table.
 */

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useSimInstruments, useSimExpiries, useSimOptionChain } from "../../hooks/useMarketTerminal";

export default function OptionChain() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);

  const instruments = useSimInstruments();
  const instrumentList: any[] = Array.isArray(instruments.data) ? instruments.data : Array.isArray(instruments.data?.rows) ? instruments.data.rows : [];
  const [name, setName] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!name && instrumentList.length) setName(instrumentList[0]?.name ?? instrumentList[0]);
  }, [instrumentList, name]);

  const expiries = useSimExpiries(name ?? "");
  const expiryList: any[] = Array.isArray(expiries.data) ? expiries.data : Array.isArray(expiries.data?.rows) ? expiries.data.rows : [];
  const [expiry, setExpiry] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!expiry && expiryList.length) setExpiry(typeof expiryList[0] === "string" ? expiryList[0] : expiryList[0]?.expiry);
  }, [expiryList, expiry]);

  const chain = useSimOptionChain(name ?? "", expiry ?? "", undefined, 1);
  const rows: any[] = Array.isArray(chain.data) ? chain.data : Array.isArray(chain.data?.rows) ? chain.data.rows : [];

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Option Chain</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow} contentContainerStyle={styles.pickerRowContent}>
        {instrumentList.map((inst) => {
          const label = typeof inst === "string" ? inst : inst?.name;
          return (
            <TouchableOpacity
              key={label}
              style={[styles.chip, name === label && styles.chipActive]}
              onPress={() => { setName(label); setExpiry(undefined); }}
            >
              <Text style={[styles.chipText, name === label && styles.chipTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow} contentContainerStyle={styles.pickerRowContent}>
        {expiryList.map((exp) => {
          const label = typeof exp === "string" ? exp : exp?.expiry;
          return (
            <TouchableOpacity
              key={label}
              style={[styles.chip, expiry === label && styles.chipActive]}
              onPress={() => setExpiry(label)}
            >
              <Text style={[styles.chipText, expiry === label && styles.chipTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {(chain.isLoading || instruments.isLoading || expiries.isLoading) && (
          <ActivityIndicator color={c.gold} style={{ paddingVertical: 30 }} />
        )}
        {chain.isError && <Text style={styles.errorText}>Couldn't load the option chain.</Text>}
        {!chain.isLoading && rows.length === 0 && <Text style={styles.empty}>No chain data for this selection.</Text>}
        {rows.length > 0 && (
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, { flex: 1 }]}>Call LTP</Text>
              <Text style={[styles.headerCell, { flex: 0.8, textAlign: "center" }]}>Strike</Text>
              <Text style={[styles.headerCell, { flex: 1, textAlign: "right" }]}>Put LTP</Text>
            </View>
            {rows.map((row, i) => (
              <View key={row?.strike ?? i} style={styles.row}>
                <Text style={[styles.cell, { flex: 1 }]}>{row?.callLtp ?? row?.callPrice ?? "—"}</Text>
                <Text style={[styles.cell, styles.strikeCell, { flex: 0.8, textAlign: "center" }]}>{row?.strike ?? "—"}</Text>
                <Text style={[styles.cell, { flex: 1, textAlign: "right" }]}>{row?.putLtp ?? row?.putPrice ?? "—"}</Text>
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
  pickerRow: { flexGrow: 0, marginBottom: 10 },
  pickerRowContent: { gap: 8, paddingRight: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16,
    backgroundColor: c.surfaceElevated, borderWidth: 1, borderColor: c.border,
  },
  chipActive: { backgroundColor: c.goldLight, borderColor: c.gold },
  chipText: { color: c.textSecondary, fontSize: 12.5, fontWeight: "600" },
  chipTextActive: { color: c.gold },
  list: { flex: 1, marginTop: 8 },
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
