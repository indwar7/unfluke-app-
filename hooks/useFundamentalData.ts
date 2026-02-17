import { useQuery } from "@tanstack/react-query";
import { unflukeAPI, StockType, FinancialResponse, RatioResponse } from "../api/unfluke";

// Hook to search for a company (Symbol -> Capcode)
export function useCapcode(symbol: string) {
    return useQuery({
        queryKey: ["capcode", symbol],
        queryFn: async () => {
            if (!symbol) return null;
            try {
                const capcode = await unflukeAPI.getCapcodeBySymbol(symbol);
                return capcode;
            } catch (e) {
                console.warn("Capcode fetch failed for symbol:", symbol, e);
                return null;
            }
        },
        enabled: !!symbol && symbol.length > 1,
        staleTime: 1000 * 60 * 60,
        retry: false,
    });
}

// Hook to get Company Details
export function useCompany(capcode?: string) {
    return useQuery({
        queryKey: ["company", capcode],
        queryFn: async () => {
            if (!capcode) throw new Error("No capcode provided");
            return unflukeAPI.getCompanyInfo(capcode);
        },
        enabled: !!capcode,
        staleTime: 1000 * 60 * 60,
    });
}

// Hook to get All Financials
export function useFinancials(capcode?: string, type: StockType = "C") {
    return useQuery({
        queryKey: ["financials", capcode, type],
        queryFn: async () => {
            if (!capcode) throw new Error("No capcode provided");
            return unflukeAPI.getAllFinancials(capcode, type);
        },
        enabled: !!capcode,
        staleTime: 1000 * 60 * 30,
    });
}

// --- Data extraction helpers ---

// Flatten an array of partial objects into a single merged object
export function flattenYearArray(arr: Array<Record<string, any>>): Record<string, any> {
    const merged: Record<string, any> = {};
    for (const item of arr) {
        if (item && typeof item === "object") {
            Object.assign(merged, item);
        }
    }
    return merged;
}

// Get the available sorted period keys from a FinancialResponse
export function getPeriodKeys(response: FinancialResponse | RatioResponse | undefined): string[] {
    if (!response || !response.results) return [];
    return Object.keys(response.results).sort((a, b) => {
        const numA = parseInt(a);
        const numB = parseInt(b);
        return numB - numA; // Descending (latest first)
    });
}

// Get flattened section data for a specific period
export function getSectionDataForPeriod(
    response: FinancialResponse | RatioResponse | undefined,
    period: string
): Record<string, any> {
    if (!response || !response.results || !response.results[period]) return {};
    const arr = response.results[period];
    if (Array.isArray(arr)) {
        return flattenYearArray(arr);
    }
    return arr || {};
}

// Get headings from a financial response
export function getHeadings(
    response: FinancialResponse | RatioResponse | undefined
): Array<{ title: string; children?: string[] }> {
    if (!response || !response.headings) return [];
    return response.headings;
}

// Format a period key for display:  "2011" → "2011", "202306" → "Jun 2023", "200203" → "Mar 2002"
export function formatPeriodLabel(period: string): string {
    if (period.length === 4) return period;
    if (period.length === 6) {
        const year = period.substring(0, 4);
        const month = parseInt(period.substring(4, 6));
        const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${monthNames[month] || month} ${year}`;
    }
    return period;
}

// For ratio sections: merge all ratio data for a given period
export function getMergedRatioData(
    ratios: Record<string, RatioResponse> | undefined,
    period: string
): Record<string, any> {
    if (!ratios) return {};
    const merged: Record<string, any> = {};
    for (const sectionResp of Object.values(ratios)) {
        const data = getSectionDataForPeriod(sectionResp, period);
        Object.assign(merged, data);
    }
    return merged;
}

// Get merged ratio period keys (union of all ratio section keys)
export function getRatioPeriodKeys(ratios: Record<string, RatioResponse> | undefined): string[] {
    if (!ratios) return [];
    const keys = new Set<string>();
    for (const sectionResp of Object.values(ratios)) {
        if (sectionResp?.results) {
            Object.keys(sectionResp.results).forEach(k => keys.add(k));
        }
    }
    return Array.from(keys).sort((a, b) => parseInt(b) - parseInt(a));
}

// Get all ratio headings merged
export function getMergedRatioHeadings(
    ratios: Record<string, RatioResponse> | undefined
): Array<{ title: string; children?: string[] }> {
    if (!ratios) return [];
    const all: Array<{ title: string; children?: string[] }> = [];
    for (const sectionResp of Object.values(ratios)) {
        const hdgs = getHeadings(sectionResp);
        all.push(...hdgs);
    }
    return all;
}
