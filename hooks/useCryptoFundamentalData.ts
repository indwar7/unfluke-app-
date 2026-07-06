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

/* ── Live real-time sources, preferred over the backend collector ──
 * The backend's crypto collector can lag (observed months stale). Every
 * series below is fetched live first; the backend payload is the fallback,
 * so a rate-limited/blocked third-party host degrades gracefully. */

/** blockchain.info charts API — live BTC on-chain series, {values:[{x,y}]}
 *  (toSeries already understands that envelope). */
const blockchainChart = (name: string, timespan = "30days") =>
  fetchJson(
    `https://api.blockchain.info/charts/${name}?timespan=${timespan}&format=json&cors=true`,
    `bc:${name}`
  );

/** Live Fear & Greed from alternative.me, normalised to the backend's
 *  {data:[{timestamp,date,value}]} shape (their values come as strings). */
async function liveFearGreed(limit = 30): Promise<any | null> {
  const raw = await fetchJson(`https://api.alternative.me/fng/?limit=${limit}`, "fng-live");
  if (!Array.isArray(raw?.data) || !raw.data.length) return null;
  const data = raw.data
    .map((d: any) => {
      const ts = Number(d?.timestamp);
      const value = Number(d?.value);
      if (!Number.isFinite(ts) || !Number.isFinite(value)) return null;
      return {
        timestamp: ts,
        date: new Date(ts * 1000).toISOString().slice(0, 10),
        value,
        classification: d?.value_classification,
      };
    })
    .filter(Boolean)
    // alternative.me sends newest-first; emit chronological so charts read
    // left-to-right and `toSeries(..., {limit:1})` picks the LATEST value.
    .sort((a: any, b: any) => a.timestamp - b.timestamp);
  return data.length ? { source: "alternative.me(live)", data } : null;
}

/** Live 15d price history via CoinGecko market_chart ({prices:[[ts,usd]]},
 *  a shape toSeries handles). Null for coins not in COINGECKO_IDS. */
function livePriceHistory(symbol: string | undefined, days = 15): Promise<any | null> {
  const id = symbol ? COINGECKO_IDS[symbol.toUpperCase()] : undefined;
  if (!id) return Promise.resolve(null);
  return fetchJson(
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`,
    "cg-market-chart"
  );
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
      const [
        coinInfo, coinInfoAlt, global, fearGreed, priceHistory, hashRate, minersRevenue, txVolume,
        fngLive, pricesLive, hashLive, minersLive, txVolLive,
      ] = await Promise.all([
        safe(getCryptoCoinInfo(p), "coinInfo"),
        safe(getCryptoCoinInfoAlt(p), "coinInfoAlt"),
        safe(getCryptoGlobalMarket(), "global"),
        safe(getCryptoFearGreed(), "fearGreed"),
        safe(getCryptoPriceHistory(p), "priceHistory"),
        safe(getCryptoBtcHashRate(), "hashRate"),
        safe(getCryptoBtcMinersRevenue(), "minersRevenue"),
        safe(getCryptoBtcTxnVolume(), "txVolume"),
        // Live sources (preferred — the backend collector can lag).
        liveFearGreed(30),
        livePriceHistory(symbol),
        blockchainChart("hash-rate"),
        blockchainChart("miners-revenue"),
        blockchainChart("estimated-transaction-volume-usd"),
      ]);
      return {
        // Live first, backend `[{...}]` payload (unwrapped) as fallback.
        coinInfo: first(coinInfo) || first(coinInfoAlt),
        global: first(global),
        fearGreed: fngLive ?? first(fearGreed),
        priceHistory: pricesLive ?? first(priceHistory),
        hashRate: hashLive ?? first(hashRate),
        minersRevenue: minersLive ?? first(minersRevenue),
        txVolume: txVolLive ?? first(txVolume),
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
      const [coinInfo, onChain, derivatives, lightning, priceHistory, etherscan, pricesLive] =
        await Promise.all([
          safe(getCryptoCoinInfo(p), "coinInfo"),
          safe(getCryptoOnChain(p), "onChain"),
          safe(getCryptoDerivatives(p), "derivatives"),
          safe(getCryptoLightning(p), "lightning"),
          safe(getCryptoPriceHistory(p), "priceHistory"),
          safe(getCryptoEtherScanOnChain(p), "etherscan"),
          livePriceHistory(symbol, 30),
        ]);

      // Bitcoin-only rich on-chain series (skip for non-BTC to save calls).
      // Each series: live blockchain.info first, backend collector fallback.
      const series = isBtc
        ? await (async () => {
            const [
              hashRate, difficulty, minersRevenue, totalFees, txVolume, txCount,
              utxoCount, totalBitcoins, avgBlockSize, blockchainSize, mempoolSize,
              marketCap, networkActivities, lightnings,
              bcHash, bcDiff, bcMiners, bcFees, bcTxVol, bcTxCount,
              bcUtxo, bcTotal, bcAvgBlock, bcChainSize, bcMempool, bcMcap,
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
              blockchainChart("hash-rate"),
              blockchainChart("difficulty"),
              blockchainChart("miners-revenue"),
              blockchainChart("transaction-fees-usd"),
              blockchainChart("estimated-transaction-volume-usd"),
              blockchainChart("n-transactions"),
              blockchainChart("utxo-count"),
              blockchainChart("total-bitcoins"),
              blockchainChart("avg-block-size"),
              blockchainChart("blocks-size"),
              blockchainChart("mempool-size"),
              blockchainChart("market-cap"),
            ]);
            return {
              hashRate: bcHash ?? hashRate,
              difficulty: bcDiff ?? difficulty,
              minersRevenue: bcMiners ?? minersRevenue,
              totalFees: bcFees ?? totalFees,
              txVolume: bcTxVol ?? txVolume,
              txCount: bcTxCount ?? txCount,
              utxoCount: bcUtxo ?? utxoCount,
              totalBitcoins: bcTotal ?? totalBitcoins,
              avgBlockSize: bcAvgBlock ?? avgBlockSize,
              blockchainSize: bcChainSize ?? blockchainSize,
              mempoolSize: bcMempool ?? mempoolSize,
              marketCap: bcMcap ?? marketCap,
              // No public live equivalent — backend only.
              networkActivities, lightnings,
            };
          })()
        : {
            hashRate: null, difficulty: null, minersRevenue: null, totalFees: null,
            txVolume: null, txCount: null, utxoCount: null, totalBitcoins: null,
            avgBlockSize: null, blockchainSize: null, mempoolSize: null, marketCap: null,
            networkActivities: null, lightnings: null,
          };

      return {
        // API returns [{...}] arrays — unwrap the first element for the
        // objects; the bitcoin `series` payloads are handled by toSeries().
        coinInfo: first(coinInfo),
        onChain: first(onChain),
        derivatives: first(derivatives),
        lightning: first(lightning),
        priceHistory: pricesLive ?? first(priceHistory),
        etherscan: first(etherscan),
        series,
      };
    },
  });
}

/* ── Small shape helpers the UI can lean on ─────────────────── */

/**
 * Unwrap the common `[{...}]` API envelope — the crypto backend returns most
 * fundamentals as a one-element array. Returns the object (or the value itself
 * if it isn't an array, or null).
 */
export function first(raw: any): any {
  if (Array.isArray(raw)) return raw.length ? raw[0] : null;
  return raw ?? null;
}

/**
 * Normalise any of the assorted series payloads into a {x,y}[] for SvgLineChart.
 *
 * Real API shapes (confirmed against api.unfluke.in):
 *   priceHistory[0].prices          → [{timestamp, date, price}]
 *   fearGreed[0].data               → [{timestamp, date, value}]
 *   onChain[0].transaction_count    → [{date, value}]
 *   lightning[0].historical_stats   → [{date, capacity_btc, channel_count}]
 *   derivatives[0].funding_rate_history → [{timestamp, funding_rate}]
 *
 * `raw` may be the already-unwrapped object, the [{...}] envelope, or a bare
 * array. `seriesKey` names the nested array to read; `yKey` its value field.
 * Everything is optional and guarded — unknown shapes return [].
 */
export function toSeries(
  raw: any,
  opts?: { seriesKey?: string; xKey?: string; yKey?: string; limit?: number }
): { x: string; y: number }[] {
  const obj = first(raw);
  // Find the array to iterate: explicit seriesKey, else common wrappers, else
  // auto-detect the first array-valued property (the bitcoin series endpoints
  // wrap their data under a field-specific key like hash_rate_th_s /
  // miners_revenue_usd / difficulty / etc.), else the value itself.
  const autoArrayKey =
    obj && typeof obj === "object" && !Array.isArray(obj)
      ? Object.keys(obj).find(
          (k) => Array.isArray(obj[k]) && obj[k].length > 0 && typeof obj[k][0] === "object"
        )
      : undefined;
  // NOTE on ordering: the API wraps most series in a one-element array whose
  // object holds the real data under a named key (e.g. [{_id, hash_rate_th_s:
  // [...]}]). So `obj` (the unwrapped first element) and its nested key must be
  // checked BEFORE falling back to treating `raw` itself as the data array —
  // otherwise we'd iterate the [{_id,...}] wrapper and find nothing.
  const arr: any[] =
    opts?.seriesKey && Array.isArray(obj?.[opts.seriesKey]) ? obj[opts.seriesKey] :
    Array.isArray(obj?.data) ? obj.data :
    Array.isArray(obj?.prices) ? obj.prices :
    Array.isArray(obj?.historical_stats) ? obj.historical_stats :
    Array.isArray(obj?.transaction_count) ? obj.transaction_count :
    Array.isArray(obj?.funding_rate_history) ? obj.funding_rate_history :
    Array.isArray(obj?.values) ? obj.values :
    autoArrayKey ? obj[autoArrayKey] :
    Array.isArray(raw) && !opts?.seriesKey ? raw :
    Array.isArray(obj) ? obj : [];

  const xKey = opts?.xKey;
  const yKey = opts?.yKey;
  const out: { x: string; y: number }[] = [];
  for (const row of arr) {
    let x: any, y: any;
    if (Array.isArray(row)) { x = row[0]; y = row[1]; }
    else if (row && typeof row === "object") {
      x = xKey ? row[xKey] : (row.date ?? row.timestamp ?? row.time ?? row.t ?? row.x);
      y = yKey ? row[yKey]
        : (row.value ?? row.price ?? row.funding_rate ?? row.capacity_btc ?? row.v ?? row.y ?? row.close);
    }
    const ny = Number(y);
    if (Number.isFinite(ny)) {
      // Guard against "Invalid time value": new Date(bad).toISOString() throws.
      const safeDate = (ms: number): string => {
        const d = new Date(ms);
        return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
      };
      const dx =
        typeof x === "number"
          ? safeDate(x > 1e12 ? x : x * 1000)
          : typeof x === "string" && x.length > 10
          ? x.slice(0, 10)
          : String(x ?? "");
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
