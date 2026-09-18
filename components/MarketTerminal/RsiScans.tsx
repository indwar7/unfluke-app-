/**
 * components/MarketTerminal/RsiScans.tsx
 * RSI Scans (Watch List, doc3.md §2.2) — /api/v2/nse/scans/rsi.
 */

import React from "react";
import { ScanScreen } from "./ScanScreen";
import type { Column } from "./GenericTable";

const TABS = [
  { key: "all", label: "All" },
  { key: "overbought", label: "Overbought" },
  { key: "oversold", label: "Oversold" },
  { key: "trending_up", label: "Trending Up" },
  { key: "trending_down", label: "Trending Down" },
  { key: "bullish", label: "Bullish" },
  { key: "bearish", label: "Bearish" },
];

const COLUMNS: Column[] = [
  { key: "symbol", label: "Symbol", flex: 1.3 },
  { key: "ltp", label: "LTP", flex: 0.9, align: "right" },
  { key: "pctChange", label: "Chg %", flex: 0.9, align: "right", format: (v) => (v != null ? `${v}%` : "—") },
  { key: "rsi", label: "RSI", flex: 0.8, align: "right", format: (v) => (v != null ? v.toFixed(2) : "—") },
];

export default function RsiScans() {
  return <ScanScreen scan="rsi" heading="RSI Scans" tabs={TABS} defaultTab="overbought" columns={COLUMNS} />;
}
