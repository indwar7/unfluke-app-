/**
 * components/MarketTerminal/AdxScans.tsx
 * ADX Scans (Watch List, doc3.md §2.3) — /api/v2/nse/scans/adx.
 */

import React from "react";
import { ScanScreen } from "./ScanScreen";
import type { Column } from "./GenericTable";

const TABS = [
  { key: "all", label: "All" },
  { key: "cross_25", label: "Cross 25" },
  { key: "cross_40", label: "Cross 40" },
  { key: "uptrend", label: "Uptrend" },
  { key: "downtrend", label: "Downtrend" },
];

const COLUMNS: Column[] = [
  { key: "symbol", label: "Symbol", flex: 1.3 },
  { key: "ltp", label: "LTP", flex: 0.9, align: "right" },
  { key: "pctChange", label: "Chg %", flex: 0.8, align: "right", format: (v) => (v != null ? `${v}%` : "—") },
  { key: "adx", label: "ADX", flex: 0.8, align: "right", format: (v) => (v != null ? v.toFixed(2) : "—") },
  { key: "plusDI", label: "+DI", flex: 0.7, align: "right", format: (v) => (v != null ? v.toFixed(2) : "—") },
  { key: "minusDI", label: "-DI", flex: 0.7, align: "right", format: (v) => (v != null ? v.toFixed(2) : "—") },
];

export default function AdxScans() {
  return <ScanScreen scan="adx" heading="ADX Scans" tabs={TABS} defaultTab="cross_25" columns={COLUMNS} />;
}
