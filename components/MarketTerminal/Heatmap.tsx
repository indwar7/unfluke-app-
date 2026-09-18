/**
 * components/MarketTerminal/Heatmap.tsx
 * Sector/Index Heatmap page (spec §5). Tile size = NIFTY 50 free-float index
 * weight, from the ported INDEX_WEIGHT table (web app parity, see
 * indexWeights.ts) — /index-constituents (spec §2.1) supplies price/%change
 * but has no weight field of its own.
 */

import React from "react";
import { View, Text, StyleSheet, ActivityIndicator, useWindowDimensions } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useIndexConstituents } from "../../hooks/useMarketTerminal";
import { Treemap, type TreemapCell } from "./Treemap";
import { getIndexWeight } from "./indexWeights";

const INDEX_NAME = "NIFTY 50";

export default function Heatmap() {
  const { colors: c, isDark } = useTheme();
  const styles = makeStyles(c);
  const { width } = useWindowDimensions();
  // Capped at 560 rather than a phone-width-only value — on a wider device
  // (tablet, large phone landscape) a lower cap leaves dead space either
  // side of the treemap since the screen wrapper only centers it, not fills it.
  const size = Math.min(width - 32, 560);

  const constituents = useIndexConstituents(INDEX_NAME);
  const rawRows: any[] = Array.isArray(constituents.data)
    ? constituents.data
    : Array.isArray(constituents.data?.rows) ? constituents.data.rows : [];

  const cells: TreemapCell[] = rawRows.map((row) => ({
    symbol: row?.symbol ?? "—",
    weight: getIndexWeight(row?.symbol),
    pctChange: typeof row?.pctChange === "number" ? row.pctChange : parseFloat(row?.pctChange) || 0,
  }));

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Sector Heatmap</Text>
      <Text style={styles.subheading}>{INDEX_NAME} constituents, sized by index weight</Text>

      {constituents.isLoading && <ActivityIndicator color={c.gold} style={{ paddingVertical: 40 }} />}
      {constituents.isError && <Text style={styles.errorText}>Couldn't load heatmap data.</Text>}
      {!constituents.isLoading && !constituents.isError && (
        <Treemap cells={cells} c={c} isDark={isDark} width={size} height={size} domain={6} />
      )}
    </View>
  );
}

const makeStyles = (c: AppColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background, padding: 16, alignItems: "center" },
  heading: { fontSize: 22, fontWeight: "700", color: c.text, alignSelf: "flex-start" },
  subheading: { fontSize: 12.5, color: c.textSecondary, marginTop: 4, marginBottom: 16, alignSelf: "flex-start" },
  errorText: { color: c.loss, fontSize: 13, paddingVertical: 30 },
});
