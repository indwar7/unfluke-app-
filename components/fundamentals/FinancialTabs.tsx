import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import { EmptyState } from "./SharedComponents";
import { SvgLineChart } from "./DataTabs";
import {
    fmt, valueColor, ACCENT, ACCENT_LIGHT, TEXT_PRIMARY, TEXT_SECONDARY,
    TEXT_MUTED, BORDER_COLOR, ZEBRA_LIGHT, CARD_BG, GREEN, RED,
} from "./constants";
import {
    getSectionDataForPeriod,
    getHeadings,
    getPeriodKeys,
    getMergedRatioData,
    formatPeriodLabel,
    getRatioPeriodKeys,
    type RatioSection,
} from "../../hooks/useFundamentalData";

const { width: SCREEN_W } = Dimensions.get("window");
const CONTENT_W = SCREEN_W - 32;
const LABEL_W = Math.min(140, CONTENT_W * 0.38);
const DATA_COL_W = 90;
const ROW_H = 42;

/* ═══════════════════════════════════════════════════════════
   HORIZONTAL SCROLLABLE TABLE
═══════════════════════════════════════════════════════════ */
function HorizontalTable({ response, emptyMessage }: { response: any; emptyMessage?: string }) {
    const periodKeys = useMemo(() => response?.results ? getPeriodKeys(response) : [], [response]);
    const headings = useMemo(() => {
        if (!response?.results) return [];
        try { return getHeadings(response) || []; } catch { return []; }
    }, [response]);

    const rows = useMemo(() => {
        const result: { label: string; isBold: boolean; isChild: boolean }[] = [];
        if (!response?.results) return result;
        try {
            if (Array.isArray(headings) && headings.length > 0) {
                for (const heading of headings) {
                    result.push({ label: heading?.title || "", isBold: true, isChild: false });
                    if (Array.isArray(heading?.children)) {
                        for (const child of heading.children) {
                            result.push({ label: child || "", isBold: false, isChild: true });
                        }
                    }
                }
            } else {
                const firstPeriod = periodKeys[0];
                if (firstPeriod) {
                    const data = getSectionDataForPeriod(response, firstPeriod);
                    if (data && typeof data === "object") {
                        for (const key of Object.keys(data)) {
                            result.push({ label: key, isBold: false, isChild: false });
                        }
                    }
                }
            }
        } catch (e) { console.warn("HorizontalTable rows error:", e); }
        return result;
    }, [headings, periodKeys, response]);

    const allData = useMemo(() => {
        const map: Record<string, Record<string, any>> = {};
        if (!response?.results) return map;
        try {
            for (const pk of periodKeys) {
                map[pk] = getSectionDataForPeriod(response, pk) || {};
            }
        } catch (e) { console.warn("HorizontalTable data error:", e); }
        return map;
    }, [periodKeys, response]);

    if (!response?.results || periodKeys.length === 0 || rows.length === 0)
        return <EmptyState message={emptyMessage || "No data available."} />;

    return (
        <View style={tbl.container}>
            <View style={tbl.tableWrap}>
                <View style={tbl.stickyCol}>
                    <View style={tbl.stickyHeader}>
                        <Text style={tbl.headerTxt}>Particulars</Text>
                    </View>
                    {rows.map((row, i) => (
                        <View key={`s-${i}`}
                            style={[tbl.stickyCell, i % 2 === 0 && tbl.zebraOdd, row.isBold && tbl.boldRow]}>
                            <Text style={[tbl.stickyTxt, row.isBold && tbl.boldTxt, row.isChild && tbl.childTxt]}
                                numberOfLines={2}>
                                {row.isChild ? `  ${row.label}` : row.label}
                            </Text>
                        </View>
                    ))}
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={true} bounces={false}
                    contentContainerStyle={{ flexGrow: 1 }}>
                    <View>
                        <View style={tbl.dataHeaderRow}>
                            {periodKeys.map(pk => (
                                <View key={pk} style={tbl.dataHeaderCell}>
                                    <Text style={tbl.headerTxt}>{formatPeriodLabel(pk)}</Text>
                                </View>
                            ))}
                        </View>
                        {rows.map((row, i) => (
                            <View key={`d-${i}`}
                                style={[tbl.dataRow, i % 2 === 0 && tbl.zebraOdd, row.isBold && tbl.boldRow]}>
                                {periodKeys.map(pk => {
                                    const val = allData[pk]?.[row.label];
                                    return (
                                        <View key={pk} style={tbl.dataCell}>
                                            <Text style={[tbl.dataTxt, { color: valueColor(val) }, row.isBold && tbl.boldTxt]}
                                                numberOfLines={1}>
                                                {fmt(val)}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

/* ═══════════════════════════════════════════════════════════
   EXPANDABLE LIST
═══════════════════════════════════════════════════════════ */
function ExpandableList({ response, period, emptyMessage }: {
    response: any; period: string; emptyMessage?: string;
}) {
    const periodKeys = useMemo(() => response?.results ? getPeriodKeys(response) : [], [response]);
    const headings = useMemo(() => {
        if (!response?.results) return [];
        try { return getHeadings(response) || []; } catch { return []; }
    }, [response]);

    const selectedYear = (period && periodKeys.includes(period)) ? period : (periodKeys[0] || "");
    const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

    const toggleSection = (title: string) =>
        setExpandedMap(prev => ({ ...prev, [title]: !prev[title] }));

    const allData = useMemo(() => {
        const map: Record<string, Record<string, any>> = {};
        if (!response?.results) return map;
        try {
            for (const pk of periodKeys) map[pk] = getSectionDataForPeriod(response, pk) || {};
        } catch { }
        return map;
    }, [periodKeys, response]);

    const getValue = (label: string) => {
        const val = (allData[selectedYear] || {})[label];
        return val !== undefined && val !== null ? fmt(val) : "-";
    };

    if (!response?.results || periodKeys.length === 0 || headings.length === 0)
        return <EmptyState message={emptyMessage || "No data available."} />;

    return (
        <View>
            {headings.map((item: any, index: number) => {
                const hasChildren = Array.isArray(item?.children) && item.children.length > 0;
                const isOpen = !!expandedMap[item?.title];
                return (
                    <View key={index} style={el.rowWrap}>
                        <TouchableOpacity
                            style={el.rowHeader}
                            onPress={() => hasChildren && toggleSection(item.title)}
                            activeOpacity={hasChildren ? 0.7 : 1}
                        >
                            <View style={el.rowLeft}>
                                <Text style={el.plusIcon}>+</Text>
                                <Text style={el.rowTitle} numberOfLines={2}>{item?.title}</Text>
                            </View>
                            <View style={el.rowRight}>
                                <Text style={el.rowValue}>{getValue(item?.title)}</Text>
                                {hasChildren && (
                                    <Text style={[el.chevron, isOpen && el.chevronOpen]}>›</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                        {isOpen && hasChildren && (
                            <View style={el.childrenWrap}>
                                {item.children.map((child: string, ci: number) => (
                                    <View key={ci} style={el.childRow}>
                                        <Text style={el.childLabel} numberOfLines={2}>{child}</Text>
                                        <Text style={el.childValue}>{getValue(child)}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    );
}

export function BalanceSheetTab({ response, period }: { response: any; period: string }) {
    return <ExpandableList response={response} period={period} emptyMessage="No balance sheet data available." />;
}
export function PLStyleTab({ response, period, emptyMessage }: { response: any; period: string; emptyMessage?: string }) {
    return <ExpandableList response={response} period={period} emptyMessage={emptyMessage || "No data available."} />;
}

/* ═══════════════════════════════════════════════════════════
   KEY RATIOS TAB
   ✅ Fix 1: Charts stacked VERTICALLY — all 3 always visible
   ✅ Fix 2: ROE key found via PARTIAL MATCH — works regardless
              of exact API key name ("ROE", "Return on Equity", etc.)
═══════════════════════════════════════════════════════════ */

// Partial match keywords — finds the right key from actual API data
const RATIO_CHART_CONFIGS = [
    {
        label: "ROCE (%)",
        // Matches: "ROCE (%)", "ROCE", "Return on Capital Employed", etc.
        matchKeywords: ["roce"],
        color: "#1A1A2E",
    },
    {
        label: "ROE (%)",
        // Matches: "ROE(%)", "ROE", "Return on Equity", "Return on Equity / Networth", etc.
        matchKeywords: ["roe", "return on equity", "return on networth"],
        color: "#1A1A2E",
    },
    {
        label: "PBIDT/Sales (%)",
        // Matches: "PBIDTM (%)", "PBIDT/Sales(%)", "PBIDT", etc.
        matchKeywords: ["pbidt", "pbidtm"],
        color: "#1A1A2E",
    },
] as const;

/**
 * Given a flat object of ratio data keys, find the best matching key
 * for a given set of lowercase search keywords (partial match).
 */
function findRatioKey(dataKeys: string[], matchKeywords: readonly string[]): string | null {
    const lower = dataKeys.map(k => ({ original: k, lower: k.toLowerCase() }));
    for (const keyword of matchKeywords) {
        const found = lower.find(k => k.lower.includes(keyword));
        if (found) return found.original;
    }
    return null;
}

export function KeyRatiosTab({ ratios, period, banking }: { ratios: Record<string, any> | undefined; period: string; banking?: any }) {
    const allPeriods = useMemo(() => {
        if (!ratios) return [];
        try { return getRatioPeriodKeys(ratios) || []; } catch { return []; }
    }, [ratios]);

    const activePeriod = (period && allPeriods.includes(period)) ? period : (allPeriods[0] || "");

    // Build a flat list of ALL keys across all periods for chart partial matching
    const allRatioKeys = useMemo(() => {
        const keySet = new Set<string>();
        for (const pk of allPeriods) {
            try {
                const d = getMergedRatioData(ratios, pk) || {};
                Object.keys(d).forEach(k => keySet.add(k));
            } catch { }
        }
        return Array.from(keySet);
    }, [ratios, allPeriods]);

    const resolvedKeys = useMemo(() => {
        const map: Record<string, string | null> = {};
        for (const config of RATIO_CHART_CONFIGS) {
            map[config.label] = findRatioKey(allRatioKeys, config.matchKeywords);
        }
        return map;
    }, [allRatioKeys]);

    // Build chart series
    const chartDataSets = useMemo(() => {
        const sets: Record<string, { x: string; y: number }[]> = {};
        for (const config of RATIO_CHART_CONFIGS) {
            const resolvedKey = resolvedKeys[config.label];
            const pts: { x: string; y: number }[] = [];
            if (resolvedKey) {
                for (const pk of [...allPeriods].reverse()) {
                    try {
                        const d = getMergedRatioData(ratios, pk) || {};
                        const v = d?.[resolvedKey];
                        if (typeof v === "number" && Number.isFinite(v))
                            pts.push({ x: pk.replace("Annual", "").trim(), y: v });
                    } catch { }
                }
            }
            sets[config.label] = pts;
        }
        return sets;
    }, [ratios, allPeriods, resolvedKeys]);

    // Data for selected period
    const data = useMemo(() => {
        try { return getMergedRatioData(ratios, activePeriod) || {}; } catch { return {}; }
    }, [ratios, activePeriod]);

    const bankingData = useMemo(() => {
        if (!banking?.results || !activePeriod) return {};
        try {
            // Banking API uses year keys like "2024", ratio periods are like "202403"
            // Try exact match first, then try year-only match
            if (banking.results[activePeriod]) {
                const pd = banking.results[activePeriod];
                if (Array.isArray(pd)) {
                    const out: Record<string, any> = {};
                    for (const obj of pd) { if (obj && typeof obj === "object") Object.assign(out, obj); }
                    return out;
                }
                return typeof pd === "object" ? { ...pd } : {};
            }
            // Try matching by year portion (e.g. "202403" → "2024")
            const yearStr = activePeriod.slice(0, 4);
            if (banking.results[yearStr]) {
                const pd = banking.results[yearStr];
                if (Array.isArray(pd)) {
                    const out: Record<string, any> = {};
                    for (const obj of pd) { if (obj && typeof obj === "object") Object.assign(out, obj); }
                    return out;
                }
                return typeof pd === "object" ? { ...pd } : {};
            }
        } catch { }
        return {};
    }, [banking, activePeriod]);

    // Exact ratio names matching the website
    const PROFITABILITY_KEYS = [
        "ROCE (%)", "RONW (%)", "Payout (%)", "PBIDT/Sales(%)",
        "PBDIT/Net Assets", "PAT/PBIDT(%)", "ROE(%)",
        "Return on Assets (ROA)", "Earning Power",
    ];

    // Exact valuation ratio names matching the website
    const VALUATION_KEYS = [
        "Price Earning (P/E)", "Price to Book Value ( P/BV)", "Price/Cash EPS (P/CEPS)",
        "EV/EBIDTA", "Market Cap/Sales", "Price to Free Cash Flows to Equity",
        "Price to Free Cash Flows to the Firm", "Dividend Yield", "Graham Number",
        "Industry PE", "Industry PBV",
    ];

    // Banking section titles matching the website (array index → section title)
    const BANKING_SECTION_TITLES = [
        "Regulatory & Capital Adequacy Overview",
        "Loan Book & Advance Distribution",
        "Asset Quality (NPAs)",
        "Profitability & Margin Performance",
        "Risk & Liquidity Ratios",
    ];

    // Hardcoded keys for sections 4 & 5 to match website exactly
    const PROFITABILITY_MARGIN_KEYS = [
        "Net Interest Income", "Net Interest Margin (%)",
        "Return on Assets (%)", "Return on Equity (ROE) (%)",
    ];
    const RISK_LIQUIDITY_KEYS = [
        "CASA Ratio (%)", "Debt Equity Ratio",
        "Debt Service Coverage Ratio", "Interest Service Coverage Ratio",
        "Provision Coverage Ratio (%)",
    ];

    // Extract banking data as array of sections (preserving per-section grouping)
    const bankingSectionsArray = useMemo(() => {
        if (!banking?.results || !activePeriod) return [];
        try {
            const yearStr = activePeriod.slice(0, 4);
            const pd = banking.results[activePeriod] || banking.results[yearStr];
            if (!Array.isArray(pd)) return [];
            return pd.map((obj: any, idx: number) => {
                const title = BANKING_SECTION_TITLES[idx] || `Banking Section ${idx + 1}`;
                // For sections 4 & 5, use hardcoded keys matching the website
                if (idx === 3) return { title, items: PROFITABILITY_MARGIN_KEYS };
                if (idx === 4) return { title, items: RISK_LIQUIDITY_KEYS };
                // For sections 1-3, use dynamic keys from API
                return {
                    title,
                    items: obj && typeof obj === "object" ? Object.keys(obj) : [],
                };
            }).filter((s: any) => s.items.length > 0);
        } catch { return []; }
    }, [banking, activePeriod]);

    const ratioGroups = useMemo(() => {
        const allData = data || {};
        const profitItems = PROFITABILITY_KEYS.filter(k => allData[k] !== undefined);
        const valuationItems = VALUATION_KEYS.filter(k => allData[k] !== undefined);

        const result: { title: string; items: string[] }[] = [];
        if (profitItems.length > 0) result.push({ title: "Profitability Ratios", items: profitItems });
        if (valuationItems.length > 0) result.push({ title: "Valuation Ratios", items: valuationItems });

        // Add banking sections for bank companies
        for (const sec of bankingSectionsArray) {
            result.push({ title: sec.title, items: sec.items });
        }

        return result;
    }, [data, bankingSectionsArray]);

    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    const toggleGroup = (title: string) =>
        setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));

    const getVal = (label: string) => {
        const val = data?.[label] ?? bankingData?.[label];
        return val !== undefined && val !== null ? fmt(val) : "—";
    };

    if (!ratios || allPeriods.length === 0)
        return <EmptyState message="No ratio data available." />;

    if (ratioGroups.length === 0)
        return <EmptyState message="No ratio data for this period." />;

    return (
        <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>

            {/* Charts — UNTOUCHED */}
            <Text style={kr.chartsTitle}>Key Ratios</Text>
            <View style={kr.chartsContainer}>
                {RATIO_CHART_CONFIGS.map(config => {
                    const pts = chartDataSets[config.label] || [];
                    const hasData = pts.length >= 2;
                    const latest = hasData ? (pts[pts.length - 1]?.y ?? 0) : 0;
                    const prev   = hasData ? (pts[pts.length - 2]?.y ?? latest) : 0;
                    const chg    = prev !== 0 ? ((latest - prev) / Math.abs(prev)) * 100 : 0;
                    const up     = chg >= 0;

                    return (
                        <View key={config.label} style={kr.chartCard}>
                            <View style={kr.chartHeader}>
                                <Text style={kr.chartLabel}>{config.label}</Text>
                                {hasData && (
                                    <View style={kr.chartMeta}>
                                        <Text style={[kr.chartVal, { color: up ? GREEN : RED }]}>
                                            {latest.toFixed(2)}
                                        </Text>
                                        <View style={[kr.chgBadge, { backgroundColor: up ? "#DCFCE7" : "#FEE2E2" }]}>
                                            <Text style={[kr.chgText, { color: up ? GREEN : RED }]}>
                                                {up ? "▲" : "▼"} {Math.abs(chg).toFixed(1)}%
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                            {hasData ? (
                                <SvgLineChart
                                    data={pts}
                                    color={up ? GREEN : RED}
                                    areaColor={up ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)"}
                                    height={160}
                                />
                            ) : (
                                <View style={kr.noDataBox}>
                                    <Text style={kr.noDataText}>No data available</Text>
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>

            {/* Selected period badge */}
            <View style={kr.periodBadgeRow}>
                <Text style={kr.periodBadgeLabel}>Showing data for</Text>
                <View style={kr.periodBadge}>
                    <Text style={kr.periodBadgeTxt}>{formatPeriodLabel(activePeriod)}</Text>
                </View>
            </View>

            {/* Ratio groups — flat list under each, like website */}
            {ratioGroups.map((group, gIdx) => {
                const isOpen = !!expandedGroups[group.title];
                return (
                    <View key={gIdx} style={kr.collapseGroupWrap}>
                        <TouchableOpacity
                            style={kr.collapseGroupHeader}
                            onPress={() => toggleGroup(group.title)}
                            activeOpacity={0.7}
                        >
                            <View style={kr.collapseGroupLeft}>
                                <View style={kr.sectionAccent} />
                                <Text style={kr.collapseGroupTitle}>{group.title}</Text>
                            </View>
                            <Text style={[kr.collapseChevron, isOpen && kr.collapseChevronOpen]}>›</Text>
                        </TouchableOpacity>

                        {isOpen && (
                            <View style={kr.collapseGroupBody}>
                                {group.items.map((item, i) => (
                                    <View key={i} style={[kr.ratioRow, i % 2 === 0 && kr.ratioRowAlt]}>
                                        <Text style={kr.ratioLabel} numberOfLines={2}>{item}</Text>
                                        <Text style={[kr.ratioValue, { color: valueColor(data?.[item] ?? bankingData?.[item]) }]}>
                                            {getVal(item)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                );
            })}
        </ScrollView>
    );
}

/* ═══════════════════════════════════════════════════════════
   TABLE STYLES
═══════════════════════════════════════════════════════════ */
const tbl = StyleSheet.create({
    container: {
        borderRadius: 12, overflow: "hidden",
        borderWidth: 1, borderColor: BORDER_COLOR, backgroundColor: CARD_BG,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
    },
    tableWrap: { flexDirection: "row" },
    stickyCol: { width: LABEL_W, borderRightWidth: 1, borderRightColor: BORDER_COLOR, zIndex: 10, backgroundColor: CARD_BG },
    stickyHeader: { width: LABEL_W, height: ROW_H, justifyContent: "center", paddingHorizontal: 10, backgroundColor: ACCENT },
    stickyCell: { width: LABEL_W, height: ROW_H, justifyContent: "center", paddingHorizontal: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E2E8F0" },
    stickyTxt: { fontSize: 11, color: TEXT_SECONDARY, lineHeight: 15 },
    dataHeaderRow: { flexDirection: "row" },
    dataHeaderCell: { width: DATA_COL_W, height: ROW_H, justifyContent: "center", alignItems: "center", backgroundColor: ACCENT },
    headerTxt: { fontSize: 11, fontWeight: "700", color: "#fff", textAlign: "center" },
    dataRow: { flexDirection: "row" },
    dataCell: { width: DATA_COL_W, height: ROW_H, justifyContent: "center", alignItems: "flex-end", paddingHorizontal: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E2E8F0" },
    dataTxt: { fontSize: 11, fontWeight: "500", textAlign: "right" },
    zebraOdd: { backgroundColor: ZEBRA_LIGHT },
    boldRow: { backgroundColor: ACCENT_LIGHT },
    boldTxt: { fontWeight: "700", color: TEXT_PRIMARY, fontSize: 11 },
    childTxt: { color: TEXT_MUTED, fontSize: 10, paddingLeft: 6 },
});

const el = StyleSheet.create({
    rowWrap: { marginBottom: 8 },
    rowHeader: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingVertical: 12, paddingHorizontal: 12,
        backgroundColor: CARD_BG, borderRadius: 8, borderWidth: 1, borderColor: BORDER_COLOR,
    },
    rowLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
    plusIcon: { fontSize: 16, fontWeight: "bold", color: ACCENT, marginRight: 8, width: 16 },
    rowTitle: { fontSize: 13, fontWeight: "600", color: TEXT_PRIMARY, flex: 1 },
    rowRight: { flexDirection: "row", alignItems: "center" },
    rowValue: { fontSize: 13, fontWeight: "700", color: TEXT_PRIMARY, marginRight: 8 },
    chevron: { fontSize: 18, color: TEXT_MUTED, transform: [{ rotate: "90deg" }], marginLeft: 8 },
    chevronOpen: { transform: [{ rotate: "-90deg" }] },
    childrenWrap: {
        backgroundColor: "#F8FAFC", borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
        borderWidth: 1, borderColor: BORDER_COLOR, borderTopWidth: 0, marginTop: -4, paddingTop: 8, paddingBottom: 8,
    },
    childRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, paddingHorizontal: 16, paddingLeft: 36 },
    childLabel: { fontSize: 12, color: TEXT_SECONDARY, flex: 1 },
    childValue: { fontSize: 12, fontWeight: "500", color: TEXT_PRIMARY },
});

/* ═══════════════════════════════════════════════════════════
   KEY RATIOS STYLES
═══════════════════════════════════════════════════════════ */
const kr = StyleSheet.create({
    // Charts
    chartsTitle: { fontSize: 16, fontWeight: "700", color: TEXT_PRIMARY, marginBottom: 12 },
    chartsContainer: { gap: 14, marginBottom: 20 },
    chartCard: {
        backgroundColor: CARD_BG, borderRadius: 12, overflow: "hidden",
        borderWidth: 1, borderColor: BORDER_COLOR,
        elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 3, padding: 16,
    },
    chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    chartLabel: { fontSize: 15, fontWeight: "700", color: TEXT_PRIMARY },
    chartMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
    chartVal: { fontSize: 18, fontWeight: "800" },
    chgBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    chgText: { fontSize: 11, fontWeight: "700" },
    noDataBox: { height: 80, justifyContent: "center", alignItems: "center" },
    noDataText: { fontSize: 13, color: TEXT_MUTED },
    // Period badge
    periodBadgeRow: {
        flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 8,
    },
    periodBadgeLabel: { fontSize: 12, color: TEXT_MUTED },
    periodBadge: {
        backgroundColor: ACCENT, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
    },
    periodBadgeTxt: { fontSize: 12, fontWeight: "700", color: "#FFFFFF" },
    sectionAccent: {
        width: 4, height: 18, borderRadius: 2,
        backgroundColor: ACCENT, marginRight: 10,
    },
    // Collapsible group boxes
    collapseGroupWrap: {
        marginBottom: 14,
        borderRadius: 10, overflow: "hidden",
        borderWidth: 1, borderColor: BORDER_COLOR,
        backgroundColor: CARD_BG,
        elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04, shadowRadius: 2,
    },
    collapseGroupHeader: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        backgroundColor: "#F1F5F9", paddingVertical: 14, paddingHorizontal: 14,
    },
    collapseGroupLeft: {
        flexDirection: "row", alignItems: "center", flex: 1,
    },
    collapseGroupTitle: {
        fontSize: 15, fontWeight: "700", color: "#0F172A",
    },
    collapseChevron: {
        fontSize: 22, color: TEXT_MUTED, fontWeight: "600",
        transform: [{ rotate: "0deg" }],
    },
    collapseChevronOpen: {
        transform: [{ rotate: "90deg" }],
    },
    collapseGroupBody: {
        paddingVertical: 4,
    },
    ratioRow: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingVertical: 11, paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#F1F5F9",
    },
    ratioRowAlt: { backgroundColor: "#F8FAFC" },
    ratioLabel: { flex: 1, fontSize: 13, color: TEXT_SECONDARY, fontWeight: "500", paddingRight: 8 },
    ratioValue: { fontSize: 13, fontWeight: "700", textAlign: "right" },
});