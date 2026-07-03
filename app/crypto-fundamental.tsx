/**
 * crypto-fundamental.tsx
 *
 * Crypto Fundamentals — Overview page. Mirrors the website's
 * CryptoFundamental.jsx: a coin search, KPI cards, 5 overview charts
 * (Price 15d, Tx volume 30d, Miners revenue 30d, Hash rate 30d,
 * Fear & Greed 15d), plus quick observations. A tab bar switches to the
 * 9 detail tabs (rendered by components/cryptoFundamentals/DetailTabs).
 *
 * Data comes from hooks/useCryptoFundamentalData (own backend carries the
 * `mrkt` header; third-party price/FNG via plain fetch). Everything reads
 * defensively so a missing endpoint renders an empty state, never a crash.
 * Existing Indian fundamentals (app/fundamental.tsx) is untouched.
 */
import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  ActivityIndicator, Dimensions, StyleSheet, FlatList,
} from "react-native";
import { Search, X, TrendingUp, TrendingDown } from "lucide-react-native";
import { ScreenWithHeader } from "../components/AppHeader";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { SvgLineChart } from "../components/cryptoFundamentals/charts";
import {
  useCryptoOverview, useCryptoSearch, useCoinLivePrice,
  toSeries, pick,
} from "../hooks/useCryptoFundamentalData";
import { CryptoDetailTabs, CRYPTO_DETAIL_TABS } from "../components/cryptoFundamentals/DetailTabs";

const { width: SCREEN_W } = Dimensions.get("window");
const DEFAULT_COIN = { symbol: "BTC", name: "Bitcoin" };

type Coin = { symbol: string; name: string };

const fmtUsd = (v: any, dp = 2) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(dp)}T`;
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(dp)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(dp)}M`;
  if (Math.abs(n) >= 1e3) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  return `$${n.toFixed(dp)}`;
};
const fmtPct = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? `${n >= 0 ? "+" : ""}${n.toFixed(2)}%` : "—";
};
// Compact number WITHOUT Intl `notation:"compact"` — Hermes (this app's JS
// engine) doesn't fully support it and can misbehave/crash. Pure-JS instead.
const fmtCompact = (v: any) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toFixed(0);
};

export default function CryptoFundamentalScreen() {
  const { colors: c, isDark } = useTheme();
  const s = useMemo(() => makeStyles(c, isDark), [c, isDark]);

  const [coin, setCoin] = useState<Coin>(DEFAULT_COIN);
  const [query, setQuery] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const scrollRef = useRef<ScrollView>(null);

  const symbol = coin.symbol;
  const { data: overview, isLoading, isError, refetch } = useCryptoOverview(symbol);
  const { data: live } = useCoinLivePrice(symbol);
  const { data: searchData, isFetching: searching } = useCryptoSearch(query);

  // Reset tab + scroll when coin changes.
  useEffect(() => {
    setActiveTab("Overview");
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [symbol]);

  const searchResults: Coin[] = useMemo(() => {
    const raw: any = searchData;
    const arr = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    return arr
      .map((r: any) => {
        const sym = pick(r, ["symbol", "coin", "base", "name", "instrument_token"]);
        const nm = pick(r, ["name", "coinName", "fullName", "symbol"]);
        return sym ? { symbol: String(sym).replace(/USDT$/i, "").toUpperCase(), name: String(nm ?? sym) } : null;
      })
      .filter(Boolean) as Coin[];
  }, [searchData]);

  const onPickCoin = useCallback((cn: Coin) => {
    setCoin(cn);
    setQuery("");
    setShowDrop(false);
  }, []);

  /* ── derive KPI values ──
   * Field names confirmed against the real /api/crypto/getCoinInfo response:
   *   current_price_usd, market_cap_usd, total_volume_24h, ath, atl,
   *   ath_change_percentage, circulating_supply, max_supply, total_supply.
   * CoinGecko live price (simple/price) uses usd / usd_24h_change / etc.
   * We prefer CoinGecko live (fresher) then fall back to backend coinInfo. */
  const info = overview?.coinInfo ?? {};
  const liveObj = live?.[Object.keys(live || {})[0] as any];
  const livePrice =
    pick(liveObj, ["usd"]) ??
    pick(info, ["current_price_usd", "current_price", "price"]);
  const change24 =
    pick(liveObj, ["usd_24h_change"]) ??
    pick(info, ["price_change_percentage_24h", "ath_change_percentage", "change24h"]);
  const marketCap =
    pick(liveObj, ["usd_market_cap"]) ??
    pick(info, ["market_cap_usd", "market_cap"]);
  const vol24 =
    pick(liveObj, ["usd_24h_vol"]) ??
    pick(info, ["total_volume_24h", "total_volume", "volume"]);
  const ath = pick(info, ["ath", "allTimeHigh"]);
  const atl = pick(info, ["atl", "allTimeLow"]);
  const circSupply = pick(info, ["circulating_supply", "circulatingSupply"]);
  const maxSupply = pick(info, ["max_supply", "maxSupply", "total_supply"]);
  const rank = pick(info, ["market_cap_rank", "rank"]);

  const kpis = [
    { label: "Price", value: fmtUsd(livePrice, livePrice < 1 ? 4 : 2), change: change24 },
    { label: "Market Cap", value: fmtUsd(marketCap, 2) },
    { label: "24h Volume", value: fmtUsd(vol24, 2) },
    { label: "All-Time High", value: fmtUsd(ath, 2) },
    { label: "All-Time Low", value: fmtUsd(atl, atl < 1 ? 4 : 2) },
    { label: "Circulating", value: circSupply ? fmtCompact(circSupply) : "—" },
  ];

  /* ── overview charts ──
   * Real nested shapes: priceHistory.prices[{timestamp,price}],
   * fearGreed.data[{timestamp,value}]. BTC series endpoints return {date,value}
   * arrays (toSeries picks .value by default). */
  const charts = useMemo(() => {
    return [
      { key: "price", label: "Price Trend (15d)", series: toSeries(overview?.priceHistory, { seriesKey: "prices", yKey: "price", limit: 15 }) },
      { key: "txvol", label: "Transaction Volume (30d)", series: toSeries(overview?.txVolume, { limit: 30 }) },
      { key: "miners", label: "Miners Revenue (30d)", series: toSeries(overview?.minersRevenue, { limit: 30 }) },
      { key: "hash", label: "Hash Rate (30d)", series: toSeries(overview?.hashRate, { limit: 30 }) },
      { key: "fng", label: "Fear & Greed (15d)", series: toSeries(overview?.fearGreed, { seriesKey: "data", yKey: "value", limit: 15 }) },
    ];
  }, [overview]);

  const tabs = ["Overview", ...CRYPTO_DETAIL_TABS.map((t) => t.label)];

  return (
    <ScreenWithHeader>
      <View style={s.root}>
        {/* Search */}
        <View style={s.searchWrap}>
          <View style={s.searchBox}>
            <Search size={16} color={c.textMuted} />
            <TextInput
              style={s.searchInput}
              placeholder="Search coin (BTC, ETH, SOL…)"
              placeholderTextColor={c.textMuted}
              value={query}
              onChangeText={(t) => { setQuery(t); setShowDrop(true); }}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {searching ? <ActivityIndicator size="small" color={c.gold} /> : query ? (
              <TouchableOpacity onPress={() => { setQuery(""); setShowDrop(false); }}>
                <X size={16} color={c.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
          {showDrop && query.length > 0 && searchResults.length > 0 && (
            <View style={s.dropdown}>
              <FlatList
                data={searchResults.slice(0, 20)}
                keyExtractor={(it, i) => `${it.symbol}-${i}`}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity style={s.dropItem} onPress={() => onPickCoin(item)}>
                    <Text style={s.dropSym}>{item.symbol}</Text>
                    <Text style={s.dropName} numberOfLines={1}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        {/* Coin header */}
        <View style={s.coinHead}>
          <View style={s.coinBadge}><Text style={s.coinBadgeText}>{coin.symbol.slice(0, 3)}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.coinName}>{coin.name}</Text>
            <Text style={s.coinSym}>{coin.symbol} · USDT</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.coinPrice}>{fmtUsd(livePrice, livePrice < 1 ? 4 : 2)}</Text>
            {change24 != null && (
              <View style={s.chgRow}>
                {Number(change24) >= 0
                  ? <TrendingUp size={12} color={c.profit} />
                  : <TrendingDown size={12} color={c.loss} />}
                <Text style={[s.chgText, { color: Number(change24) >= 0 ? c.profit : c.loss }]}>
                  {fmtPct(change24)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Tab bar */}
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabBar}>
            {tabs.map((t) => (
              <TouchableOpacity
                key={t}
                style={[s.tab, activeTab === t && s.tabActive]}
                onPress={() => setActiveTab(t)}
              >
                <Text style={[s.tabText, activeTab === t && s.tabTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
          {activeTab === "Overview" ? (
            <>
              {isError && (
                <View style={s.emptyBox}>
                  <Text style={s.emptyText}>Couldn't load {coin.symbol} data.</Text>
                  <TouchableOpacity style={s.retryBtn} onPress={() => refetch()}>
                    <Text style={s.retryText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* KPI cards */}
              <View style={s.kpiGrid}>
                {kpis.map((k) => (
                  <View key={k.label} style={s.kpiCard}>
                    <Text style={s.kpiLabel}>{k.label}</Text>
                    <Text style={s.kpiValue} numberOfLines={1}>{k.value}</Text>
                    {"change" in k && k.change != null && (
                      <Text style={[s.kpiChg, { color: Number(k.change) >= 0 ? c.profit : c.loss }]}>
                        {fmtPct(k.change)}
                      </Text>
                    )}
                  </View>
                ))}
              </View>

              {/* Charts */}
              {isLoading ? (
                <View style={s.loadingBox}><ActivityIndicator color={c.gold} /></View>
              ) : (
                charts.map((ch) => (
                  <View key={ch.key} style={s.chartCard}>
                    <Text style={s.chartTitle}>{ch.label}</Text>
                    {ch.series.length > 0 ? (
                      <SvgLineChart
                        data={ch.series}
                        color={c.gold}
                        areaColor={isDark ? "rgba(233,196,106,0.10)" : "rgba(201,154,46,0.10)"}
                      />
                    ) : (
                      <View style={s.chartEmpty}><Text style={s.emptyTextSm}>No data</Text></View>
                    )}
                  </View>
                ))
              )}

              {/* Observations */}
              <View style={s.obsCard}>
                <Text style={s.obsTitle}>Observations</Text>
                <ObsRow c={c} s={s} label="24h Trend"
                  ok={Number(change24) >= 0}
                  text={Number(change24) >= 0 ? `Up ${fmtPct(change24)} in last 24h` : `Down ${fmtPct(change24)} in last 24h`} />
                <ObsRow c={c} s={s} label="Supply"
                  ok={!!maxSupply}
                  text={maxSupply ? `Max supply capped at ${Number(maxSupply).toLocaleString()}` : "No hard supply cap"} />
                <ObsRow c={c} s={s} label="Fear & Greed"
                  ok
                  text={(() => {
                    const fng = toSeries(overview?.fearGreed, { seriesKey: "data", yKey: "value", limit: 1 });
                    return fng.length ? `Index at ${Math.round(fng[fng.length - 1].y)}` : "Index unavailable";
                  })()} />
                {rank != null && (
                  <ObsRow c={c} s={s} label="Market Rank" ok text={`Ranked #${rank} by market cap`} />
                )}
              </View>
            </>
          ) : (
            <CryptoDetailTabs tab={activeTab} symbol={symbol} />
          )}
        </ScrollView>
      </View>
    </ScreenWithHeader>
  );
}

const ObsRow = ({ c, s, label, ok, text }: any) => (
  <View style={s.obsRow}>
    <View style={[s.obsDot, { backgroundColor: ok ? c.profit : c.loss }]} />
    <Text style={s.obsLabel}>{label}</Text>
    <Text style={s.obsText} numberOfLines={2}>{text}</Text>
  </View>
);

const makeStyles = (c: AppColors, isDark: boolean) => StyleSheet.create({
  root: { flex: 1, backgroundColor: c.background },
  searchWrap: { paddingHorizontal: 14, paddingTop: 10, zIndex: 20 },
  searchBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: c.inputBg, borderRadius: 12,
    borderWidth: 1, borderColor: c.inputBorder ?? c.border,
    paddingHorizontal: 12, height: 44,
  },
  searchInput: { flex: 1, color: c.text, fontSize: 14 },
  dropdown: {
    position: "absolute", top: 56, left: 14, right: 14,
    backgroundColor: c.surfaceElevated, borderRadius: 12,
    borderWidth: 1, borderColor: c.border, maxHeight: 260, zIndex: 30,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 12,
  },
  dropItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: c.borderLight,
  },
  dropSym: { fontSize: 13, fontWeight: "800", color: c.gold, minWidth: 52 },
  dropName: { fontSize: 13, color: c.textSecondary, flex: 1 },

  coinHead: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  coinBadge: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: c.gold,
    alignItems: "center", justifyContent: "center",
  },
  coinBadgeText: { color: c.onGold, fontSize: 12, fontWeight: "800" },
  coinName: { fontSize: 16, fontWeight: "800", color: c.text },
  coinSym: { fontSize: 12, color: c.textMuted, marginTop: 1 },
  coinPrice: { fontSize: 16, fontWeight: "800", color: c.text },
  chgRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  chgText: { fontSize: 12, fontWeight: "700" },

  tabBar: { paddingHorizontal: 12, gap: 8, paddingVertical: 8 },
  tab: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.border,
  },
  tabActive: { backgroundColor: c.gold, borderColor: c.gold },
  tabText: { fontSize: 12, fontWeight: "700", color: c.textSecondary },
  tabTextActive: { color: c.onGold },

  kpiGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 10,
    paddingHorizontal: 14, paddingTop: 6,
  },
  kpiCard: {
    width: (SCREEN_W - 28 - 20) / 3, backgroundColor: c.card, borderRadius: 12,
    borderWidth: 1, borderColor: c.border, padding: 10,
  },
  kpiLabel: { fontSize: 10, color: c.textMuted, fontWeight: "600" },
  kpiValue: { fontSize: 14, fontWeight: "800", color: c.text, marginTop: 3 },
  kpiChg: { fontSize: 11, fontWeight: "700", marginTop: 2 },

  chartCard: {
    marginHorizontal: 14, marginTop: 12, backgroundColor: c.card,
    borderRadius: 14, borderWidth: 1, borderColor: c.border, padding: 12,
  },
  chartTitle: { fontSize: 13, fontWeight: "800", color: c.text, marginBottom: 8 },
  chartEmpty: { height: 120, alignItems: "center", justifyContent: "center" },

  obsCard: {
    marginHorizontal: 14, marginTop: 14, backgroundColor: c.card,
    borderRadius: 14, borderWidth: 1, borderColor: c.border, padding: 14,
  },
  obsTitle: { fontSize: 13, fontWeight: "800", color: c.text, marginBottom: 10 },
  obsRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 },
  obsDot: { width: 8, height: 8, borderRadius: 4 },
  obsLabel: { fontSize: 12, fontWeight: "700", color: c.textSecondary, minWidth: 92 },
  obsText: { fontSize: 12, color: c.textMuted, flex: 1 },

  loadingBox: { paddingVertical: 40, alignItems: "center" },
  emptyBox: { padding: 24, alignItems: "center" },
  emptyText: { fontSize: 13, color: c.textMuted, marginBottom: 10 },
  emptyTextSm: { fontSize: 12, color: c.textMuted },
  retryBtn: { paddingHorizontal: 18, paddingVertical: 8, backgroundColor: c.gold, borderRadius: 10 },
  retryText: { color: c.onGold, fontWeight: "800", fontSize: 13 },
});
