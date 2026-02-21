/**
 * hooks/useFundamentalData.ts
 *
 * EXACT API CONTRACT  (base: https://api.unfluke.in/api/screener)
 *   getCompany?capcode=476
 *   getBalanceSheet?capcode=476&type=C
 *   getProfitLoss?capcode=476&type=C
 *   getCashFlow?capcode=476&type=C
 *   getQuarterly?capcode=476&type=C
 *   getCFRatio?capcode=476&type=C&section=KeyFinancial
 *   getCFRatio?capcode=476&type=C&section=DuPont
 *   getCFRatio?capcode=476&type=C&section=Calculated
 *   getCFRatio?capcode=476&type=C&section=Valuation1
 *   getCFRatio?capcode=476&type=C&section=Valuation2
 *   getCFRatio?capcode=476&type=C&section=ValuationCalculated
 */

import { useQuery } from "@tanstack/react-query";

const BASE = "https://api.unfluke.in/api/screener";

export const RATIO_SECTIONS = [
  "KeyFinancial", "DuPont", "Calculated", "Valuation1", "Valuation2", "ValuationCalculated",
] as const;
export type RatioSection = typeof RATIO_SECTIONS[number];

export type FinancialsData = {
  balanceSheet: any;
  profitLoss: any;
  cashFlow: any;
  quarterly: any;
  ratios: Record<RatioSection, any>;
};

async function get(url: string): Promise<any> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${url}`);
  return r.json();
}

/* ── useCompany ─────────────────────────────────────────── */
export function useCompany(capcode: string | number | undefined) {
  return useQuery({
    queryKey: ["company", String(capcode ?? "")],
    queryFn: () => get(`${BASE}/getCompany?capcode=${capcode}`),
    enabled: !!capcode,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/* ── useFinancials ──────────────────────────────────────── */
export function useFinancials(
  capcode: string | number | undefined,
  type: "C" | "S" = "C",
) {
  return useQuery<FinancialsData>({
    queryKey: ["financials", String(capcode ?? ""), type],
    queryFn: async (): Promise<FinancialsData> => {
      if (!capcode) throw new Error("capcode required");
      const q = `capcode=${capcode}&type=${type}`;

      const [bs, pl, cf, qr, kf, dp, ca, v1, v2, vc] = await Promise.all([
        get(`${BASE}/getBalanceSheet?${q}`).catch(e => { console.warn("BS", e.message); return null; }),
        get(`${BASE}/getProfitLoss?${q}`).catch(e => { console.warn("PL", e.message); return null; }),
        get(`${BASE}/getCashFlow?${q}`).catch(e => { console.warn("CF", e.message); return null; }),
        get(`${BASE}/getQuarterly?${q}`).catch(e => { console.warn("QR", e.message); return null; }),
        get(`${BASE}/getCFRatio?${q}&section=KeyFinancial`).catch(() => null),
        get(`${BASE}/getCFRatio?${q}&section=DuPont`).catch(() => null),
        get(`${BASE}/getCFRatio?${q}&section=Calculated`).catch(() => null),
        get(`${BASE}/getCFRatio?${q}&section=Valuation1`).catch(() => null),
        get(`${BASE}/getCFRatio?${q}&section=Valuation2`).catch(() => null),
        get(`${BASE}/getCFRatio?${q}&section=ValuationCalculated`).catch(() => null),
      ]);

      return {
        balanceSheet: bs, profitLoss: pl, cashFlow: cf, quarterly: qr,
        ratios: {
          KeyFinancial: kf, DuPont: dp, Calculated: ca,
          Valuation1: v1, Valuation2: v2, ValuationCalculated: vc
        },
      };
    },
    enabled: !!capcode,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/* ── getPeriodKeys ─────────────────────────────────────── */
const META = new Set([
  "label", "name", "description", "rowLabel", "rowName", "category",
  "id", "type", "unit", "format", "indent", "bold", "separator", "subRows",
]);

export function getPeriodKeys(res: any): string[] {
  if (!res) return [];
  try {
    // Primary format: { results: { "2024": [...], "2023": [...] } }
    if (res.results && typeof res.results === "object" && !Array.isArray(res.results)) {
      const ks = Object.keys(res.results).filter(k => !META.has(k));
      if (ks.length) {
        // Sort: numeric descending (newest first)
        return ks.sort((a, b) => {
          const na = parseInt(a), nb = parseInt(b);
          if (!isNaN(na) && !isNaN(nb)) return nb - na;
          return b.localeCompare(a);
        });
      }
    }
    // Fallback: headers / periods / columns arrays
    for (const k of ["headers", "periods", "columns", "yearHeaders"]) {
      if (Array.isArray(res[k]) && res[k].length) return res[k];
    }
    if (res.data && typeof res.data === "object" && !Array.isArray(res.data)) {
      const ks = Object.keys(res.data).filter(k => !META.has(k));
      if (ks.length) return ks;
    }
    if (Array.isArray(res) && res.length) {
      const first = res[0];
      if (first && typeof first === "object" && !Array.isArray(first)) {
        const ks = Object.keys(first).filter(k => !META.has(k));
        if (ks.length) return ks;
      }
    }
    if (typeof res === "object" && !Array.isArray(res)) {
      const ks = Object.keys(res).filter(k => !META.has(k) && k !== "headings" && k !== "results");
      if (ks.length) return ks;
    }
  } catch { }
  return [];
}

export function getRatioPeriodKeys(ratios: Record<string, any> | undefined): string[] {
  if (!ratios) return [];
  for (const s of RATIO_SECTIONS) {
    const ks = getPeriodKeys(ratios[s]);
    if (ks.length) return ks;
  }
  return [];
}

/* ── formatPeriodLabel ─────────────────────────────────── */
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function formatPeriodLabel(p: string): string {
  if (!p) return "";
  if (/[A-Za-z]/.test(p)) return p.replace(/-(\d{2})$/, (_, y) => ` 20${y}`);
  if (/^\d{6}$/.test(p)) return `${MON[+p.slice(4, 6) - 1] ?? ""} ${p.slice(0, 4)}`;
  if (/^\d{5}$/.test(p)) return `Q${p[4]} ${p.slice(0, 4)}`;
  return p;
}

/* ── getMergedRatioData ────────────────────────────────── */
export function getMergedRatioData(
  ratios: Record<string, any> | undefined,
  period: string,
): Record<string, any> {
  if (!ratios || !period) return {};
  const out: Record<string, any> = {};
  for (const s of RATIO_SECTIONS) {
    const d = ratios[s];
    if (!d) continue;
    try {
      // API format: { results: { "202403": [ {key: val, key: val} ] }, headings: [...] }
      if (d.results?.[period]) {
        const periodData = d.results[period];
        if (Array.isArray(periodData)) {
          for (const obj of periodData) {
            if (obj && typeof obj === "object") Object.assign(out, obj);
          }
        } else if (typeof periodData === "object") {
          Object.assign(out, periodData);
        }
        continue;
      }
      // Legacy/fallback: rows array
      const rows = Array.isArray(d) ? d : Array.isArray(d.rows) ? d.rows : null;
      if (rows) {
        for (const row of rows) {
          const k = row?.label || row?.name || row?.description;
          if (k && row[period] != null) out[k] = row[period];
        }
        continue;
      }
      if (d.data?.[period] && typeof d.data[period] === "object") { Object.assign(out, d.data[period]); continue; }
      if (d[period] && typeof d[period] === "object") Object.assign(out, d[period]);
    } catch { }
  }
  return out;
}

/* ── getSectionDataForPeriod ──────────────────────────── */
/**
 * Extract a flat key→value map for one period from a financial response.
 * API returns: { results: { "2024": [ {k:v, k:v}, {k:v} ], "2023": [...] } }
 * Each period is an array of objects; we merge them into one flat object.
 */
export function getSectionDataForPeriod(
  response: any,
  period: string,
): Record<string, any> {
  if (!response || !period) return {};
  try {
    const results = response?.results;
    if (!results) return {};

    const periodData = results[period];
    if (!periodData) return {};

    // Most common: array of objects → merge into flat map
    if (Array.isArray(periodData)) {
      const out: Record<string, any> = {};
      for (const obj of periodData) {
        if (obj && typeof obj === "object") Object.assign(out, obj);
      }
      return out;
    }

    // Single object
    if (typeof periodData === "object") return { ...periodData };
  } catch { }
  return {};
}

/* ── getHeadings ──────────────────────────────────────── */
/**
 * Extract headings from a financial response.
 * API returns: { headings: [ { title: "Total Shareholders Fund", children: ["Share Capital", "Reserves"] } ] }
 */
export function getHeadings(response: any): { title: string; children?: string[] }[] {
  if (!response) return [];
  try {
    if (Array.isArray(response.headings)) return response.headings;
  } catch { }
  return [];
}

/* ── getMergedRatioHeadings ───────────────────────────── */
/**
 * Merge headings from all 6 ratio sections into one list.
 */
export function getMergedRatioHeadings(
  ratios: Record<string, any> | undefined,
): { title: string; children?: string[] }[] {
  if (!ratios) return [];
  const out: { title: string; children?: string[] }[] = [];
  const seenTitles = new Set<string>();
  for (const s of RATIO_SECTIONS) {
    const d = ratios[s];
    if (!d) continue;
    try {
      const headings = getHeadings(d);
      for (const h of headings) {
        if (!seenTitles.has(h.title)) {
          seenTitles.add(h.title);
          out.push(h);
        }
      }
    } catch { }
  }
  return out;
}