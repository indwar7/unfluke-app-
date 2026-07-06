// Unfluke Pro — Dashboard CRYPTO fundamentals snapshot card.
// Rendered instead of FundamentalsCard when the header market toggle is on ₿.
// Search any coin → live KPI snapshot from the crypto data layer, then tap
// "Full analysis" to open /crypto-fundamental (selection carried via params).
// Same visual language as FundamentalsCard. No fake data.

import React, { useMemo, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Keyboard,
} from "react-native";
import { router } from "expo-router";
import { Search, ArrowUpRight, X } from "lucide-react-native";
import {
  useCryptoOverview,
  useCoinLivePrice,
  useCryptoSearch,
  pick,
} from "@/hooks/useCryptoFundamentalData";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

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

type Tile = { label: string; value: string; delta?: number };

const CryptoFundamentalsCard: React.FC = () => {
  const { colors: c } = useTheme();
  const s = makeStyles(c);

  const [coin, setCoin] = useState<Coin>(DEFAULT_COIN);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const debounce = useRef<any>(null);

  const { data: overview, isLoading } = useCryptoOverview(coin.symbol);
  const { data: live } = useCoinLivePrice(coin.symbol);
  const { data: searchData, isFetching: searching } = useCryptoSearch(debounced);

  /* ── derive raw KPI values (CoinGecko live first, backend fallback) ── */
  const info = overview?.coinInfo ?? {};
  const liveObj = live?.[Object.keys(live || {})[0] as any];
  const livePrice =
    pick(liveObj, ["usd"]) ?? pick(info, ["current_price_usd", "current_price", "price"]);
  const change24 =
    pick(liveObj, ["usd_24h_change"]) ??
    pick(info, ["price_change_percentage_24h", "change24h"]);
  const marketCap =
    pick(liveObj, ["usd_market_cap"]) ?? pick(info, ["market_cap_usd", "market_cap"]);
  const vol24 =
    pick(liveObj, ["usd_24h_vol"]) ?? pick(info, ["total_volume_24h", "total_volume", "volume"]);
  const ath = pick(info, ["ath"]);
  // F&G data is chronological (oldest → newest) — latest is the last entry.
  const fngArr = overview?.fearGreed?.data;
  const fearGreedValue = pick(
    (Array.isArray(fngArr) && fngArr.length ? fngArr[fngArr.length - 1] : null) ?? overview?.fearGreed,
    ["value"]
  );

  const snapshot = useMemo<Tile[]>(() => {
    const fng = Number(fearGreedValue);
    const chg = Number(change24);
    return [
      { label: "PRICE", value: fmtUsd(livePrice), delta: Number.isFinite(chg) ? chg : undefined },
      { label: "MCAP", value: fmtUsd(marketCap) },
      { label: "24H VOL", value: fmtUsd(vol24) },
      // Sentiment when available; all-time high as the fallback tile.
      Number.isFinite(fng)
        ? { label: "FEAR/GREED", value: String(Math.round(fng)) }
        : { label: "ATH", value: fmtUsd(ath) },
    ];
  }, [livePrice, change24, marketCap, vol24, ath, fearGreedValue]);

  /* ── coin search (same defensive mapping as crypto-fundamental.tsx) ── */
  const searchResults: Coin[] = useMemo(() => {
    const raw: any = searchData;
    const arr = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    return arr
      .map((r: any) => {
        // Live API returns plain symbol strings: ["SOL"]. Objects kept as a
        // fallback in case the shape changes.
        if (typeof r === "string") {
          const sym = r.replace(/USDT$/i, "").toUpperCase();
          return sym ? { symbol: sym, name: sym } : null;
        }
        const sym = pick(r, ["symbol", "coin", "base", "name", "instrument_token"]);
        const nm = pick(r, ["name", "coinName", "fullName", "symbol"]);
        return sym
          ? { symbol: String(sym).replace(/USDT$/i, "").toUpperCase(), name: String(nm ?? sym) }
          : null;
      })
      .filter(Boolean)
      .slice(0, 8) as Coin[];
  }, [searchData]);

  const runSearch = useCallback((text: string) => {
    setQuery(text);
    if (debounce.current) clearTimeout(debounce.current);
    if (!text.trim()) {
      setDebounced("");
      setShowDrop(false);
      return;
    }
    debounce.current = setTimeout(() => {
      setDebounced(text.trim());
      setShowDrop(true);
    }, 350);
  }, []);

  const selectCoin = useCallback((item: Coin) => {
    setCoin(item);
    setQuery("");
    setDebounced("");
    setShowDrop(false);
    Keyboard.dismiss();
  }, []);

  const openFull = () =>
    router.push(
      `/crypto-fundamental?symbol=${encodeURIComponent(coin.symbol)}&name=${encodeURIComponent(coin.name)}` as any
    );

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <View style={s.labelRow}>
            <View style={s.labelDot} />
            <Text style={s.label}>CRYPTO FUNDAMENTALS</Text>
          </View>
          <Text style={s.company} numberOfLines={1}>{coin.name}</Text>
          <View style={s.symbolTag}>
            <Text style={s.symbolTagText}>CRYPTO · {coin.symbol}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={openFull} style={s.fullBtn} activeOpacity={0.85}>
          <Text style={s.fullBtnText}>Full analysis</Text>
          <ArrowUpRight size={14} color={c.gold} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchPill}>
        <Search size={17} color={c.textMuted} />
        <TextInput
          style={s.searchInput}
          placeholder="Search any coin…"
          placeholderTextColor={c.textMuted}
          value={query}
          onChangeText={runSearch}
          returnKeyType="search"
          autoCapitalize="none"
        />
        {searching ? (
          <ActivityIndicator size="small" color={c.gold} />
        ) : query.length > 0 ? (
          <TouchableOpacity onPress={() => { setQuery(""); setDebounced(""); setShowDrop(false); }}>
            <X size={16} color={c.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Search dropdown */}
      {showDrop && searchResults.length > 0 && (
        <View style={s.drop}>
          <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 220 }}>
            {searchResults.map((item, i) => (
              <TouchableOpacity
                key={`${item.symbol}-${i}`}
                style={[s.dropItem, i < searchResults.length - 1 && s.dropDivider]}
                onPress={() => selectCoin(item)}
                activeOpacity={0.7}
              >
                <Text style={s.dropSymbol}>{item.symbol}</Text>
                <Text style={s.dropName} numberOfLines={1}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Snapshot KPIs */}
      {isLoading ? (
        <ActivityIndicator color={c.gold} style={{ marginVertical: 22 }} />
      ) : (
        <View style={s.statsRow}>
          {snapshot.map((st, i) => (
            <View key={st.label} style={[s.stat, i < snapshot.length - 1 && s.statDivider]}>
              <Text style={s.statValue} numberOfLines={1} adjustsFontSizeToFit>
                {st.value}
              </Text>
              <Text style={s.statLabel}>{st.label}</Text>
              {st.delta != null && Number.isFinite(st.delta) && (
                <Text style={[s.statYoy, { color: st.delta >= 0 ? c.profit : c.loss }]}>
                  {st.delta >= 0 ? "▲" : "▼"} {Math.abs(st.delta).toFixed(1)}%
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Quick links into the full crypto analysis */}
      <View style={s.linksRow}>
        {["On-Chain", "Derivatives", "Charts"].map((l) => (
          <TouchableOpacity key={l} style={s.linkChip} onPress={openFull} activeOpacity={0.8}>
            <Text style={s.linkChipText}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      marginBottom: 16,
    },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
    labelRow: { flexDirection: "row", alignItems: "center", gap: 5 },
    labelDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: c.gold },
    label: { fontSize: 10.5, fontWeight: "800", letterSpacing: 1.4, color: c.textMuted },
    company: { fontSize: 17, fontWeight: "800", color: c.text, letterSpacing: -0.4, marginTop: 4, maxWidth: 200 },
    symbolTag: { alignSelf: "flex-start", backgroundColor: c.inputBg, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, marginTop: 5 },
    symbolTagText: { fontSize: 10, fontWeight: "700", color: c.textSecondary, letterSpacing: 0.4 },
    fullBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: c.goldLight, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6 },
    fullBtnText: { fontSize: 11.5, fontWeight: "800", color: c.gold },

    searchPill: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.inputBorder, borderRadius: 14, paddingHorizontal: 12, height: 44 },
    searchInput: { flex: 1, fontSize: 14, color: c.text, padding: 0 },

    drop: { backgroundColor: c.surfaceElevated, borderWidth: 1, borderColor: c.border, borderRadius: 14, marginTop: 8, overflow: "hidden" },
    dropItem: { paddingHorizontal: 14, paddingVertical: 11 },
    dropDivider: { borderBottomWidth: 1, borderBottomColor: c.borderLight },
    dropSymbol: { fontSize: 13.5, fontWeight: "800", color: c.text },
    dropName: { fontSize: 11.5, color: c.textSecondary, marginTop: 1 },

    statsRow: { flexDirection: "row", marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: c.borderLight },
    stat: { flex: 1, alignItems: "center", paddingHorizontal: 2 },
    statDivider: { borderRightWidth: 1, borderRightColor: c.borderLight },
    statValue: { fontSize: 16, fontWeight: "800", color: c.text, fontVariant: ["tabular-nums"] },
    statLabel: { fontSize: 10, fontWeight: "700", color: c.textMuted, letterSpacing: 0.8, marginTop: 4 },
    statYoy: { fontSize: 9.5, fontWeight: "700", marginTop: 3, fontVariant: ["tabular-nums"] },

    linksRow: { flexDirection: "row", gap: 8, marginTop: 16 },
    linkChip: { flex: 1, backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingVertical: 10, alignItems: "center" },
    linkChipText: { fontSize: 12, fontWeight: "700", color: c.textSecondary },
  });

// fmtUsd is used by the TODO(human) snapshot implementation.
export { fmtUsd };
export default CryptoFundamentalsCard;
