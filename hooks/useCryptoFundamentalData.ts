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

// CoinGecko symbol → id map. Curated overrides first (a symbol like ATOM maps
// to several CoinGecko ids; these pin the canonical one). Any coin NOT listed
// here is resolved dynamically from CoinGecko's full coins list at runtime, so
// every coin the backend returns (AAVE, ALGO, ARB, …) gets live data — not
// just this handful. Without dynamic resolution, unlisted coins showed $0.
export const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin", ETH: "ethereum", SOL: "solana", XRP: "ripple",
  ADA: "cardano", DOGE: "dogecoin", BNB: "binancecoin", TRX: "tron",
  DOT: "polkadot", MATIC: "matic-network", LTC: "litecoin", AVAX: "avalanche-2",
  LINK: "chainlink", ATOM: "cosmos", XLM: "stellar", UNI: "uniswap",
  BCH: "bitcoin-cash", ETC: "ethereum-classic", FIL: "filecoin", APT: "aptos",
  AAVE: "aave", ALGO: "algorand", ARB: "arbitrum", AXS: "axie-infinity",
  EGLD: "elrond-erd-2", FLOW: "flow", FTM: "fantom", GRT: "the-graph",
  HBAR: "hedera-hashgraph", ICP: "internet-computer", IMX: "immutable-x",
  INJ: "injective-protocol", KAVA: "kava", MANA: "decentraland", MKR: "maker",
  NEAR: "near", NEO: "neo", OP: "optimism", RNDR: "render-token",
  SAND: "the-sandbox", SEI: "sei-network", SHIB: "shiba-inu", SUI: "sui",
  THETA: "theta-token", TON: "the-open-network", USDC: "usd-coin",
  USDT: "tether", VET: "vechain",
};

// Symbol → id resolved at runtime from CoinGecko's coins list, for any symbol
// not in COINGECKO_IDS. Module-level cache so we fetch the ~15k-entry list at
// most once per app session.
let cgCoinsListCache: Record<string, string> | null = null;
let cgCoinsListPromise: Promise<Record<string, string>> | null = null;

async function loadCgSymbolMap(): Promise<Record<string, string>> {
  if (cgCoinsListCache) return cgCoinsListCache;
  if (!cgCoinsListPromise) {
    cgCoinsListPromise = (async () => {
      const list = await fetchJson("https://api.coingecko.com/api/v3/coins/list", "cg-coins-list");
      const map: Record<string, string> = {};
      if (Array.isArray(list)) {
        // First id wins per symbol; curated overrides still take precedence at
        // lookup time. Good enough for the top coins the backend serves.
        for (const c of list) {
          const sym = String(c?.symbol || "").toUpperCase();
          if (sym && c?.id && !map[sym]) map[sym] = c.id;
        }
      }
      cgCoinsListCache = map;
      return map;
    })().catch(() => ({} as Record<string, string>));
  }
  return cgCoinsListPromise;
}

// Resolve a coin symbol to its CoinGecko id: curated map first, then the live
// coins list. Returns undefined only if the coin is unknown to CoinGecko.
async function resolveCgId(symbol: string | undefined): Promise<string | undefined> {
  if (!symbol) return undefined;
  const up = symbol.toUpperCase();
  if (COINGECKO_IDS[up]) return COINGECKO_IDS[up];
  const dyn = await loadCgSymbolMap();
  return dyn[up];
}

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
 *  a shape toSeries handles). Resolves the CoinGecko id dynamically so any
 *  coin works, not just the curated set. Null only if truly unknown. */
async function livePriceHistory(symbol: string | undefined, days = 15): Promise<any | null> {
  const id = await resolveCgId(symbol);
  if (!id) return null;
  return fetchJson(
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`,
    "cg-market-chart"
  );
}

/** Live coin fundamentals via CoinGecko /coins/{id} → flattened to the same
 *  field names the UI reads from the backend coinInfo (current_price_usd,
 *  market_cap_usd, ath, circulating_supply, …). Works for any coin, so the
 *  KPI cards fill even when the backend has null data (e.g. AAVE). */
async function liveCoinInfo(symbol: string | undefined): Promise<any | null> {
  const id = await resolveCgId(symbol);
  if (!id) return null;
  const raw = await fetchJson(
    `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`,
    "cg-coin-info"
  );
  const m = raw?.market_data;
  if (!m) return null;
  return {
    symbol: String(raw?.symbol || symbol || "").toUpperCase(),
    name: raw?.name ?? null,
    coingecko_id: id,
    current_price_usd: m.current_price?.usd ?? null,
    market_cap_usd: m.market_cap?.usd ?? null,
    market_cap_rank: m.market_cap_rank ?? null,
    total_volume_24h: m.total_volume?.usd ?? null,
    price_change_percentage_24h: m.price_change_percentage_24h ?? null,
    circulating_supply: m.circulating_supply ?? null,
    total_supply: m.total_supply ?? null,
    max_supply: m.max_supply ?? null,
    ath: m.ath?.usd ?? null,
    ath_change_percentage: m.ath_change_percentage?.usd ?? null,
    atl: m.atl?.usd ?? null,
    high_24h: m.high_24h?.usd ?? null,
    low_24h: m.low_24h?.usd ?? null,
  };
}

/** Lift one series out of a CoinGecko market_chart payload ({[key]:
 *  [[ts,value],...]}) into the {values:[...]} envelope toSeries reads.
 *  market_chart exists for every listed coin, so these series fill the
 *  charts where Bitcoin-only sources have nothing (e.g. BNB Network tab). */
const marketChartSeries = (raw: any, key: "market_caps" | "total_volumes") =>
  Array.isArray(raw?.[key]) && raw[key].length ? { values: raw[key] } : null;

/** Live derivatives from Binance USDT-M futures (public, keyless): current
 *  funding + funding history + open interest, normalised to the backend's
 *  getDerivativesData shape so the tab reads either source unchanged. The
 *  backend copy has been stale since Jan 2026, so live is preferred. */
async function liveDerivatives(symbol: string | undefined): Promise<any | null> {
  if (!symbol) return null;
  const fut = `${symbol.toUpperCase()}USDT`;
  const [premRaw, histRaw, oiRaw] = await Promise.all([
    fetchJson(`https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${fut}`, "binance-premium"),
    fetchJson(`https://fapi.binance.com/fapi/v1/fundingRate?symbol=${fut}&limit=90`, "binance-funding"),
    fetchJson(`https://fapi.binance.com/fapi/v1/openInterest?symbol=${fut}`, "binance-oi"),
  ]);
  // Binance answers HTTP 200 with {code,msg} for unknown symbols (e.g. PEPE
  // trades as 1000PEPEUSDT) — treat those as misses so the backend fallback
  // isn't shadowed by an empty shell.
  const ok = (o: any) => (o && typeof o === "object" && o.code == null ? o : null);
  const prem = ok(premRaw);
  const oi = ok(oiRaw);
  const hist = Array.isArray(histRaw) ? histRaw : null;
  if (!prem && !hist) return null;
  return {
    symbol: symbol.toUpperCase(),
    futures_symbol: fut,
    source: "binance_futures(live)",
    open_interest: oi?.openInterest != null ? Number(oi.openInterest) : null,
    current_funding_rate: prem?.lastFundingRate != null ? Number(prem.lastFundingRate) : null,
    funding_rate_history: hist
      ? hist.map((h: any) => ({ timestamp: Number(h?.fundingTime), funding_rate: Number(h?.fundingRate) }))
      : [],
  };
}

/** Live price + 24h change via CoinGecko simple/price (60s refetch).
 *  Id resolved dynamically inside queryFn so every coin gets live KPIs. */
export function useCoinLivePrice(symbol: string | undefined) {
  return useQuery({
    queryKey: ["cg-price", symbol?.toUpperCase() ?? ""],
    enabled: !!symbol,
    refetchInterval: 60 * 1000,
    staleTime: 55 * 1000,
    queryFn: async () => {
      const id = await resolveCgId(symbol);
      if (!id) return null;
      const raw = await fetchJson(
        `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`,
        "coingecko-price"
      );
      // simple/price keys by id; the card reads the first key, so re-key by a
      // stable name isn't needed — but return null (not {}) if the id was
      // rejected so the card falls back cleanly instead of rendering $0.
      return raw && raw[id] ? raw : null;
    },
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
    queryFn: async () => {
      const own = await safe(getCryptoSearchCoins({ searchText: query }), "searchCoins");
      const arr = Array.isArray(own) ? own : Array.isArray((own as any)?.data) ? (own as any).data : [];
      if (arr.length) return own;
      // The backend coin list is finite (and its collector stale) — fall back
      // to CoinGecko search so every coin the user types finds a result. The
      // fundamentals tabs run on live sources, so a CoinGecko-only coin still
      // renders full data.
      const cg = await fetchJson(
        `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query.trim())}`,
        "cg-search"
      );
      if (Array.isArray(cg?.coins) && cg.coins.length) {
        return cg.coins.slice(0, 20).map((c: any) => ({
          symbol: String(c?.symbol || "").toUpperCase(),
          name: String(c?.name || c?.symbol || ""),
        }));
      }
      return own;
    },
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
  marketCap: any;
};

export function useCryptoOverview(symbol: string | undefined) {
  return useQuery<CryptoOverview>({
    queryKey: ["crypto-overview", symbol ?? ""],
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    queryFn: async (): Promise<CryptoOverview> => {
      const p = { symbol };
      // Hash rate / miners revenue / on-chain tx volume are Bitcoin-protocol
      // series — only fetch them for BTC. Every other coin charts trading
      // volume + market cap from CoinGecko market_chart instead, so no coin
      // renders an empty Overview.
      const isBtc = (symbol || "").toUpperCase() === "BTC";
      const skip = Promise.resolve(null);
      const [
        coinInfo, coinInfoAlt, global, fearGreed, priceHistory, hashRate, minersRevenue, txVolume,
        fngLive, pricesLive, hashLive, minersLive, txVolLive, coinInfoLive,
      ] = await Promise.all([
        safe(getCryptoCoinInfo(p), "coinInfo"),
        safe(getCryptoCoinInfoAlt(p), "coinInfoAlt"),
        safe(getCryptoGlobalMarket(), "global"),
        safe(getCryptoFearGreed(), "fearGreed"),
        safe(getCryptoPriceHistory(p), "priceHistory"),
        isBtc ? safe(getCryptoBtcHashRate(), "hashRate") : skip,
        isBtc ? safe(getCryptoBtcMinersRevenue(), "minersRevenue") : skip,
        isBtc ? safe(getCryptoBtcTxnVolume(), "txVolume") : skip,
        // Live sources (preferred — the backend collector can lag).
        // liveCoinInfo added below in the same Promise.all.
        liveFearGreed(30),
        livePriceHistory(symbol, 30),
        isBtc ? blockchainChart("hash-rate") : skip,
        isBtc ? blockchainChart("miners-revenue") : skip,
        isBtc ? blockchainChart("estimated-transaction-volume-usd") : skip,
        liveCoinInfo(symbol),
      ]);
      // Merge live coin fundamentals over the backend payload: live values win
      // where present, backend fills any gaps (and vice-versa for BTC where the
      // backend is rich). This makes KPIs populate for every coin, not just the
      // handful the backend collected.
      const backendInfo = first(coinInfo) || first(coinInfoAlt) || {};
      const mergedInfo = coinInfoLive
        ? { ...backendInfo, ...Object.fromEntries(Object.entries(coinInfoLive).filter(([, v]) => v != null)) }
        : backendInfo;
      return {
        coinInfo: mergedInfo,
        global: first(global),
        fearGreed: fngLive ?? first(fearGreed),
        priceHistory: pricesLive ?? first(priceHistory),
        hashRate: hashLive ?? first(hashRate),
        minersRevenue: minersLive ?? first(minersRevenue),
        txVolume: isBtc
          ? (txVolLive ?? first(txVolume))
          : marketChartSeries(pricesLive, "total_volumes"),
        marketCap: marketChartSeries(pricesLive, "market_caps"),
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
      const [coinInfo, onChain, derivatives, lightning, priceHistory, etherscan,
             pricesLive, coinInfoLive, derivativesLive] =
        await Promise.all([
          safe(getCryptoCoinInfo(p), "coinInfo"),
          safe(getCryptoOnChain(p), "onChain"),
          safe(getCryptoDerivatives(p), "derivatives"),
          safe(getCryptoLightning(p), "lightning"),
          safe(getCryptoPriceHistory(p), "priceHistory"),
          safe(getCryptoEtherScanOnChain(p), "etherscan"),
          livePriceHistory(symbol, 30),
          // Live fundamentals + derivatives, same precedence as the overview:
          // the backend collector has been stale since Jan 2026 and returns
          // all-null coinInfo for most non-BTC coins.
          liveCoinInfo(symbol),
          liveDerivatives(symbol),
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
            // Non-BTC coins have no mempool/UTXO/hash-rate (Bitcoin-protocol
            // concepts), but market_chart gives every coin a trading-volume
            // and market-cap series — the detail tabs chart these instead of
            // rendering "No data".
            hashRate: null, difficulty: null, minersRevenue: null, totalFees: null,
            txVolume: marketChartSeries(pricesLive, "total_volumes"),
            txCount: null, utxoCount: null, totalBitcoins: null,
            avgBlockSize: null, blockchainSize: null, mempoolSize: null,
            marketCap: marketChartSeries(pricesLive, "market_caps"),
            networkActivities: null, lightnings: null,
          };

      // Live coin fundamentals win over the (stale) backend payload, same
      // merge the overview does — fills Supply/Indicators/Price History rows
      // for every coin instead of "—".
      const backendInfo = first(coinInfo) || {};
      const mergedInfo = coinInfoLive
        ? { ...backendInfo, ...Object.fromEntries(Object.entries(coinInfoLive).filter(([, v]) => v != null)) }
        : backendInfo;

      return {
        // API returns [{...}] arrays — unwrap the first element for the
        // objects; the bitcoin `series` payloads are handled by toSeries().
        coinInfo: mergedInfo,
        onChain: first(onChain),
        derivatives: derivativesLive ?? first(derivatives),
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
  const daily = dailySample(out);
  return lim && daily.length > lim ? daily.slice(-lim) : daily;
}

/**
 * Collapse intra-day points into one point per calendar day.
 *
 * CoinGecko market_chart returns HOURLY points for 2–90 day ranges (a 30d
 * request = ~721 points), while blockchain.info and the backend return daily
 * points. Charts label themselves "(30d)" and slice the last `limit` points —
 * without this step an hourly series shows the last 30 HOURS. Points arrive
 * chronological (oldest → newest); each point's `x` is already a YYYY-MM-DD
 * day string, so points sharing the same `x` belong to the same day. Daily
 * series must pass through unchanged.
 */
function dailySample(points: { x: string; y: number }[]): { x: string; y: number }[] {
  // Last point per day wins — matches candle-close semantics. Map preserves
  // first-insertion order, so a chronological input stays chronological; a
  // series that's already daily (all-unique x) passes through unchanged.
  const byDay = new Map<string, { x: string; y: number }>();
  for (const p of points) byDay.set(p.x, p);
  return [...byDay.values()];
}

/** Pull a plausible numeric field out of a nested object by candidate keys. */
export function pick(obj: any, keys: string[], fallback: any = null): any {
  if (!obj) return fallback;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return fallback;
}
