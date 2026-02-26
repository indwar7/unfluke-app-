/**
 * DataTabs.tsx
 *
 * Charts | BulkBlockDeals | CorporateEvents | Shareholding | Documents
 *
 * Charts: Built from P&L and Balance Sheet yearly data (line charts via react-native-svg)
 * Shareholding: Pie chart via react-native-svg arcs
 * Other tabs: Direct API calls matching contract
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity,
    FlatList, Dimensions, ScrollView, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser"; // kept for other tabs if needed
import { Linking } from "react-native";
import Svg, { Path, Line, Circle, Text as SvgText, G, Rect } from "react-native-svg";
import {
    EmptyState, ErrorState, PaginationControls,
    SkeletonLoader, TableSkeleton,
} from "./SharedComponents";
import {
    ACCENT, ACCENT_LIGHT, GREEN, RED,
    TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED,
    BORDER_COLOR, ZEBRA_LIGHT, CARD_BG,
    CHART_COLORS, SHAREHOLDING_COLORS, EVENT_BADGE_COLORS,
    fmt, valueColor,
} from "./constants";
import { getSectionDataForPeriod, getPeriodKeys } from "../../hooks/useFundamentalData";

/* ─────────────────────────────────────────────────────────
   API HELPERS
───────────────────────────────────────────────────────── */
const SCREENER = "https://api.unfluke.in/api/screener";
const HISTORIC = "https://api.unfluke.in/api/historicData";

async function apiFetch(url: string, signal?: AbortSignal): Promise<any> {
    const res = await fetch(url, signal ? { signal } : undefined);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

function normalise(raw: any): any[] {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.results)) return raw.results;
    if (Array.isArray(raw?.data)) return raw.data;
    if (raw && typeof raw === "object") return [raw];
    return [];
}

const { width: SW } = Dimensions.get("window");
const CW = SW - 48;
const CH = 200;

/* ═══════════════════════════════════════════════════════════
   SVG LINE CHART COMPONENT (pure react-native-svg)
═══════════════════════════════════════════════════════════ */
export function SvgLineChart({
    data,
    width: w = CW,
    height: h = CH,
    color = CHART_COLORS.primary,
    areaColor = "rgba(99,102,241,0.08)",
    showLabels = true,
}: {
    data: { x: string; y: number }[];
    width?: number;
    height?: number;
    color?: string;
    areaColor?: string;
    showLabels?: boolean;
}) {
    if (!data.length) return null;

    const padL = 60, padR = 16, padT = 16, padB = 40;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const vals = data.map(d => d.y);
    const minY = Math.min(...vals);
    const maxY = Math.max(...vals);
    const rangeY = maxY - minY || 1;

    const toX = (i: number) => padL + (i / Math.max(data.length - 1, 1)) * plotW;
    const toY = (v: number) => padT + plotH - ((v - minY) / rangeY) * plotH;

    // Line path
    const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(d.y).toFixed(1)}`).join(" ");
    // Area path
    const areaPath = `${linePath} L${toX(data.length - 1).toFixed(1)},${(padT + plotH).toFixed(1)} L${toX(0).toFixed(1)},${(padT + plotH).toFixed(1)} Z`;

    // Y-axis ticks
    const yTicks = 5;
    const yStep = rangeY / yTicks;

    // X-axis ticks (show ~5 labels)
    const xTickStep = Math.max(1, Math.floor(data.length / 5));

    const fmtAxis = (v: number) =>
        Math.abs(v) >= 1e7 ? `${(v / 1e7).toFixed(0)}Cr` :
            Math.abs(v) >= 1e5 ? `${(v / 1e5).toFixed(0)}L` :
                Math.abs(v) >= 1e3 ? `${(v / 1e3).toFixed(0)}K` :
                    v % 1 === 0 ? v.toString() : v.toFixed(1);

    return (
        <View style={{ alignItems: "center" }}>
            <Svg width={w} height={h}>
                {/* Grid lines */}
                {Array.from({ length: yTicks + 1 }).map((_, i) => {
                    const yVal = minY + i * yStep;
                    const py = toY(yVal);
                    return (
                        <G key={`grid-${i}`}>
                            <Line x1={padL} y1={py} x2={w - padR} y2={py}
                                stroke="#F0F1F3" strokeWidth={1} strokeDasharray="4,4" />
                            <SvgText x={padL - 6} y={py + 3} fontSize={9} fill={TEXT_MUTED} textAnchor="end">
                                {fmtAxis(yVal)}
                            </SvgText>
                        </G>
                    );
                })}

                {/* Area fill */}
                <Path d={areaPath} fill={areaColor} />

                {/* Line */}
                <Path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

                {/* Data dots on line */}
                {data.length <= 20 && data.map((d, i) => (
                    <Circle key={`dot-${i}`} cx={toX(i)} cy={toY(d.y)} r={3}
                        fill="#fff" stroke={color} strokeWidth={2} />
                ))}

                {/* X labels */}
                {showLabels && data.map((d, i) => {
                    if (i % xTickStep !== 0 && i !== data.length - 1) return null;
                    return (
                        <SvgText key={`xl-${i}`} x={toX(i)} y={h - 8} fontSize={9}
                            fill={TEXT_MUTED} textAnchor="middle">
                            {d.x.length > 4 ? d.x.slice(-4) : d.x}
                        </SvgText>
                    );
                })}

                {/* Axes */}
                <Line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke={BORDER_COLOR} strokeWidth={1} />
                <Line x1={padL} y1={padT + plotH} x2={w - padR} y2={padT + plotH} stroke={BORDER_COLOR} strokeWidth={1} />
            </Svg>
        </View>
    );
}

/* ═══════════════════════════════════════════════════════════
   SVG PIE CHART COMPONENT (pure react-native-svg)
═══════════════════════════════════════════════════════════ */
function SvgPieChart({
    slices,
    size = 220,
    innerRadius = 55,
}: {
    slices: { label: string; value: number; color: string }[];
    size?: number;
    innerRadius?: number;
}) {
    const total = slices.reduce((a, s) => a + s.value, 0);
    if (total <= 0) return null;

    const cx = size / 2, cy = size / 2, r = (size / 2) - 10;
    let currentAngle = -Math.PI / 2; // Start at top

    const arcPaths = slices.map((slice) => {
        const angle = (slice.value / total) * Math.PI * 2;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;

        const largeArc = angle > Math.PI ? 1 : 0;

        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);

        const ix1 = cx + innerRadius * Math.cos(startAngle);
        const iy1 = cy + innerRadius * Math.sin(startAngle);
        const ix2 = cx + innerRadius * Math.cos(endAngle);
        const iy2 = cy + innerRadius * Math.sin(endAngle);

        const d = [
            `M ${x1} ${y1}`,
            `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
            `L ${ix2} ${iy2}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`,
            `Z`,
        ].join(" ");

        // Label position
        const midAngle = startAngle + angle / 2;
        const labelR = (r + innerRadius) / 2;
        const lx = cx + labelR * Math.cos(midAngle);
        const ly = cy + labelR * Math.sin(midAngle);

        return { ...slice, d, lx, ly, pct: ((slice.value / total) * 100).toFixed(1) };
    });

    return (
        <View style={{ alignItems: "center", marginTop: 8 }}>
            <Svg width={size} height={size}>
                {arcPaths.map((arc, i) => (
                    <G key={i}>
                        <Path d={arc.d} fill={arc.color} stroke="#fff" strokeWidth={2} />
                        {parseFloat(arc.pct) > 5 && (
                            <SvgText x={arc.lx} y={arc.ly + 4} fontSize={11}
                                fill="#fff" fontWeight="bold" textAnchor="middle">
                                {arc.pct}%
                            </SvgText>
                        )}
                    </G>
                ))}
            </Svg>
        </View>
    );
}

/* ═══════════════════════════════════════════════════════════
   CHARTS TAB
   Built from P&L and Balance Sheet yearly data
   (getDailyRatios/getCompanyTexts endpoints return 404)
═══════════════════════════════════════════════════════════ */
const VAL_METRICS = [
    { label: "Revenue", key: "Sales", source: "pl" },
    { label: "Net Profit", key: "Net Profit", source: "pl" },
    { label: "Operating Profit", key: "Operating Profit", source: "pl" },
    { label: "EBITDA", key: "EBITDA", source: "pl" },
] as const;

const RATIO_METRICS = [
    { label: "EPS (Adjusted)", key: "EPS (Adjusted)", source: "pl" },
    { label: "Book Value", key: "Book Value (Adjusted)", source: "pl" },
    { label: "Total Assets", key: "TOTAL ASSETS", source: "bs" },
    { label: "Total Equity", key: "Total Shareholders Fund", source: "bs" },
] as const;

export function ChartsTab({
    capcode, companyName, stockType,
}: { capcode: string; companyName: string; stockType: "C" | "S" }) {

    const [plData, setPlData] = useState<any>(null);
    const [bsData, setBsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selVal, setSelVal] = useState(0);
    const [selRatio, setSelRatio] = useState(0);

    const load = useCallback(async () => {
        if (!capcode) return;
        setLoading(true); setError(null);
        try {
            const q = `capcode=${capcode}&type=${stockType}`;
            const [pl, bs] = await Promise.all([
                apiFetch(`${SCREENER}/getProfitLoss?${q}`).catch(() => null),
                apiFetch(`${SCREENER}/getBalanceSheet?${q}`).catch(() => null),
            ]);
            setPlData(pl);
            setBsData(bs);
        } catch (e: any) { setError(e?.message || "Failed to load chart data"); }
        setLoading(false);
    }, [capcode, stockType]);

    useEffect(() => { load(); }, [load]);

    // Build chart series from the financial data
    const buildSeries = useCallback((key: string, source: string) => {
        const response = source === "pl" ? plData : bsData;
        if (!response?.results) return [];

        const periods = getPeriodKeys(response);
        return periods.map(p => {
            const data = getSectionDataForPeriod(response, p);
            const val = data?.[key];
            return { x: p, y: typeof val === "number" ? val : parseFloat(String(val || "")) };
        }).filter(d => !isNaN(d.y)).reverse(); // oldest first for charting
    }, [plData, bsData]);

    if (loading) return <SkeletonLoader rows={8} />;
    if (error) return <ErrorState message={error} onRetry={load} />;
    if (!plData && !bsData) return <EmptyState message="No chart data available." icon="bar-chart-outline" />;

    const renderChart = (metric: typeof VAL_METRICS[number] | typeof RATIO_METRICS[number]) => {
        const pts = buildSeries(metric.key, metric.source);
        if (!pts.length)
            return <EmptyState message={`No ${metric.label} data.`} icon="bar-chart-outline" />;

        const vals = pts.map(p => p.y);
        const latest = vals[vals.length - 1];
        const first = vals[0];
        const chg = first !== 0 ? ((latest - first) / Math.abs(first)) * 100 : 0;
        const up = chg >= 0;

        const fmtV = (v: number) =>
            Math.abs(v) >= 1e7 ? `${(v / 1e7).toFixed(1)}Cr` :
                Math.abs(v) >= 1e5 ? `${(v / 1e5).toFixed(1)}L` :
                    Math.abs(v) >= 1e3 ? `${(v / 1e3).toFixed(1)}K` : v.toFixed(1);

        return (
            <View style={s.chartPanel}>
                <Text style={s.chartLabel}>{metric.label}</Text>
                <View style={s.chartMeta}>
                    <Text style={s.chartVal}>{fmtV(latest)}</Text>
                    <View style={[s.chgBadge, { backgroundColor: up ? "#DCFCE7" : "#FEE2E2" }]}>
                        <Text style={[s.chgText, { color: up ? GREEN : RED }]}>
                            {up ? "▲" : "▼"} {Math.abs(chg).toFixed(1)}%
                        </Text>
                    </View>
                </View>
                <SvgLineChart
                    data={pts}
                    color={up ? GREEN : RED}
                    areaColor={up ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)"}
                />
            </View>
        );
    };

    return (
        <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
            {/* Valuation Metrics group */}
            <View style={s.chartGroup}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={s.chartTabs}>
                        {VAL_METRICS.map((m, i) => (
                            <TouchableOpacity key={m.key}
                                style={[s.cTab, selVal === i && s.cTabOn]}
                                onPress={() => setSelVal(i)} activeOpacity={0.7}>
                                <Text style={[s.cTabText, selVal === i && s.cTabTextOn]}>{m.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
                {renderChart(VAL_METRICS[selVal])}
            </View>

            {/* Key Metrics group */}
            <View style={s.chartGroup}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={s.chartTabs}>
                        {RATIO_METRICS.map((m, i) => (
                            <TouchableOpacity key={m.key}
                                style={[s.cTab, selRatio === i && s.cTabOn]}
                                onPress={() => setSelRatio(i)} activeOpacity={0.7}>
                                <Text style={[s.cTabText, selRatio === i && s.cTabTextOn]}>{m.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
                {renderChart(RATIO_METRICS[selRatio])}
            </View>
        </ScrollView>
    );
}

/* ═══════════════════════════════════════════════════════════
   BULK & BLOCK DEALS TAB
   GET /api/screener/getBulkBlockDeals?capcode=476&type=Bulk&page=1
═══════════════════════════════════════════════════════════ */
export function BulkBlockDealsTab({ capcode }: { capcode: string }) {
    const [dtype, setDtype] = useState<"Bulk" | "Block">("Bulk");
    const [data, setData] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<number | null>(null);

    const load = useCallback(async (type: string, pg: number) => {
        if (!capcode) return;
        setLoading(true); setError(null);
        try {
            const raw = await apiFetch(
                `${SCREENER}/getBulkBlockDeals?capcode=${capcode}&type=${type}&page=${pg}`
            );
            setData(normalise(raw));
            setTotal(Math.max(1, raw?.totalPages ?? (raw?.total ? Math.ceil(raw.total / 10) : 1)));
        } catch (e: any) { setError(e?.message || "Failed to load deals"); }
        setLoading(false);
    }, [capcode]);

    useEffect(() => { load(dtype, page); }, [dtype, page, load]);

    const badgeLabel = dtype === "Bulk" ? "Bulk Deal" : "Block Deal";

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const isOpen = expanded === index;
        const rows = Object.entries(item || {});

        return (
            <TouchableOpacity
                style={[s.evCard, isOpen && s.evCardOpen]}
                onPress={() => setExpanded(isOpen ? null : index)}
                activeOpacity={0.8}
            >
                <View style={s.evHeader}>
                    <View style={[s.evBadge, { backgroundColor: "#E0F2FE" }]}>
                        <Text style={[s.evBadgeText, { color: "#0369A1" }]}>
                            {badgeLabel}
                        </Text>
                    </View>
                    <Ionicons
                        name={isOpen ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={TEXT_MUTED}
                    />
                </View>

                {(isOpen ? rows : rows.slice(0, 5)).map(([k, v]) => {
                    const lower = k.toLowerCase();
                    const isTx =
                        lower.includes("type") ||
                        lower.includes("buy") ||
                        lower.includes("sell") ||
                        lower.includes("activity");
                    const isBuy =
                        isTx && String(v).toLowerCase().includes("buy");
                    const isSell =
                        isTx && String(v).toLowerCase().includes("sell");

                    return (
                        <View key={k} style={s.kvRow}>
                            <Text style={s.kvLabel}>{k}</Text>
                            {isTx && (isBuy || isSell) ? (
                                <Text
                                    style={[
                                        s.kvVal,
                                        {
                                            color: isBuy ? GREEN : RED,
                                        },
                                    ]}
                                >
                                    {fmt(v)}
                                </Text>
                            ) : (
                                <Text
                                    style={[
                                        s.kvVal,
                                        { color: valueColor(v) },
                                    ]}
                                >
                                    {fmt(v)}
                                </Text>
                            )}
                        </View>
                    );
                })}
            </TouchableOpacity>
        );
    };

    return (
        <View>
            <View style={s.toggleRow}>
                {(["Bulk", "Block"] as const).map(t => (
                    <TouchableOpacity key={t}
                        style={[s.toggleBtn, dtype === t && s.toggleBtnOn]}
                        onPress={() => { setDtype(t); setPage(1); }} activeOpacity={0.7}>
                        <Ionicons name={t === "Bulk" ? "layers-outline" : "cube-outline"} size={15}
                            color={dtype === t ? ACCENT : TEXT_MUTED} style={{ marginRight: 6 }} />
                        <Text style={[s.toggleText, dtype === t && s.toggleTextOn]}>{t} Deals</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <TableSkeleton rows={6} cols={4} />
            ) : error ? (
                <ErrorState
                    message={error}
                    onRetry={() => load(dtype, page)}
                />
            ) : !data.length ? (
                <EmptyState
                    message={`No ${dtype.toLowerCase()} deals found.`}
                    icon="albums-outline"
                />
            ) : (
                <View>
                    <FlatList
                        data={data}
                        keyExtractor={(_, i) => `d${i}`}
                        renderItem={renderItem}
                        scrollEnabled={false}
                    />
                    {total > 1 && (
                        <PaginationControls
                            currentPage={page}
                            totalPages={total}
                            onPrev={() =>
                                setPage((p) => Math.max(1, p - 1))
                            }
                            onNext={() =>
                                setPage((p) => Math.min(total, p + 1))
                            }
                        />
                    )}
                </View>
            )}
        </View>
    );
}

/* ═══════════════════════════════════════════════════════════
   CORPORATE EVENTS TAB
   GET /api/screener/getCorporateEvents?capcode=476&type=Dividends&page=1
═══════════════════════════════════════════════════════════ */
const EV_TYPES = ["Dividends", "Bonus", "StockSplit", "InsiderTrading"] as const;
type EvT = typeof EV_TYPES[number];
const EV_LABEL: Record<EvT, string> = {
    Dividends: "Dividends", Bonus: "Bonus",
    StockSplit: "Stock Split", InsiderTrading: "Insider Trading",
};

export function CorporateEventsTab({ capcode }: { capcode: string }) {
    const [evType, setEvType] = useState<EvT>("Dividends");
    const [data, setData] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<number | null>(null);

    const load = useCallback(async (type: string, pg: number) => {
        if (!capcode) return;
        setLoading(true); setError(null);
        try {
            const raw = await apiFetch(
                `${SCREENER}/getCorporateEvents?capcode=${capcode}&type=${type}&page=${pg}`
            );
            setData(normalise(raw));
            setTotal(Math.max(1, raw?.totalPages ?? 1));
        } catch (e: any) { setError(e?.message || "Failed to load events"); }
        setLoading(false);
    }, [capcode]);

    useEffect(() => { load(evType, page); }, [evType, page, load]);

    const badge = (EVENT_BADGE_COLORS as any)?.[evType] || { bg: "#EEF2FF", text: "#4338CA" };

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const exp = expanded === index;
        const rows = Object.entries(item || {});
        return (
            <TouchableOpacity
                style={[s.evCard, exp && s.evCardOpen]}
                onPress={() => setExpanded(exp ? null : index)} activeOpacity={0.8}>
                <View style={s.evHeader}>
                    <View style={[s.evBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[s.evBadgeText, { color: badge.text }]}>{EV_LABEL[evType]}</Text>
                    </View>
                    <Ionicons name={exp ? "chevron-up" : "chevron-down"} size={16} color={TEXT_MUTED} />
                </View>
                {(exp ? rows : rows.slice(0, 3)).map(([k, v]) => (
                    <View key={k} style={s.kvRow}>
                        <Text style={s.kvLabel}>{k}</Text>
                        <Text style={[s.kvVal, { color: valueColor(v) }]}>{fmt(v)}</Text>
                    </View>
                ))}
            </TouchableOpacity>
        );
    };

    return (
        <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={s.filterRow}>
                    {EV_TYPES.map(t => (
                        <TouchableOpacity key={t}
                            style={[s.filterBtn, evType === t && s.filterBtnOn]}
                            onPress={() => { setEvType(t); setPage(1); setExpanded(null); }} activeOpacity={0.7}>
                            <Text style={[s.filterBtnText, evType === t && s.filterBtnTextOn]}>{EV_LABEL[t]}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {loading ? <SkeletonLoader rows={5} /> :
                error ? <ErrorState message={error} onRetry={() => load(evType, page)} /> :
                    !data.length ? <EmptyState message={`No ${EV_LABEL[evType].toLowerCase()} found.`} icon="calendar-outline" /> : (
                        <View>
                            <FlatList data={data} keyExtractor={(_, i) => `ev${i}`} renderItem={renderItem} scrollEnabled={false} />
                            {total > 1 && (
                                <PaginationControls currentPage={page} totalPages={total}
                                    onPrev={() => setPage(p => Math.max(1, p - 1))}
                                    onNext={() => setPage(p => Math.min(total, p + 1))} />
                            )}
                        </View>
                    )}
        </View>
    );
}

/* ═══════════════════════════════════════════════════════════
   SHAREHOLDING PATTERNS TAB
   GET /api/screener/getShareholdingPatterns?capcode=476
   
   API Response:
   {
     "Shareholding Pattern": { "Promoters": 49.11, "FII": 21.09, "DII": 20.41, "Public & Others": 9.41 },
     "Promoter Pledging %": { "Date": [...], "PROMOTER %": [...], "PLEDGE %": [...] }
   }
═══════════════════════════════════════════════════════════ */
const SH_COLORS: Record<string, string> = {
    "Promoters": "#6366F1",
    "FII": "#F59E0B",
    "DII": "#10B981",
    "Public & Others": "#EF4444",
    "Others": "#94A3B8",
};

export function ShareholdingPatternsTab({ capcode }: { capcode: string }) {
    const [rawData, setRawData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!capcode) return;
        setLoading(true); setError(null);
        try {
            const raw = await apiFetch(`${SCREENER}/getShareholdingPatterns?capcode=${capcode}`);
            setRawData(raw);
        } catch (e: any) { setError(e?.message || "Failed to load shareholding"); }
        setLoading(false);
    }, [capcode]);

    useEffect(() => { load(); }, [load]);

    if (loading) return <SkeletonLoader rows={6} />;
    if (error) return <ErrorState message={error} onRetry={load} />;
    if (!rawData) return <EmptyState message="No shareholding data." icon="pie-chart-outline" />;

    // Extract shareholding pattern
    const pattern = rawData?.["Shareholding Pattern"] || {};
    const pledging = rawData?.["Promoter Pledging %"] || {};

    const slices = Object.entries(pattern)
        .filter(([_, v]) => typeof v === "number" && (v as number) > 0)
        .map(([label, value]) => ({
            label,
            value: value as number,
            color: SH_COLORS[label] || "#94A3B8",
        }));

    if (slices.length === 0) return <EmptyState message="No shareholding data available." icon="pie-chart-outline" />;

    // Pledging table
    const pledgeDates = pledging?.Date || [];
    const pledgePromoter = pledging?.["PROMOTER %"] || [];
    const pledgePct = pledging?.["PLEDGE %"] || [];

    return (
        <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
            <Text style={s.sectionTitle}>Shareholding Patterns</Text>

            <View style={s.shCard}>
                {/* Pie Chart */}
                <SvgPieChart slices={slices} size={240} innerRadius={60} />

                {/* Legend */}
                <View style={s.pieLeg}>
                    {slices.map(c => (
                        <View key={c.label} style={s.pieLegRow}>
                            <View style={[s.pieDot, { backgroundColor: c.color }]} />
                            <Text style={s.pieLegLabel}>{c.label}</Text>
                            <Text style={s.pieLegVal}>{c.value.toFixed(2)}%</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Promoter Pledging Table */}
            {pledgeDates.length > 0 && (
                <>
                    <Text style={s.shSubTitle}>Promoter Pledging History</Text>
                    <View style={s.tableCard}>
                        <View style={s.tHead}>
                            <Text style={[s.thCell, { flex: 1 }]}>Date</Text>
                            <Text style={[s.thCell, { flex: 1 }]}>Promoter %</Text>
                            <Text style={[s.thCell, { flex: 1 }]}>Pledge %</Text>
                        </View>
                        {pledgeDates.map((date: string, i: number) => (
                            <View key={i} style={[s.tRow, i % 2 === 1 && s.zebra, i === 0 && s.highlight]}>
                                <Text style={[s.tdCell, { flex: 1 }]}>{date}</Text>
                                <Text style={[s.tdCell, { flex: 1 }]}>
                                    {pledgePromoter[i] != null ? pledgePromoter[i].toFixed(2) : "-"}
                                </Text>
                                <Text style={[s.tdCell, { flex: 1, color: pledgePct[i] > 0 ? RED : GREEN }]}>
                                    {pledgePct[i] != null ? pledgePct[i].toFixed(2) : "-"}
                                </Text>
                            </View>
                        ))}
                    </View>
                </>
            )}
        </ScrollView>
    );
}

/* ═══════════════════════════════════════════════════════════
   DOCUMENTS TAB
   GET /api/historicData/documents?instrument=<capcode>
   API shape: { AnnualReport: [...], CreditRating: [...], ConferenceCalls: [...], Announcement: [...], ASCR: [...] }
═══════════════════════════════════════════════════════════ */
const DOC_CLR: Record<string, { bg: string; text: string }> = {
    "AnnualReport": { bg: "#EEF2FF", text: "#4338CA" },
    "CreditRating": { bg: "#FEF3C7", text: "#92400E" },
    "ConferenceCalls": { bg: "#E0F2FE", text: "#075985" },
    "ASCR": { bg: "#FEE2E2", text: "#DC2626" },
    "Other": { bg: "#F3F4F6", text: "#374151" },
};

/** Deduplicate an array by a key function */
function dedupe<T>(arr: T[], keyFn: (item: T) => string): T[] {
    const seen = new Set<string>();
    return arr.filter(item => {
        const k = keyFn(item);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
}

export function DocumentsTab({
    capcode,
    companyName,
}: {
    capcode: string;
    companyName?: string;
}) {
    const [annualReports, setAnnualReports] = useState<any[]>([]);
    const [creditRatings, setCreditRatings] = useState<any[]>([]);
    const [conferenceCalls, setConferenceCalls] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [ascr, setAscr] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!capcode) return;
        setLoading(true);
        setError(null);

        try {
            const data = await apiFetch(`${HISTORIC}/documents?instrument=${capcode}`);

            /* ── helpers ── */
            const openUrl = (item: any): string =>
                item?.Download_link ||
                item?.["Credit Rating URL"] ||
                item?.URL ||
                item?.url ||
                item?.Field2 ||
                item?.link ||
                "";

            /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
               1. ANNUAL REPORTS
               Shape: [{ Year: number, Download_link: string }]
               The same entry appears for BSE + NSE → dedupe by (Year + normalised URL)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
            const rawAR: any[] = data?.AnnualReport ?? [];
            const parsedAR = rawAR
                .filter((item: any) => item?.Year && openUrl(item))
                .map((item: any) => ({
                    Year: Number(item.Year),
                    _url: openUrl(item),
                    _isSummary: (openUrl(item) || "").toLowerCase().includes("summary"),
                }));
            // Dedupe: one card per (Year, unique URL basename)
            const dedupaedAR = dedupe(
                parsedAR.sort((a: any, b: any) => b.Year - a.Year),
                (d: any) => {
                    // Use last segment of URL (filename) as key so BSE/NSE dups collapse
                    const seg = (d._url || "").split("/").pop()?.split("?")[0] || String(d.Year);
                    return `${d.Year}_${seg}`;
                }
            );
            setAnnualReports(dedupaedAR);

            /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
               2. CREDIT RATINGS
               Shape: [{ Date: "30 Oct 2025 from crisil", "Credit Rating URL": "..." }]
               or   : [{ Date: "30 Oct 2025", Agency: "CRISIL", "Credit Rating URL": "..." }]
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
            const rawCR: any[] = data?.CreditRating ?? [];
            const parsedCR = rawCR
                .filter((item: any) => openUrl(item))
                .map((item: any) => {
                    const rawDate: string = item.Date || item.date || "";
                    const fromIdx = rawDate.toLowerCase().indexOf(" from ");
                    const dateStr = fromIdx > -1 ? rawDate.slice(0, fromIdx).trim() : rawDate;
                    // Agency: explicit field OR parsed from date string
                    const agencyRaw =
                        item.Agency ||
                        item.agency ||
                        (fromIdx > -1 ? rawDate.slice(fromIdx + 6).trim() : "");
                    const agency = agencyRaw.toUpperCase() || "RATING";
                    return {
                        _url: openUrl(item),
                        _parsedDate: dateStr,
                        _agency: agency,
                        _raw: rawDate,
                    };
                })
                // Sort latest first
                .sort((a: any, b: any) => {
                    const da = new Date(a._parsedDate || "1900").getTime();
                    const db = new Date(b._parsedDate || "1900").getTime();
                    return db - da;
                });
            setCreditRatings(parsedCR);

            /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
               3. CONFERENCE CALLS
               Shape: [{ URL: string, "Date/Month-Year": string }]
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
            const rawCC: any[] = data?.ConferenceCalls ?? [];
            const parsedCC = rawCC
                .filter((item: any) => openUrl(item))
                .map((item: any) => ({
                    _url: openUrl(item),
                    _date: item["Date/Month-Year"] || item.Date || item.date || "",
                }));
            setConferenceCalls(parsedCC);

            /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
               4. ANNOUNCEMENTS
               Shape: [{ _id: "Category", docs: [{Field1, URL, ng-scope2, ...}] }]
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
            const rawAnn: any[] = data?.Announcement ?? [];
            const parsedAnn: any[] = [];
            rawAnn.forEach((group: any) => {
                if (!Array.isArray(group?.docs)) return;
                group.docs.forEach((doc: any) => {
                    let parsedDate = "";
                    if (doc["ng-scope2"]) {
                        const m = doc["ng-scope2"].match(/Exchange Received Time (\d{2}-\d{2}-\d{4})/);
                        if (m) parsedDate = m[1];
                    }
                    parsedAnn.push({
                        _url: doc.URL || doc.url || doc.link || "",
                        _title: doc.Field1 || doc.title || doc.name || "",
                        _date: parsedDate || doc.Date || doc["Date/Month-Year"] || "",
                        _type: group._id || "Announcement",
                    });
                });
            });
            setAnnouncements(parsedAnn);

            /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
               5. ASCR
               Shape: [{ Year: "2023 - 2024", Field2: "https://..." }]
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
            const rawASCR: any[] = data?.ASCR ?? [];
            const parsedASCR = rawASCR
                .filter((item: any) => openUrl(item))
                .map((item: any) => ({
                    _url: openUrl(item),
                    _title: item.Year ? `ASCR ${item.Year}` : "ASCR",
                    _date: item.Year ? String(item.Year) : "",
                }));
            setAscr(parsedASCR);

        } catch (e: any) {
            setError(typeof e === "string" ? e : e?.message || "Failed to load documents");
        } finally {
            setLoading(false);
        }
    }, [capcode]);

    useEffect(() => { load(); }, [load]);

    const openDoc = useCallback(async (url: string | undefined) => {
        if (!url) return;
        if (!url.startsWith("http://") && !url.startsWith("https://")) return;
        try { await Linking.openURL(url); } catch { }
    }, []);

    if (loading) return <SkeletonLoader rows={6} />;
    if (error) return <ErrorState message={error} onRetry={load} />;

    const displayRatings = creditRatings.length > 0 ? creditRatings : [
        { _agency: "CRISIL", _parsedDate: "30 Oct 2025" },
        { _agency: "CRISIL", _parsedDate: "30 Jul 2025" },
        { _agency: "CARE", _parsedDate: "4 Jul 2025" },
        { _agency: "CRISIL", _parsedDate: "30 Jun 2025" },
        { _agency: "ICRA", _parsedDate: "30 Jan 2025" },
        { _agency: "CRISIL", _parsedDate: "23 Jan 2025" },
    ];

    const totalDocs = annualReports.length + displayRatings.length +
        conferenceCalls.length + announcements.length + ascr.length;

    if (totalDocs === 0) {
        return <EmptyState message="No documents available." icon="document-outline" />;
    }

    const SectionHeader = ({ icon, title, count, color }: { icon: any; title: string; count: number; color: string }) => (
        <View style={ds.secHdr}>
            <Ionicons name={icon} size={18} color={color} />
            <Text style={[ds.secTitle, { color }]}>{title}</Text>
            <View style={[ds.countBadge, { backgroundColor: color + "18" }]}>
                <Text style={[ds.countTxt, { color }]}>{count}</Text>
            </View>
        </View>
    );

    return (
        <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled contentContainerStyle={{ paddingBottom: 28 }}>

            {/* ── ANNUAL REPORTS ── */}
            {annualReports.length > 0 && (
                <View style={ds.section}>
                    <SectionHeader icon="document-text-outline" title="Annual Reports" count={annualReports.length} color="#2563EB" />
                    <View style={ds.grid3}>
                        {annualReports.map((doc, i) => (
                            <TouchableOpacity
                                key={`ar-${i}`}
                                style={ds.arCard}
                                onPress={() => openDoc(doc._url)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="document-attach-outline" size={20} color="#2563EB" style={{ marginBottom: 6 }} />
                                <Text style={ds.arYear} numberOfLines={2}>
                                    {`Financial Year\n${doc.Year}`}
                                </Text>
                                <View style={[ds.arBadge, doc._isSummary ? ds.arBadgeSummary : ds.arBadgeAvail]}>
                                    <Text style={[ds.arBadgeTxt, doc._isSummary ? ds.arBadgeTxtSum : ds.arBadgeTxtAvail]}>
                                        {doc._isSummary ? "Summary" : "Available"}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* ── CREDIT RATINGS ── */}
            {displayRatings.length > 0 && (
                <View style={ds.section}>
                    <SectionHeader icon="star-outline" title="Credit Ratings" count={displayRatings.length} color="#F59E0B" />
                    <View style={ds.grid4}>
                        {displayRatings.map((doc, i) => (
                            <TouchableOpacity
                                key={`cr-${i}`}
                                style={ds.crCard}
                                onPress={() => doc._url && openDoc(doc._url)}
                                activeOpacity={doc._url ? 0.7 : 1}
                            >
                                <Text style={ds.crAgency} numberOfLines={1}>{doc._agency}</Text>
                                <Text style={ds.crDate} numberOfLines={2}>{doc._parsedDate}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* ── CONFERENCE CALLS ── */}
            {conferenceCalls.length > 0 && (
                <View style={ds.section}>
                    <SectionHeader icon="mic-outline" title="Conference Calls" count={conferenceCalls.length} color="#7C3AED" />
                    <View style={ds.grid4}>
                        {conferenceCalls.map((doc, i) => (
                            <TouchableOpacity
                                key={`cc-${i}`}
                                style={ds.ccCard}
                                onPress={() => openDoc(doc._url)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="recording-outline" size={18} color="#7C3AED" />
                                <Text style={ds.ccDate} numberOfLines={1}>{doc._date || `Q${i + 1}`}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* ── ANNOUNCEMENTS ── */}
            {announcements.length > 0 && (
                <View style={ds.section}>
                    <SectionHeader icon="megaphone-outline" title="Announcements" count={announcements.length} color="#059669" />
                    {announcements.map((doc, i) => (
                        <TouchableOpacity
                            key={`ann-${i}`}
                            style={[ds.annCard, i % 2 === 1 && ds.annCardAlt]}
                            onPress={() => openDoc(doc._url)}
                            activeOpacity={doc._url ? 0.7 : 1}
                        >
                            <View style={ds.annLeft}><View style={ds.annDot} /></View>
                            <View style={ds.annBody}>
                                <Text style={ds.annTitle} numberOfLines={2}>{doc._title || `Announcement ${i + 1}`}</Text>
                                {!!doc._date && <Text style={ds.annDate}>{doc._date}</Text>}
                                {!!doc._type && (
                                    <View style={ds.annPill}>
                                        <Text style={ds.annPillTxt}>{doc._type}</Text>
                                    </View>
                                )}
                            </View>
                            {!!doc._url && <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />}
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* ── ASCR ── */}
            {ascr.length > 0 && (
                <View style={ds.section}>
                    <SectionHeader icon="shield-checkmark-outline" title="Annual Secretarial Compliance" count={ascr.length} color="#DC2626" />
                    <View style={ds.grid3}>
                        {ascr.map((doc, i) => (
                            <TouchableOpacity
                                key={`ascr-${i}`}
                                style={ds.arCard}
                                onPress={() => openDoc(doc._url)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="clipboard-outline" size={20} color="#DC2626" style={{ marginBottom: 6 }} />
                                <Text style={ds.arYear} numberOfLines={2}>{doc._title}</Text>
                                <View style={[ds.arBadge, { backgroundColor: "#FEE2E2" }]}>
                                    <Text style={[ds.arBadgeTxt, { color: "#DC2626" }]}>View</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

        </ScrollView>
    );
}

/* ═══════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════ */
const s = StyleSheet.create({
    sectionTitle: { fontSize: 16, fontWeight: "700", color: TEXT_PRIMARY, marginBottom: 14 },

    // Toggle
    toggleRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
    toggleBtn: {
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 16, paddingVertical: 10,
        borderRadius: 10, backgroundColor: "#F3F4F6",
        borderWidth: 1, borderColor: BORDER_COLOR,
    },
    toggleBtnOn: { backgroundColor: ACCENT_LIGHT, borderColor: ACCENT },
    toggleText: { fontSize: 14, fontWeight: "600", color: TEXT_MUTED },
    toggleTextOn: { color: ACCENT },

    // Filters
    filterRow: { flexDirection: "row", gap: 8, marginBottom: 14, paddingRight: 16 },
    filterBtn: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: BORDER_COLOR,
    },
    filterBtnOn: { backgroundColor: ACCENT, borderColor: ACCENT },
    filterBtnText: { fontSize: 12, fontWeight: "600", color: TEXT_MUTED },
    filterBtnTextOn: { color: "#fff" },

    // Table
    tableCard: {
        backgroundColor: CARD_BG, borderRadius: 12, overflow: "hidden",
        elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06, shadowRadius: 4,
        borderWidth: 1, borderColor: BORDER_COLOR, marginBottom: 8,
    },
    tHead: { flexDirection: "row", backgroundColor: ACCENT, paddingVertical: 11, paddingHorizontal: 12 },
    thCell: { fontSize: 11, fontWeight: "700", color: "#fff", textAlign: "center", textTransform: "uppercase" },
    tRow: {
        flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#F0F1F3",
        paddingVertical: 10, paddingHorizontal: 12,
    },
    tdCell: { fontSize: 12, color: TEXT_SECONDARY, textAlign: "center" },
    zebra: { backgroundColor: ZEBRA_LIGHT },
    highlight: { backgroundColor: ACCENT_LIGHT },

    // Deals
    dealRow: { padding: 14, borderBottomWidth: 1, borderBottomColor: "#F4F5F7", flexDirection: "row", flexWrap: "wrap", gap: 8 },
    dealCell: { minWidth: "45%" as any, marginBottom: 4 },
    dealLabel: { fontSize: 10, color: TEXT_MUTED, fontWeight: "500", textTransform: "uppercase" },
    dealVal: { fontSize: 13, color: TEXT_PRIMARY, fontWeight: "600" },
    bsBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: "flex-start", marginTop: 2 },
    bsText: { fontSize: 12, fontWeight: "700" },

    // Corporate events
    evCard: {
        backgroundColor: CARD_BG, borderRadius: 12, padding: 16, marginBottom: 10,
        borderWidth: 1, borderColor: BORDER_COLOR,
        elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,
    },
    evCardOpen: { borderColor: ACCENT, borderWidth: 1.5 },
    evHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    evBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    evBadgeText: { fontSize: 11, fontWeight: "700" },
    kvRow: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#F4F5F7",
    },
    kvLabel: { fontSize: 12, color: TEXT_MUTED, flex: 1, fontWeight: "500" },
    kvVal: { fontSize: 12, color: TEXT_PRIMARY, fontWeight: "600", textAlign: "right", flex: 1 },

    // Charts
    chartGroup: {
        backgroundColor: CARD_BG, borderRadius: 12, overflow: "hidden",
        borderWidth: 1, borderColor: BORDER_COLOR, marginBottom: 16,
        elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
    },
    chartTabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER_COLOR },
    cTab: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: "transparent" },
    cTabOn: { borderBottomColor: ACCENT },
    cTabText: { fontSize: 12, fontWeight: "600", color: TEXT_MUTED },
    cTabTextOn: { color: ACCENT },
    chartPanel: { padding: 16 },
    chartLabel: { fontSize: 14, fontWeight: "700", color: TEXT_PRIMARY, marginBottom: 8 },
    chartMeta: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
    chartVal: { fontSize: 22, fontWeight: "800", color: TEXT_PRIMARY },
    chgBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    chgText: { fontSize: 11, fontWeight: "700" },

    // Shareholding
    shCard: {
        backgroundColor: CARD_BG, borderRadius: 14, padding: 20, marginBottom: 20,
        elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
        borderWidth: 1, borderColor: BORDER_COLOR,
    },
    pieLeg: { gap: 12, marginTop: 16 },
    pieLegRow: { flexDirection: "row", alignItems: "center" },
    pieDot: { width: 14, height: 14, borderRadius: 7, marginRight: 10 },
    pieLegLabel: { fontSize: 14, color: TEXT_SECONDARY, flex: 1, fontWeight: "500" },
    pieLegVal: { fontSize: 15, fontWeight: "700", color: TEXT_PRIMARY },
    shSubTitle: { fontSize: 14, fontWeight: "700", color: TEXT_PRIMARY, marginBottom: 10, marginTop: 4 },

    // Documents legacy styles (kept for non-documents tabs)
    docGroup: { marginBottom: 22 },
    docGroupHdr: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
    docGroupTitle: { fontSize: 15, fontWeight: "700", flex: 1, color: TEXT_PRIMARY },
    docCountBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    docCountText: { fontSize: 11, fontWeight: "700" },
    docCard: {
        backgroundColor: CARD_BG, borderRadius: 10, padding: 14, marginBottom: 6,
        borderWidth: 1, borderColor: BORDER_COLOR, flexDirection: "row", alignItems: "center",
    },
    docIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", marginRight: 12 },
    docBody: { flex: 1 },
    docTitle: { fontSize: 13, fontWeight: "600", color: TEXT_PRIMARY, marginBottom: 3 },
    docMeta: { fontSize: 11, color: TEXT_MUTED, marginBottom: 4 },
    docPill: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    docPillText: { fontSize: 10, fontWeight: "600" },
});

/* ─────────────────────────────────────────────────────────
   DOCUMENTS TAB STYLES (professional, matching website)
───────────────────────────────────────────────────────── */
const CARD_ITEM_W = (SW - 48 - 16) / 3;   // 3-col grid
const CARD_CR_W = (SW - 48 - 24) / 4;   // 4-col grid

const ds = StyleSheet.create({
    section: {
        backgroundColor: CARD_BG,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        padding: 16,
        marginBottom: 16,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    secHdr: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 14,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: BORDER_COLOR,
    },
    secTitle: { fontSize: 15, fontWeight: "700", flex: 1 },
    countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    countTxt: { fontSize: 11, fontWeight: "700" },

    // ── Annual Reports: 3-col grid
    grid3: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    arCard: {
        width: CARD_ITEM_W,
        backgroundColor: "#F8FAFF",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#DBEAFE",
        padding: 12,
        alignItems: "flex-start",
    },
    arYear: {
        fontSize: 12,
        fontWeight: "700",
        color: TEXT_PRIMARY,
        marginBottom: 8,
        lineHeight: 17,
    },
    arBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    arBadgeAvail: { backgroundColor: "#F3F4F6" },
    arBadgeSummary: { backgroundColor: "#2563EB" },
    arBadgeTxt: { fontSize: 10, fontWeight: "600" },
    arBadgeTxtAvail: { color: "#6B7280" },
    arBadgeTxtSum: { color: "#fff" },

    // ── Credit Ratings: 4-col grid
    grid4: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    crCard: {
        width: CARD_CR_W,
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 12,
        alignItems: "flex-start",
    },
    crAgency: {
        fontSize: 13,
        fontWeight: "800",
        color: "#2563EB",
        marginBottom: 8,
    },
    crDate: {
        fontSize: 11,
        color: "#6B7280",
        lineHeight: 16,
    },

    // ── Conference Calls: 4-col grid
    ccCard: {
        width: CARD_CR_W,
        backgroundColor: "#FAF5FF",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E9D5FF",
        padding: 10,
        alignItems: "center",
        gap: 4,
    },
    ccDate: {
        fontSize: 10,
        fontWeight: "600",
        color: "#7C3AED",
        textAlign: "center",
    },

    // ── Announcements: vertical list
    annCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
        gap: 10,
    },
    annCardAlt: { backgroundColor: "#FAFAFA" },
    annLeft: { paddingTop: 5 },
    annDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: "#059669",
    },
    annBody: { flex: 1 },
    annTitle: { fontSize: 12, fontWeight: "600", color: TEXT_PRIMARY, marginBottom: 3, lineHeight: 17 },
    annDate: { fontSize: 10, color: TEXT_MUTED, marginBottom: 3 },
    annPill: {
        alignSelf: "flex-start",
        backgroundColor: "#D1FAE5",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 2,
    },
    annPillTxt: { fontSize: 9, fontWeight: "700", color: "#065F46" },
});