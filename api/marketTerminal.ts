/**
 * api/marketTerminal.ts
 *
 * Client for backend-allignz's /api/v2/nse namespace (Market Terminal).
 * Reuses the app-wide axios instance from helpers/api_helper.js, which already
 * attaches the bearer token via a request interceptor and points at
 * Config.BACKEND_URL (same host as backend-allignz).
 */

import { APIClient } from "../helpers/api_helper";

const api = new APIClient();
const NSE_BASE = "/api/v2/nse";

function nseGet<T = any>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const cleaned: Record<string, string> = {};
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") cleaned[k] = String(v);
    }
  }
  // APIClient.get() treats a truthy (even empty) params object as "append a
  // query string" — pass undefined instead of {} so a paramless call doesn't
  // produce a trailing "?" on the URL (helpers/api_helper.js:76).
  const hasParams = Object.keys(cleaned).length > 0;
  // The app-wide axios response interceptor (helpers/api_helper.js) already
  // unwraps response.data at runtime; axios's static types don't know that.
  return api.get(`${NSE_BASE}${path}`, hasParams ? cleaned : undefined) as unknown as Promise<T>;
}

export type SnapshotFeature =
  | "gainers" | "losers" | "most_active_volume" | "most_active_value"
  | "gap_up" | "gap_down" | "volume_gainers" | "52w_high" | "52w_low"
  | "oi_spurts" | "buildup_long" | "buildup_short" | "buildup_short_covering"
  | "buildup_long_unwinding" | "most_active_underlying" | "price_band_upper"
  | "price_band_lower" | "advances_declines";

export function getSnapshot(feature: SnapshotFeature, date?: string, segment?: string, dealType?: string) {
  return nseGet(`/snapshot/${feature}`, { date, segment, dealType });
}

export function getLiveFeature(feature: string, segment?: string, dealType?: string) {
  return nseGet(`/live/${feature}`, { segment, dealType });
}

export function getIndices(date?: string) {
  return nseGet(`/indices`, { date });
}

export function getIndexHistory(name: string, from?: string, to?: string) {
  return nseGet(`/indices/${encodeURIComponent(name)}`, { from, to });
}

export function getFiiDii(from?: string, to?: string) {
  return nseGet(`/fii-dii`, { from, to });
}

export function getGiftNifty() {
  return nseGet(`/gift-nifty`);
}

export function getEquityDaily(symbol: string, from?: string, to?: string) {
  return nseGet(`/equity/${encodeURIComponent(symbol)}`, { from, to });
}

export function getFoExpiries(symbol: string) {
  return nseGet(`/fo/expiries`, { symbol });
}

export function getFoOptionChain(symbol: string, expiry: string, date?: string) {
  return nseGet(`/fo/option-chain`, { symbol, expiry, date });
}

export function getIndexConstituents(name: string, asOf?: string) {
  return nseGet(`/index-constituents/${encodeURIComponent(name)}`, { asOf });
}

export function getPcr(symbol: string, date?: string) {
  return nseGet(`/pcr/${encodeURIComponent(symbol)}`, { date });
}

export function getPcrHistory(symbol: string, from?: string, to?: string) {
  return nseGet(`/pcr/${encodeURIComponent(symbol)}/history`, { from, to });
}

export function getCorporateActions(from?: string, to?: string) {
  return nseGet(`/corporate-actions`, { from, to });
}

export function getBoardMeetings(from?: string, to?: string, limit?: number, skip?: number) {
  return nseGet(`/board-meetings`, { from, to, limit, skip });
}

export function getIpos(from?: string, to?: string, limit?: number) {
  return nseGet(`/ipos`, { from, to, limit });
}

export function getLargeDeals(type: "bulk" | "block" | "short_selling", from?: string, to?: string) {
  return nseGet(`/large-deals`, { type, from, to });
}

export function getFilings(from?: string, to?: string, symbol?: string) {
  return nseGet(`/filings`, { from, to, symbol });
}

export function getCreditRatings(from?: string, to?: string, symbol?: string, agency?: string) {
  return nseGet(`/credit-ratings`, { from, to, symbol, agency });
}

export function getHolidays(segment?: string, year?: number) {
  return nseGet(`/holidays`, { segment, year });
}

export function getLotSizes() {
  return nseGet(`/lot-sizes`);
}

export function getLotSizeHistory(symbol: string) {
  return nseGet(`/lot-size/${encodeURIComponent(symbol)}`);
}

export function getDepository() {
  return nseGet(`/depository`);
}

export function getDepositoryReports() {
  return nseGet(`/depository/reports`);
}

export function getIntraday(direction: "gainers" | "losers", limit?: number, date?: string) {
  return nseGet(`/intraday/${direction}`, { limit, date });
}

// --- Option Mastery (/api/v2/nse/options/*) — doc3.md, 18 Sep 2026 ---

export function getOptionsLatest(name: string) {
  return nseGet(`/options/latest`, { name });
}

export function getOptionsOi(name: string, expiry: string, date?: string, time?: string) {
  return nseGet(`/options/oi`, { name, expiry, date, time });
}

export function getOptionsCombinedOi(name: string, expiry: string, date?: string, time?: string) {
  return nseGet(`/options/combined-oi`, { name, expiry, date, time });
}

export function getOptionsMultiStrike(name: string, expiry: string, strikes: string, date?: string, time?: string) {
  return nseGet(`/options/multi-strike`, { name, expiry, strikes, date, time });
}

export function getOptionsStraddles(expiry?: string, date?: string, time?: string) {
  return nseGet(`/options/straddles`, { expiry, date, time });
}

export type OptionTrendTab =
  | "active_contracts" | "active_value" | "oi_gainers" | "oi_losers"
  | "price_gainers" | "price_losers" | "volume_gainers";

export function getOptionsTrend(
  tab?: OptionTrendTab, expiry?: string, type?: "CE" | "PE" | "ALL",
  category?: "all" | "stock" | "index", date?: string, limit?: number,
) {
  return nseGet(`/options/trend`, { tab, expiry, type, category, date, limit });
}

// Option Simulator endpoints reused for instrument/expiry pickers (doc3.md §1.1) —
// not under /api/v2/nse, so bypass nseGet and call the app-wide axios instance directly.
export function getOptionNames() {
  return api.get(`/api/historicalChart/getOptionNames`) as unknown as Promise<any>;
}

export function getOptionsExpiryDateList(optionName: string, optionType: string, userId: string) {
  return api.get(`/api/historicalChart/getOptionsExpiryDate`, {
    optionName, optionType, id: userId,
  }) as unknown as Promise<any>;
}

// --- Watch List scans (/api/v2/nse/scans/*) — doc3.md, 18 Sep 2026 ---

export type ScanName = "rsi" | "adx" | "bollinger" | "macd" | "supertrend" | "moving-average" | "pivots";

export function getScan(scan: ScanName, tab?: string, date?: string, limit?: number) {
  return nseGet(`/scans/${scan}`, { tab, date, limit });
}

export function getChartPatterns(
  age?: "recent" | "historical" | "all", bias?: "bullish" | "bearish" | "neutral" | "all",
  types?: string, universe?: "all" | "nifty50" | "niftynext50" | "niftybank" | "fno",
  date?: string, limit?: number,
) {
  return nseGet(`/scans/patterns`, { age, bias, types, universe, date, limit });
}

// --- /api/v2/historical ---
const HISTORICAL_BASE = "/api/v2/historical";

function historicalGet<T = any>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const cleaned: Record<string, string> = {};
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") cleaned[k] = String(v);
    }
  }
  const hasParams = Object.keys(cleaned).length > 0;
  return api.get(`${HISTORICAL_BASE}${path}`, hasParams ? cleaned : undefined) as unknown as Promise<T>;
}

export type WeeklySymbol = "nifty" | "banknifty" | "sensex" | "gold";

export function getWeeklySeries() {
  return historicalGet(`/weekly`);
}

export function getWeeklyInstrument(symbol: WeeklySymbol, from?: string, to?: string, limit?: number) {
  return historicalGet(`/weekly/${symbol}`, { from, to, limit });
}

// --- /api/v2/simulator ---
const SIMULATOR_BASE = "/api/v2/simulator";

function simulatorGet<T = any>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const cleaned: Record<string, string> = {};
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") cleaned[k] = String(v);
    }
  }
  const hasParams = Object.keys(cleaned).length > 0;
  return api.get(`${SIMULATOR_BASE}${path}`, hasParams ? cleaned : undefined) as unknown as Promise<T>;
}

export function getSimInstruments() {
  return simulatorGet(`/instruments`);
}

export function getSimExpiries(name: string) {
  return simulatorGet(`/instruments/${encodeURIComponent(name)}/expiries`);
}

export function getSimOptionChain(name: string, expiry: string, at?: number, asOf?: 0 | 1) {
  return simulatorGet(`/option-chain`, { name, expiry, at, asOf });
}
