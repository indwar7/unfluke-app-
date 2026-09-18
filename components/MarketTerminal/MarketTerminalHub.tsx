/**
 * components/MarketTerminal/MarketTerminalHub.tsx
 *
 * Entry hub for Market Terminal — 4 sections (Equity/Option Mastery/Watch
 * List/Reference), each a list of pages, matching the web app's sidebar
 * structure (doc3.md, 18 Sep 2026 — "Derivatives" renamed to "Option
 * Mastery" and a new "Watch List" section added). Built pages navigate to
 * their real route; not-yet-built pages show a "Coming soon" pill instead
 * of a broken link.
 */

import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import {
  ChevronRight, Landmark, Sigma, BookOpen, Bookmark,
  TrendingUp, Grid3x3, BarChart3, ArrowUpDown, FileBarChart, Gauge, Info, Banknote,
  Layers, Activity, LineChart, Box, Percent, ListOrdered, Shuffle, GitBranch, Crosshair, Scale,
  Rocket, CalendarClock, History, Flame, Calendar, FileText, ListTree, ShieldCheck, Landmark as LandmarkAlt,
  ArrowUpNarrowWide, ArrowDownNarrowWide, Waves, GitCompare, Compass, Radar, Shapes,
} from "lucide-react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

type Page = { code: string; label: string; icon: React.ComponentType<any>; route?: string; params?: Record<string, string> }; // route undefined = not built yet

const SECTIONS: { title: string; icon: React.ComponentType<any>; pages: Page[] }[] = [
  {
    title: "Equity",
    icon: Landmark,
    pages: [
      { code: "MOV", label: "Movers", icon: TrendingUp, route: "/market-terminal-movers" },
      { code: "HTM", label: "Heatmap", icon: Grid3x3, route: "/market-terminal-heatmap" },
      { code: "IDX", label: "Indices", icon: BarChart3, route: "/market-terminal-indices" },
      { code: "52W", label: "52W High/Low", icon: ArrowUpDown, route: "/market-terminal-52-week" },
      { code: "LDL", label: "Large Deals", icon: FileBarChart, route: "/market-terminal-large-deals" },
      { code: "PBH", label: "Price Band Hitters", icon: Gauge, route: "/market-terminal-price-band" },
      { code: "INF", label: "Market Info", icon: Info, route: "/market-terminal-market-info" },
      { code: "FII", label: "FII/DII Activity", icon: Banknote, route: "/market-terminal-fii-dii" },
    ],
  },
  {
    title: "Option Mastery",
    icon: Sigma,
    pages: [
      { code: "OPT", label: "Option Chain", icon: Layers, route: "/market-terminal-option-chain" },
      { code: "OI", label: "OI Buildup", icon: Activity, route: "/market-terminal-oi-buildup" },
      { code: "DRV", label: "Derivatives Activity", icon: LineChart, route: "/market-terminal-derivatives-activity" },
      { code: "LOT", label: "Lot Size Changes", icon: Box, route: "/market-terminal-lot-sizes" },
      { code: "PCR", label: "PCR & Max Pain", icon: Percent, route: "/market-terminal-pcr-maxpain" },
      { code: "OIA", label: "Open Interest", icon: ListOrdered, route: "/market-terminal-open-interest" },
      { code: "OTR", label: "Option Trend", icon: GitCompare, route: "/market-terminal-option-trend" },
      { code: "COI", label: "Combined OI", icon: Shuffle, route: "/market-terminal-combined-oi" },
      { code: "MSO", label: "Multi Strike OI", icon: GitBranch, route: "/market-terminal-multi-strike-oi" },
      { code: "MXP", label: "Max Pain", icon: Crosshair, route: "/market-terminal-max-pain" },
      { code: "STR", label: "Short Straddle", icon: Scale, route: "/market-terminal-short-straddle" },
    ],
  },
  {
    title: "Watch List",
    icon: Bookmark,
    pages: [
      { code: "52H", label: "52 Week High", icon: ArrowUpNarrowWide, route: "/market-terminal-watchlist-52-week", params: { tab: "52w_high" } },
      { code: "52L", label: "52 Week Low", icon: ArrowDownNarrowWide, route: "/market-terminal-watchlist-52-week", params: { tab: "52w_low" } },
      { code: "RSI", label: "RSI Scans", icon: Activity, route: "/market-terminal-rsi-scans" },
      { code: "ADX", label: "ADX Scans", icon: Compass, route: "/market-terminal-adx-scans" },
      { code: "BBS", label: "Bollinger Band Scans", icon: Waves, route: "/market-terminal-bollinger-scans" },
      { code: "MCD", label: "MACD Scans", icon: GitBranch, route: "/market-terminal-macd-scans" },
      { code: "SUP", label: "Supertrend Scans", icon: TrendingUp, route: "/market-terminal-supertrend-scans" },
      { code: "MAC", label: "Moving Average Crossover", icon: LineChart, route: "/market-terminal-moving-average-crossover" },
      { code: "PVT", label: "Pivots", icon: Radar, route: "/market-terminal-pivots" },
      { code: "PAT", label: "Chart Patterns", icon: Shapes, route: "/market-terminal-chart-patterns" },
    ],
  },
  {
    title: "Reference",
    icon: BookOpen,
    pages: [
      { code: "IPO", label: "IPO Calendar", icon: Rocket, route: "/market-terminal-ipo-calendar" },
      { code: "RES", label: "Result Calendar", icon: CalendarClock, route: "/market-terminal-result-calendar" },
      { code: "IDXH", label: "Index History", icon: History, route: "/market-terminal-index-history" },
      { code: "RTN", label: "Returns Heatmap", icon: Flame, route: "/market-terminal-returns-heatmap" },
      { code: "CAL", label: "Trading Calendar", icon: Calendar, route: "/market-terminal-trading-calendar" },
      { code: "FIL", label: "Filings", icon: FileText, route: "/market-terminal-filings" },
      { code: "CON", label: "Index Constituents", icon: ListTree, route: "/market-terminal-index-constituents" },
      { code: "CRD", label: "Credit Ratings", icon: ShieldCheck, route: "/market-terminal-credit-ratings" },
      { code: "DEP", label: "Depository Stats", icon: LandmarkAlt, route: "/market-terminal-depository-stats" },
    ],
  },
];

export default function MarketTerminalHub() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Market Terminal</Text>
      <Text style={styles.subheading}>NSE market data — equity, option mastery, watch list & reference</Text>

      {SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <section.icon size={16} color={c.gold} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
          <View style={styles.card}>
            {section.pages.map((page, i) => (
              <TouchableOpacity
                key={page.label}
                style={[styles.row, i === section.pages.length - 1 && styles.rowLast]}
                disabled={!page.route}
                onPress={() => page.route && router.push(page.params ? { pathname: page.route as any, params: page.params } : (page.route as any))}
                activeOpacity={0.7}
              >
                <page.icon size={18} color={page.route ? c.textSecondary : c.textMuted} />
                <View style={styles.rowText}>
                  <Text style={styles.rowCode}>{page.code}</Text>
                  <Text style={[styles.rowLabel, !page.route && styles.rowLabelDisabled]}>{page.label}</Text>
                </View>
                {page.route ? (
                  <ChevronRight size={16} color={c.textSecondary} />
                ) : (
                  <View style={styles.soonPill}>
                    <Text style={styles.soonText}>Soon</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const makeStyles = (c: AppColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background },
  content: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: "800", color: c.text },
  subheading: { fontSize: 12.5, color: c.textSecondary, marginTop: 4, marginBottom: 18 },
  section: { marginBottom: 18 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: c.gold, letterSpacing: 0.4, textTransform: "uppercase" },
  card: {
    backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.border, overflow: "hidden",
  },
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 14, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: c.border,
  },
  rowLast: { borderBottomWidth: 0 },
  rowText: { flex: 1 },
  rowCode: { fontSize: 10, fontWeight: "700", color: c.textMuted, letterSpacing: 0.4, marginBottom: 1 },
  rowLabel: { fontSize: 14, color: c.text, fontWeight: "600" },
  rowLabelDisabled: { color: c.textMuted },
  soonPill: { backgroundColor: c.surfaceElevated, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  soonText: { fontSize: 10.5, fontWeight: "700", color: c.textMuted },
});
