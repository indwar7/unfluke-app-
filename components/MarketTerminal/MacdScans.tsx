/**
 * components/MarketTerminal/MacdScans.tsx
 * MACD Scans (Watch List, doc3.md §2.5) — /api/v2/nse/scans/macd.
 */

import React from "react";
import { ScanScreen } from "./ScanScreen";
import type { Column } from "./GenericTable";

const TABS = [
  { key: "all", label: "All" },
  { key: "cross_above", label: "Cross Above" },
  { key: "cross_below", label: "Cross Below" },
];

const COLUMNS: Column[] = [
  { key: "symbol", label: "Symbol", flex: 1.3 },
  { key: "ltp", label: "LTP", flex: 0.9, align: "right" },
  { key: "pctChange", label: "Chg %", flex: 0.8, align: "right", format: (v) => (v != null ? `${v}%` : "—") },
  { key: "macd", label: "MACD", flex: 0.9, align: "right", format: (v) => (v != null ? v.toFixed(2) : "—") },
  { key: "signal", label: "Signal", flex: 0.9, align: "right", format: (v) => (v != null ? v.toFixed(2) : "—") },
];

export default function MacdScans() {
  return <ScanScreen scan="macd" heading="MACD Scans" tabs={TABS} defaultTab="cross_above" columns={COLUMNS} />;
}
