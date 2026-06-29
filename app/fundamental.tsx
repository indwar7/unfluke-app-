/**
 * FundamentalScreen.tsx
 * ✅ Uses ScreenWithHeader for consistent navbar
 * ✅ All 10 tabs in correct order
 * ✅ Search bar with proper AbortController cleanup
 * ✅ S/C toggle correctly passed to BulkBlockDealsTab
 * ✅ Ratio cards strip
 */
import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  ActivityIndicator, Dimensions, StyleSheet, Modal, FlatList,
  KeyboardAvoidingView, Platform, Keyboard,
} from "react-native";
import {
  Search, X, ChevronDown, ChevronRight, Check,
  AlertCircle, TrendingUp, TrendingDown,
} from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedStock } from "../redux/Unfluke_slices/globalStock/reducer";
import {
  useCompany, useFinancials, getPeriodKeys, formatPeriodLabel,
  getRatioPeriodKeys, getMergedRatioData,
} from "../hooks/useFundamentalData";
import { fmt } from "../components/fundamentals/constants";
import { ScreenWithHeader } from "../components/AppHeader";
import { BalanceSheetTab, PLStyleTab, KeyRatiosTab } from "../components/fundamentals/FinancialTabs";
import {
  ChartsTab, BulkBlockDealsTab, CorporateEventsTab,
  ShareholdingPatternsTab, DocumentsTab,
} from "../components/fundamentals/DataTabs";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

const { width: SCREEN_W } = Dimensions.get("window");
const SEARCH_URL = "https://api.unfluke.in/api/historicData/search?searchQuery=";
const DEFAULT_STOCK = { symbol: "RELIANCE", name: "Reliance Industries Ltd", capcode: 476 };

type StockType = "C" | "S";
type SectionType =
  | "Balance Sheet" | "Profit & Loss" | "Cash Flow"
  | "Quarterly Results" | "Key Ratios" | "Charts"
  | "Bulk and Block Deals" | "Corporate Events"
  | "Shareholding Patterns" | "Documents";

const SECTIONS: SectionType[] = [
  "Balance Sheet", "Profit & Loss", "Cash Flow",
  "Quarterly Results", "Key Ratios", "Charts",
  "Bulk and Block Deals", "Corporate Events",
  "Shareholding Patterns", "Documents",
];

const NO_PERIOD: SectionType[] = [
  "Charts", "Bulk and Block Deals", "Corporate Events",
  "Shareholding Patterns", "Documents",
];

interface SearchResult {
  "Company Name": string;
  NSESYMBOL?: string;
  BSESYMBOL?: string;
  "Capitaline Code"?: number | string;
}

/* ═══════════════════════════════════════════════════════
   RATIO CARD
═══════════════════════════════════════════════════════ */
function RatioCardInline({ label, value, yoyChange, s, c }: {
  label: string; value: any; yoyChange?: number; s: any; c: AppColors;
}) {
  const isPositive = (yoyChange ?? 0) >= 0;
  return (
    <View style={s.rcCard}>
      <Text style={s.rcLabel} numberOfLines={1}>{label}</Text>
      <Text style={s.rcValue} numberOfLines={1}>{fmt(value)}</Text>
      {yoyChange !== undefined && !isNaN(yoyChange) && (
        <View style={s.rcYoyRow}>
          {isPositive
            ? <TrendingUp size={10} color={c.profit} strokeWidth={2.5} />
            : <TrendingDown size={10} color={c.loss} strokeWidth={2.5} />}
          <Text style={[s.rcYoy, { color: isPositive ? c.profit : c.loss }]} numberOfLines={1}>
            {isPositive ? "+" : ""}{yoyChange.toFixed(1)}%
          </Text>
        </View>
      )}
    </View>
  );
}

/* ═══════════════════════════════════════════════════════
   PERIOD PICKER
═══════════════════════════════════════════════════════ */
function PeriodPicker({ items, selected, onSelect, s, c }: {
  items: string[]; selected: string; onSelect: (v: string) => void; s: any; c: AppColors;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity style={s.picker} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Text style={s.pickerText}>{selected ? formatPeriodLabel(selected) : "Year"}</Text>
        <ChevronDown size={14} color={c.gold} strokeWidth={2.4} />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={s.pickerModal}>
            <Text style={s.pickerTitle}>Select Period</Text>
            <FlatList
              data={items}
              keyExtractor={i => i}
              style={{ maxHeight: 380 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[s.pickerRow, item === selected && s.pickerRowOn]}
                  onPress={() => { onSelect(item); setOpen(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[s.pickerRowText, item === selected && s.pickerRowTextOn]}>
                    {formatPeriodLabel(item)}
                  </Text>
                  {item === selected && <Check size={18} color={c.gold} strokeWidth={2.6} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN SCREEN
═══════════════════════════════════════════════════════ */
export default function FundamentalScreen() {
  const { colors: c, isDark } = useTheme();
  const s = useMemo(() => makeStyles(c, isDark), [c, isDark]);
  const dispatch = useDispatch();
  const scrollRef = useRef<ScrollView>(null);
  const tabScrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const abortRef = useRef<AbortController | null>(null);

  const redux = useSelector((s: any) => s.GlobalStock?.selectedStock);

  useEffect(() => {
    dispatch(setSelectedStock(DEFAULT_STOCK));
  }, []);

  const stock = redux?.capcode ? redux : DEFAULT_STOCK;
  const capcode = String(stock.capcode);
  const companyName = stock.name || DEFAULT_STOCK.name;

  const [query, setQuery] = useState(stock.name);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDrop, setShowDrop] = useState(false);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<SectionType>("Balance Sheet");
  const [stockType, setStockType] = useState<StockType>("C");
  const [period, setPeriod] = useState("");

  useEffect(() => {
    if (stock.name) setQuery(stock.name);
  }, [stock.name, capcode]);

  // ── Search with proper cleanup ──
  useEffect(() => {
    abortRef.current?.abort();
    const q = query.trim();
    if (!q || q === stock.name) { setShowDrop(false); setResults([]); return; }
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setSearching(true);
    fetch(`${SEARCH_URL}${encodeURIComponent(q)}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then((data: any) => {
        if (ctrl.signal.aborted) return;
        const list: SearchResult[] =
          Array.isArray(data) ? data :
            Array.isArray(data?.data) ? data.data :
              Array.isArray(data?.results) ? data.results : [];
        setResults(list);
        setShowDrop(list.length > 0);
      })
      .catch(e => {
        if (e?.name !== "AbortError") { setResults([]); setShowDrop(false); }
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setSearching(false);
      });
    return () => ctrl.abort();
  }, [query]);

  // ✅ Cleanup abort on unmount
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const { data: company, isLoading: loadCo } = useCompany(capcode);
  const { data: financials, isLoading: loadFin, refetch: refetchFin } = useFinancials(capcode, stockType);


  useEffect(() => {
    setPeriod("");
    setActiveTab("Balance Sheet");
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [capcode]);

  useEffect(() => {
    setPeriod("");
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [stockType]);

  const currentResponse = useMemo(() => {
    if (!financials) return undefined;
    switch (activeTab) {
      case "Balance Sheet": return financials.balanceSheet;
      case "Profit & Loss": return financials.profitLoss;
      case "Cash Flow": return financials.cashFlow;
      case "Quarterly Results": return financials.quarterly;
      default: return undefined;
    }
  }, [financials, activeTab]);

  const periodKeys = useMemo(() => {
    if (NO_PERIOD.includes(activeTab)) return [];
    if (activeTab === "Key Ratios") return getRatioPeriodKeys(financials?.ratios) || [];
    return getPeriodKeys(currentResponse) || [];
  }, [activeTab, currentResponse, financials]);

  useEffect(() => {
    if (periodKeys.length > 0) {
      if (!period || !periodKeys.includes(period)) setPeriod(periodKeys[0]);
    } else {
      setPeriod("");
    }
  }, [periodKeys]);

  // ── Ratio summary cards ──
  const ratioCards = useMemo(() => {
    try {
      if (!financials?.ratios) return [];
      const allP = getRatioPeriodKeys(financials.ratios);
      if (!allP.length) return [];
      const cur = getMergedRatioData(financials.ratios, allP[0]) || {};
      const prev = allP[1] ? getMergedRatioData(financials.ratios, allP[1]) || {} : {};
      // Detect bank: use banking API data (must have actual period data), or fallback heuristic
      const bankingResults = financials.banking?.results;
      const hasBankingData = bankingResults && typeof bankingResults === "object" && Object.keys(bankingResults).length > 0;
      const isBank = hasBankingData ||
        ((cur["Current Ratio"] == null || cur["Current Ratio"] === 0) && cur["Price Earning (P/E)"] != null);
      const CARD_KEYS = isBank
        ? [
            { label: "PE Ratio", key: "Price Earning (P/E)" },
            { label: "Price to Book Value Ratio", key: "Price to Book Value ( P/BV)" },
            { label: "Price/Cash EPS Ratio", key: "Price/Cash EPS (P/CEPS)" },
            { label: "ROE Ratio", key: "ROE(%)" },
          ]
        : [
            { label: "Current Ratio", key: "Current Ratio" },
            { label: "Debt-Equity", key: "Debt-Equity Ratio" },
            { label: "Interest Cover", key: "Interest Cover Ratio" },
            { label: "Total Asset Turnover", key: "Total Asset Turnover Ratio" },
          ];
      return CARD_KEYS
        .filter(c => cur[c.key] != null)
        .map(c => {
          const val = cur[c.key];
          let yoy: number | undefined;
          if (typeof val === "number" && typeof prev[c.key] === "number" && prev[c.key] !== 0)
            yoy = ((val - prev[c.key]) / Math.abs(prev[c.key])) * 100;
          return { label: c.label, value: val, yoyChange: yoy };
        })
        .slice(0, 4);
    } catch { return []; }
  }, [financials]);

  const selectStock = useCallback((item: SearchResult) => {
    dispatch(setSelectedStock({
      symbol: item?.NSESYMBOL || "",
      name: item?.["Company Name"] || "",
      capcode: item?.["Capitaline Code"],
    }));
    setQuery(item?.["Company Name"] || "");
    setShowDrop(false);
    setResults([]);
    Keyboard.dismiss();
  }, [dispatch]);

  const clearSearch = useCallback(() => {
    setQuery(""); setResults([]); setShowDrop(false);
    setTimeout(() => inputRef.current?.focus(), 30);
  }, []);

  const switchTab = useCallback((tab: SectionType) => {
    setActiveTab(tab);
    setShowDrop(false);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  const isLoading = loadCo || loadFin;
  const showPeriodRow = !NO_PERIOD.includes(activeTab);

  const renderTab = () => {
    try {
      if (activeTab === "Charts")
        return <ChartsTab capcode={capcode} companyName={companyName} stockType={stockType} />;
      if (activeTab === "Bulk and Block Deals")
        return <BulkBlockDealsTab capcode={capcode} stockType={stockType} />;
      if (activeTab === "Corporate Events")
        return <CorporateEventsTab capcode={capcode} />;
      if (activeTab === "Shareholding Patterns")
        return <ShareholdingPatternsTab capcode={capcode} />;
      if (activeTab === "Documents")
        return <DocumentsTab capcode={capcode} companyName={companyName} />;
      if (!financials)
        return <Text style={s.emptyMsg}>No data. Try toggling S / C.</Text>;
      if (activeTab === "Balance Sheet")
        return <BalanceSheetTab response={financials.balanceSheet} period={period} />;
      if (activeTab === "Profit & Loss")
        return <PLStyleTab response={financials.profitLoss} period={period} />;
      if (activeTab === "Cash Flow")
        return <PLStyleTab response={financials.cashFlow} period={period} emptyMessage="No cash flow data." />;
      if (activeTab === "Quarterly Results")
        return <PLStyleTab response={financials.quarterly} period={period} emptyMessage="No quarterly data." />;
      if (activeTab === "Key Ratios")
        return <KeyRatiosTab ratios={financials.ratios} period={period} banking={financials.banking} />;
      return null;
    } catch (err) {
      console.error("[FundamentalScreen] renderTab:", err);
      return (
        <View style={s.center}>
          <AlertCircle size={44} color={c.loss} strokeWidth={1.8} />
          <Text style={s.emptyMsg}>Something went wrong.</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => refetchFin()}>
            <Text style={s.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <ScreenWithHeader>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={s.root}>

          {/* ── Title ── */}
          <View style={s.titleBar}>
            <Text style={s.titleText}>
              Fundamental Screener{" "}
              <Text style={s.titleAccent}>({activeTab})</Text>
            </Text>
            <Text style={s.titleSub}>Get all your summary at one place</Text>
          </View>

          {/* ── Search Bar ── */}
          <View style={[s.searchOuter, { zIndex: 200 }]}>
            <View style={s.searchPill}>
              {searching
                ? <ActivityIndicator size="small" color={c.gold} style={s.searchIcon} />
                : <Search size={18} color={c.textMuted} strokeWidth={2.2} style={s.searchIcon} />}
              <TextInput
                ref={inputRef}
                style={s.searchInput}
                placeholder="Search company (e.g. Reliance, TCS…)"
                placeholderTextColor={c.textMuted}
                value={query}
                onChangeText={t => {
                  setQuery(t);
                  if (!t) { setShowDrop(false); setResults([]); }
                }}
                onFocus={() => {
                  if (results.length > 0 && query !== stock.name) setShowDrop(true);
                }}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
              />
              {query.length > 0 && (
                <TouchableOpacity
                  onPress={clearSearch}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={20} color={c.textMuted} strokeWidth={2.2} />
                </TouchableOpacity>
              )}
            </View>

            {/* Search Dropdown */}
            {showDrop && results.length > 0 && (
              <View style={s.searchDrop}>
                <FlatList
                  data={results}
                  keyExtractor={(item, i) => String(item?.["Capitaline Code"] ?? i)}
                  keyboardShouldPersistTaps="handled"
                  style={{ maxHeight: 260 }}
                  renderItem={({ item }) => {
                    const sym = [item.NSESYMBOL, item.BSESYMBOL].filter(Boolean).join(" · ");
                    return (
                      <TouchableOpacity
                        style={s.searchDropRow}
                        onPress={() => selectStock(item)}
                        activeOpacity={0.7}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={s.searchDropName} numberOfLines={1}>
                            {item?.["Company Name"] || "—"}
                          </Text>
                          {!!sym && <Text style={s.searchDropSym}>{sym}</Text>}
                        </View>
                        <ChevronRight size={15} color={c.textMuted} strokeWidth={2.2} />
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            )}
          </View>

          {/* ── Tab Bar + S/C Toggle ── */}
          <View style={s.tabBar}>
            <ScrollView
              ref={tabScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.tabScroll}
            >
              {SECTIONS.map(sec => (
                <TouchableOpacity
                  key={sec}
                  style={[s.tab, activeTab === sec && s.tabOn]}
                  onPress={() => switchTab(sec)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.tabText, activeTab === sec && s.tabTextOn]}>{sec}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={s.scWrap}>
              {(["S", "C"] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[s.scBtn, stockType === t && s.scBtnOn]}
                  onPress={() => setStockType(t)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.scText, stockType === t && s.scTextOn]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Ratio Cards Strip ── */}
          {ratioCards.length > 0 && !isLoading && (
            <View style={s.ratioStripWrap}>
              <View style={s.ratioStripContent}>
                {ratioCards.map((card, i) => (
                  <RatioCardInline
                    key={`${card.label}-${i}`}
                    label={card.label}
                    value={card.value}
                    yoyChange={card.yoyChange}
                    s={s}
                    c={c}
                  />
                ))}
              </View>
            </View>
          )}

          {/* ── Period Picker ── */}
          {showPeriodRow && periodKeys.length > 0 && !isLoading && (
            <View style={s.periodRow}>
              <Text style={s.periodLabel}>Period</Text>
              <PeriodPicker items={periodKeys} selected={period} onSelect={setPeriod} s={s} c={c} />
            </View>
          )}

          {/* ── Content ── */}
          {isLoading && showPeriodRow ? (
            <View style={s.center}>
              <ActivityIndicator size="large" color={c.gold} />
              <Text style={s.loadingText}>Loading {companyName}…</Text>
            </View>
          ) : (
            <ScrollView
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={s.scrollContent}
              onScrollBeginDrag={() => setShowDrop(false)}
              nestedScrollEnabled
            >
              {renderTab()}
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </ScreenWithHeader>
  );
}

const makeStyles = (c: AppColors, isDark: boolean) => StyleSheet.create({
  root: { flex: 1, backgroundColor: c.background },

  // Title
  titleBar: {
    backgroundColor: c.surface,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
  },
  titleText: { fontSize: 19, fontWeight: "800", color: c.text, letterSpacing: -0.4 },
  titleAccent: { color: c.gold, fontWeight: "800" },
  titleSub: { fontSize: 12.5, color: c.textMuted, marginTop: 4, letterSpacing: 0.1 },

  // Search
  searchOuter: {
    backgroundColor: c.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  searchPill: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: c.inputBg, borderRadius: 14,
    paddingHorizontal: 14, height: 48,
    borderWidth: 1, borderColor: c.inputBorder,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14.5, color: c.text, paddingVertical: 0, fontWeight: "500" },
  searchDrop: {
    position: "absolute", top: 70, left: 16, right: 16,
    backgroundColor: c.surfaceElevated, borderRadius: 16,
    elevation: 16, shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDark ? 0.5 : 0.14, shadowRadius: 22,
    borderWidth: 1, borderColor: c.border,
    zIndex: 999, overflow: "hidden",
  },
  searchDropRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: c.borderLight,
  },
  searchDropName: { fontSize: 14.5, fontWeight: "700", color: c.text },
  searchDropSym: { fontSize: 12, color: c.textMuted, marginTop: 3, fontWeight: "600", letterSpacing: 0.3 },

  // Tabs
  tabBar: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: c.surface,
    borderBottomWidth: 1, borderBottomColor: c.border,
    paddingLeft: 12,
  },
  tabScroll: { paddingRight: 8, paddingVertical: 8 },
  tab: {
    paddingVertical: 8, paddingHorizontal: 15,
    marginRight: 7, borderRadius: 20,
    backgroundColor: c.surfaceElevated,
    borderWidth: 1, borderColor: c.border,
  },
  tabOn: { backgroundColor: c.gold, borderColor: c.gold },
  tabText: { fontSize: 13, color: c.textSecondary, fontWeight: "600" },
  tabTextOn: { color: c.onGold, fontWeight: "800" },
  scWrap: {
    flexDirection: "row", marginRight: 12, marginLeft: 6,
    backgroundColor: c.surfaceElevated, borderRadius: 20, padding: 3,
    borderWidth: 1, borderColor: c.border,
  },
  scBtn: { paddingHorizontal: 13, paddingVertical: 6, borderRadius: 18 },
  scBtnOn: { backgroundColor: c.gold },
  scText: { fontSize: 12.5, fontWeight: "700", color: c.textSecondary },
  scTextOn: { color: c.onGold, fontWeight: "800" },

  // Ratio Cards Strip
  ratioStripWrap: {
    backgroundColor: c.background,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
  },
  ratioStripContent: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 8,
  },
  rcCard: {
    backgroundColor: c.card, borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 11,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.35 : 0.06, shadowRadius: 8,
    elevation: 3, borderWidth: 1,
    borderColor: c.border, justifyContent: "center",
  },
  rcLabel: {
    fontSize: 8.5, color: c.textMuted, fontWeight: "700",
    marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase",
  },
  rcValue: {
    fontSize: 14, fontWeight: "800", color: c.text,
    marginBottom: 2, fontVariant: ["tabular-nums"],
  },
  rcYoyRow: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 3 },
  rcYoy: { fontSize: 8.5, fontWeight: "700", fontVariant: ["tabular-nums"] },

  // Period Picker
  periodRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: c.background, gap: 10,
  },
  periodLabel: {
    fontSize: 11, fontWeight: "700", color: c.textMuted,
    letterSpacing: 1.2, textTransform: "uppercase",
  },
  picker: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: c.surface, borderRadius: 12,
    paddingHorizontal: 14, height: 38,
    minWidth: 86, borderWidth: 1,
    borderColor: c.border, gap: 6,
  },
  pickerText: { fontSize: 13, color: c.text, fontWeight: "700" },
  overlay: {
    flex: 1, backgroundColor: c.overlay,
    justifyContent: "center", alignItems: "center",
  },
  pickerModal: {
    backgroundColor: c.surfaceElevated, borderRadius: 20,
    width: SCREEN_W * 0.8, maxHeight: 480, padding: 22,
    borderWidth: 1, borderColor: c.border,
  },
  pickerTitle: { fontSize: 18, fontWeight: "800", color: c.text, marginBottom: 16, letterSpacing: -0.3 },
  pickerRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingVertical: 14,
    paddingHorizontal: 12, borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
  },
  pickerRowOn: { backgroundColor: c.goldLight, borderRadius: 10, borderBottomColor: "transparent" },
  pickerRowText: { fontSize: 16, color: c.text, fontWeight: "500" },
  pickerRowTextOn: { color: c.gold, fontWeight: "800" },

  // Content
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  loadingText: { marginTop: 14, fontSize: 14.5, color: c.textMuted, fontWeight: "600" },
  emptyMsg: { padding: 32, textAlign: "center", color: c.textMuted, fontSize: 15, fontWeight: "500" },
  scrollContent: { padding: 16, paddingBottom: 60 },
  retryBtn: {
    marginTop: 18, backgroundColor: c.gold,
    paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12,
  },
  retryBtnText: { color: c.onGold, fontWeight: "800", fontSize: 14, letterSpacing: 0.3 },
});
