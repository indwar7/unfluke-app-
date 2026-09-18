/**
 * components/MarketTerminal/BollingerScans.tsx
 * Bollinger Band Scans (Watch List, doc3.md §2.4) — /api/v2/nse/scans/bollinger.
 */

import React from "react";
import { ScanScreen } from "./ScanScreen";
import type { Column } from "./GenericTable";

const TABS = [
  { key: "all", label: "All" },
  { key: "upper_from_below", label: "Upper ↑" },
  { key: "upper_from_above", label: "Upper ↓" },
  { key: "lower_from_below", label: "Lower ↑" },
  { key: "lower_from_above", label: "Lower ↓" },
];

const COLUMNS: Column[] = [
  { key: "symbol", label: "Symbol", flex: 1.3 },
  { key: "ltp", label: "LTP", flex: 0.9, align: "right" },
  { key: "pctChange", label: "Chg %", flex: 0.8, align: "right", format: (v) => (v != null ? `${v}%` : "—") },
  { key: "upper", label: "Upper", flex: 0.8, align: "right", format: (v) => (v != null ? v.toFixed(2) : "—") },
  { key: "lower", label: "Lower", flex: 0.8, align: "right", format: (v) => (v != null ? v.toFixed(2) : "—") },
];

export default function BollingerScans() {
  return <ScanScreen scan="bollinger" heading="Bollinger Band Scans" tabs={TABS} defaultTab="upper_from_below" columns={COLUMNS} />;
}
