/**
 * components/cryptoFundamentals/DetailTabs.tsx
 *
 * The 9 crypto detail tabs (mirrors website CryptoDetails.jsx):
 *   On-Chain · Mining · Network Activity · Price History · Supply ·
 *   Lightning · Derivatives · Market Indicators · Blockchain Stats
 *
 * All data from useCryptoDetails() (own backend, mrkt header). Each tab reads
 * defensively via toSeries()/pick(): a missing series shows an empty state, a
 * missing metric shows "—". Never throws on shape mismatch.
 *
 * Tab → source (crypto.md §6):
 *   OnChain/Mining/NetworkActivity/BlockchainStats → onChain + bitcoin series
 *   MarketIndicators/Supply                        → coinInfo
 *   PriceHistory                                   → coinInfo + priceHistory
 *   Derivatives                                    → derivatives
 *   Lightning                                      → lightning + coinInfo
 */
import React, { useMemo } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { SvgLineChart, SvgBarChart } from "./charts";
import { useCryptoDetails, toSeries, pick } from "../../hooks/useCryptoFundamentalData";

export const CRYPTO_DETAIL_TABS = [
  { key: "onchain", label: "On-Chain" },
  { key: "mining", label: "Mining" },
  { key: "network", label: "Network" },
  { key: "pricehist", label: "Price History" },
  { key: "supply", label: "Supply" },
  { key: "lightning", label: "Lightning" },
  { key: "derivatives", label: "Derivatives" },
  { key: "indicators", label: "Indicators" },
  { key: "blockchain", label: "Blockchain" },
] as const;

const fmtNum = (v: any, dp = 2) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1e12) return `${(n / 1e12).toFixed(dp)}T`;
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(dp)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(dp)}M`;
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(dp)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: dp });
};

export function CryptoDetailTabs({ tab, symbol }: { tab: string; symbol: string }) {
  const { colors: c, isDark } = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const { data, isLoading, isError, refetch } = useCryptoDetails(symbol);

  if (isLoading) {
    return <View style={s.center}><ActivityIndicator color={c.gold} /></View>;
  }
  if (isError || !data) {
    return (
      <View style={s.center}>
        <Text style={s.muted}>Couldn't load {symbol} details.</Text>
        <Text style={[s.link]} onPress={() => refetch()}>Retry</Text>
      </View>
    );
  }

  const areaColor = isDark ? "rgba(233,196,106,0.10)" : "rgba(201,154,46,0.10)";
  const chart = (series: { x: string; y: number }[], bar = false) =>
    series.length > 0 ? (
      bar ? <SvgBarChart data={series} color={c.gold} /> :
        <SvgLineChart data={series} color={c.gold} areaColor={areaColor} />
    ) : <View style={s.emptyChart}><Text style={s.mutedSm}>No data</Text></View>;

  const Section = ({ title, children }: any) => (
    <View style={s.section}><Text style={s.sectionTitle}>{title}</Text>{children}</View>
  );
  const Row = ({ k, v }: { k: string; v: any }) => (
    <View style={s.row}><Text style={s.rowKey}>{k}</Text><Text style={s.rowVal}>{v ?? "—"}</Text></View>
  );

  const info = data.coinInfo ?? {};
  const ser = data.series;

  switch (tab) {
    case "On-Chain": {
      // Real getOnChainData shape: { transaction_count:[{date,value}], ... }
      const txSeries = toSeries(data.onChain, { seriesKey: "transaction_count", limit: 30 });
      const lastTx = txSeries.length ? txSeries[txSeries.length - 1].y : null;
      return (
        <View>
          <Section title="Transaction Count (30d)">{chart(txSeries)}</Section>
          <Section title="On-Chain Metrics">
            <Row k="Latest Tx Count" v={fmtNum(lastTx, 0)} />
            <Row k="Data Points" v={fmtNum(pick(data.onChain, ["days", "data_points"]), 0)} />
            <Row k="Source" v={pick(data.onChain, ["source"], "—")} />
          </Section>
        </View>
      );
    }

    case "Mining":
      return (
        <View>
          <Section title="Hash Rate (30d)">{chart(toSeries(ser.hashRate, { limit: 30 }))}</Section>
          <Section title="Miners Revenue (30d)">{chart(toSeries(ser.minersRevenue, { limit: 30 }))}</Section>
          <Section title="Mining Stats">
            <Row k="Difficulty" v={fmtNum(pick(data.onChain, ["difficulty"]))} />
            <Row k="Miners Revenue" v={fmtNum(pick(data.onChain, ["minersRevenue", "miners_revenue"]))} />
          </Section>
        </View>
      );

    case "Network":
      return (
        <View>
          <Section title="Network Activity (30d)">{chart(toSeries(ser.networkActivities, { limit: 30 }))}</Section>
          <Section title="Transaction Count (30d)">{chart(toSeries(ser.txCount, { limit: 30 }), true)}</Section>
          <Section title="Mempool Size">{chart(toSeries(ser.mempoolSize, { limit: 30 }))}</Section>
        </View>
      );

    case "Price History":
      return (
        <View>
          <Section title="Price (30d)">{chart(toSeries(data.priceHistory, { seriesKey: "prices", yKey: "price", limit: 30 }))}</Section>
          <Section title="Price Details">
            <Row k="ATH" v={fmtNum(pick(info, ["ath", "allTimeHigh"]))} />
            <Row k="ATH Date" v={String(pick(info, ["ath_date"], "—")).slice(0, 10)} />
            <Row k="ATL" v={fmtNum(pick(info, ["atl", "allTimeLow"]))} />
            <Row k="ATL Date" v={String(pick(info, ["atl_date"], "—")).slice(0, 10)} />
            <Row k="Current Price" v={fmtNum(pick(info, ["current_price_usd", "current_price"]))} />
          </Section>
        </View>
      );

    case "Supply":
      return (
        <View>
          <Section title="Supply Metrics">
            <Row k="Circulating" v={fmtNum(pick(info, ["circulating_supply", "circulatingSupply"]), 0)} />
            <Row k="Total Supply" v={fmtNum(pick(info, ["total_supply", "totalSupply"]), 0)} />
            <Row k="Max Supply" v={fmtNum(pick(info, ["max_supply", "maxSupply"]), 0)} />
            <Row k="Market Cap" v={fmtNum(pick(info, ["market_cap_usd", "market_cap"]))} />
            <Row k="Fully Diluted" v={fmtNum(pick(info, ["fully_diluted_valuation_usd", "fully_diluted_valuation"]))} />
          </Section>
        </View>
      );

    case "Lightning": {
      // Real getLightningNetwork shape:
      // historical_stats:[{date, capacity_btc, channel_count, node_count}].
      const capSeries = toSeries(data.lightning, { seriesKey: "historical_stats", yKey: "capacity_btc", limit: 30 });
      const latest = (() => {
        const hs = data.lightning?.historical_stats;
        return Array.isArray(hs) && hs.length ? hs[0] : {};
      })();
      return (
        <View>
          <Section title="Lightning Capacity BTC (30d)">{chart(capSeries)}</Section>
          <Section title="Lightning Network">
            <Row k="Capacity (BTC)" v={fmtNum(pick(latest, ["capacity_btc"]))} />
            <Row k="Channels" v={fmtNum(pick(latest, ["channel_count"]), 0)} />
            <Row k="Nodes" v={fmtNum(pick(latest, ["node_count"]), 0)} />
            <Row k="Source" v={pick(data.lightning, ["source"], "—")} />
          </Section>
        </View>
      );
    }

    case "Derivatives": {
      // Real getDerivativesData shape: open_interest, current_funding_rate,
      // funding_rate_history:[{timestamp, funding_rate}].
      const fundSeries = toSeries(data.derivatives, { seriesKey: "funding_rate_history", yKey: "funding_rate", limit: 30 });
      return (
        <View>
          <Section title="Derivatives">
            <Row k="Funding Rate" v={(() => { const f = pick(data.derivatives, ["current_funding_rate", "funding_rate"]); return f != null ? `${(Number(f) * 100).toFixed(4)}%` : "—"; })()} />
            <Row k="Open Interest" v={fmtNum(pick(data.derivatives, ["open_interest", "openInterest"]))} />
            <Row k="Futures Symbol" v={pick(data.derivatives, ["futures_symbol"], "—")} />
            <Row k="Source" v={pick(data.derivatives, ["source"], "—")} />
          </Section>
          <Section title="Funding Rate History (30d)">{chart(fundSeries)}</Section>
        </View>
      );
    }

    case "Indicators":
      return (
        <View>
          <Section title="Market Indicators">
            <Row k="Price" v={fmtNum(pick(info, ["current_price_usd", "current_price"]))} />
            <Row k="24h Volume" v={fmtNum(pick(info, ["total_volume_24h", "total_volume"]))} />
            <Row k="Market Cap Rank" v={pick(info, ["market_cap_rank", "rank"], "—")} />
            <Row k="ATH Change" v={(() => { const p = pick(info, ["ath_change_percentage"]); return p != null ? `${Number(p).toFixed(2)}%` : "—"; })()} />
            <Row k="Sentiment (Up)" v={(() => { const p = pick(info, ["sentiment_votes_up_percentage"]); return p != null ? `${Number(p).toFixed(0)}%` : "—"; })()} />
          </Section>
        </View>
      );

    case "Blockchain":
      return (
        <View>
          <Section title="Blockchain Size (30d)">{chart(toSeries(ser.blockchainSize, { limit: 30 }))}</Section>
          <Section title="Avg Block Size (30d)">{chart(toSeries(ser.avgBlockSize, { limit: 30 }))}</Section>
          <Section title="Blockchain Stats">
            <Row k="Total Bitcoins" v={fmtNum(pick(data.onChain, ["totalBitcoins", "total_bitcoins"]), 0)} />
            <Row k="Blockchain Size" v={fmtNum(pick(data.onChain, ["blockchainSize", "blocks_size"]))} />
            <Row k="Avg Block Size" v={fmtNum(pick(data.onChain, ["avgBlockSize", "avg_block_size"]), 3)} />
          </Section>
        </View>
      );

    default:
      return <View style={s.center}><Text style={s.muted}>Select a tab</Text></View>;
  }
}

const makeStyles = (c: AppColors) => StyleSheet.create({
  center: { paddingVertical: 40, alignItems: "center", gap: 8 },
  muted: { fontSize: 13, color: c.textMuted },
  mutedSm: { fontSize: 12, color: c.textMuted },
  link: { fontSize: 13, color: c.gold, fontWeight: "800" },
  section: {
    marginHorizontal: 14, marginTop: 12, backgroundColor: c.card,
    borderRadius: 14, borderWidth: 1, borderColor: c.border, padding: 12,
  },
  sectionTitle: { fontSize: 13, fontWeight: "800", color: c.text, marginBottom: 8 },
  emptyChart: { height: 120, alignItems: "center", justifyContent: "center" },
  row: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.borderLight,
  },
  rowKey: { fontSize: 13, color: c.textSecondary },
  rowVal: { fontSize: 13, fontWeight: "700", color: c.text },
});
