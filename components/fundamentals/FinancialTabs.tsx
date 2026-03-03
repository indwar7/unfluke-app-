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
    getMergedRatioHeadings,
    formatPeriodLabel,
    getRatioPeriodKeys,
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
    if (!response?.results) return <EmptyState message={emptyMessage || "No data available."} />;

    const periodKeys = useMemo(() => getPeriodKeys(response), [response]);
    const headings = useMemo(() => {
        try { return getHeadings(response) || []; } catch { return []; }
    }, [response]);

    const rows = useMemo(() => {
        const result: { label: string; isBold: boolean; isChild: boolean }[] = [];
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
        try {
            for (const pk of periodKeys) {
                map[pk] = getSectionDataForPeriod(response, pk) || {};
            }
        } catch (e) { console.warn("HorizontalTable data error:", e); }
        return map;
    }, [periodKeys, response]);

    if (periodKeys.length === 0 || rows.length === 0)
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
    if (!response?.results) return <EmptyState message={emptyMessage || "No data available."} />;

    const periodKeys = useMemo(() => getPeriodKeys(response), [response]);
    const headings = useMemo(() => {
        try { return getHeadings(response) || []; } catch { return []; }
    }, [response]);

    const selectedYear = (period && periodKeys.includes(period)) ? period : (periodKeys[0] || "");
    const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

    const toggleSection = (title: string) =>
        setExpandedMap(prev => ({ ...prev, [title]: !prev[title] }));

    const allData = useMemo(() => {
        const map: Record<string, Record<string, any>> = {};
        try {
            for (const pk of periodKeys) map[pk] = getSectionDataForPeriod(response, pk) || {};
        } catch { }
        return map;
    }, [periodKeys, response]);

    const getValue = (label: string) => {
        const val = (allData[selectedYear] || {})[label];
        return val !== undefined && val !== null ? fmt(val) : "-";
    };

    if (periodKeys.length === 0 || headings.length === 0)
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
        color: "#6366F1",
    },
    {
        label: "ROE (%)",
        // Matches: "ROE(%)", "ROE", "Return on Equity", "Return on Equity / Networth", etc.
        matchKeywords: ["roe", "return on equity", "return on networth"],
        color: "#6366F1",
    },
    {
        label: "PBIDT/Sales (%)",
        // Matches: "PBIDTM (%)", "PBIDT/Sales(%)", "PBIDT", etc.
        matchKeywords: ["pbidt", "pbidtm"],
        color: "#6366F1",
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

export function KeyRatiosTab({ ratios, period }: { ratios: Record<string, any> | undefined; period: string }) {
    const allPeriods = useMemo(() => {
        try { return getRatioPeriodKeys(ratios) || []; } catch { return []; }
    }, [ratios]);

    const activePeriod = (period && allPeriods.includes(period)) ? period : (allPeriods[0] || "");
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    if (!ratios || allPeriods.length === 0) return <EmptyState message="No ratio data available." />;

    const data = useMemo(() => {
        try { return getMergedRatioData(ratios, activePeriod) || {}; } catch { return {}; }
    }, [ratios, activePeriod]);

    const headings = useMemo(() => {
        try { return getMergedRatioHeadings(ratios) || []; } catch { return []; }
    }, [ratios]);

    const prevPeriod = useMemo(() => {
        const idx = allPeriods.indexOf(activePeriod);
        return idx >= 0 && idx < allPeriods.length - 1 ? allPeriods[idx + 1] : null;
    }, [allPeriods, activePeriod]);

    const prevData = useMemo(() => {
        if (!prevPeriod) return {};
        try { return getMergedRatioData(ratios, prevPeriod) || {}; } catch { return {}; }
    }, [ratios, prevPeriod]);

    // ✅ Build a flat list of ALL keys present in ratio data (from any period)
    //    so we can do partial matching even if some periods are missing keys
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

    // ✅ Resolve actual API key for each chart metric via partial match
    const resolvedKeys = useMemo(() => {
        const map: Record<string, string | null> = {};
        for (const config of RATIO_CHART_CONFIGS) {
            map[config.label] = findRatioKey(allRatioKeys, config.matchKeywords);
        }
        return map;
    }, [allRatioKeys]);

    // Build chart series using resolved keys
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

    const sections = useMemo(() => {
        const result: { title: string; items: { label: string; value: any; yoyChange?: number }[] }[] = [];
        try {
            if (Array.isArray(headings) && headings.length > 0) {
                for (const heading of headings) {
                    if (!Array.isArray(heading?.children) || heading.children.length === 0) continue;
                    const items = heading.children.map((child: string) => {
                        const currentVal = data?.[child];
                        const prevVal = prevData?.[child];
                        let yoyChange: number | undefined;
                        if (typeof currentVal === "number" && typeof prevVal === "number" && prevVal !== 0)
                            yoyChange = ((currentVal - prevVal) / Math.abs(prevVal)) * 100;
                        return { label: child, value: currentVal, yoyChange };
                    });
                    result.push({ title: heading.title, items });
                }
            }
            if (result.length === 0 && data && typeof data === "object") {
                const items = Object.entries(data).map(([k, v]) => {
                    const prevVal = prevData?.[k];
                    let yoyChange: number | undefined;
                    if (typeof v === "number" && typeof prevVal === "number" && prevVal !== 0)
                        yoyChange = ((v - prevVal) / Math.abs(prevVal)) * 100;
                    return { label: k, value: v, yoyChange };
                });
                if (items.length > 0) result.push({ title: "All Ratios", items });
            }
        } catch (e) { console.warn("KeyRatiosTab sections error:", e); }
        return result;
    }, [headings, data, prevData]);

    const toggleSection = (title: string) =>
        setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));

    if (sections.length === 0) return <EmptyState message="No ratio data for this period." />;

    return (
        <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>

            {/* ✅ 3 charts — vertical stack, full width, partial key matching */}
            <Text style={kr.chartsTitle}>Key Ratios</Text>
            <View style={kr.chartsContainer}>
                {RATIO_CHART_CONFIGS.map(config => {
                    const pts = chartDataSets[config.label] || [];
                    // ✅ Show placeholder card even if pts < 2 so user knows chart exists
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
                                    {/* Debug: show resolved key so you can verify */}
                                    {__DEV__ && (
                                        <Text style={kr.debugText}>
                                            Looking for: {config.matchKeywords.join(", ")}{"\n"}
                                            Resolved: {resolvedKeys[config.label] ?? "NOT FOUND"}{"\n"}
                                            Available keys (first 5): {allRatioKeys.slice(0, 5).join(", ")}
                                        </Text>
                                    )}
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>

            {/* Accordion Sections */}
            {sections.map((section, sIdx) => {
                const isOpen = !!expandedSections[section.title];
                const summaryVal = section.items[0]?.value;
                return (
                    <View key={sIdx} style={kr.sectionWrap}>
                        <TouchableOpacity
                            style={kr.sectionHeader}
                            onPress={() => toggleSection(section.title)}
                            activeOpacity={0.7}
                        >
                            <View style={kr.sectionLeft}>
                                <Text style={kr.plusIcon}>{isOpen ? "−" : "+"}</Text>
                                <Text style={kr.sectionTitle} numberOfLines={2}>{section.title}</Text>
                            </View>
                            <View style={kr.sectionRight}>
                                {summaryVal != null && (
                                    <Text style={[kr.sectionValue, { color: valueColor(summaryVal) }]}>
                                        {fmt(summaryVal)}
                                    </Text>
                                )}
                                <Text style={[kr.chevron, isOpen && kr.chevronOpen]}>›</Text>
                            </View>
                        </TouchableOpacity>
                        {isOpen && (
                            <View style={kr.childrenWrap}>
                                {section.items.map((item, i) => {
                                    const positive = (item.yoyChange ?? 0) >= 0;
                                    return (
                                        <View key={i} style={kr.childRow}>
                                            <Text style={kr.childLabel} numberOfLines={2}>{item.label}</Text>
                                            <View style={kr.childRight}>
                                                <Text style={[kr.childValue, { color: valueColor(item.value) }]}>
                                                    {fmt(item.value)}
                                                </Text>
                                                {item.yoyChange !== undefined && !isNaN(item.yoyChange) && (
                                                    <Text style={[kr.childYoy, { color: positive ? GREEN : RED }]}>
                                                        {positive ? "↑" : "↓"}{Math.abs(item.yoyChange).toFixed(1)}%
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                    );
                                })}
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
    stickyCell: { width: LABEL_W, height: ROW_H, justifyContent: "center", paddingHorizontal: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E8E9EB" },
    stickyTxt: { fontSize: 11, color: TEXT_SECONDARY, lineHeight: 15 },
    dataHeaderRow: { flexDirection: "row" },
    dataHeaderCell: { width: DATA_COL_W, height: ROW_H, justifyContent: "center", alignItems: "center", backgroundColor: ACCENT },
    headerTxt: { fontSize: 11, fontWeight: "700", color: "#fff", textAlign: "center" },
    dataRow: { flexDirection: "row" },
    dataCell: { width: DATA_COL_W, height: ROW_H, justifyContent: "center", alignItems: "flex-end", paddingHorizontal: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E8E9EB" },
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
        backgroundColor: "#FAFAFA", borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
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
    chartsTitle: { fontSize: 16, fontWeight: "700", color: TEXT_PRIMARY, marginBottom: 12 },
    // ✅ Vertical stack — no horizontal scroll, all 3 always visible
    chartsContainer: { gap: 14, marginBottom: 20 },
    chartCard: {
        backgroundColor: CARD_BG, borderRadius: 12, overflow: "hidden",
        borderWidth: 1, borderColor: BORDER_COLOR,
        elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 3, padding: 16,
        // ✅ No width set — stretches full screen width
    },
    chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    chartLabel: { fontSize: 15, fontWeight: "700", color: TEXT_PRIMARY },
    chartMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
    chartVal: { fontSize: 18, fontWeight: "800" },
    chgBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    chgText: { fontSize: 11, fontWeight: "700" },
    noDataBox: { height: 80, justifyContent: "center", alignItems: "center" },
    noDataText: { fontSize: 13, color: TEXT_MUTED },
    debugText: { fontSize: 9, color: TEXT_MUTED, marginTop: 6, textAlign: "center", lineHeight: 14 },
    // Accordion
    sectionWrap: { marginBottom: 8 },
    sectionHeader: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingVertical: 12, paddingHorizontal: 12,
        backgroundColor: CARD_BG, borderRadius: 8, borderWidth: 1, borderColor: BORDER_COLOR,
    },
    sectionLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
    plusIcon: { fontSize: 16, fontWeight: "bold" as const, color: ACCENT, marginRight: 8, width: 16 },
    sectionTitle: { fontSize: 13, fontWeight: "600", color: TEXT_PRIMARY, flex: 1 },
    sectionRight: { flexDirection: "row", alignItems: "center" },
    sectionValue: { fontSize: 13, fontWeight: "700", color: TEXT_PRIMARY, marginRight: 8 },
    chevron: { fontSize: 18, color: TEXT_MUTED, transform: [{ rotate: "90deg" }], marginLeft: 8 },
    chevronOpen: { transform: [{ rotate: "-90deg" }] },
    childrenWrap: {
        backgroundColor: "#FAFAFA", borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
        borderWidth: 1, borderColor: BORDER_COLOR, borderTopWidth: 0,
        marginTop: -4, paddingTop: 8, paddingBottom: 8,
    },
    childRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, paddingHorizontal: 16, paddingLeft: 36 },
    childLabel: { fontSize: 12, color: TEXT_SECONDARY, flex: 1 },
    childRight: { flexDirection: "row", alignItems: "center", gap: 6 },
    childValue: { fontSize: 12, fontWeight: "500", color: TEXT_PRIMARY },
    childYoy: { fontSize: 10, fontWeight: "600" },
});