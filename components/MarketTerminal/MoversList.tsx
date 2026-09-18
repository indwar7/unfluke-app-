/**
 * components/MarketTerminal/MoversList.tsx
 *
 * Renders one row per mover (gainer/loser) from /api/v2/nse/snapshot/gainers|losers
 * (EOD snapshot only — this page never calls /live/gainers|losers).
 * Real row shape: { symbol, close, pctChange, prevClose, totalQty, turnover, delivPct, ... }.
 * No `ltp` field on this endpoint — `price` falls back through `ltp`/`lastPrice`
 * only in case a live feature is ever wired through this same component.
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { AppColors } from "@/constants/Colors";

type Direction = "up" | "down";

export function MoversList({ data, direction, c }: { data: any; c: AppColors; direction: Direction }) {
  const styles = makeStyles(c);
  const rows: any[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.rows) ? data.rows
    : Array.isArray(data?.data) ? data.data
    : Array.isArray(data?.results) ? data.results
    : [];

  if (!rows.length) {
    return <Text style={styles.empty}>No data for this session.</Text>;
  }

  return (
    <View>
      {rows.slice(0, 10).map((row, i) => (
        <MoverRow key={row?.symbol ?? i} row={row} direction={direction} c={c} />
      ))}
    </View>
  );
}

function MoverRow({ row, direction, c }: { row: any; direction: Direction; c: AppColors }) {
  const styles = makeStyles(c);
  const symbol = row?.symbol ?? row?.SYMBOL ?? "—";
  const price = row?.close ?? row?.ltp ?? row?.lastPrice;
  const pctChange = row?.pctChange ?? row?.pChange;
  const pct = typeof pctChange === "number" ? pctChange : parseFloat(pctChange);
  const color = isNaN(pct) ? c.text : pct >= 0 ? c.profit : c.loss;

  return (
    <View style={styles.row}>
      <Text style={styles.symbol}>{symbol}</Text>
      {price != null && <Text style={styles.price}>{price}</Text>}
      <Text style={[styles.pct, { color }]}>
        {isNaN(pct) ? "—" : `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`}
      </Text>
    </View>
  );
}

const makeStyles = (c: AppColors) => StyleSheet.create({
  empty: { color: c.textMuted, fontSize: 13, paddingVertical: 10 },
  row: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.border,
  },
  symbol: { color: c.text, fontSize: 13, fontWeight: "600", flex: 1 },
  price: { color: c.textSecondary, fontSize: 13, marginRight: 10 },
  pct: { fontSize: 13, fontWeight: "700", width: 64, textAlign: "right" },
});
