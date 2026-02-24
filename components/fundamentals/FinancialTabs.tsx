import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, FlatList, TouchableOpacity } from "react-native";
import { EmptyState } from "./SharedComponents";
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
const CONTENT_W = SCREEN_W - 32; // 16px padding each side in scrollContent
const LABEL_W = Math.min(140, CONTENT_W * 0.38); // 38% of content, max 140
const DATA_COL_W = 90; // Each data column
const ROW_H = 42;

/* ═══════════════════════════════════════════════════════════
   HORIZONTAL SCROLLABLE TABLE
   - Sticky "Particulars" column (left)
   - Horizontally scrollable year columns (right)
   - Clean zebra striping, bold headers, child indent
═══════════════════════════════════════════════════════════ */
function HorizontalTable({
    response,
    emptyMessage,
}: {
    response: any;
    emptyMessage?: string;
}) {
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

    if (periodKeys.length === 0 || rows.length === 0) {
        return <EmptyState message={emptyMessage || "No data available."} />;
    }

    return (
        <View style={tbl.container}>
            <View style={tbl.tableWrap}>
                {/* ── Sticky label column ── */}
                <View style={tbl.stickyCol}>
                    {/* Header */}
                    <View style={tbl.stickyHeader}>
                        <Text style={tbl.headerTxt}>Particulars</Text>
                    </View>
                    {/* Rows */}
                    {rows.map((row, i) => (
                        <View key={`s-${i}`}
                            style={[tbl.stickyCell, i % 2 === 0 && tbl.zebraOdd, row.isBold && tbl.boldRow]}>
                            <Text style={[
                                tbl.stickyTxt,
                                row.isBold && tbl.boldTxt,
                                row.isChild && tbl.childTxt,
                            ]} numberOfLines={2}>
                                {row.isChild ? `  ${row.label}` : row.label}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* ── Scrollable data columns ── */}
                <ScrollView horizontal showsHorizontalScrollIndicator={true} bounces={false}
                    contentContainerStyle={{ flexGrow: 1 }}>
                    <View>
                        {/* Header row */}
                        <View style={tbl.dataHeaderRow}>
                            {periodKeys.map(pk => (
                                <View key={pk} style={tbl.dataHeaderCell}>
                                    <Text style={tbl.headerTxt}>{formatPeriodLabel(pk)}</Text>
                                </View>
                            ))}
                        </View>
                        {/* Data rows */}
                        {rows.map((row, i) => (
                            <View key={`d-${i}`}
                                style={[tbl.dataRow, i % 2 === 0 && tbl.zebraOdd, row.isBold && tbl.boldRow]}>
                                {periodKeys.map(pk => {
                                    const val = allData[pk]?.[row.label];
                                    return (
                                        <View key={pk} style={tbl.dataCell}>
                                            <Text style={[
                                                tbl.dataTxt,
                                                { color: valueColor(val) },
                                                row.isBold && tbl.boldTxt,
                                            ]} numberOfLines={1}>
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

/* ── Expandable List (Balance Sheet / PL style) ──────── */
function ExpandableList({
    response,
    period,
    emptyMessage,
}: {
    response: any;
    period: string;
    emptyMessage?: string;
}) {
    if (!response?.results) return <EmptyState message={emptyMessage || "No data available."} />;

    const periodKeys = useMemo(() => getPeriodKeys(response), [response]);
    const headings = useMemo(() => {
        try { return getHeadings(response) || []; } catch { return []; }
    }, [response]);

    // Use period from parent PeriodPicker; fall back to first available
    const selectedYear = (period && periodKeys.includes(period)) ? period : (periodKeys[0] || "");
    const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

    const toggleSection = (title: string) => {
        setExpandedMap(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const allData = useMemo(() => {
        const map: Record<string, Record<string, any>> = {};
        try {
            for (const pk of periodKeys) {
                map[pk] = getSectionDataForPeriod(response, pk) || {};
            }
        } catch { }
        return map;
    }, [periodKeys, response]);

    const getValue = (label: string, parent?: string) => {
        const data = allData[selectedYear] || {};
        const val = data[label];
        return val !== undefined && val !== null ? fmt(val) : "-";
    };

    if (periodKeys.length === 0 || headings.length === 0)
        return <EmptyState message={emptyMessage || "No data available."} />;

    return (
        <View>
            {/* Expandable rows — year controlled by parent PeriodPicker */}
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
                                        <Text style={el.childValue}>{getValue(child, item.title)}</Text>
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

/* ── Balance Sheet Tab ────────────────────────────────── */
export function BalanceSheetTab({ response, period }: { response: any; period: string }) {
    return <ExpandableList response={response} period={period} emptyMessage="No balance sheet data available." />;
}

/* ── P&L / Cash Flow / Quarterly Tab ─────────────────── */
export function PLStyleTab({ response, period, emptyMessage }: { response: any; period: string; emptyMessage?: string }) {
    return <ExpandableList response={response} period={period} emptyMessage={emptyMessage || "No data available."} />;
}


/* ═══════════════════════════════════════════════════════════
   KEY RATIOS TAB
   Uses period passed from parent PeriodPicker (no internal pills)
═══════════════════════════════════════════════════════════ */
export function KeyRatiosTab({ ratios, period }: { ratios: Record<string, any> | undefined; period: string }) {
    const allPeriods = useMemo(() => {
        try { return getRatioPeriodKeys(ratios) || []; } catch { return []; }
    }, [ratios]);

    // Use parent period; fall back to first available
    const activePeriod = (period && allPeriods.includes(period)) ? period : (allPeriods[0] || "");

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

    // Build ratio items from headings or fallback to data keys
    const ratioItems = useMemo(() => {
        const items: { label: string; value: any; yoyChange?: number; sectionTitle?: string }[] = [];
        try {
            if (Array.isArray(headings) && headings.length > 0) {
                for (const heading of headings) {
                    if (Array.isArray(heading?.children) && heading.children.length > 0) {
                        items.push({ label: heading.title, value: null, sectionTitle: heading.title });
                        for (const child of heading.children) {
                            const currentVal = data?.[child];
                            const prevVal = prevData?.[child];
                            let yoyChange: number | undefined;
                            if (typeof currentVal === "number" && typeof prevVal === "number" && prevVal !== 0) {
                                yoyChange = ((currentVal - prevVal) / Math.abs(prevVal)) * 100;
                            }
                            items.push({ label: child, value: currentVal, yoyChange });
                        }
                    }
                }
            }
            if (items.length === 0 && data && typeof data === "object") {
                for (const [k, v] of Object.entries(data)) {
                    const prevVal = prevData?.[k];
                    let yoyChange: number | undefined;
                    if (typeof v === "number" && typeof prevVal === "number" && prevVal !== 0) {
                        yoyChange = ((v - prevVal) / Math.abs(prevVal)) * 100;
                    }
                    items.push({ label: k, value: v, yoyChange });
                }
            }
        } catch (e) { console.warn("KeyRatiosTab error:", e); }
        return items;
    }, [headings, data, prevData]);

    const gridItems = ratioItems.filter(item => !item.sectionTitle);

    if (gridItems.length === 0) return <EmptyState message="No ratio data for this period." />;

    const cardW = (CONTENT_W - 12) / 2; // 2 columns with 12px gap

    const renderRatioCard = ({ item }: { item: typeof gridItems[0] }) => {
        const isPositive = (item.yoyChange ?? 0) >= 0;
        return (
            <View style={[rt.card, { width: cardW }]}>
                <Text style={rt.cardLabel} numberOfLines={2}>{item.label}</Text>
                <Text style={[rt.cardValue, { color: valueColor(item.value) }]}>{fmt(item.value)}</Text>
                {item.yoyChange !== undefined && !isNaN(item.yoyChange) && (
                    <Text style={[rt.cardYoy, { color: isPositive ? GREEN : RED }]}>
                        {isPositive ? "↑" : "↓"} {Math.abs(item.yoyChange).toFixed(1)}% YoY
                    </Text>
                )}
            </View>
        );
    };

    return (
        <View>
            {/* 2-column grid */}
            <FlatList
                data={gridItems}
                numColumns={2}
                keyExtractor={(item, i) => `${item.label}-${i}`}
                renderItem={renderRatioCard}
                columnWrapperStyle={rt.colWrap}
                scrollEnabled={false}
                removeClippedSubviews={false}
                ListEmptyComponent={<EmptyState message="No ratio data." />}
            />
        </View>
    );
}

/* ═══════════════════════════════════════════════════════════
   TABLE STYLES
═══════════════════════════════════════════════════════════ */
const tbl = StyleSheet.create({
    container: {
        borderRadius: 12, overflow: "hidden",
        borderWidth: 1, borderColor: BORDER_COLOR,
        backgroundColor: CARD_BG,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
        elevation: 2,
    },
    tableWrap: { flexDirection: "row" },
    // ── Sticky column
    stickyCol: {
        width: LABEL_W,
        borderRightWidth: 1,
        borderRightColor: BORDER_COLOR,
        zIndex: 10,
        backgroundColor: CARD_BG,
    },
    stickyHeader: {
        width: LABEL_W, height: ROW_H,
        justifyContent: "center", paddingHorizontal: 10,
        backgroundColor: ACCENT,
    },
    stickyCell: {
        width: LABEL_W, height: ROW_H,
        justifyContent: "center", paddingHorizontal: 10,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E8E9EB",
    },
    stickyTxt: { fontSize: 11, color: TEXT_SECONDARY, lineHeight: 15 },
    // ── Data columns
    dataHeaderRow: { flexDirection: "row" },
    dataHeaderCell: {
        width: DATA_COL_W, height: ROW_H,
        justifyContent: "center", alignItems: "center",
        backgroundColor: ACCENT,
    },
    headerTxt: { fontSize: 11, fontWeight: "700", color: "#fff", textAlign: "center" },
    dataRow: { flexDirection: "row" },
    dataCell: {
        width: DATA_COL_W, height: ROW_H,
        justifyContent: "center", alignItems: "flex-end",
        paddingHorizontal: 6,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E8E9EB",
    },
    dataTxt: { fontSize: 11, fontWeight: "500", textAlign: "right" },
    // ── Shared states
    zebraOdd: { backgroundColor: ZEBRA_LIGHT },
    boldRow: { backgroundColor: ACCENT_LIGHT },
    boldTxt: { fontWeight: "700", color: TEXT_PRIMARY, fontSize: 11 },
    childTxt: { color: TEXT_MUTED, fontSize: 10, paddingLeft: 6 },
});

/* ═══════════════════════════════════════════════════════════
   RATIO STYLES
═══════════════════════════════════════════════════════════ */
const rt = StyleSheet.create({
    pillScroll: { marginBottom: 14 },
    pillRow: { flexDirection: "row", gap: 8, paddingHorizontal: 2 },
    pill: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: BORDER_COLOR,
    },
    pillOn: { backgroundColor: ACCENT, borderColor: ACCENT },
    pillTxt: { fontSize: 12, fontWeight: "600", color: TEXT_MUTED },
    pillTxtOn: { color: "#fff" },
    colWrap: { justifyContent: "space-between", marginBottom: 10 },
    card: {
        backgroundColor: CARD_BG, borderRadius: 12, padding: 14,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
        borderWidth: 1, borderColor: BORDER_COLOR,
        justifyContent: "center", minHeight: 90,
    },
    cardLabel: { fontSize: 11, color: TEXT_MUTED, fontWeight: "500", marginBottom: 4, lineHeight: 15 },
    cardValue: { fontSize: 18, fontWeight: "800", color: TEXT_PRIMARY, marginBottom: 2 },
    cardYoy: { fontSize: 10, fontWeight: "600", marginTop: 2 },
});

const el = StyleSheet.create({
    pillScroll: { marginBottom: 16 },
    pillRow: { flexDirection: "row", gap: 8, paddingHorizontal: 4 },
    pill: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: BORDER_COLOR,
    },
    pillOn: { backgroundColor: ACCENT, borderColor: ACCENT },
    pillTxt: { fontSize: 13, fontWeight: "600", color: TEXT_MUTED },
    pillTxtOn: { color: "#fff" },

    rowWrap: {
        marginBottom: 8,
    },
    rowHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: CARD_BG,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    plusIcon: {
        fontSize: 16,
        fontWeight: 'bold',
        color: ACCENT,
        marginRight: 8,
        width: 16,
    },
    rowTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: TEXT_PRIMARY,
        flex: 1,
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowValue: {
        fontSize: 13,
        fontWeight: '700',
        color: TEXT_PRIMARY,
        marginRight: 8,
    },
    chevron: {
        fontSize: 18,
        color: TEXT_MUTED,
        transform: [{ rotate: '90deg' }],
        marginLeft: 8,
    },
    chevronOpen: {
        transform: [{ rotate: '-90deg' }],
    },
    childrenWrap: {
        backgroundColor: '#FAFAFA',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        borderTopWidth: 0,
        marginTop: -4,
        paddingTop: 8,
        paddingBottom: 8,
    },
    childRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        paddingHorizontal: 16,
        paddingLeft: 36,
    },
    childLabel: {
        fontSize: 12,
        color: TEXT_SECONDARY,
        flex: 1,
    },
    childValue: {
        fontSize: 12,
        fontWeight: '500',
        color: TEXT_PRIMARY,
    },
});
