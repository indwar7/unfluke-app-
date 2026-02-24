import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    LayoutAnimation, Platform, UIManager, Dimensions, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EmptyState } from "./SharedComponents";
import {
    fmt, valueColor, ACCENT, ACCENT_LIGHT, TEXT_PRIMARY, TEXT_SECONDARY,
    TEXT_MUTED, BORDER_COLOR, ZEBRA_LIGHT, CARD_BG, GREEN, RED, CHART_COLORS,
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
import { SvgLineChart } from "./DataTabs";

const { width: SCREEN_W } = Dimensions.get("window");
const CONTENT_W = SCREEN_W - 32;

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* ═══════════════════════════════════════════════════════════
   YEAR SELECTOR PILLS
═══════════════════════════════════════════════════════════ */
function YearPills({
    periods,
    selected,
    onSelect,
}: {
    periods: string[];
    selected: string;
    onSelect: (p: string) => void;
}) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={yp.scroll}
            contentContainerStyle={yp.row}
        >
            {periods.map((p) => (
                <TouchableOpacity
                    key={p}
                    style={[yp.pill, selected === p && yp.pillOn]}
                    onPress={() => onSelect(p)}
                    activeOpacity={0.7}
                >
                    <Text style={[yp.pillTxt, selected === p && yp.pillTxtOn]}>
                        {formatPeriodLabel(p)}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const yp = StyleSheet.create({
    scroll: { marginBottom: 12 },
    row: { flexDirection: "row", gap: 8, paddingHorizontal: 2 },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#F3F4F6",
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    pillOn: { backgroundColor: ACCENT, borderColor: ACCENT },
    pillTxt: { fontSize: 12, fontWeight: "600", color: TEXT_MUTED },
    pillTxtOn: { color: "#fff" },
});

/* ═══════════════════════════════════════════════════════════
   EXPANDABLE SECTION ROW
   Parent row with +/- and chevron, expands to show children
═══════════════════════════════════════════════════════════ */
function ExpandableSection({
    title,
    value,
    children,
    isEven,
}: {
    title: string;
    value: any;
    children: { label: string; value: any }[];
    isEven: boolean;
}) {
    const [open, setOpen] = useState(false);

    const toggle = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpen((prev) => !prev);
    }, []);

    const hasChildren = children && children.length > 0;

    return (
        <View style={[ex.wrapper, isEven && ex.wrapperEven]}>
            {/* Parent row */}
            <TouchableOpacity
                style={ex.headerRow}
                onPress={hasChildren ? toggle : undefined}
                activeOpacity={hasChildren ? 0.7 : 1}
            >
                <View style={ex.headerLeft}>
                    {hasChildren ? (
                        <Text style={ex.plusSign}>{open ? "−" : "+"}</Text>
                    ) : (
                        <View style={ex.plusPlaceholder} />
                    )}
                    <Text style={ex.headerTitle} numberOfLines={2}>
                        {title}
                    </Text>
                </View>
                <View style={ex.headerRight}>
                    <Text style={ex.headerValue}>{fmt(value)}</Text>
                    {hasChildren && (
                        <Ionicons
                            name={open ? "chevron-up" : "chevron-down"}
                            size={14}
                            color={TEXT_MUTED}
                            style={{ marginLeft: 6 }}
                        />
                    )}
                </View>
            </TouchableOpacity>

            {/* Children rows */}
            {open && hasChildren && (
                <View style={ex.childrenWrap}>
                    {children.map((child, i) => (
                        <View
                            key={`${child.label}-${i}`}
                            style={[ex.childRow, i % 2 !== 0 && ex.childRowAlt]}
                        >
                            <Text style={ex.childLabel} numberOfLines={2}>
                                {child.label}
                            </Text>
                            <Text
                                style={[ex.childValue, { color: valueColor(child.value) }]}
                                numberOfLines={1}
                            >
                                {fmt(child.value)}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

const ex = StyleSheet.create({
    wrapper: {
        backgroundColor: CARD_BG,
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    wrapperEven: {
        backgroundColor: ZEBRA_LIGHT,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 14,
        paddingVertical: 14,
    },
    headerLeft: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        marginRight: 12,
    },
    plusSign: {
        fontSize: 16,
        fontWeight: "700",
        color: ACCENT,
        width: 18,
        textAlign: "center",
        marginRight: 8,
    },
    plusPlaceholder: {
        width: 18,
        marginRight: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 13,
        fontWeight: "700",
        color: TEXT_PRIMARY,
        lineHeight: 18,
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerValue: {
        fontSize: 13,
        fontWeight: "700",
        color: TEXT_PRIMARY,
        textAlign: "right",
    },
    childrenWrap: {
        borderTopWidth: 1,
        borderTopColor: BORDER_COLOR,
    },
    childRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 11,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: BORDER_COLOR,
    },
    childRowAlt: {
        backgroundColor: "rgba(0,0,0,0.018)",
    },
    childLabel: {
        flex: 1,
        fontSize: 12,
        color: TEXT_SECONDARY,
        marginRight: 12,
        lineHeight: 17,
    },
    childValue: {
        fontSize: 12,
        fontWeight: "600",
        textAlign: "right",
        minWidth: 70,
    },
});

/* ═══════════════════════════════════════════════════════════
   EXPANDABLE FINANCIAL LIST
   Replaces HorizontalTable — one year at a time via pills,
   parent rows expandable to show child sub-rows.
═══════════════════════════════════════════════════════════ */
function ExpandableFinancialList({
    response,
    emptyMessage,
}: {
    response: any;
    emptyMessage?: string;
}) {
    if (!response?.results) {
        return <EmptyState message={emptyMessage || "No data available."} />;
    }

    const periodKeys = useMemo(() => getPeriodKeys(response), [response]);
    const headings = useMemo(() => {
        try { return getHeadings(response) || []; } catch { return []; }
    }, [response]);

    const [selectedPeriod, setSelectedPeriod] = useState<string>(periodKeys[0] || "");
    const activePeriod = periodKeys.includes(selectedPeriod)
        ? selectedPeriod
        : (periodKeys[0] || "");

    const periodData = useMemo(() => {
        try {
            return getSectionDataForPeriod(response, activePeriod) || {};
        } catch { return {}; }
    }, [response, activePeriod]);

    // Build sections: parent rows with children
    const sections = useMemo(() => {
        const result: {
            title: string;
            value: any;
            children: { label: string; value: any }[];
        }[] = [];

        try {
            if (Array.isArray(headings) && headings.length > 0) {
                for (const heading of headings) {
                    const parentLabel = heading?.title || "";
                    const parentValue = periodData[parentLabel];
                    const children: { label: string; value: any }[] = [];

                    if (Array.isArray(heading?.children)) {
                        for (const child of heading.children) {
                            children.push({ label: child, value: periodData[child] });
                        }
                    }
                    result.push({ title: parentLabel, value: parentValue, children });
                }
            } else {
                // Fallback flat list
                if (periodData && typeof periodData === "object") {
                    for (const [key, val] of Object.entries(periodData)) {
                        result.push({ title: key, value: val, children: [] });
                    }
                }
            }
        } catch (e) {
            console.warn("ExpandableFinancialList error:", e);
        }

        return result;
    }, [headings, periodData]);

    if (periodKeys.length === 0 || sections.length === 0) {
        return <EmptyState message={emptyMessage || "No data available."} />;
    }

    return (
        <View>
            {/* Year pills */}
            <YearPills
                periods={periodKeys}
                selected={activePeriod}
                onSelect={setSelectedPeriod}
            />

            {/* Expandable rows */}
            {sections.map((section, i) => (
                <ExpandableSection
                    key={`${section.title}-${i}`}
                    title={section.title}
                    value={section.value}
                    children={section.children}
                    isEven={i % 2 !== 0}
                />
            ))}
        </View>
    );
}

/* ── Balance Sheet Tab ────────────────────────────────── */
export function BalanceSheetTab({
    response,
    period,
}: {
    response: any;
    period: string;
}) {
    return (
        <ExpandableFinancialList
            response={response}
            emptyMessage="No balance sheet data available."
        />
    );
}

/* ── P&L / Cash Flow / Quarterly Tab ─────────────────── */
export function PLStyleTab({
    response,
    period,
    emptyMessage,
}: {
    response: any;
    period: string;
    emptyMessage?: string;
}) {
    return (
        <ExpandableFinancialList
            response={response}
            emptyMessage={emptyMessage || "No data available."}
        />
    );
}

/* ═══════════════════════════════════════════════════════════
   KEY RATIOS TAB
   Year pills + expandable accordion sections with ratio cards
═══════════════════════════════════════════════════════════ */
export function KeyRatiosTab({
    ratios,
    period: initialPeriod,
}: {
    ratios: Record<string, any> | undefined;
    period: string;
}) {
    const allPeriods = useMemo(() => {
        try { return getRatioPeriodKeys(ratios) || []; } catch { return []; }
    }, [ratios]);

    const [selectedPeriod, setSelectedPeriod] = useState(
        initialPeriod || allPeriods[0] || ""
    );
    const activePeriod = allPeriods.includes(selectedPeriod)
        ? selectedPeriod
        : (allPeriods[0] || "");

    if (!ratios || allPeriods.length === 0) {
        return <EmptyState message="No ratio data available." />;
    }

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

    // Build accordion sections from headings
    const sections = useMemo(() => {
        const result: {
            title: string;
            children: { label: string; value: any; yoyChange?: number }[];
        }[] = [];

        try {
            if (Array.isArray(headings) && headings.length > 0) {
                for (const heading of headings) {
                    if (Array.isArray(heading?.children) && heading.children.length > 0) {
                        const children = heading.children.map((child: string) => {
                            const currentVal = data?.[child];
                            const prevVal = prevData?.[child];
                            let yoyChange: number | undefined;
                            if (
                                typeof currentVal === "number" &&
                                typeof prevVal === "number" &&
                                prevVal !== 0
                            ) {
                                yoyChange =
                                    ((currentVal - prevVal) / Math.abs(prevVal)) * 100;
                            }
                            return { label: child, value: currentVal, yoyChange };
                        });
                        result.push({ title: heading.title, children });
                    }
                }
            }

            // Fallback flat list
            if (result.length === 0 && data && typeof data === "object") {
                const children = Object.entries(data).map(([k, v]) => {
                    const prevVal = prevData?.[k];
                    let yoyChange: number | undefined;
                    if (typeof v === "number" && typeof prevVal === "number" && prevVal !== 0) {
                        yoyChange = ((v - prevVal) / Math.abs(prevVal)) * 100;
                    }
                    return { label: k, value: v, yoyChange };
                });
                result.push({ title: "Key Ratios", children });
            }
        } catch (e) {
            console.warn("KeyRatiosTab sections error:", e);
        }

        return result;
    }, [headings, data, prevData]);

    if (sections.length === 0) {
        return <EmptyState message="No ratio data for this period." />;
    }

    // ── Build chart series for 3 key ratio trends ──
    // We pull all periods' data to create time-series lines
    const RATIO_CHARTS = [
        { label: "Debt-Equity Ratio", key: "Debt-Equity Ratio", color: "#6366F1", area: "rgba(99,102,241,0.08)" },
        { label: "Current Ratio", key: "Current Ratio", color: "#10B981", area: "rgba(16,185,129,0.08)" },
        { label: "Return on Equity", key: "Return on Equity", color: "#F59E0B", area: "rgba(245,158,11,0.08)" },
    ];

    const chartSeries = useMemo(() => {
        return RATIO_CHARTS.map(rc => {
            const pts = allPeriods.map(p => {
                try {
                    const d = getMergedRatioData(ratios, p) || {};
                    const val = d[rc.key];
                    return { x: formatPeriodLabel(p), y: typeof val === "number" ? val : parseFloat(String(val || "")) };
                } catch { return { x: p, y: NaN }; }
            }).filter(pt => !isNaN(pt.y)).reverse();
            return { ...rc, pts };
        });
    }, [ratios, allPeriods]);

    const [selChart, setSelChart] = useState(0);
    const activeChart = chartSeries[selChart];

    return (
        <View>
            {/* ── 3 Ratio Charts (Issue #5 fix) ── */}
            {chartSeries.some(c => c.pts.length > 1) && (
                <View style={rc.chartCard}>
                    {/* Chart selector tabs */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={rc.chartTabs}>
                            {chartSeries.map((c, i) => (
                                <TouchableOpacity
                                    key={c.key}
                                    style={[rc.chartTab, selChart === i && rc.chartTabOn]}
                                    onPress={() => setSelChart(i)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[rc.chartTabText, selChart === i && rc.chartTabTextOn]}>
                                        {c.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Active chart */}
                    {activeChart.pts.length > 1 ? (
                        <View style={rc.chartBody}>
                            <View style={rc.chartMeta}>
                                <Text style={rc.chartLatest}>
                                    {activeChart.pts[activeChart.pts.length - 1]?.y?.toFixed(2) ?? "—"}
                                </Text>
                                {activeChart.pts.length >= 2 && (() => {
                                    const last = activeChart.pts[activeChart.pts.length - 1].y;
                                    const prev = activeChart.pts[activeChart.pts.length - 2].y;
                                    const chg = prev !== 0 ? ((last - prev) / Math.abs(prev)) * 100 : 0;
                                    const up = chg >= 0;
                                    return (
                                        <View style={[rc.chgBadge, { backgroundColor: up ? "#DCFCE7" : "#FEE2E2" }]}>
                                            <Text style={[rc.chgText, { color: up ? GREEN : RED }]}>
                                                {up ? "▲" : "▼"} {Math.abs(chg).toFixed(1)}% YoY
                                            </Text>
                                        </View>
                                    );
                                })()}
                            </View>
                            <SvgLineChart
                                data={activeChart.pts}
                                color={activeChart.color}
                                areaColor={activeChart.area}
                            />
                        </View>
                    ) : (
                        <EmptyState message={`No ${activeChart.label} trend data.`} icon="bar-chart-outline" />
                    )}
                </View>
            )}

            {/* Year pills */}
            <YearPills
                periods={allPeriods.slice(0, 10)}
                selected={activePeriod}
                onSelect={setSelectedPeriod}
            />

            {/* Accordion sections */}
            {sections.map((section, sIdx) => (
                <RatioAccordionSection
                    key={`${section.title}-${sIdx}`}
                    title={section.title}
                    items={section.children}
                    isEven={sIdx % 2 !== 0}
                />
            ))}
        </View>
    );
}

/* ─── Ratio Accordion Section ───────────────────────── */
function RatioAccordionSection({
    title,
    items,
    isEven,
}: {
    title: string;
    items: { label: string; value: any; yoyChange?: number }[];
    isEven: boolean;
}) {
    const [open, setOpen] = useState(true); // open by default

    const toggle = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpen((prev) => !prev);
    }, []);

    const cardW = (CONTENT_W - 10) / 2;

    return (
        <View style={[ra.wrapper, isEven && ra.wrapperEven]}>
            {/* Section header */}
            <TouchableOpacity style={ra.header} onPress={toggle} activeOpacity={0.7}>
                <Text style={ra.headerTitle}>{title}</Text>
                <Ionicons
                    name={open ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={TEXT_MUTED}
                />
            </TouchableOpacity>

            {/* 2-column ratio cards */}
            {open && (
                <View style={ra.grid}>
                    {items.map((item, i) => {
                        const isPositive = (item.yoyChange ?? 0) >= 0;
                        return (
                            <View key={`${item.label}-${i}`} style={[ra.card, { width: cardW }]}>
                                <Text style={ra.cardLabel} numberOfLines={2}>
                                    {item.label}
                                </Text>
                                <Text
                                    style={[ra.cardValue, { color: valueColor(item.value) }]}
                                    numberOfLines={1}
                                >
                                    {fmt(item.value)}
                                </Text>
                                {item.yoyChange !== undefined &&
                                    !isNaN(item.yoyChange) && (
                                        <Text
                                            style={[
                                                ra.cardYoy,
                                                { color: isPositive ? GREEN : RED },
                                            ]}
                                        >
                                            {isPositive ? "↑" : "↓"}{" "}
                                            {Math.abs(item.yoyChange).toFixed(1)}% YoY
                                        </Text>
                                    )}
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
}

/* Ratio chart styles (Issue #5) */
const rc = StyleSheet.create({
    chartCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        marginBottom: 16,
        overflow: "hidden",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    chartTabs: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: BORDER_COLOR,
    },
    chartTab: {
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    chartTabOn: { borderBottomColor: ACCENT },
    chartTabText: { fontSize: 12, fontWeight: "600", color: TEXT_MUTED },
    chartTabTextOn: { color: ACCENT },
    chartBody: { padding: 16 },
    chartMeta: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
    chartLatest: { fontSize: 24, fontWeight: "800", color: TEXT_PRIMARY },
    chgBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    chgText: { fontSize: 11, fontWeight: "700" },
});

const ra = StyleSheet.create({
    wrapper: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    wrapperEven: {
        backgroundColor: ZEBRA_LIGHT,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: BORDER_COLOR,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: TEXT_PRIMARY,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        padding: 12,
        gap: 10,
    },
    card: {
        backgroundColor: CARD_BG,
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
        minHeight: 80,
    },
    cardLabel: {
        fontSize: 11,
        color: TEXT_MUTED,
        fontWeight: "500",
        marginBottom: 4,
        lineHeight: 15,
    },
    cardValue: {
        fontSize: 18,
        fontWeight: "800",
        color: TEXT_PRIMARY,
        marginBottom: 2,
    },
    cardYoy: {
        fontSize: 10,
        fontWeight: "600",
        marginTop: 2,
    },
});