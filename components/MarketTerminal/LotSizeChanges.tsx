/**
 * components/MarketTerminal/LotSizeChanges.tsx
 *
 * Lot Size Changes page (spec §5): summary table with expandable rows —
 * tap a symbol to show its full revision history inline. Grouped by expiry
 * server-side already (§3.4 — grouping by calendar day produces
 * contradictory overlapping ranges, a verified bug the spec explicitly
 * warns not to repeat), so this screen just renders what comes back.
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { ChevronDown, ChevronRight } from "lucide-react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useLotSizes, useLotSizeHistory } from "../../hooks/useMarketTerminal";

function isoDate(v: any): string {
  return typeof v === "string" ? v.slice(0, 10) : v ?? "—";
}

function LotSizeRow({ row, c }: { row: any; c: AppColors }) {
  const styles = makeStyles(c);
  const [expanded, setExpanded] = useState(false);
  const symbol = row?.symbol ?? "—";
  const history = useLotSizeHistory(expanded ? symbol : "");
  // /lot-size/:symbol returns { changes: [...] }, ascending by effectiveFrom —
  // there's no `previousSize` field, the previous size is just the prior entry.
  const historyRows: any[] = Array.isArray(history.data?.changes) ? history.data.changes : [];

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.summaryRow} onPress={() => setExpanded((e) => !e)} activeOpacity={0.7}>
        {expanded ? <ChevronDown size={16} color={c.textSecondary} /> : <ChevronRight size={16} color={c.textSecondary} />}
        <Text style={styles.symbol}>{symbol}</Text>
        <View style={styles.summaryValues}>
          <Text style={styles.summaryLabel}>Current: <Text style={styles.summaryValue}>{row?.currentLotSize ?? "—"}</Text></Text>
          <Text style={styles.summaryLabel}>Previous: <Text style={styles.summaryValue}>{row?.previousLotSize ?? "—"}</Text></Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.historyWrap}>
          {history.isLoading && <ActivityIndicator color={c.gold} style={{ paddingVertical: 10 }} />}
          {history.isError && <Text style={styles.errorText}>Couldn't load history.</Text>}
          {!history.isLoading && historyRows.length === 0 && <Text style={styles.empty}>No earlier revisions.</Text>}
          {historyRows.map((h, i) => (
            <View key={h?.expiry ?? i} style={styles.historyRow}>
              <Text style={styles.historyCell}>{isoDate(h?.expiry)}</Text>
              <Text style={styles.historyCell}>{isoDate(h?.effectiveFrom)}</Text>
              <Text style={[styles.historyCell, styles.historyValue]}>{h?.lotSize ?? "—"}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function LotSizeChanges() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const lotSizes = useLotSizes();
  const rows: any[] = Array.isArray(lotSizes.data) ? lotSizes.data : Array.isArray(lotSizes.data?.rows) ? lotSizes.data.rows : [];

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Lot Size Changes</Text>
      <Text style={styles.note}>Tap a symbol for its full revision history.</Text>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 20 }}>
        {lotSizes.isLoading && <ActivityIndicator color={c.gold} style={{ paddingVertical: 30 }} />}
        {lotSizes.isError && <Text style={styles.errorText}>Couldn't load lot sizes.</Text>}
        {rows.map((row, i) => <LotSizeRow key={row?.symbol ?? i} row={row} c={c} />)}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: AppColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background, padding: 16 },
  heading: { fontSize: 22, fontWeight: "700", color: c.text, marginBottom: 4 },
  note: { fontSize: 12, color: c.textMuted, marginBottom: 14 },
  list: { flex: 1 },
  card: {
    backgroundColor: c.surface, borderRadius: 12, borderWidth: 1, borderColor: c.border,
    marginBottom: 10, overflow: "hidden",
  },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12 },
  symbol: { color: c.text, fontSize: 14, fontWeight: "700", flex: 1 },
  summaryValues: { alignItems: "flex-end" },
  summaryLabel: { fontSize: 11, color: c.textSecondary },
  summaryValue: { color: c.text, fontWeight: "700" },
  historyWrap: { paddingHorizontal: 12, paddingBottom: 12, borderTopWidth: 1, borderTopColor: c.border },
  historyRow: { flexDirection: "row", paddingVertical: 6, gap: 10 },
  historyCell: { fontSize: 12, color: c.textSecondary, flex: 1 },
  historyValue: { color: c.text, fontWeight: "600", textAlign: "right" },
  empty: { color: c.textMuted, fontSize: 12, paddingVertical: 8 },
  errorText: { color: c.loss, fontSize: 13, paddingVertical: 20, textAlign: "center" },
});
