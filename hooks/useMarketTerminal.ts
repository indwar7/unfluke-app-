/**
 * hooks/useMarketTerminal.ts
 *
 * TanStack Query hooks over api/marketTerminal.ts.
 *
 * Staleness follows the spec's own policy (§4.1 of the Market Terminal doc):
 * daily snapshots 15min, live feeds 30s, reference data 60min.
 */

import { useQuery } from "@tanstack/react-query";
import {
  getSnapshot, getLiveFeature, getIndices, getIndexHistory, getFiiDii, getGiftNifty,
  getIndexConstituents, getPcr, getPcrHistory, getCorporateActions, getBoardMeetings,
  getIpos, getLargeDeals, getFilings, getCreditRatings, getLotSizes, getLotSizeHistory,
  getDepository, getDepositoryReports, getHolidays, getWeeklySeries, getWeeklyInstrument,
  getSimInstruments, getSimExpiries, getSimOptionChain,
  getOptionsLatest, getOptionsOi, getOptionsCombinedOi, getOptionsMultiStrike,
  getOptionsStraddles, getOptionsTrend, getOptionNames, getOptionsExpiryDateList,
  getScan, getChartPatterns,
  type SnapshotFeature, type WeeklySymbol, type OptionTrendTab, type ScanName,
} from "../api/marketTerminal";

const DAILY_STALE = 15 * 60 * 1000;
const LIVE_STALE = 30 * 1000;
const REFERENCE_STALE = 60 * 60 * 1000;

export function useSnapshot(feature: SnapshotFeature, date?: string, segment?: string, dealType?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["mt-snapshot", feature, date ?? "latest", segment, dealType],
    queryFn: () => getSnapshot(feature, date, segment, dealType),
    staleTime: DAILY_STALE,
    retry: 2,
    enabled,
  });
}

export function useLiveFeature(feature: string, segment?: string, dealType?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["mt-live", feature, segment, dealType],
    queryFn: () => getLiveFeature(feature, segment, dealType),
    staleTime: LIVE_STALE,
    retry: 2,
    enabled,
  });
}

export function useIndices(date?: string) {
  return useQuery({
    queryKey: ["mt-indices", date ?? "latest"],
    queryFn: () => getIndices(date),
    staleTime: DAILY_STALE,
    retry: 2,
  });
}

export function useIndexHistory(name: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ["mt-index-history", name, from, to],
    queryFn: () => getIndexHistory(name, from, to),
    enabled: !!name,
    staleTime: DAILY_STALE,
    retry: 2,
  });
}

export function useFiiDii(from?: string, to?: string) {
  return useQuery({
    queryKey: ["mt-fii-dii", from, to],
    queryFn: () => getFiiDii(from, to),
    staleTime: DAILY_STALE,
    retry: 2,
  });
}

export function useGiftNifty() {
  return useQuery({
    queryKey: ["mt-gift-nifty"],
    queryFn: () => getGiftNifty(),
    staleTime: REFERENCE_STALE,
    retry: 2,
  });
}

export function useIndexConstituents(name: string, asOf?: string) {
  return useQuery({
    queryKey: ["mt-index-constituents", name, asOf ?? "latest"],
    queryFn: () => getIndexConstituents(name, asOf),
    enabled: !!name,
    staleTime: DAILY_STALE,
    retry: 2,
  });
}

/**
 * PCR intraday, with the client-side closed-day fallback spec §4.3 requires
 * (the /pcr/:symbol endpoint has no server-side fallback — a day with
 * nothing stored is a plain 404). Steps back up to 20 calendar days.
 */
export function usePcr(symbol: string, date?: string) {
  return useQuery({
    queryKey: ["mt-pcr", symbol, date ?? "latest"],
    queryFn: async () => {
      if (!date) return { ...(await getPcr(symbol)), requestedDate: undefined, moved: false };
      let cursor = date;
      for (let attempt = 0; attempt < 20; attempt++) {
        try {
          const data = await getPcr(symbol, cursor);
          return { ...data, requestedDate: date, moved: cursor !== date };
        } catch (err: any) {
          const is404 = err?.response?.status === 404 || /NO_DATA/i.test(String(err?.message ?? err));
          if (!is404 || attempt === 19) throw err;
          const prev = new Date(cursor);
          prev.setDate(prev.getDate() - 1);
          cursor = prev.toISOString().slice(0, 10);
        }
      }
      throw new Error("No PCR data in the last 20 days");
    },
    enabled: !!symbol,
    staleTime: DAILY_STALE,
    retry: 1,
  });
}

export function usePcrHistory(symbol: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ["mt-pcr-history", symbol, from, to],
    queryFn: () => getPcrHistory(symbol, from, to),
    enabled: !!symbol,
    staleTime: DAILY_STALE,
    retry: 2,
  });
}

export function useCorporateActions(from?: string, to?: string) {
  return useQuery({
    queryKey: ["mt-corporate-actions", from, to],
    queryFn: () => getCorporateActions(from, to),
    staleTime: DAILY_STALE,
    retry: 2,
  });
}

export function useBoardMeetings(from?: string, to?: string, limit?: number, skip?: number) {
  return useQuery({
    queryKey: ["mt-board-meetings", from, to, limit, skip],
    queryFn: () => getBoardMeetings(from, to, limit, skip),
    staleTime: DAILY_STALE,
    retry: 2,
  });
}

export function useIpos(from?: string, to?: string, limit?: number) {
  return useQuery({
    queryKey: ["mt-ipos", from, to, limit],
    queryFn: () => getIpos(from, to, limit),
    staleTime: DAILY_STALE,
    retry: 2,
  });
}

export function useLargeDeals(type: "bulk" | "block" | "short_selling", from?: string, to?: string) {
  return useQuery({
    queryKey: ["mt-large-deals", type, from, to],
    queryFn: () => getLargeDeals(type, from, to),
    staleTime: DAILY_STALE,
    retry: 2,
  });
}

export function useFilings(from?: string, to?: string, symbol?: string) {
  return useQuery({
    queryKey: ["mt-filings", from, to, symbol],
    queryFn: () => getFilings(from, to, symbol),
    staleTime: DAILY_STALE,
    retry: 2,
  });
}

export function useCreditRatings(from?: string, to?: string, symbol?: string, agency?: string) {
  return useQuery({
    queryKey: ["mt-credit-ratings", from, to, symbol, agency],
    queryFn: () => getCreditRatings(from, to, symbol, agency),
    staleTime: DAILY_STALE,
    retry: 2,
  });
}

export function useLotSizes() {
  return useQuery({
    queryKey: ["mt-lot-sizes"],
    queryFn: () => getLotSizes(),
    staleTime: REFERENCE_STALE,
    retry: 2,
  });
}

export function useLotSizeHistory(symbol: string) {
  return useQuery({
    queryKey: ["mt-lot-size-history", symbol],
    queryFn: () => getLotSizeHistory(symbol),
    enabled: !!symbol,
    staleTime: REFERENCE_STALE,
    retry: 2,
  });
}

export function useDepository() {
  return useQuery({
    queryKey: ["mt-depository"],
    queryFn: () => getDepository(),
    staleTime: DAILY_STALE,
    retry: 2,
  });
}

export function useDepositoryReports() {
  return useQuery({
    queryKey: ["mt-depository-reports"],
    queryFn: () => getDepositoryReports(),
    staleTime: DAILY_STALE,
    retry: 2,
  });
}

export function useHolidays(segment?: string, year?: number) {
  return useQuery({
    queryKey: ["mt-holidays", segment, year],
    queryFn: () => getHolidays(segment, year),
    staleTime: REFERENCE_STALE,
    retry: 2,
  });
}

export function useWeeklySeries() {
  return useQuery({
    queryKey: ["mt-weekly-series"],
    queryFn: () => getWeeklySeries(),
    staleTime: REFERENCE_STALE,
    retry: 2,
  });
}

export function useWeeklyInstrument(symbol: WeeklySymbol, from?: string, to?: string, limit?: number) {
  return useQuery({
    queryKey: ["mt-weekly-instrument", symbol, from, to, limit],
    queryFn: () => getWeeklyInstrument(symbol, from, to, limit),
    enabled: !!symbol,
    staleTime: REFERENCE_STALE,
    retry: 2,
  });
}

export function useSimInstruments() {
  return useQuery({
    queryKey: ["mt-sim-instruments"],
    queryFn: () => getSimInstruments(),
    staleTime: REFERENCE_STALE,
    retry: 2,
  });
}

export function useSimExpiries(name: string) {
  return useQuery({
    queryKey: ["mt-sim-expiries", name],
    queryFn: () => getSimExpiries(name),
    enabled: !!name,
    staleTime: DAILY_STALE,
    retry: 2,
  });
}

export function useSimOptionChain(name: string, expiry: string, at?: number, asOf?: 0 | 1) {
  return useQuery({
    queryKey: ["mt-sim-option-chain", name, expiry, at, asOf],
    queryFn: () => getSimOptionChain(name, expiry, at, asOf),
    enabled: !!name && !!expiry,
    staleTime: LIVE_STALE,
    retry: 2,
  });
}

// --- Option Mastery ---

export function useOptionNames() {
  return useQuery({
    queryKey: ["mt-option-names"],
    queryFn: () => getOptionNames(),
    staleTime: REFERENCE_STALE,
    retry: 2,
  });
}

export function useOptionsExpiryDateList(optionName: string, optionType: string, userId: string) {
  return useQuery({
    queryKey: ["mt-option-expiries", optionName, optionType, userId],
    queryFn: () => getOptionsExpiryDateList(optionName, optionType, userId),
    enabled: !!optionName && !!optionType && !!userId,
    staleTime: REFERENCE_STALE,
    retry: 2,
  });
}

export function useOptionsLatest(name: string) {
  return useQuery({
    queryKey: ["mt-options-latest", name],
    queryFn: () => getOptionsLatest(name),
    enabled: !!name,
    staleTime: DAILY_STALE,
    retry: 2,
  });
}

export function useOptionsOi(name: string, expiry: string, date?: string, time?: string) {
  return useQuery({
    queryKey: ["mt-options-oi", name, expiry, date ?? "latest", time ?? "close"],
    queryFn: () => getOptionsOi(name, expiry, date, time),
    enabled: !!name && !!expiry,
    staleTime: DAILY_STALE,
    retry: 2,
  });
}

export function useOptionsCombinedOi(name: string, expiry: string, date?: string, time?: string) {
  return useQuery({
    queryKey: ["mt-options-combined-oi", name, expiry, date ?? "latest", time ?? "close"],
    queryFn: () => getOptionsCombinedOi(name, expiry, date, time),
    enabled: !!name && !!expiry,
    staleTime: DAILY_STALE,
    retry: 2,
  });
}

export function useOptionsMultiStrike(name: string, expiry: string, strikes: string, date?: string, time?: string) {
  return useQuery({
    queryKey: ["mt-options-multi-strike", name, expiry, strikes, date ?? "latest", time ?? "close"],
    queryFn: () => getOptionsMultiStrike(name, expiry, strikes, date, time),
    enabled: !!name && !!expiry && !!strikes,
    staleTime: DAILY_STALE,
    retry: 2,
  });
}

export function useOptionsStraddles(expiry?: string, date?: string, time?: string) {
  return useQuery({
    queryKey: ["mt-options-straddles", expiry ?? "nearest", date ?? "latest", time ?? "close"],
    queryFn: () => getOptionsStraddles(expiry, date, time),
    staleTime: DAILY_STALE,
    retry: 2,
  });
}

export function useOptionsTrend(
  tab?: OptionTrendTab, expiry?: string, type?: "CE" | "PE" | "ALL",
  category?: "all" | "stock" | "index", date?: string, limit?: number,
) {
  return useQuery({
    queryKey: ["mt-options-trend", tab, expiry, type, category, date ?? "latest", limit],
    queryFn: () => getOptionsTrend(tab, expiry, type, category, date, limit),
    staleTime: DAILY_STALE,
    retry: 2,
  });
}

// --- Watch List scans ---

export function useScan(scan: ScanName, tab?: string, date?: string, limit?: number) {
  return useQuery({
    queryKey: ["mt-scan", scan, tab, date ?? "latest", limit],
    queryFn: () => getScan(scan, tab, date, limit),
    staleTime: DAILY_STALE,
    retry: 2,
  });
}

export function useChartPatterns(
  age?: "recent" | "historical" | "all", bias?: "bullish" | "bearish" | "neutral" | "all",
  types?: string, universe?: "all" | "nifty50" | "niftynext50" | "niftybank" | "fno",
  date?: string, limit?: number,
) {
  return useQuery({
    queryKey: ["mt-patterns", age, bias, types, universe, date ?? "latest", limit],
    queryFn: () => getChartPatterns(age, bias, types, universe, date, limit),
    staleTime: DAILY_STALE,
    retry: 2,
  });
}
