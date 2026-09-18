/**
 * components/MarketTerminal/MultiStrikeOi.tsx
 * Multi Strike OI (Option Mastery, doc3.md §1.5) — /api/v2/nse/options/multi-strike.
 * Default: 3 puts + 3 calls around ATM, picked from §1.3's strike list once
 * the instrument/expiry/spot are known.
 */

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useOptionsOi, useOptionsMultiStrike } from "../../hooks/useMarketTerminal";
import { useOptionInstrumentPicker, OptionInstrumentPickerRow } from "./OptionInstrumentPicker";

function defaultLegs(strikes: any[], spot: number | undefined): string[] {
  if (!strikes.length || spot == null) return [];
  const sorted = [...strikes].sort((a, b) => Math.abs(a.strike - spot) - Math.abs(b.strike - spot));
  const atmStrikes = sorted.slice(0, 3).map((s) => s.strike).sort((a, b) => a - b);
  return [...atmStrikes.map((s) => `${s}PE`), ...atmStrikes.map((s) => `${s}CE`)];
}

export default function MultiStrikeOi() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const picker = useOptionInstrumentPicker();

  // Reuses §1.3 (Open Interest) only to seed sensible default strikes/spot —
  // not rendered here.
  const oiSeed = useOptionsOi(picker.name ?? "", picker.expiry ?? "");
  const strikes: any[] = Array.isArray(oiSeed.data?.strikes) ? oiSeed.data.strikes : [];

  const [legs, setLegs] = useState<string[]>([]);
  useEffect(() => {
    if (!legs.length && strikes.length && oiSeed.data?.spot != null) {
      setLegs(defaultLegs(strikes, oiSeed.data.spot));
    }
  }, [strikes, oiSeed.data?.spot, legs.length]);

  const multi = useOptionsMultiStrike(picker.name ?? "", picker.expiry ?? "", legs.join(","));
  const data: any = multi.data;
  const points: any[] = Array.isArray(data?.points) ? data.points : [];
  const activeLegs: string[] = Array.isArray(data?.legs) ? data.legs : legs;

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Multi Strike OI</Text>

      <OptionInstrumentPickerRow
        nameList={picker.nameList} name={picker.name} onNameChange={picker.setName}
        expiryList={picker.expiryList} expiry={picker.expiry} onExpiryChange={picker.setExpiry}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.legRow} contentContainerStyle={styles.legRowContent}>
        {strikes.map((s) => {
          const pe = `${s.strike}PE`, ce = `${s.strike}CE`;
          return (
            <React.Fragment key={s.strike}>
              <TouchableOpacity
                style={[styles.chip, legs.includes(pe) && styles.chipActive]}
                onPress={() => setLegs((prev) => prev.includes(pe) ? prev.filter((l) => l !== pe) : prev.length < 6 ? [...prev, pe] : prev)}
              >
                <Text style={[styles.chipText, legs.includes(pe) && styles.chipTextActive]}>{pe}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, legs.includes(ce) && styles.chipActive]}
                onPress={() => setLegs((prev) => prev.includes(ce) ? prev.filter((l) => l !== ce) : prev.length < 6 ? [...prev, ce] : prev)}
              >
                <Text style={[styles.chipText, legs.includes(ce) && styles.chipTextActive]}>{ce}</Text>
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </ScrollView>

      {data?.missing?.length > 0 && (
        <Text style={styles.note}>No data this session for: {data.missing.join(", ")}</Text>
      )}

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {(multi.isLoading || oiSeed.isLoading || picker.isLoading) && <ActivityIndicator color={c.gold} style={{ paddingVertical: 30 }} />}
        {multi.isError && <Text style={styles.errorText}>Couldn't load multi strike OI.</Text>}
        {!multi.isError && oiSeed.isError && <Text style={styles.errorText}>Couldn't load strikes for this expiry.</Text>}
        {!multi.isLoading && !oiSeed.isError && points.length === 0 && <Text style={styles.empty}>Pick up to 6 strikes above.</Text>}
        {points.length > 0 && (
          <ScrollView horizontal style={{ flexGrow: 0 }}>
            <View>
              <View style={styles.headerRow}>
                <Text style={[styles.headerCell, styles.timeCol]}>Time</Text>
                {activeLegs.map((leg) => (
                  <Text key={leg} style={[styles.headerCell, styles.legCol]}>{leg}</Text>
                ))}
              </View>
              {points.map((p) => (
                <View key={p.t} style={styles.row}>
                  <Text style={[styles.cell, styles.timeCol]}>{p.t}</Text>
                  {activeLegs.map((leg) => (
                    <Text key={leg} style={[styles.cell, styles.legCol]}>{p.oi?.[leg]?.toLocaleString("en-IN") ?? "—"}</Text>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: AppColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background, padding: 16 },
  heading: { fontSize: 22, fontWeight: "700", color: c.text, marginBottom: 14 },
  legRow: { flexGrow: 0, marginBottom: 8 },
  legRowContent: { gap: 6, paddingRight: 8 },
  chip: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14,
    backgroundColor: c.surfaceElevated, borderWidth: 1, borderColor: c.border,
  },
  chipActive: { backgroundColor: c.goldLight, borderColor: c.gold },
  chipText: { color: c.textSecondary, fontSize: 11.5, fontWeight: "600" },
  chipTextActive: { color: c.gold },
  note: { fontSize: 11, color: c.textMuted, marginBottom: 8 },
  list: { flex: 1 },
  listContent: {
    flexGrow: 1,
    backgroundColor: c.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: c.border,
  },
  headerRow: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.border },
  headerCell: { fontSize: 10.5, fontWeight: "700", color: c.textSecondary, textTransform: "uppercase" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: c.border },
  cell: { fontSize: 12, color: c.text },
  timeCol: { width: 56 },
  legCol: { width: 90, textAlign: "right" },
  empty: { color: c.textMuted, fontSize: 13, paddingVertical: 20, textAlign: "center" },
  errorText: { color: c.loss, fontSize: 13, paddingVertical: 20, textAlign: "center" },
});
