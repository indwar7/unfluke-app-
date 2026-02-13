import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  TextInput,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WIDTH = Dimensions.get("window").width;
const BASE = "https://api.unfluke.in/api/screener";
const HIST = "https://api.unfluke.in/api/historicData";

interface StockInfo {
  name: string;
  code: number;
  type: string;
  symbol: string;
}

const TABS = [
  "Profit & Loss",
  "Balance Sheet",
  "Cash Flow",
  "Ratios",
  "Quarterly",
  "Shareholding",
  "Corporate Events",
  "Bulk & Block Deals",
] as const;
type TabName = (typeof TABS)[number];

/* ─── Formatters ─── */
const fmt = (v: any): string => {
  if (v === null || v === undefined || v === "" || v === "-") return "-";
  const num = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(num)) return String(v);
  return num.toLocaleString("en-IN", { maximumFractionDigits: 2 });
};
const fmtDate = (d: any): string => {
  if (!d) return "-";
  try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return "-"; }
};
const safeNum = (v: any): number => {
  if (v === null || v === undefined || v === "" || v === "-") return 0;
  const n = typeof v === "string" ? parseFloat(v) : v;
  return isNaN(n) ? 0 : n;
};

/* ─── Stock List ─── */
const STOCK_LIST: StockInfo[] = [
  { name: "Reliance Industries", code: 476, type: "C", symbol: "RELIANCE" },
  { name: "TCS", code: 5400, type: "C", symbol: "TCS" },
  { name: "HDFC Bank", code: 7229, type: "C", symbol: "HDFCBANK" },
  { name: "Infosys", code: 7595, type: "C", symbol: "INFY" },
  { name: "ICICI Bank", code: 4963, type: "C", symbol: "ICICIBANK" },
  { name: "Hindustan Unilever", code: 1594, type: "C", symbol: "HINDUNILVR" },
  { name: "ITC", code: 1660, type: "C", symbol: "ITC" },
  { name: "State Bank of India", code: 3045, type: "C", symbol: "SBIN" },
  { name: "Bharti Airtel", code: 10604, type: "C", symbol: "BHARTIARTL" },
  { name: "Kotak Mahindra Bank", code: 1922, type: "C", symbol: "KOTAKBANK" },
  { name: "Bajaj Finance", code: 16675, type: "C", symbol: "BAJFINANCE" },
  { name: "Asian Paints", code: 3718, type: "C", symbol: "ASIANPAINT" },
  { name: "Larsen & Toubro", code: 11483, type: "C", symbol: "LT" },
  { name: "Axis Bank", code: 5900, type: "C", symbol: "AXISBANK" },
  { name: "Wipro", code: 3787, type: "C", symbol: "WIPRO" },
  { name: "Maruti Suzuki", code: 10999, type: "C", symbol: "MARUTI" },
  { name: "Sun Pharma", code: 3351, type: "C", symbol: "SUNPHARMA" },
  { name: "Titan Company", code: 3506, type: "C", symbol: "TITAN" },
  { name: "NTPC", code: 11630, type: "C", symbol: "NTPC" },
  { name: "Tata Steel", code: 3499, type: "C", symbol: "TATASTEEL" },
  { name: "Tata Motors", code: 3456, type: "C", symbol: "TATAMOTORS" },
  { name: "Cipla", code: 694, type: "C", symbol: "CIPLA" },
  { name: "ONGC", code: 2475, type: "C", symbol: "ONGC" },
  { name: "Adani Enterprises", code: 25, type: "C", symbol: "ADANIENT" },
  { name: "Bajaj Auto", code: 16669, type: "C", symbol: "BAJAJ-AUTO" },
  { name: "BPCL", code: 526, type: "C", symbol: "BPCL" },
  { name: "Coal India", code: 20374, type: "C", symbol: "COALINDIA" },
  { name: "Tata Power", code: 3486, type: "C", symbol: "TATAPOWER" },
  { name: "Mahindra & Mahindra", code: 2304, type: "C", symbol: "M&M" },
  { name: "Power Grid", code: 14977, type: "C", symbol: "POWERGRID" },
  { name: "JSW Steel", code: 3150, type: "C", symbol: "JSWSTEEL" },
  { name: "Hindalco", code: 1363, type: "C", symbol: "HINDALCO" },
  { name: "Dr Reddy's", code: 3962, type: "C", symbol: "DRREDDY" },
  { name: "Hero MotoCorp", code: 1348, type: "C", symbol: "HEROMOTOCO" },
  { name: "Vedanta", code: 3063, type: "C", symbol: "VEDL" },
  { name: "Yes Bank", code: 11693, type: "C", symbol: "YESBANK" },
].sort((a, b) => a.name.localeCompare(b.name));

/* ─── Metric Aliases ─── */
const ALIASES: Record<string, string[]> = {
  "Sales": ["Revenue", "Total Revenue", "Income", "Total Income"],
  "Net Profit": ["Profit after tax", "PAT", "Profit for the period", "Net Income"],
  "Expenses": ["Total Expenses", "Expenditure"],
};

/* ─── Extract metric from API year data ─── */
const extractMetric = (yearData: any, metric: string): any => {
  if (!yearData) return null;
  const blocks = Array.isArray(yearData) ? yearData : [yearData];
  for (const block of blocks) {
    if (block[metric] !== undefined && block[metric] !== null) return block[metric];
    let key = Object.keys(block).find(k => k.toLowerCase() === metric.toLowerCase());
    if (key && block[key] !== undefined && block[key] !== null) return block[key];
    const aliases = ALIASES[metric];
    if (aliases) {
      for (const alias of aliases) {
        if (block[alias] !== undefined && block[alias] !== null) return block[alias];
        key = Object.keys(block).find(k => k.toLowerCase() === alias.toLowerCase());
        if (key && block[key] !== undefined && block[key] !== null) return block[key];
      }
    }
  }
  return null;
};

/* ═══════════════════════════ STYLES ═══════════════════════════ */
const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  header: { padding: 16, backgroundColor: "#4f46e5", zIndex: 10, elevation: 5 },
  searchBar: {
    backgroundColor: "white", padding: 12, borderRadius: 12, flexDirection: "row", alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 6, elevation: 4
  },
  searchTitle: { fontWeight: "bold", fontSize: 16, color: "#1f2937" },
  searchSub: { fontSize: 12, color: "#6b7280" },
  searchIconBtn: {
    backgroundColor: "#e0e7ff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20
  },
  retryBtn: { marginTop: 20, backgroundColor: "#4f46e5", paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8 },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  tabBar: { backgroundColor: "#fff", elevation: 2, maxHeight: 48, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  tab: { paddingVertical: 13, paddingHorizontal: 16, marginHorizontal: 2 },
  tabActive: { borderBottomWidth: 3, borderBottomColor: "#4f46e5" },
  tabText: { fontSize: 13, color: "#6b7280", fontWeight: "600" },
  tabTextActive: { color: "#4f46e5", fontWeight: "700" },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 12, elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#111827", marginBottom: 14 },
  insightGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  insightCard: { width: "48%", backgroundColor: "#f9fafb", borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 4 },
  insightIcon: { fontSize: 20, marginBottom: 4 },
  insightLabel: { fontSize: 12, color: "#6b7280", fontWeight: "600" },
  insightValue: { fontSize: 16, fontWeight: "700", marginTop: 2 },
  insightSub: { fontSize: 12, fontWeight: "600", marginTop: 4 },
  tRow: { flexDirection: "row" },
  tHeaderRow: { backgroundColor: "#4f46e5" },
  tRowEven: { backgroundColor: "#f9fafb" },
  tRowOdd: { backgroundColor: "#fff" },
  tCell: { paddingVertical: 10, paddingHorizontal: 10, borderRightWidth: 1, borderRightColor: "#e5e7eb", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  tMetricCell: { minWidth: 150, maxWidth: 180 },
  tYearCell: { minWidth: 100 },
  tHeaderText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  tMetricText: { color: "#374151", fontWeight: "600", fontSize: 13 },
  tDataText: { color: "#111827", fontWeight: "500", fontSize: 13, textAlign: "right" },
  subTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#f3f4f6", marginRight: 8 },
  subTabActive: { backgroundColor: "#4f46e5" },
  subTabText: { fontSize: 13, color: "#6b7280", fontWeight: "600" },
  subTabTextActive: { color: "#fff" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, paddingHorizontal: 20, maxHeight: "80%" },
  searchInput: { backgroundColor: "#f3f4f6", borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12, color: "#111827" },
  stockItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
});

/* ═══════════════════════════ COMPONENT ═══════════════════════════ */

export default function FundamentalScreen() {
  const [stock, setStock] = useState<StockInfo>(STOCK_LIST.find(s => s.symbol === "RELIANCE")!);
  const [tab, setTab] = useState<TabName>("Profit & Loss");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Resolved capcode & type (may differ from stock.code after API verification)
  const [resolvedCode, setResolvedCode] = useState<number>(stock.code);
  const [resolvedType, setResolvedType] = useState<string>(stock.type);

  // Bumped every time the stock changes - triggers core data reload
  const [stockVersion, setStockVersion] = useState(0);

  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem("authToken") || await AsyncStorage.getItem("access");
      if (t) setToken(t);
    })();
  }, []);

  const safeFetch = async (url: string) => {
    try {
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const mrkt = await AsyncStorage.getItem("mkt");
      if (mrkt) headers.mrkt = mrkt;
      const r = await fetch(url, { headers });
      if (!r.ok) return null;
      return await r.json();
    }
    catch { return null; }
  };

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<StockInfo[]>([]);
  const [searching, setSearching] = useState(false);

  // Data stores
  const [plData, setPlData] = useState<any>(null);
  const [bsData, setBsData] = useState<any>(null);
  const [cfData, setCfData] = useState<any>(null);
  const [ratioData, setRatioData] = useState<any>(null);
  const [quarterlyData, setQuarterlyData] = useState<any>(null);
  const [shareholding, setShareholding] = useState<any>(null);
  const [dividends, setDividends] = useState<any>(null);
  const [bonus, setBonus] = useState<any>(null);
  const [splits, setSplits] = useState<any>(null);
  const [insider, setInsider] = useState<any>(null);
  const [bulkDeals, setBulkDeals] = useState<any>(null);
  const [blockDeals, setBlockDeals] = useState<any>(null);
  const [tabLoading, setTabLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<any>(null);

  const [eventType, setEventType] = useState<"Dividends" | "Bonus" | "StockSplit" | "InsiderTrading">("Dividends");
  const [dealType, setDealType] = useState<"Bulk" | "Block">("Bulk");

  // Clear ALL data stores
  const clearAllData = () => {
    setPlData(null); setBsData(null); setCfData(null); setCompanyInfo(null);
    setRatioData(null); setQuarterlyData(null); setShareholding(null);
    setDividends(null); setBonus(null); setSplits(null); setInsider(null);
    setBulkDeals(null); setBlockDeals(null);
  };

  /* ─── Core data load: triggered by stockVersion change ─── */
  useEffect(() => {
    let cancelled = false;

    const loadCore = async () => {
      try {
        setLoading(true);
        setError(null);
        clearAllData();

        // Step 1: Resolve correct capcode via API
        let activeCode = stock.code;
        try {
          const codeRes = await safeFetch(`${HIST}/getCapcodeByStockSymbol?instrument=${stock.symbol}`);
          // API returns { code: 5400 }
          if (codeRes?.code) {
            activeCode = codeRes.code;
            console.log(`[Fundamental] Resolved capcode for ${stock.symbol}: ${activeCode}`);
          }
        } catch (err) {
          console.warn("[Fundamental] Capcode resolve failed, using default:", stock.code);
        }

        if (cancelled) return;

        // Step 2: Try Consolidated, fall back to Standalone
        let activeType = stock.type;
        let pl = await safeFetch(`${BASE}/getProfitLoss?type=${activeType}&capcode=${activeCode}`);

        if (!pl?.results || Object.keys(pl.results).length === 0) {
          const altType = activeType === "C" ? "S" : "C";
          const plAlt = await safeFetch(`${BASE}/getProfitLoss?type=${altType}&capcode=${activeCode}`);
          if (plAlt?.results && Object.keys(plAlt.results).length > 0) {
            pl = plAlt;
            activeType = altType;
          }
        }

        if (cancelled) return;

        // Step 3: Fetch BS, CF, Company Info in parallel
        const [bs, cf, info] = await Promise.all([
          safeFetch(`${BASE}/getBalanceSheet?type=${activeType}&capcode=${activeCode}`),
          safeFetch(`${BASE}/getCashFlow?type=${activeType}&capcode=${activeCode}`),
          safeFetch(`${HIST}/companyname?instrument=${activeCode}`),
        ]);

        if (cancelled) return;

        // Store resolved values for lazy tabs to use
        setResolvedCode(activeCode);
        setResolvedType(activeType);
        setPlData(pl);
        setBsData(bs);
        setCfData(cf);
        setCompanyInfo(info);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Failed to load data");
      } finally {
        if (!cancelled) { setLoading(false); setRefreshing(false); }
      }
    };

    loadCore();
    return () => { cancelled = true; };
  }, [stockVersion]);

  /* ─── Lazy tab data: loads when user switches tabs ─── */
  useEffect(() => {
    if (loading) return; // wait for core to finish
    let cancelled = false;

    const load = async () => {
      setTabLoading(true);
      try {
        const code = resolvedCode;
        const type = resolvedType;

        if (tab === "Ratios" && !ratioData) {
          const d = await safeFetch(`${BASE}/getCFRatio?capcode=${code}&type=${type}&section=KeyFinancial`);
          if (!cancelled) setRatioData(d);
        } else if (tab === "Quarterly" && !quarterlyData) {
          const d = await safeFetch(`${BASE}/getQuarterly?capcode=${code}&type=${type}`);
          if (!cancelled) setQuarterlyData(d);
        } else if (tab === "Shareholding" && !shareholding) {
          const d = await safeFetch(`${BASE}/getShareholdingPatterns?capcode=${code}`);
          if (!cancelled) setShareholding(d);
        } else if (tab === "Corporate Events") {
          if (eventType === "Dividends" && !dividends) {
            const d = await safeFetch(`${BASE}/getCorporateEvents?capcode=${code}&type=Dividends&page=1`);
            if (!cancelled) setDividends(d);
          } else if (eventType === "Bonus" && !bonus) {
            const d = await safeFetch(`${BASE}/getCorporateEvents?capcode=${code}&type=Bonus&page=1`);
            if (!cancelled) setBonus(d);
          } else if (eventType === "StockSplit" && !splits) {
            const d = await safeFetch(`${BASE}/getCorporateEvents?capcode=${code}&type=StockSplit&page=1`);
            if (!cancelled) setSplits(d);
          } else if (eventType === "InsiderTrading" && !insider) {
            const d = await safeFetch(`${BASE}/getCorporateEvents?capcode=${code}&type=InsiderTrading&page=1`);
            if (!cancelled) setInsider(d);
          }
        } else if (tab === "Bulk & Block Deals") {
          if (dealType === "Bulk" && !bulkDeals) {
            const d = await safeFetch(`${BASE}/getBulkBlockDeals?capcode=${code}&type=Bulk&page=1`);
            if (!cancelled) setBulkDeals(d);
          } else if (dealType === "Block" && !blockDeals) {
            const d = await safeFetch(`${BASE}/getBulkBlockDeals?capcode=${code}&type=Block&page=1`);
            if (!cancelled) setBlockDeals(d);
          }
        }
      } catch { }
      finally {
        if (!cancelled) setTabLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [tab, eventType, dealType, loading, stockVersion, resolvedCode]);

  /* ─── Handle stock selection ─── */
  const selectStock = (item: StockInfo) => {
    setStock(item);
    setShowPicker(false);
    setSearch("");
    setSearchResults([]);
    setTab("Profit & Loss");
    clearAllData();
    setStockVersion(v => v + 1); // triggers core reload
  };

  /* ─── Search handler ─── */
  const handleSearch = async (text: string) => {
    setSearch(text);
    if (text.length < 2) { setSearchResults([]); return; }
    const local = STOCK_LIST.filter(s =>
      s.name.toLowerCase().includes(text.toLowerCase()) ||
      s.symbol.toLowerCase().includes(text.toLowerCase())
    );
    setSearchResults(local);
    if (text.length >= 3) {
      setSearching(true);
      try {
        // API returns { code: 5400 }
        const res = await safeFetch(`${HIST}/getCapcodeByStockSymbol?instrument=${text.toUpperCase()}`);
        if (res?.code && !local.find(s => s.code === res.code)) {
          const nameRes = await safeFetch(`${HIST}/companyname?instrument=${res.code}`);
          if (nameRes?.name) {
            setSearchResults(prev => [...prev, {
              name: nameRes.name,
              code: res.code,
              type: "C",
              symbol: text.toUpperCase()
            }]);
          }
        }
      } catch { }
      setSearching(false);
    }
  };

  /* ═══ INSIGHTS SECTION ═══ */
  const renderInsights = () => {
    if (!plData?.results) return null;
    const years = Object.keys(plData.results).sort();
    const latest = years[years.length - 1];
    const prev = years.length > 1 ? years[years.length - 2] : null;
    const yd = plData.results[latest];
    const pd = prev ? plData.results[prev] : null;

    const get = (data: any, key: string) => extractMetric(data, key);
    const sales = safeNum(get(yd, "Sales"));
    const prevSales = pd ? safeNum(get(pd, "Sales")) : 0;
    const netProfit = safeNum(get(yd, "Net Profit"));
    const prevNetProfit = pd ? safeNum(get(pd, "Net Profit")) : 0;
    const opm = safeNum(get(yd, "OPM%"));
    const npm = safeNum(get(yd, "NPM%"));
    const eps = safeNum(get(yd, "EPS (Adjusted)"));
    const bv = safeNum(get(yd, "Book Value (Adjusted)"));

    const salesGrowth = prevSales ? ((sales - prevSales) / prevSales * 100) : 0;
    const profitGrowth = prevNetProfit ? ((netProfit - prevNetProfit) / prevNetProfit * 100) : 0;

    const InsightCard = ({ icon, label, value, sub, color }: any) => (
      <View style={[st.insightCard, { borderLeftColor: color }]}>
        <Text style={st.insightIcon}>{icon}</Text>
        <Text style={st.insightLabel}>{label}</Text>
        <Text style={[st.insightValue, { color }]}>{value}</Text>
        {sub ? <Text style={[st.insightSub, { color: parseFloat(sub) >= 0 ? "#10b981" : "#ef4444" }]}>{parseFloat(sub) >= 0 ? "▲" : "▼"} {Math.abs(parseFloat(sub)).toFixed(1)}% YoY</Text> : null}
      </View>
    );

    return (
      <View style={st.card}>
        <Text style={st.sectionTitle}>📊 Key Insights — FY {latest}</Text>
        <View style={st.insightGrid}>
          <InsightCard icon="💰" label="Revenue" value={`₹${fmt(sales)} Cr`} sub={String(salesGrowth)} color="#4f46e5" />
          <InsightCard icon="📈" label="Net Profit" value={`₹${fmt(netProfit)} Cr`} sub={String(profitGrowth)} color="#10b981" />
          <InsightCard icon="⚡" label="OPM" value={`${opm.toFixed(1)}%`} color="#f59e0b" />
          <InsightCard icon="📉" label="NPM" value={`${npm.toFixed(1)}%`} color="#8b5cf6" />
          <InsightCard icon="💵" label="EPS" value={`₹${eps.toFixed(2)}`} color="#3b82f6" />
          <InsightCard icon="📖" label="Book Value" value={`₹${bv.toFixed(2)}`} color="#06b6d4" />
        </View>
      </View>
    );
  };

  /* ═══ YEAR-WISE TABLE ═══ */
  const renderYearWiseTable = (apiData: any, metricsToShow: string[]) => {
    if (!apiData?.results) return <View style={{ padding: 20, alignItems: "center" }}><Text style={{ color: "#6b7280" }}>No data available</Text></View>;
    const allYears = Object.keys(apiData.results).sort();
    const years = allYears.slice(-5);

    return (
      <View style={st.card}>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View>
            <View style={[st.tRow, st.tHeaderRow]}>
              <Text style={[st.tCell, st.tMetricCell, st.tHeaderText]}>Metric</Text>
              {years.map(y => (
                <Text key={y} style={[st.tCell, st.tYearCell, st.tHeaderText]}>{y}</Text>
              ))}
            </View>
            {metricsToShow.map((metric, idx) => (
              <View key={metric} style={[st.tRow, idx % 2 === 0 ? st.tRowEven : st.tRowOdd]}>
                <Text style={[st.tCell, st.tMetricCell, st.tMetricText]} numberOfLines={2}>{metric}</Text>
                {years.map(y => {
                  const val = extractMetric(apiData.results[y], metric);
                  return (
                    <Text key={y} style={[st.tCell, st.tYearCell, st.tDataText,
                    val !== null && safeNum(val) < 0 && { color: "#ef4444" }
                    ]}>
                      {val !== null && val !== undefined ? fmt(val) : "-"}
                    </Text>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  /* ─── Tab Renderers ─── */
  const PL_METRICS = ["Sales", "Expenses", "Operating Profit", "OPM%", "Other Income and stock adj", "EBITDA", "Depreciation Expense", "EBIT", "Interest Expense", "Profit Before Tax", "Tax Expense", "Tax%", "Net Profit", "NPM%", "EPS (Adjusted)", "Book Value (Adjusted)"];
  const BS_METRICS = ["Total Assets", "Fixed Assets", "Current Assets", "Investments", "Share Capital", "Reserves and Surplus", "Shareholders Equity", "Total Debt", "Current Liabilities", "Total Liabilities"];
  const CF_METRICS = ["Cash at beginning of year", "Cash from operating activities", "Cash from investing activities", "Cash from financing activities", "Net Cash Flow", "Cash at end of year"];

  const renderPL = () => (
    <>
      {renderInsights()}
      <View style={st.card}><Text style={st.sectionTitle}>💰 Profit & Loss Statement</Text></View>
      {renderYearWiseTable(plData, PL_METRICS)}
    </>
  );

  const renderBS = () => (
    <>
      <View style={st.card}><Text style={st.sectionTitle}>📋 Balance Sheet</Text></View>
      {renderYearWiseTable(bsData, BS_METRICS)}
    </>
  );

  const renderCF = () => (
    <>
      <View style={st.card}><Text style={st.sectionTitle}>💵 Cash Flow Statement</Text></View>
      {renderYearWiseTable(cfData, CF_METRICS)}
    </>
  );

  const renderRatios = () => {
    if (tabLoading) return <Loader />;
    if (!ratioData?.results) return <NoData />;
    const allYears = Object.keys(ratioData.results).sort();
    const years = allYears.slice(-5);
    const sampleObj = Array.isArray(ratioData.results[years[0]]) ? ratioData.results[years[0]][0] : ratioData.results[years[0]];
    if (!sampleObj) return <NoData />;
    const metrics = Object.keys(sampleObj);

    return (
      <>
        <View style={st.card}><Text style={st.sectionTitle}>📈 Key Financial Ratios</Text></View>
        <View style={st.card}>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
              <View style={[st.tRow, st.tHeaderRow]}>
                <Text style={[st.tCell, st.tMetricCell, st.tHeaderText]}>Ratio</Text>
                {years.map(y => <Text key={y} style={[st.tCell, st.tYearCell, st.tHeaderText]}>{y}</Text>)}
              </View>
              {metrics.map((metric, idx) => (
                <View key={metric} style={[st.tRow, idx % 2 === 0 ? st.tRowEven : st.tRowOdd]}>
                  <Text style={[st.tCell, st.tMetricCell, st.tMetricText]} numberOfLines={2}>{metric}</Text>
                  {years.map(y => {
                    const d = Array.isArray(ratioData.results[y]) ? ratioData.results[y][0] : ratioData.results[y];
                    return <Text key={y} style={[st.tCell, st.tYearCell, st.tDataText]}>{d?.[metric] !== undefined ? fmt(d[metric]) : "-"}</Text>;
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </>
    );
  };

  const renderQuarterly = () => {
    if (tabLoading) return <Loader />;
    if (!quarterlyData?.results) return <NoData />;
    const allQtrs = Object.keys(quarterlyData.results).sort();
    const qtrs = allQtrs.slice(-8);
    const METRICS = ["Sales", "Expenses", "Operating Profit", "OPM%", "EBITDA", "Net Profit", "NPM%", "EPS (Adjusted)"];
    const fmtQtr = (q: string) => {
      const yr = q.slice(0, 4);
      const mn = parseInt(q.slice(4));
      const qn = mn <= 3 ? "Q4" : mn <= 6 ? "Q1" : mn <= 9 ? "Q2" : "Q3";
      return `${qn}\n${yr}`;
    };
    return (
      <>
        <View style={st.card}><Text style={st.sectionTitle}>📅 Quarterly Results</Text></View>
        <View style={st.card}>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
              <View style={[st.tRow, st.tHeaderRow]}>
                <Text style={[st.tCell, st.tMetricCell, st.tHeaderText]}>Metric</Text>
                {qtrs.map(q => <Text key={q} style={[st.tCell, st.tYearCell, st.tHeaderText]}>{fmtQtr(q)}</Text>)}
              </View>
              {METRICS.map((metric, idx) => (
                <View key={metric} style={[st.tRow, idx % 2 === 0 ? st.tRowEven : st.tRowOdd]}>
                  <Text style={[st.tCell, st.tMetricCell, st.tMetricText]} numberOfLines={2}>{metric}</Text>
                  {qtrs.map(q => {
                    const val = extractMetric(quarterlyData.results[q], metric);
                    return <Text key={q} style={[st.tCell, st.tYearCell, st.tDataText]}>{val !== null && val !== undefined ? fmt(val) : "-"}</Text>;
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </>
    );
  };

  const renderShareholding = () => {
    if (tabLoading) return <Loader />;
    if (!shareholding) return <NoData />;
    const pattern = shareholding["Shareholding Pattern"];
    const pledging = shareholding["Promoter Pledging %"];
    const colors: Record<string, string> = { Promoters: "#4f46e5", FII: "#10b981", DII: "#f59e0b", "Public & Others": "#8b5cf6", Others: "#6b7280" };
    return (
      <>
        {pattern && (
          <View style={st.card}>
            <Text style={st.sectionTitle}>👥 Shareholding Pattern</Text>
            {Object.entries(pattern).map(([k, v]) => (
              <View key={k} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                  <Text style={{ fontSize: 14, color: "#374151", fontWeight: "600" }}>{k}</Text>
                  <Text style={{ fontSize: 14, color: colors[k] || "#4f46e5", fontWeight: "700" }}>{fmt(v)}%</Text>
                </View>
                <View style={{ height: 10, backgroundColor: "#e5e7eb", borderRadius: 5 }}>
                  <View style={{ height: 10, backgroundColor: colors[k] || "#4f46e5", borderRadius: 5, width: `${Math.min(safeNum(v), 100)}%` }} />
                </View>
              </View>
            ))}
          </View>
        )}
        {pledging?.Date && (
          <View style={st.card}>
            <Text style={st.sectionTitle}>🔒 Promoter Pledging Trend</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View>
                <View style={[st.tRow, st.tHeaderRow]}>
                  <Text style={[st.tCell, st.tMetricCell, st.tHeaderText]}>Date</Text>
                  <Text style={[st.tCell, st.tYearCell, st.tHeaderText]}>Promoter %</Text>
                  <Text style={[st.tCell, st.tYearCell, st.tHeaderText]}>Pledge %</Text>
                </View>
                {pledging.Date.map((d: string, i: number) => (
                  <View key={d} style={[st.tRow, i % 2 === 0 ? st.tRowEven : st.tRowOdd]}>
                    <Text style={[st.tCell, st.tMetricCell, st.tMetricText]}>{d}</Text>
                    <Text style={[st.tCell, st.tYearCell, st.tDataText]}>{pledging["PROMOTER %"]?.[i] ?? "-"}%</Text>
                    <Text style={[st.tCell, st.tYearCell, st.tDataText]}>{pledging["PLEDGE %"]?.[i] ?? "-"}%</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </>
    );
  };

  const SubTabs = ({ items, active, onSelect }: { items: string[]; active: string; onSelect: (v: any) => void }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
      {items.map(t => (
        <TouchableOpacity key={t} onPress={() => onSelect(t)} style={[st.subTab, active === t && st.subTabActive]}>
          <Text style={[st.subTabText, active === t && st.subTabTextActive]}>{t}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderCorporateEvents = () => {
    if (tabLoading) return <Loader />;
    const dataMap: Record<string, any> = { Dividends: dividends, Bonus: bonus, StockSplit: splits, InsiderTrading: insider };
    const d = dataMap[eventType];
    return (
      <View style={st.card}>
        <Text style={st.sectionTitle}>🎉 Corporate Events</Text>
        <SubTabs items={["Dividends", "Bonus", "StockSplit", "InsiderTrading"]} active={eventType} onSelect={setEventType} />
        {!d?.results?.length ? <NoData msg={`No ${eventType} data`} /> :
          eventType === "Dividends" ? (
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View>
                <View style={[st.tRow, st.tHeaderRow]}>
                  {["Ex-Date", "Type", "Dividend %", "Per Share"].map(h => <Text key={h} style={[st.tCell, st.tYearCell, st.tHeaderText]}>{h}</Text>)}
                </View>
                {d.results.slice(0, 15).map((item: any, i: number) => (
                  <View key={i} style={[st.tRow, i % 2 === 0 ? st.tRowEven : st.tRowOdd]}>
                    <Text style={[st.tCell, st.tYearCell, st.tDataText]}>{fmtDate(item["Ex Dividend Date"])}</Text>
                    <Text style={[st.tCell, st.tYearCell, st.tDataText]}>{item.Type}</Text>
                    <Text style={[st.tCell, st.tYearCell, st.tDataText]}>{item["Dividend %"]}%</Text>
                    <Text style={[st.tCell, st.tYearCell, st.tDataText]}>₹{item["Dividend Per Share"]}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : eventType === "Bonus" ? (
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View>
                <View style={[st.tRow, st.tHeaderRow]}>
                  {["Ex-Date", "Record Date", "Ratio"].map(h => <Text key={h} style={[st.tCell, st.tYearCell, st.tHeaderText]}>{h}</Text>)}
                </View>
                {d.results.map((item: any, i: number) => (
                  <View key={i} style={[st.tRow, i % 2 === 0 ? st.tRowEven : st.tRowOdd]}>
                    <Text style={[st.tCell, st.tYearCell, st.tDataText]}>{fmtDate(item["Ex Bonus Date"])}</Text>
                    <Text style={[st.tCell, st.tYearCell, st.tDataText]}>{fmtDate(item["Record Date"])}</Text>
                    <Text style={[st.tCell, st.tYearCell, st.tDataText]}>{item.Ratio}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : eventType === "InsiderTrading" ? (
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View>
                <View style={[st.tRow, st.tHeaderRow]}>
                  {["Date", "Name", "Type", "Value"].map(h => <Text key={h} style={[st.tCell, st.tYearCell, st.tHeaderText]}>{h}</Text>)}
                </View>
                {d.results.slice(0, 15).map((item: any, i: number) => (
                  <View key={i} style={[st.tRow, i % 2 === 0 ? st.tRowEven : st.tRowOdd]}>
                    <Text style={[st.tCell, st.tYearCell, st.tDataText]}>{fmtDate(item["Trade Date"])}</Text>
                    <Text style={[st.tCell, st.tYearCell, st.tDataText]} numberOfLines={1}>{item["Buyer/Seller"]}</Text>
                    <Text style={[st.tCell, st.tYearCell, { color: item["Transaction Type"] === "Acquisition" ? "#10b981" : "#ef4444", fontWeight: "600", fontSize: 13 }]}>{item["Transaction Type"]}</Text>
                    <Text style={[st.tCell, st.tYearCell, st.tDataText]}>₹{fmt(item["Total Value"])}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : <NoData msg="No stock split data" />
        }
      </View>
    );
  };

  const renderDeals = () => {
    if (tabLoading) return <Loader />;
    const d = dealType === "Bulk" ? bulkDeals : blockDeals;
    return (
      <View style={st.card}>
        <Text style={st.sectionTitle}>🤝 Bulk & Block Deals</Text>
        <SubTabs items={["Bulk", "Block"]} active={dealType} onSelect={setDealType} />
        {!d?.results?.length ? <NoData msg={`No ${dealType} deals`} /> : (
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
              <View style={[st.tRow, st.tHeaderRow]}>
                {["Date", "Name", "Activity", "Volume", "Avg Price"].map(h => <Text key={h} style={[st.tCell, st.tYearCell, st.tHeaderText]}>{h}</Text>)}
              </View>
              {d.results.slice(0, 15).map((item: any, i: number) => (
                <View key={i} style={[st.tRow, i % 2 === 0 ? st.tRowEven : st.tRowOdd]}>
                  <Text style={[st.tCell, st.tYearCell, st.tDataText]}>{fmtDate(item.Date || item["Deal Date"])}</Text>
                  <Text style={[st.tCell, st.tYearCell, st.tDataText]} numberOfLines={1}>{item.Name || item["Client Name"]}</Text>
                  <Text style={[st.tCell, st.tYearCell, { color: item.Activity === "BUY" ? "#10b981" : "#ef4444", fontWeight: "700", fontSize: 13 }]}>{item.Activity}</Text>
                  <Text style={[st.tCell, st.tYearCell, st.tDataText]}>{fmt(item["Traded Volume"])}</Text>
                  <Text style={[st.tCell, st.tYearCell, st.tDataText]}>₹{fmt(item["Average Price"])}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    );
  };

  const contentMap: Record<TabName, () => React.ReactNode> = {
    "Profit & Loss": renderPL, "Balance Sheet": renderBS, "Cash Flow": renderCF,
    "Ratios": renderRatios, "Quarterly": renderQuarterly, "Shareholding": renderShareholding,
    "Corporate Events": renderCorporateEvents, "Bulk & Block Deals": renderDeals,
  };

  /* ═══ Small components ═══ */
  const Loader = () => <ActivityIndicator size="large" color="#4f46e5" style={{ padding: 40 }} />;
  const NoData = ({ msg }: { msg?: string }) => (
    <View style={st.card}><View style={{ padding: 40, alignItems: "center" }}><Text style={{ fontSize: 14, color: "#9ca3af" }}>{msg || "No data available"}</Text></View></View>
  );

  const displayStocks = search.length >= 2 ? searchResults : STOCK_LIST;

  /* ═══ Main loading / error states ═══ */
  if (loading) return (
    <SafeAreaView style={st.container} edges={["top"]}>
      <StatusBar backgroundColor="#4f46e5" barStyle="light-content" />
      <View style={st.center}><ActivityIndicator size="large" color="#4f46e5" /><Text style={{ marginTop: 12, color: "#6b7280" }}>Loading {stock.name}...</Text></View>
    </SafeAreaView>
  );
  if (error) return (
    <SafeAreaView style={st.container} edges={["top"]}>
      <StatusBar backgroundColor="#4f46e5" barStyle="light-content" />
      <View style={st.center}>
        <Text style={{ color: "#ef4444", fontSize: 16, fontWeight: "600" }}>⚠️ {error}</Text>
        <TouchableOpacity style={st.retryBtn} onPress={() => setStockVersion(v => v + 1)}><Text style={st.retryText}>Retry</Text></TouchableOpacity>
        <TouchableOpacity style={[st.retryBtn, { marginTop: 12, backgroundColor: "#6b7280" }]} onPress={() => setShowPicker(true)}><Text style={st.retryText}>Change Stock</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  /* ═══ MAIN RENDER ═══ */
  return (
    <SafeAreaView style={st.container} edges={["top"]}>
      <StatusBar backgroundColor="#4f46e5" barStyle="light-content" />

      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity style={st.searchBar} onPress={() => setShowPicker(true)} activeOpacity={0.9}>
          <Text style={{ fontSize: 18, marginRight: 8 }}>🔍</Text>
          <View style={{ flex: 1 }}>
            <Text style={st.searchTitle} numberOfLines={1}>{companyInfo?.name || stock.name}</Text>
            <Text style={st.searchSub}>{stock.symbol} • {resolvedType === "C" ? "Consolidated" : "Standalone"} • Code: {resolvedCode}</Text>
          </View>
          <View style={st.searchIconBtn}>
            <Text style={{ color: "#4f46e5", fontWeight: "700", fontSize: 12 }}>CHANGE</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.tabBar} contentContainerStyle={{ paddingHorizontal: 4 }}>
        {TABS.map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[st.tab, tab === t && st.tabActive]}>
            <Text style={[st.tabText, tab === t && st.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setStockVersion(v => v + 1); }} colors={["#4f46e5"]} tintColor="#4f46e5" />}>
        {contentMap[tab]?.()}
        <View style={{ alignItems: "center", paddingVertical: 24 }}>
          <Text style={{ color: "#9ca3af", fontSize: 12 }}>Data from Unfluke API • Pull to refresh</Text>
        </View>
      </ScrollView>

      {/* Stock Picker Modal */}
      <Modal visible={showPicker} animationType="slide" transparent onRequestClose={() => setShowPicker(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, justifyContent: "flex-end" }}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} activeOpacity={1} onPress={() => setShowPicker(false)} />
          <SafeAreaView style={{ backgroundColor: "transparent" }} edges={["bottom"]}>
            <View style={st.modalContent}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <Text style={{ fontSize: 20, fontWeight: "700", color: "#111827" }}>Select Stock</Text>
                <TouchableOpacity onPress={() => setShowPicker(false)}><Text style={{ fontSize: 28, color: "#6b7280" }}>✕</Text></TouchableOpacity>
              </View>
              <TextInput style={st.searchInput} placeholder="Search by name or symbol..."
                value={search} onChangeText={handleSearch} placeholderTextColor="#9ca3af" autoFocus />
              {searching && <ActivityIndicator size="small" color="#4f46e5" style={{ marginBottom: 8 }} />}
              <FlatList data={displayStocks} keyExtractor={i => `${i.code}-${i.symbol}`}
                renderItem={({ item }) => (
                  <TouchableOpacity style={st.stockItem} onPress={() => selectStock(item)}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>{item.name}</Text>
                      <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>NSE: {item.symbol}</Text>
                    </View>
                    {stock.symbol === item.symbol && <Text style={{ fontSize: 24, color: "#4f46e5", fontWeight: "700" }}>✓</Text>}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={<View style={{ padding: 40, alignItems: "center" }}><Text style={{ color: "#6b7280" }}>No stocks found</Text></View>}
              />
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}