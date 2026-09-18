/**
 * components/MarketTerminal/MovingAverageScans.tsx
 * Moving Average Crossover (Watch List, doc3.md §2.7) — /api/v2/nse/scans/moving-average.
 * Row carries dma20..dma200 ("breakout"/"breakdown"/null) + sma20..sma200 —
 * showing `events` (how many averages crossed) instead of all 8 fields, which
 * won't fit a phone-width table.
 */

import React from "react";
import { ScanScreen } from "./ScanScreen";
import type { Column } from "./GenericTable";

const TABS = [
  { key: "all", label: "All" },
  { key: "breakout", label: "Breakout" },
  { key: "breakdown", label: "Breakdown" },
];

const COLUMNS: Column[] = [
  { key: "symbol", label: "Symbol", flex: 1.4 },
  { key: "ltp", label: "LTP", flex: 1, align: "right" },
  { key: "pctChange", label: "Chg %", flex: 1, align: "right", format: (v) => (v != null ? `${v}%` : "—") },
  { key: "events", label: "Crossed", flex: 0.9, align: "right" },
];

export default function MovingAverageScans() {
  return <ScanScreen scan="moving-average" heading="Moving Average Crossover" tabs={TABS} defaultTab="breakout" columns={COLUMNS} />;
}
