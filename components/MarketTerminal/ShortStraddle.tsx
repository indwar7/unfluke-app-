/**
 * components/MarketTerminal/ShortStraddle.tsx
 * Short Straddle (Option Mastery, doc3.md §1.6) — /api/v2/nse/options/straddles.
 * ATM straddle premium across every F&O stock; no instrument picker (the
 * endpoint returns all of them), just expiry + search per spec §1.8.
 * expiry here is ISO YYYY-MM-DD, unlike the other Option Mastery endpoints.
 */

import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useOptionsStraddles } from "../../hooks/useMarketTerminal";

export default function ShortStraddle() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const [expiry, setExpiry] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");

  const straddles = useOptionsStraddles(expiry);
  const data: any = straddles.data;
  const rows: any[] = Array.isArray(data?.rows) ? data.rows : [];
  const expiries: string[] = Array.isArray(data?.expiries) ? data.expiries : [];

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toUpperCase();
    return rows.filter((r) => r.symbol?.toUpperCase().includes(q));
  }, [rows, search]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => (b.changePct ?? 0) - (a.changePct ?? 0)),
    [filtered],
  );

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Short Straddle</Text>
      <Text style={styles.note}>ATM premium change since open, {data?.symbols ?? "—"} stocks</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.expiryRow} contentContainerStyle={styles.expiryRowContent}>
        {expiries.map((e) => (
          <TouchableOpacity
            key={e}
            style={[styles.chip, (expiry ?? data?.expiry) === e && styles.chipActive]}
            onPress={() => setExpiry(e)}
          >
            <Text style={[styles.chipText, (expiry ?? data?.expiry) === e && styles.chipTextActive]}>{e}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TextInput
        style={styles.search}
        placeholder="Search symbol…"
        placeholderTextColor={c.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {straddles.isLoading && <ActivityIndicator color={c.gold} style={{ paddingVertical: 30 }} />}
        {straddles.isError && <Text style={styles.errorText}>Couldn't load short straddle data.</Text>}
        {!straddles.isLoading && sorted.length === 0 && <Text style={styles.empty}>No matching stocks.</Text>}
        {sorted.length > 0 && (
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, { flex: 1.2 }]}>Symbol</Text>
              <Text style={[styles.headerCell, { flex: 1, textAlign: "right" }]}>Premium</Text>
              <Text style={[styles.headerCell, { flex: 0.9, textAlign: "right" }]}>Chg %</Text>
            </View>
            {sorted.map((row) => (
              <View key={row.symbol} style={styles.row}>
                <Text style={[styles.cell, { flex: 1.2, fontWeight: "700" }]}>{row.symbol}</Text>
                <Text style={[styles.cell, { flex: 1, textAlign: "right" }]}>{row.now?.premium ?? "—"}</Text>
                <Text style={[
                  styles.cell, { flex: 0.9, textAlign: "right", fontWeight: "700" },
                  { color: (row.changePct ?? 0) >= 0 ? c.profit : c.loss },
                ]}>
                  {row.changePct != null ? `${row.changePct >= 0 ? "+" : ""}${row.changePct.toFixed(2)}%` : "—"}
                </Text>
              </View>
            ))}
          </View>
        )}
        {data?.unavailable?.length > 0 && (
          <Text style={styles.footnote}>{data.unavailable.length} stocks not available yet (indexing limit).</Text>
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: AppColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background, padding: 16 },
  heading: { fontSize: 22, fontWeight: "700", color: c.text, marginBottom: 2 },
  note: { fontSize: 11.5, color: c.textMuted, marginBottom: 12 },
  expiryRow: { flexGrow: 0, marginBottom: 10 },
  expiryRowContent: { gap: 8, paddingRight: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16,
    backgroundColor: c.surfaceElevated, borderWidth: 1, borderColor: c.border,
  },
  chipActive: { backgroundColor: c.goldLight, borderColor: c.gold },
  chipText: { color: c.textSecondary, fontSize: 12.5, fontWeight: "600" },
  chipTextActive: { color: c.gold },
  search: {
    backgroundColor: c.surfaceElevated, borderRadius: 10, borderWidth: 1, borderColor: c.border,
    paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, color: c.text, marginBottom: 10,
  },
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
  footnote: { fontSize: 11, color: c.textMuted, marginTop: 10, textAlign: "center" },
  empty: { color: c.textMuted, fontSize: 13, paddingVertical: 20, textAlign: "center" },
  errorText: { color: c.loss, fontSize: 13, paddingVertical: 20, textAlign: "center" },
});
