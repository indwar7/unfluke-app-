import { useQuery } from "@tanstack/react-query";
import { unflukeAPI, StockType } from "../api/unflukeAPI";

/* ─────────────────────────────────────────────
   CAPCODE RESOLUTION
───────────────────────────────────────────── */

export function useCapcode(symbol: string) {
  return useQuery({
    queryKey: ["capcode", symbol],
    enabled: !!symbol && symbol.length > 1,
    staleTime: 1000 * 60 * 60,
    retry: false,
    queryFn: async () => {
      if (!symbol) return null;
      try {
        return await unflukeAPI.getCapcodeBySymbol(symbol);
      } catch (e) {
        console.warn("Capcode fetch failed:", symbol, e);
        return null;
      }
    },
  });
}

/* ─────────────────────────────────────────────
   COMPANY (MINIMAL – SCREEN JUST NEEDS EXISTENCE)
───────────────────────────────────────────── */

export function useCompany(capcode?: string) {
  return useQuery({
    queryKey: ["company", capcode],
    enabled: !!capcode,
    staleTime: 1000 * 60 * 60,
    queryFn: async () => {
      if (!capcode) throw new Error("No capcode");
      return { capcode };
    },
  });
}

/* ─────────────────────────────────────────────
   ALL FINANCIALS
───────────────────────────────────────────── */

export function useFinancials(capcode?: string, type: StockType = "C") {
  return useQuery({
    queryKey: ["financials", capcode, type],
    enabled: !!capcode,
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      if (!capcode) throw new Error("No capcode");

      const [
        balanceSheet,
        profitLoss,
        cashFlow,
        quarterly,
        keyFinancial,
        duPont,
        calculated,
        valuation1,
        valuation2,
        valuationCalculated,
      ] = await Promise.all([
        unflukeAPI.getBalanceSheet(capcode, type),
        unflukeAPI.getProfitLoss(capcode, type),
        unflukeAPI.getCashFlow(capcode, type),
        unflukeAPI.getQuarterly(capcode, type),

        unflukeAPI.getRatios(capcode, type, "KeyFinancial"),
        unflukeAPI.getRatios(capcode, type, "DuPont"),
        unflukeAPI.getRatios(capcode, type, "Calculated"),
        unflukeAPI.getRatios(capcode, type, "Valuation1"),
        unflukeAPI.getRatios(capcode, type, "Valuation2"),
        unflukeAPI.getRatios(capcode, type, "ValuationCalculated"),
      ]);

      return {
        balanceSheet,
        profitLoss,
        cashFlow,
        quarterly,
        ratios: {
          KeyFinancial: keyFinancial,
          DuPont: duPont,
          Calculated: calculated,
          Valuation1: valuation1,
          Valuation2: valuation2,
          ValuationCalculated: valuationCalculated,
        },
      };
    },
  });
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

type AnyObj = Record<string, any>;

// Flatten array of row-objects into single object
export function flattenYearArray(arr: AnyObj[]): AnyObj {
  const merged: AnyObj = {};
  arr?.forEach(obj => {
    if (obj && typeof obj === "object") Object.assign(merged, obj);
  });
  return merged;
}

// Get available period keys
export function getPeriodKeys(response?: AnyObj): string[] {
  if (!response?.results || typeof response.results !== "object") return [];
  return Object.keys(response.results).sort((a, b) => parseInt(b) - parseInt(a));
}

// Get section data for selected period
export function getSectionDataForPeriod(response: AnyObj | undefined, period: string): AnyObj {
  if (!response?.results?.[period]) return {};
  const rows = response.results[period];
  return Array.isArray(rows) ? flattenYearArray(rows) : rows;
}

// Get headings
export function getHeadings(response?: AnyObj) {
  return Array.isArray(response?.headings) ? response.headings : [];
}

// Period label formatter
export function formatPeriodLabel(period: string): string {
  if (!period) return "";
  if (period.length === 4) return period;
  if (period.length === 6) {
    const year = period.slice(0, 4);
    const month = parseInt(period.slice(4), 10);
    const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[month] || month} ${year}`;
  }
  return period;
}

// Merge ratio data across all sections
export function getMergedRatioData(ratios: AnyObj | undefined, period: string): AnyObj {
  const merged: AnyObj = {};
  if (!ratios || !period) return merged;

  Object.values(ratios).forEach((section: any) => {
    const data = getSectionDataForPeriod(section, period);
    Object.assign(merged, data);
  });

  return merged;
}

// Ratio period keys
export function getRatioPeriodKeys(ratios: AnyObj | undefined): string[] {
  if (!ratios?.KeyFinancial?.results) return [];
  return Object.keys(ratios.KeyFinancial.results).sort((a, b) => parseInt(b) - parseInt(a));
}

// Merge all ratio headings
export function getMergedRatioHeadings(ratios: AnyObj | undefined) {
  const list: AnyObj[] = [];
  Object.values(ratios || {}).forEach((section: any) => {
    if (Array.isArray(section?.headings)) list.push(...section.headings);
  });
  return list;
}