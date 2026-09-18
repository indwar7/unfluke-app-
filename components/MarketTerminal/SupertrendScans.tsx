/**
 * components/MarketTerminal/SupertrendScans.tsx
 * Supertrend Scans (Watch List, doc3.md §2.6) — /api/v2/nse/scans/supertrend.
 */

import React from "react";
import { ScanScreen } from "./ScanScreen";
import type { Column } from "./GenericTable";

const TABS = [
  { key: "all", label: "All" },
  { key: "close_above", label: "Close Above" },
  { key: "close_below", label: "Close Below" },
];

const COLUMNS: Column[] = [
  { key: "symbol", label: "Symbol", flex: 1.4 },
  { key: "ltp", label: "LTP", flex: 1, align: "right" },
  { key: "pctChange", label: "Chg %", flex: 0.9, align: "right", format: (v) => (v != null ? `${v}%` : "—") },
  { key: "supertrend", label: "Supertrend", flex: 1.1, align: "right", format: (v) => (v != null ? v.toFixed(2) : "—") },
];

export default function SupertrendScans() {
  return <ScanScreen scan="supertrend" heading="Supertrend Scans" tabs={TABS} defaultTab="close_above" columns={COLUMNS} />;
}
