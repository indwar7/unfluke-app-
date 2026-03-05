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
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedStock } from "../redux/Unfluke_slices/globalStock/reducer";
import {
  useCompany, useFinancials, getPeriodKeys, formatPeriodLabel,
  getRatioPeriodKeys, getMergedRatioData,
} from "../hooks/useFundamentalData";
import {
  ACCENT, ACCENT_LIGHT, BG, CARD_BG,
  TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, BORDER_COLOR, RED, GREEN,
  fmt,
} from "../components/fundamentals/constants";
import { ScreenWithHeader } from "../components/AppHeader";
import { BalanceSheetTab, PLStyleTab, KeyRatiosTab } from "../components/fundamentals/FinancialTabs";
import {
  ChartsTab, BulkBlockDealsTab, CorporateEventsTab,
  ShareholdingPatternsTab, DocumentsTab,
} from "../components/fundamentals/DataTabs";

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
function RatioCardInline({ label, value, yoyChange }: {
  label: string; value: any; yoyChange?: number;
}) {
  const isPositive = (yoyChange ?? 0) >= 0;
  return (
    <View style={st.rcCard}>
      <Text style={st.rcLabel} numberOfLines={1}>{label}</Text>
      <Text style={st.rcValue} numberOfLines={1}>{fmt(value)}</Text>
      {yoyChange !== undefined && !isNaN(yoyChange) && (
        <Text style={[st.rcYoy, { color: isPositive ? GREEN : RED }]} numberOfLines={1}>
          {isPositive ? "↗" : "↘"} {isPositive ? "+" : ""}{yoyChange.toFixed(1)}%
        </Text>
      )}
    </View>
  );
}

/* ═══════════════════════════════════════════════════════
   PERIOD PICKER
═══════════════════════════════════════════════════════ */
function PeriodPicker({ items, selected, onSelect }: {
  items: string[]; selected: string; onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity style={st.picker} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Text style={st.pickerText}>{selected ? formatPeriodLabel(selected) : "Year"}</Text>
        <Ionicons name="chevron-down" size={14} color={TEXT_MUTED} />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity style={st.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={st.pickerModal}>
            <Text style={st.pickerTitle}>Select Period</Text>
            <FlatList
              data={items}
              keyExtractor={i => i}
              style={{ maxHeight: 380 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[st.pickerRow, item === selected && st.pickerRowOn]}
                  onPress={() => { onSelect(item); setOpen(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[st.pickerRowText, item === selected && st.pickerRowTextOn]}>
                    {formatPeriodLabel(item)}
                  </Text>
                  {item === selected && <Ionicons name="checkmark" size={18} color={ACCENT} />}
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
  const dispatch = useDispatch();
  const scrollRef = useRef<ScrollView>(null);
  const tabScrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const abortRef = useRef<AbortController | null>(null);

  const redux = useSelector((s: any) => s.GlobalStock?.selectedStock);

  useEffect(() => {
    if (!redux?.capcode) dispatch(setSelectedStock(DEFAULT_STOCK));
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
      const CARD_KEYS = [
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
        return <Text style={st.emptyMsg}>No data. Try toggling S / C.</Text>;
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
        <View style={st.center}>
          <Ionicons name="alert-circle-outline" size={44} color={RED} />
          <Text style={st.emptyMsg}>Something went wrong.</Text>
          <TouchableOpacity style={st.retryBtn} onPress={() => refetchFin()}>
            <Text style={st.retryBtnText}>Retry</Text>
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
        <View style={st.root}>

          {/* ── Title ── */}
          <View style={st.titleBar}>
            <Text style={st.titleText}>
              Fundamental Screener{" "}
              <Text style={st.titleAccent}>({activeTab})</Text>
            </Text>
            <Text style={st.titleSub}>Get all your summary at one place</Text>
          </View>

          {/* ── Search Bar ── */}
          <View style={[st.searchOuter, { zIndex: 200 }]}>
            <View style={st.searchPill}>
              {searching
                ? <ActivityIndicator size="small" color={ACCENT} style={st.searchIcon} />
                : <Ionicons name="search" size={18} color={TEXT_MUTED} style={st.searchIcon} />}
              <TextInput
                ref={inputRef}
                style={st.searchInput}
                placeholder="Search company (e.g. Reliance, TCS…)"
                placeholderTextColor="#bbb"
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
                  <Ionicons name="close-circle" size={20} color={TEXT_MUTED} />
                </TouchableOpacity>
              )}
            </View>

            {/* Search Dropdown */}
            {showDrop && results.length > 0 && (
              <View style={st.searchDrop}>
                <FlatList
                  data={results}
                  keyExtractor={(item, i) => String(item?.["Capitaline Code"] ?? i)}
                  keyboardShouldPersistTaps="handled"
                  style={{ maxHeight: 260 }}
                  renderItem={({ item }) => {
                    const sym = [item.NSESYMBOL, item.BSESYMBOL].filter(Boolean).join(" · ");
                    return (
                      <TouchableOpacity
                        style={st.searchDropRow}
                        onPress={() => selectStock(item)}
                        activeOpacity={0.7}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={st.searchDropName} numberOfLines={1}>
                            {item?.["Company Name"] || "—"}
                          </Text>
                          {!!sym && <Text style={st.searchDropSym}>{sym}</Text>}
                        </View>
                        <Ionicons name="chevron-forward" size={15} color={TEXT_MUTED} />
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            )}
          </View>

          {/* ── Tab Bar + S/C Toggle ── */}
          <View style={st.tabBar}>
            <ScrollView
              ref={tabScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={st.tabScroll}
            >
              {SECTIONS.map(sec => (
                <TouchableOpacity
                  key={sec}
                  style={[st.tab, activeTab === sec && st.tabOn]}
                  onPress={() => switchTab(sec)}
                  activeOpacity={0.7}
                >
                  <Text style={[st.tabText, activeTab === sec && st.tabTextOn]}>{sec}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={st.scWrap}>
              {(["S", "C"] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[st.scBtn, stockType === t && st.scBtnOn]}
                  onPress={() => setStockType(t)}
                  activeOpacity={0.7}
                >
                  <Text style={[st.scText, stockType === t && st.scTextOn]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Ratio Cards Strip ── */}
          {ratioCards.length > 0 && !isLoading && (
            <View style={st.ratioStripWrap}>
              <View style={st.ratioStripContent}>
                {ratioCards.map((c, i) => (
                  <RatioCardInline
                    key={`${c.label}-${i}`}
                    label={c.label}
                    value={c.value}
                    yoyChange={c.yoyChange}
                  />
                ))}
              </View>
            </View>
          )}

          {/* ── Period Picker ── */}
          {showPeriodRow && periodKeys.length > 0 && !isLoading && (
            <View style={st.periodRow}>
              <Text style={st.periodLabel}>Period:</Text>
              <PeriodPicker items={periodKeys} selected={period} onSelect={setPeriod} />
            </View>
          )}

          {/* ── Content ── */}
          {isLoading && showPeriodRow ? (
            <View style={st.center}>
              <ActivityIndicator size="large" color={ACCENT} />
              <Text style={st.loadingText}>Loading {companyName}…</Text>
            </View>
          ) : (
            <ScrollView
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={st.scrollContent}
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

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  // Title
  titleBar: {
    backgroundColor: CARD_BG,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  titleText: { fontSize: 18, fontWeight: "700", color: TEXT_PRIMARY },
  titleAccent: { color: ACCENT, fontWeight: "700" },
  titleSub: { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },

  // Search
  searchOuter: {
    backgroundColor: CARD_BG,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  searchPill: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F4F5F7", borderRadius: 10,
    paddingHorizontal: 12, height: 46,
    borderWidth: 1, borderColor: BORDER_COLOR,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: TEXT_PRIMARY, paddingVertical: 0 },
  searchDrop: {
    position: "absolute", top: 66, left: 16, right: 16,
    backgroundColor: CARD_BG, borderRadius: 12,
    elevation: 14, shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18, shadowRadius: 14,
    borderWidth: 1, borderColor: BORDER_COLOR,
    zIndex: 999, overflow: "hidden",
  },
  searchDropRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 13, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  searchDropName: { fontSize: 14, fontWeight: "600", color: TEXT_PRIMARY },
  searchDropSym: { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },

  // Tabs
  tabBar: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: CARD_BG,
    borderBottomWidth: 1, borderBottomColor: BORDER_COLOR,
    paddingLeft: 16,
  },
  tabScroll: { paddingRight: 8 },
  tab: {
    paddingVertical: 12, paddingHorizontal: 14,
    marginRight: 2, borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabOn: { borderBottomColor: ACCENT },
  tabText: { fontSize: 13, color: TEXT_MUTED, fontWeight: "500" },
  tabTextOn: { color: ACCENT, fontWeight: "700" },
  scWrap: {
    flexDirection: "row", marginRight: 12, marginLeft: 4,
    backgroundColor: "#F4F5F7", borderRadius: 6, padding: 2,
  },
  scBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4 },
  scBtnOn: { backgroundColor: ACCENT },
  scText: { fontSize: 12, fontWeight: "600", color: TEXT_MUTED },
  scTextOn: { color: "#fff" },

  // Ratio Cards Strip
  ratioStripWrap: {
    backgroundColor: BG,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  ratioStripContent: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
  },
  rcCard: {
    backgroundColor: CARD_BG, borderRadius: 8,
    paddingVertical: 8, paddingHorizontal: 6,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3,
    elevation: 2, borderWidth: 1,
    borderColor: BORDER_COLOR, justifyContent: "center",
  },
  rcLabel: { fontSize: 8.5, color: TEXT_MUTED, fontWeight: "500", marginBottom: 4 },
  rcValue: { fontSize: 13, fontWeight: "800", color: TEXT_PRIMARY, marginBottom: 2 },
  rcYoy: { fontSize: 8, fontWeight: "600", marginTop: 2 },

  // Period Picker
  periodRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: BG, gap: 10,
  },
  periodLabel: { fontSize: 13, fontWeight: "600", color: TEXT_SECONDARY },
  picker: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F4F5F7", borderRadius: 8,
    paddingHorizontal: 12, height: 36,
    minWidth: 80, borderWidth: 1,
    borderColor: BORDER_COLOR, gap: 6,
  },
  pickerText: { fontSize: 13, color: TEXT_PRIMARY, fontWeight: "500" },
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center", alignItems: "center",
  },
  pickerModal: {
    backgroundColor: CARD_BG, borderRadius: 16,
    width: SCREEN_W * 0.8, maxHeight: 480, padding: 20,
  },
  pickerTitle: { fontSize: 18, fontWeight: "700", color: TEXT_PRIMARY, marginBottom: 14 },
  pickerRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingVertical: 14,
    paddingHorizontal: 8, borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  pickerRowOn: { backgroundColor: ACCENT_LIGHT, borderRadius: 8 },
  pickerRowText: { fontSize: 16, color: TEXT_PRIMARY },
  pickerRowTextOn: { color: ACCENT, fontWeight: "600" },

  // Content
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  loadingText: { marginTop: 12, fontSize: 15, color: TEXT_MUTED },
  emptyMsg: { padding: 32, textAlign: "center", color: TEXT_MUTED, fontSize: 15 },
  scrollContent: { padding: 16, paddingBottom: 60 },
  retryBtn: {
    marginTop: 16, backgroundColor: ACCENT,
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8,
  },
  retryBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});