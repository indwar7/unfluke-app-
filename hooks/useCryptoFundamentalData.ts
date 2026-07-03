/**
 * hooks/useCryptoFundamentalData.ts
 *
 * Crypto Fundamentals data layer — mirrors the website's crypto fundamentals
 * pages (CryptoFundamental.jsx overview + CryptoDetails.jsx 9 tabs).
 *
 * Two kinds of sources:
 *  1. Own backend  (api.unfluke.in/api/crypto/*) — called via backend_helper
 *     getters so the axios interceptor attaches the `mrkt` + auth headers.
 *  2. Third-party  (CoinGecko / blockchain.info / alternative.me) — called with
 *     PLAIN fetch (no auth/mrkt header; those hosts would reject our headers).
 *
 * Every call is individually `.catch()`-guarded to null so one failing endpoint
 * never blanks the whole screen (a missing series just renders empty).
 *
 * NOTE: exact JSON field shapes aren't documented in crypto.md — the hook
 * returns the raw payloads and the UI reads defensively. Adjust field access in
 * the tab components once real responses are observed on device.
 */

import { useQuery } from "@tanstack/react-query";
import {
  getCryptoCoinInfo,
  getCryptoCoinInfoAlt,
  getCryptoDerivatives,
  getCryptoLightning,
  getCryptoOnChain,
  getCryptoPriceHistory,
  getCryptoEtherScanOnChain,
  getCryptoSearchCoins,
  getCryptoAllCoins,
  getCryptoFearGreed,
  getCryptoGlobalMarket,
  getCryptoBtcHashRate,
  getCryptoBtcMinersRevenue,
  getCryptoBtcTxnVolume,
  getCryptoBtcTxnCount,
  getCryptoBtcDifficulty,
  getCryptoBtcTotalFees,
  getCryptoBtcTotalBitcoins,
  getCryptoBtcUtxoCount,
  getCryptoBtcAvgBlockSize,
  getCryptoBtcBlockchainSize,
  getCryptoBtcMempoolSize,
  getCryptoBtcMarketCap,
  getCryptoBtcNetworkActivities,
  getCryptoBtcLightnings,
} from "../Unfluke_helpers/backend_helper";

// A backend call that resolves to null on any error, so a single dead endpoint
// doesn't reject the whole Promise.all.
const safe = <T,>(p: Promise<T> | undefined, label?: string): Promise<T | null> =>
  Promise.resolve(p)
    .then((r) => (r as any) ?? null)
    .catch((e) => {
      if (label) console.warn(`[cryptoFund] ${label}:`, e?.message || e);
      return null;
    });

/* ── Third-party (plain fetch, no auth/mrkt header) ─────────── */

// CoinGecko symbol → id map (subset used on the web; extend as needed).
export const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin", ETH: "ethereum", SOL: "solana", XRP: "ripple",
  ADA: "cardano", DOGE: "dogecoin", BNB: "binancecoin", TRX: "tron",
  DOT: "polkadot", MATIC: "matic-network", LTC: "litecoin", AVAX: "avalanche-2",
  LINK: "chainlink", ATOM: "cosmos", XLM: "stellar", UNI: "uniswap",
  BCH: "bitcoin-cash", ETC: "ethereum-classic", FIL: "filecoin", APT: "aptos",
};

async function fetchJson(url: string, label?: string): Promise<any | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e: any) {
    if (label) console.warn(`[cryptoFund] ${label}:`, e?.message || e);
    return null;
  }
}

/** Live price + 24h change via CoinGecko simple/price (60s refetch). */
export function useCoinLivePrice(symbol: string | undefined) {
  const id = symbol ? COINGECKO_IDS[symbol.toUpperCase()] : undefined;
  return useQuery({
    queryKey: ["cg-price", id ?? ""],
    enabled: !!id,
    refetchInterval: 60 * 1000,
    staleTime: 55 * 1000,
    queryFn: () =>
      fetchJson(
        `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`,
        "coingecko-price"
      ),
  });
}

/** Fear & Greed index history (alternative.me). */
export function useFearGreed(limit = 30) {
  return useQuery({
    queryKey: ["fng", limit],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      // Prefer own backend (market-scoped); fall back to alternative.me.
      const own = await safe(getCryptoFearGreed(), "fearGreed(own)");
      if (own) return own;
      return fetchJson(`https://api.alternative.me/fng/?limit=${limit}`, "fng");
    },
  });
}

/* ── Coin search (own backend, mrkt header) ─────────────────── */
export function useCryptoSearch(query: string) {
  return useQuery({
    queryKey: ["crypto-search", query],
    enabled: query.trim().length > 0,
    staleTime: 60 * 1000,
    queryFn: () => safe(getCryptoSearchCoins({ searchText: query }), "searchCoins"),
  });
}

export function useAllCoins() {
  return useQuery({
    queryKey: ["crypto-all-coins"],
    staleTime: 10 * 60 * 1000,
    queryFn: () => safe(getCryptoAllCoins(), "allCoins"),
  });
}

/* ── OVERVIEW bundle ────────────────────────────────────────
 * KPI cards + the 5 overview charts (Price 15d, Tx volume 30d,
 * Miners revenue 30d, Hash rate 30d, Fear & Greed 15d).
 */
export type CryptoOverview = {
  coinInfo: any;
  global: any;
  fearGreed: any;
  priceHistory: any;
  hashRate: any;
  minersRevenue: any;
  txVolume: any;
};

export function useCryptoOverview(symbol: string | undefined) {
  return useQuery<CryptoOverview>({
    queryKey: ["crypto-overview", symbol ?? ""],
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    queryFn: async (): Promise<CryptoOverview> => {
      const p = { symbol };
      const [coinInfo, coinInfoAlt, global, fearGreed, priceHistory, hashRate, minersRevenue, txVolume] =
        await Promise.all([
          safe(getCryptoCoinInfo(p), "coinInfo"),
          safe(getCryptoCoinInfoAlt(p), "coinInfoAlt"),
          safe(getCryptoGlobalMarket(), "global"),
          safe(getCryptoFearGreed(), "fearGreed"),
          safe(getCryptoPriceHistory(p), "priceHistory"),
          safe(getCryptoBtcHashRate(), "hashRate"),
          safe(getCryptoBtcMinersRevenue(), "minersRevenue"),
          safe(getCryptoBtcTxnVolume(), "txVolume"),
        ]);
      return {
        coinInfo: coinInfo || coinInfoAlt,
        global,
        fearGreed,
        priceHistory,
        hashRate,
        minersRevenue,
        txVolume,
      };
    },
  });
}

/* ── DETAILS bundle (feeds all 9 tabs) ──────────────────────
 * Tab → source mapping (from crypto.md §6):
 *   OnChain/Mining/NetworkActivity/BlockchainStats → getOnChainData
 *   MarketIndicators/SupplyMetrics               → getCoinInfo
 *   PriceHistory                                  → getCoinInfo + getPriceHistory
 *   Derivatives                                   → getDerivativesData
 *   LightningNetwork                              → getLightningNetwork + getCoinInfo
 * We additionally pull the individual bitcoin on-chain series for the richer
 * BTC charts the website shows.
 */
export type CryptoDetails = {
  coinInfo: any;
  onChain: any;
  derivatives: any;
  lightning: any;
  priceHistory: any;
  etherscan: any;
  series: {
    hashRate: any; difficulty: any; minersRevenue: any; totalFees: any;
    txVolume: any; txCount: any; utxoCount: any; totalBitcoins: any;
    avgBlockSize: any; blockchainSize: any; mempoolSize: any; marketCap: any;
    networkActivities: any; lightnings: any;
  };
};

export function useCryptoDetails(symbol: string | undefined) {
  const isBtc = (symbol || "").toUpperCase() === "BTC";
  return useQuery<CryptoDetails>({
    queryKey: ["crypto-details", symbol ?? ""],
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    queryFn: async (): Promise<CryptoDetails> => {
      const p = { symbol };
      const [coinInfo, onChain, derivatives, lightning, priceHistory, etherscan] =
        await Promise.all([
          safe(getCryptoCoinInfo(p), "coinInfo"),
          safe(getCryptoOnChain(p), "onChain"),
          safe(getCryptoDerivatives(p), "derivatives"),
          safe(getCryptoLightning(p), "lightning"),
          safe(getCryptoPriceHistory(p), "priceHistory"),
          safe(getCryptoEtherScanOnChain(p), "etherscan"),
        ]);

      // Bitcoin-only rich on-chain series (skip for non-BTC to save calls).
      const series = isBtc
        ? await (async () => {
            const [
              hashRate, difficulty, minersRevenue, totalFees, txVolume, txCount,
              utxoCount, totalBitcoins, avgBlockSize, blockchainSize, mempoolSize,
              marketCap, networkActivities, lightnings,
            ] = await Promise.all([
              safe(getCryptoBtcHashRate(), "hashRate"),
              safe(getCryptoBtcDifficulty(), "difficulty"),
              safe(getCryptoBtcMinersRevenue(), "minersRevenue"),
              safe(getCryptoBtcTotalFees(), "totalFees"),
              safe(getCryptoBtcTxnVolume(), "txVolume"),
              safe(getCryptoBtcTxnCount(), "txCount"),
              safe(getCryptoBtcUtxoCount(), "utxoCount"),
              safe(getCryptoBtcTotalBitcoins(), "totalBitcoins"),
              safe(getCryptoBtcAvgBlockSize(), "avgBlockSize"),
              safe(getCryptoBtcBlockchainSize(), "blockchainSize"),
              safe(getCryptoBtcMempoolSize(), "mempoolSize"),
              safe(getCryptoBtcMarketCap(), "marketCap"),
              safe(getCryptoBtcNetworkActivities(), "networkActivities"),
              safe(getCryptoBtcLightnings(), "lightnings"),
            ]);
            return {
              hashRate, difficulty, minersRevenue, totalFees, txVolume, txCount,
              utxoCount, totalBitcoins, avgBlockSize, blockchainSize, mempoolSize,
              marketCap, networkActivities, lightnings,
            };
          })()
        : {
            hashRate: null, difficulty: null, minersRevenue: null, totalFees: null,
            txVolume: null, txCount: null, utxoCount: null, totalBitcoins: null,
            avgBlockSize: null, blockchainSize: null, mempoolSize: null, marketCap: null,
            networkActivities: null, lightnings: null,
          };

      return { coinInfo, onChain, derivatives, lightning, priceHistory, etherscan, series };
    },
  });
}

/* ── Small shape helpers the UI can lean on ─────────────────── */

/**
 * Normalise any of the assorted series payloads into a {x,y}[] for SvgLineChart.
 * Handles arrays of {date,value}, {timestamp,value}, {t,v}, [ts, val] pairs, or
 * { data: [...] } wrappers. Returns [] when nothing usable is found.
 */
export function toSeries(raw: any, opts?: { xKey?: string; yKey?: string; limit?: number }): { x: string; y: number }[] {
  const arr =
    Array.isArray(raw) ? raw :
    Array.isArray(raw?.data) ? raw.data :
    Array.isArray(raw?.prices) ? raw.prices :
    Array.isArray(raw?.values) ? raw.values : [];
  const xKey = opts?.xKey;
  const yKey = opts?.yKey;
  const out: { x: string; y: number }[] = [];
  for (const row of arr) {
    let x: any, y: any;
    if (Array.isArray(row)) { x = row[0]; y = row[1]; }
    else if (row && typeof row === "object") {
      x = xKey ? row[xKey] : (row.date ?? row.timestamp ?? row.time ?? row.t ?? row.x);
      y = yKey ? row[yKey] : (row.value ?? row.v ?? row.y ?? row.close ?? row.price);
    }
    const ny = Number(y);
    if (Number.isFinite(ny)) {
      const dx = typeof x === "number" ? new Date(x > 1e12 ? x : x * 1000).toISOString().slice(0, 10) : String(x ?? "");
      out.push({ x: dx, y: ny });
    }
  }
  const lim = opts?.limit;
  return lim && out.length > lim ? out.slice(-lim) : out;
}

/** Pull a plausible numeric field out of a nested object by candidate keys. */
export function pick(obj: any, keys: string[], fallback: any = null): any {
  if (!obj) return fallback;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return fallback;
}
