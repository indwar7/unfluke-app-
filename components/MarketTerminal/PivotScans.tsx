/**
 * components/MarketTerminal/PivotScans.tsx
 * Pivots (Watch List, doc3.md §2.8) — /api/v2/nse/scans/pivots.
 * Row carries p/tc/bc/r1-3/s1-3 plus crosses[] + crossedLabel — showing the
 * pivot (P) and the pre-built crossedLabel text rather than all 7 levels,
 * which won't fit a phone-width table.
 */

import React from "react";
import { ScanScreen } from "./ScanScreen";
import type { Column } from "./GenericTable";

const TABS = [
  { key: "all", label: "All" },
  { key: "crossed", label: "Crossed" },
];

const COLUMNS: Column[] = [
  { key: "symbol", label: "Symbol", flex: 1.1 },
  { key: "ltp", label: "LTP", flex: 0.8, align: "right" },
  { key: "p", label: "Pivot", flex: 0.8, align: "right", format: (v) => (v != null ? v.toFixed(2) : "—") },
  { key: "crossedLabel", label: "Crossed", flex: 2 },
];

export default function PivotScans() {
  return <ScanScreen scan="pivots" heading="Pivots" tabs={TABS} defaultTab="crossed" columns={COLUMNS} />;
}
