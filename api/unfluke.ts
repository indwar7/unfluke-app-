/**
 * unfluke.ts — API client for api.unfluke.in
 * All endpoints match the contract exactly.
 */

const SCREENER = "https://api.unfluke.in/api/screener";
const HISTORIC = "https://api.unfluke.in/api/historicData";

export type StockType = "C" | "S";
export type RatioSection =
  | "KeyFinancial" | "DuPont" | "Calculated"
  | "Valuation1" | "Valuation2" | "ValuationCalculated";

export interface SearchResult {
  "Company Name": string;
  NSESYMBOL?: string;
  BSESYMBOL?: string;
  "Capitaline Code"?: number | string;
}

async function api<T = any>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`[unfluke] HTTP ${res.status} — ${url}`);
  return res.json() as Promise<T>;
}

function toArray(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.results)) return raw.results;
  if (Array.isArray(raw?.data)) return raw.data;
  if (raw && typeof raw === "object") return [raw];
  return [];
}

export const unflukeAPI = {
  // Search
  searchStocks: (q: string): Promise<SearchResult[]> =>
    api(`${HISTORIC}/search?searchQuery=${encodeURIComponent(q.trim())}`).then(toArray),

  // Company
  getCompany: (capcode: string) =>
    api(`${SCREENER}/getCompany?capcode=${capcode}`),

  // symbol → capcode
  getCapcodeBySymbol: (symbol: string) =>
    api(`${HISTORIC}/search?searchQuery=${encodeURIComponent(symbol)}`).then((res: any) => {
      const list = toArray(res);
      const match = list.find(
        (r: SearchResult) =>
          r.NSESYMBOL?.toUpperCase() === symbol.toUpperCase() ||
          r.BSESYMBOL?.toUpperCase() === symbol.toUpperCase()
      );
      return match?.["Capitaline Code"] ?? null;
    }),

  // Financials
  getBalanceSheet: (capcode: string, type: StockType = "C") =>
    api(`${SCREENER}/getBalanceSheet?capcode=${capcode}&type=${type}`),

  getProfitLoss: (capcode: string, type: StockType = "C") =>
    api(`${SCREENER}/getProfitLoss?capcode=${capcode}&type=${type}`),

  getCashFlow: (capcode: string, type: StockType = "C") =>
    api(`${SCREENER}/getCashFlow?capcode=${capcode}&type=${type}`),

  getQuarterly: (capcode: string, type: StockType = "C") =>
    api(`${SCREENER}/getQuarterly?capcode=${capcode}&type=${type}`),

  // Ratios (6 sections)
  getRatios: (capcode: string, type: StockType = "C", section: RatioSection) =>
    api(`${SCREENER}/getCFRatio?capcode=${capcode}&type=${type}&section=${section}`),

  // Charts
  getDailyRatios: (capcode: string, type: StockType = "C") =>
    api(`${HISTORIC}/dailyratios?instrument=${capcode}&mode=${type}`).then(toArray),

  getCompanyTexts: (companyName: string, type: StockType = "C") =>
    api(`${SCREENER}/getCompanyTexts?companyname=${encodeURIComponent(companyName)}&type=${type}`).then(toArray),

  // Deals
  getBulkDeals: (capcode: string, page = 1) =>
    api(`${SCREENER}/getBulkBlockDeals?capcode=${capcode}&type=Bulk&page=${page}`),

  getBlockDeals: (capcode: string, page = 1) =>
    api(`${SCREENER}/getBulkBlockDeals?capcode=${capcode}&type=Block&page=${page}`),

  // Corporate events
  getCorporateEvents: (
    capcode: string,
    type: "Dividends" | "Bonus" | "StockSplit" | "InsiderTrading",
    page = 1
  ) => api(`${SCREENER}/getCorporateEvents?capcode=${capcode}&type=${type}&page=${page}`),

  // Shareholding
  getShareholdingPatterns: (capcode: string) =>
    api(`${SCREENER}/getShareholdingPatterns?capcode=${capcode}`),

  // Documents — step 1: resolve instrument code
  getCompanyCode: async (capcode: string): Promise<string> => {
    try {
      const co = await api(`${HISTORIC}/companycode?instrument=${capcode}`);
      if (co == null) return capcode;
      if (typeof co === "number" || typeof co === "string") return String(co);
      return co?.code ?? co?.companyCode ?? co?.instrument ?? co?.result ?? capcode;
    } catch { return capcode; }
  },

  // Documents — step 2
  getDocuments: (instrument: string) =>
    api(`${HISTORIC}/documents?instrument=${instrument}`),
};

/* ── Response types ──────────────────────────────────────── */
/** Shape returned by getBalanceSheet / getProfitLoss / getCashFlow / getQuarterly */
export interface FinancialResponse {
  results: Record<string, any[]>;   // { "2024": [{...}, {...}], "2023": [...] }
  headings?: Heading[];
}

export interface Heading {
  title: string;
  children?: string[];
}

/** Shape returned by getCFRatio for each section */
export interface RatioResponse {
  results: Record<string, any[]>;   // { "202403": [{...}] }
  headings?: Heading[];
}