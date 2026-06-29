// Unfluke Pro — Dashboard Fundamentals snapshot card.
// Search any stock → see a real key-ratio snapshot (P/E, ROE, etc.) from the
// live fundamentals API, then tap "Full analysis" to open the Fundamentals
// screen (same redux selectedStock, so it stays in sync). No fake data.

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
import { useDispatch, useSelector } from "react-redux";
import { Search, ArrowUpRight, X } from "lucide-react-native";
import { useCompany, useFinancials, getPeriodKeys } from "@/hooks/useFundamentalData";
import { setSelectedStock } from "@/redux/Unfluke_slices/globalStock/reducer";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

const SEARCH_URL = "https://api.unfluke.in/api/historicData/search?searchQuery=";
const DEFAULT_STOCK = { symbol: "RELIANCE", name: "Reliance Industries Ltd", capcode: 476 };

type SearchResult = {
  NSESYMBOL?: string;
  "Company Name"?: string;
  "Capitaline Code"?: number | string;
};

const FundamentalsCard: React.FC = () => {
  const { colors: c } = useTheme();
  const s = makeStyles(c);
  const dispatch = useDispatch();

  const redux = useSelector((st: any) => st.GlobalStock?.selectedStock);
  const stock = redux?.capcode ? redux : DEFAULT_STOCK;
  const capcode = String(stock.capcode);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDrop, setShowDrop] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounce = useRef<any>(null);

  const { data: company } = useCompany(capcode);
  const { data: financials, isLoading } = useFinancials(capcode, "C");

  const companyName =
    company?.results?.[0]?.["Company Name"] || stock.name || stock.symbol;

  // Pull a few headline ratios from the live financials.
  const snapshot = useMemo(() => {
    try {
      const kf = financials?.ratios?.KeyFinancial;
      const val1 = financials?.ratios?.Valuation1;
      const pick = (res: any, key: string) => {
        if (!res) return null;
        const periods = getPeriodKeys(res);
        const latest = periods[0];
        const rows = res?.results?.[latest] || res?.results || [];
        if (Array.isArray(rows)) {
          const row = rows.find((r: any) =>
            (r?.label || r?.name || r?.rowLabel || "").toString().includes(key)
          );
          if (row) {
            const v = row[latest] ?? row.value;
            if (v != null && !isNaN(Number(v))) return Number(v);
          }
        }
        return null;
      };
      const items = [
        { label: "P/E", value: pick(val1, "P/E") ?? pick(val1, "Price/Earnings") },
        { label: "ROE %", value: pick(kf, "ROE") },
        { label: "EPS", value: pick(kf, "EPS") },
        { label: "Debt/Eq", value: pick(kf, "Debt-Equity") ?? pick(kf, "Debt/Equity") },
      ];
      return items;
    } catch {
      return [];
    }
  }, [financials]);

  const runSearch = useCallback((text: string) => {
    setQuery(text);
    if (debounce.current) clearTimeout(debounce.current);
    if (!text.trim()) {
      setResults([]);
      setShowDrop(false);
      return;
    }
    debounce.current = setTimeout(async () => {
      try {
        setSearching(true);
        const r = await fetch(SEARCH_URL + encodeURIComponent(text.trim()));
        const data = await r.json();
        const list: SearchResult[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [];
        setResults(list.slice(0, 8));
        setShowDrop(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, []);

  const selectStock = useCallback(
    (item: SearchResult) => {
      dispatch(
        setSelectedStock({
          symbol: item?.NSESYMBOL || "",
          name: item?.["Company Name"] || "",
          capcode: item?.["Capitaline Code"],
        })
      );
      setQuery("");
      setShowDrop(false);
      setResults([]);
      Keyboard.dismiss();
    },
    [dispatch]
  );

  const openFull = () => router.push("/fundamental" as any);

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.label}>FUNDAMENTALS</Text>
          <Text style={s.company} numberOfLines={1}>{companyName}</Text>
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
          placeholder="Search any stock…"
          placeholderTextColor={c.textMuted}
          value={query}
          onChangeText={runSearch}
          returnKeyType="search"
        />
        {searching ? (
          <ActivityIndicator size="small" color={c.gold} />
        ) : query.length > 0 ? (
          <TouchableOpacity onPress={() => { setQuery(""); setResults([]); setShowDrop(false); }}>
            <X size={16} color={c.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Search dropdown */}
      {showDrop && results.length > 0 && (
        <View style={s.drop}>
          <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 220 }}>
            {results.map((item, i) => (
              <TouchableOpacity
                key={`${item["Capitaline Code"]}-${i}`}
                style={[s.dropItem, i < results.length - 1 && s.dropDivider]}
                onPress={() => selectStock(item)}
                activeOpacity={0.7}
              >
                <Text style={s.dropSymbol}>{item?.NSESYMBOL || "—"}</Text>
                <Text style={s.dropName} numberOfLines={1}>{item?.["Company Name"]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Snapshot ratios */}
      {isLoading ? (
        <ActivityIndicator color={c.gold} style={{ marginVertical: 22 }} />
      ) : (
        <View style={s.statsRow}>
          {snapshot.map((st, i) => (
            <View key={st.label} style={[s.stat, i < snapshot.length - 1 && s.statDivider]}>
              <Text style={s.statValue}>
                {st.value != null ? Number(st.value).toFixed(st.label === "EPS" || st.label === "P/E" ? 1 : 2) : "—"}
              </Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Quick links to P&L / Balance Sheet / Charts */}
      <View style={s.linksRow}>
        {["Balance Sheet", "P&L", "Charts"].map((l) => (
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
    label: { fontSize: 10.5, fontWeight: "800", letterSpacing: 1.4, color: c.textMuted },
    company: { fontSize: 16, fontWeight: "800", color: c.text, letterSpacing: -0.3, marginTop: 3, maxWidth: 200 },
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
    stat: { flex: 1, alignItems: "center" },
    statDivider: { borderRightWidth: 1, borderRightColor: c.borderLight },
    statValue: { fontSize: 18, fontWeight: "800", color: c.text, fontVariant: ["tabular-nums"] },
    statLabel: { fontSize: 10, fontWeight: "700", color: c.textMuted, letterSpacing: 0.8, marginTop: 4 },

    linksRow: { flexDirection: "row", gap: 8, marginTop: 16 },
    linkChip: { flex: 1, backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingVertical: 10, alignItems: "center" },
    linkChipText: { fontSize: 12, fontWeight: "700", color: c.textSecondary },
  });

export default FundamentalsCard;
