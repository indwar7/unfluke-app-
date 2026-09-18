/**
 * components/MarketTerminal/indexWeights.ts
 * NIFTY 50 free-float index weights, ported from the web app's hard-coded
 * table (unfluke-frontend/src/Unfluke_Pages/MarketTerminal/api/mockData.js,
 * published weights as of Aug 2026) — no weight field exists on the
 * /index-constituents API, so this is the only source of real weight data.
 */

export const INDEX_WEIGHT: Record<string, number> = {
  HDFCBANK: 9.97, ICICIBANK: 9.09, RELIANCE: 7.92, BHARTIARTL: 5.55, LT: 4.25,
  SBIN: 3.95, INFY: 3.67, AXISBANK: 3.13, 'M&M': 2.74, BAJFINANCE: 2.61,
  KOTAKBANK: 2.58, ITC: 2.40, TCS: 2.16, ZOMATO: 2.06, TITAN: 1.87,
  SUNPHARMA: 1.83, MARUTI: 1.62, NTPC: 1.44, TATASTEEL: 1.36, HINDALCO: 1.33,
  HCLTECH: 1.28, ULTRACEMCO: 1.23, 'BAJAJ-AUTO': 1.14, ADANIPORTS: 1.12,
  GRASIM: 1.10, ASIANPAINT: 1.09, POWERGRID: 1.08, INDIGO: 1.08, JSWSTEEL: 1.07,
  BAJAJFINSV: 1.04, EICHERMOT: 1.00, NESTLEIND: 0.96, TECHM: 0.93, TRENT: 0.89,
  COALINDIA: 0.87, ONGC: 0.82, ADANIENT: 0.82, CIPLA: 0.73, SBILIFE: 0.72,
  DRREDDY: 0.65, TATACONSUM: 0.63, TATAMOTORS: 0.63, HDFCLIFE: 0.52, WIPRO: 0.45,

  // Outside the Nifty 50 — approximate free-float weight on the same scale.
  DIVISLAB: 0.55, SIEMENS: 0.55, HEROMOTOCO: 0.50, BRITANNIA: 0.48, DMART: 0.45,
  ABB: 0.42, PIDILITIND: 0.40, DLF: 0.38, AMBUJACEM: 0.35, VBL: 0.35,
  BANKBARODA: 0.30, NAUKRI: 0.30, DABUR: 0.28, GODREJCP: 0.28, PNB: 0.28,
  MARICO: 0.25, FEDERALBNK: 0.25, IDFCFIRSTB: 0.22, CANBK: 0.22, POLICYBZR: 0.22,
  COLPAL: 0.20, SHREECEM: 0.20, GODREJPROP: 0.20, BERGEPAINT: 0.18,
  PHOENIXLTD: 0.18, PAYTM: 0.16, JUBLFOOD: 0.16, PGHH: 0.15, ACC: 0.14,
  IRCTC: 0.14, OBEROIRLTY: 0.13, BANDHANBNK: 0.12, NYKAA: 0.12, IGL: 0.10,
  GUJGASLTD: 0.08, DEVYANI: 0.07, MGL: 0.07, BAKING: 0.05,
};

/** Weight for a symbol; the tail default keeps an unknown name visible but small. */
export function getIndexWeight(symbol: string): number {
  return INDEX_WEIGHT[String(symbol).toUpperCase()] || 0.10;
}
