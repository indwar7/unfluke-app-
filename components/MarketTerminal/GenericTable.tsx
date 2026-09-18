/**
 * components/MarketTerminal/GenericTable.tsx
 *
 * Shared row-list renderer for pages whose payload is "an array of flat
 * objects" with no special formatting — corporate actions, filings, credit
 * ratings, large deals, etc. Renders whichever fields exist per column def;
 * a page-specific screen wires columns + the right hook rather than each
 * page hand-rolling its own list.
 */

import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import type { AppColors } from "@/constants/Colors";

export type Column = {
  key: string;
  label: string;
  flex?: number;
  align?: "left" | "right";
  format?: (value: any, row: any) => string;
};

/** Column `format` for date fields that may come as bare YYYY-MM-DD or full ISO timestamps. */
export function isoDateFormat(v: any): string {
  return typeof v === "string" ? v.slice(0, 10) : v ?? "—";
}

export function GenericTable({
  rows, columns, c, isLoading, isError, emptyLabel = "No data for this range.", errorLabel = "Couldn't load data.",
}: {
  rows: any[] | undefined;
  columns: Column[];
  c: AppColors;
  isLoading?: boolean;
  isError?: boolean;
  emptyLabel?: string;
  errorLabel?: string;
}) {
  const styles = makeStyles(c);

  if (isLoading) return <ActivityIndicator color={c.gold} style={{ paddingVertical: 30 }} />;
  if (isError) return <Text style={styles.errorText}>{errorLabel}</Text>;
  if (!rows || !rows.length) return <Text style={styles.empty}>{emptyLabel}</Text>;

  return (
    <View>
      <View style={styles.headerRow}>
        {columns.map((col) => (
          <Text key={col.key} style={[styles.headerCell, { flex: col.flex ?? 1, textAlign: col.align ?? "left" }]}>
            {col.label}
          </Text>
        ))}
      </View>
      {rows.map((row, i) => (
        <View key={row?.id ?? row?._id ?? i} style={styles.row}>
          {columns.map((col) => (
            <Text
              key={col.key}
              style={[styles.cell, { flex: col.flex ?? 1, textAlign: col.align ?? "left" }]}
              numberOfLines={2}
            >
              {col.format ? col.format(row?.[col.key], row) : (row?.[col.key] ?? "—")}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

const makeStyles = (c: AppColors) => StyleSheet.create({
  headerRow: {
    flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.border,
  },
  headerCell: { fontSize: 11, fontWeight: "700", color: c.textSecondary, textTransform: "uppercase" },
  row: {
    flexDirection: "row", alignItems: "center", paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: c.border,
  },
  cell: { fontSize: 13, color: c.text },
  empty: { color: c.textMuted, fontSize: 13, paddingVertical: 20, textAlign: "center" },
  errorText: { color: c.loss, fontSize: 13, paddingVertical: 20, textAlign: "center" },
});
