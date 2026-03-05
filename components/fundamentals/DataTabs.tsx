/**
 * DataTabs.tsx
 * ✅ DocumentsTab — fixed API flow: companycode?instrument=capcode → documents?instrument={code}
 * ✅ BulkBlockDealsTab — fixed date formatting + AbortController cleanup + correct API
 * ✅ CorporateEventsTab — fixed date formatting + totalPages fallback
 * ✅ All tabs use AbortController to prevent state updates on unmounted components
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity,
    FlatList, Dimensions, ScrollView, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
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

/**
 * Resolve the company code from the historic API.
 * The response can be: a number, a string, { code: ... }, { companyCode: ... }, or something else.
 */
function resolveCompanyCode(response: any, fallback: string): string {
    if (response == null) return fallback;
    if (typeof response === "number" || typeof response === "string") return String(response);
    if (response?.code != null) return String(response.code);
    if (response?.companyCode != null) return String(response.companyCode);
    // Some APIs return { instrument: "..." } or { result: "..." }
    if (response?.instrument != null) return String(response.instrument);
    if (response?.result != null) return String(response.result);
    return fallback;
}

// ✅ Fixed date formatter — handles all common API date formats
function formatDate(raw: any): string {
    if (raw == null || raw === "") return "-";
    const s = String(raw).trim();
    if (!s || s === "null" || s === "undefined") return "-";

    // Already formatted like "15 Jan 2024"
    if (/^\d{1,2}\s[A-Za-z]{3}\s\d{4}$/.test(s)) return s;

    // ISO: 2024-01-15 or 2024-01-15T00:00:00Z
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
        try {
            const d = new Date(s);
            if (!isNaN(d.getTime())) {
                return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
            }
        } catch { /* fall through */ }
        return s;
    }

    // DD-MM-YYYY or DD/MM/YYYY
    if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(s)) {
        const [dd, mm, yyyy] = s.split(/[-/]/);
        try {
            const d = new Date(`${yyyy}-${mm}-${dd}`);
            if (!isNaN(d.getTime())) {
                return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
            }
        } catch { /* fall through */ }
        return s;
    }

    // YYYYMMDD
    if (/^\d{8}$/.test(s)) {
        try {
            const d = new Date(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`);
            if (!isNaN(d.getTime())) {
                return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
            }
        } catch { /* fall through */ }
        return s;
    }

    // Just a year like "2024"
    if (/^\d{4}$/.test(s)) return s;

    return s;
}

// Format value — apply date formatting for date-like keys, handle objects safely
function fmtVal(key: string, val: any): string {
    if (val == null) return "-";
    // If value is an object/array, stringify it
    if (typeof val === "object") {
        try { return JSON.stringify(val); } catch { return "-"; }
    }
    const k = key.toLowerCase();
    if (k.includes("date") || k.includes("dt") || k === "on") return formatDate(val);
    return fmt(val);
}

// Helper: try multiple field names for a value (handles API key variants)
function getFieldValue(item: any, fieldNames: string[]): any {
    if (!item) return "-";
    for (const name of fieldNames) {
        if (item[name] !== undefined && item[name] !== null) return item[name];
    }
    return "-";
}

const { width: SW } = Dimensions.get("window");
const CW = SW - 48;
const CH = 200;

/* ═══════════════════════════════════════════════════════════
   SVG LINE CHART
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
    width?: number; height?: number;
    color?: string; areaColor?: string;
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

    const linePath = data
        .map((d, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(d.y).toFixed(1)}`)
        .join(" ");
    const areaPath = `${linePath} L${toX(data.length - 1).toFixed(1)},${(padT + plotH).toFixed(1)} L${toX(0).toFixed(1)},${(padT + plotH).toFixed(1)} Z`;

    const yTicks = 5;
    const yStep = rangeY / yTicks;
    const xTickStep = Math.max(1, Math.floor(data.length / 5));

    const fmtAxis = (v: number) =>
        Math.abs(v) >= 1e7 ? `${(v / 1e7).toFixed(0)}Cr` :
            Math.abs(v) >= 1e5 ? `${(v / 1e5).toFixed(0)}L` :
                Math.abs(v) >= 1e3 ? `${(v / 1e3).toFixed(0)}K` :
                    v % 1 === 0 ? v.toString() : v.toFixed(1);

    return (
        <View style={{ alignItems: "center" }}>
            <Svg width={w} height={h}>
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
                <Path d={areaPath} fill={areaColor} />
                <Path d={linePath} fill="none" stroke={color} strokeWidth={2.5}
                    strokeLinecap="round" strokeLinejoin="round" />
                {data.length <= 20 && data.map((d, i) => (
                    <Circle key={`dot-${i}`} cx={toX(i)} cy={toY(d.y)} r={3}
                        fill="#fff" stroke={color} strokeWidth={2} />
                ))}
                {showLabels && data.map((d, i) => {
                    if (i % xTickStep !== 0 && i !== data.length - 1) return null;
                    return (
                        <SvgText key={`xl-${i}`} x={toX(i)} y={h - 8} fontSize={9}
                            fill={TEXT_MUTED} textAnchor="middle">
                            {d.x.length > 4 ? d.x.slice(-4) : d.x}
                        </SvgText>
                    );
                })}
                <Line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke={BORDER_COLOR} strokeWidth={1} />
                <Line x1={padL} y1={padT + plotH} x2={w - padR} y2={padT + plotH} stroke={BORDER_COLOR} strokeWidth={1} />
            </Svg>
        </View>
    );
}

/* ═══════════════════════════════════════════════════════════
   SVG PIE CHART
═══════════════════════════════════════════════════════════ */
function SvgPieChart({ slices, size = 220, innerRadius = 55 }: {
    slices: { label: string; value: number; color: string }[];
    size?: number; innerRadius?: number;
}) {
    const total = slices.reduce((a, s) => a + s.value, 0);
    if (total <= 0) return null;
    const cx = size / 2, cy = size / 2, r = (size / 2) - 10;
    let currentAngle = -Math.PI / 2;

    const arcPaths = slices.map((slice) => {
        const angle = (slice.value / total) * Math.PI * 2;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;
        const largeArc = angle > Math.PI ? 1 : 0;
        const x1 = cx + r * Math.cos(startAngle); const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle); const y2 = cy + r * Math.sin(endAngle);
        const ix1 = cx + innerRadius * Math.cos(startAngle); const iy1 = cy + innerRadius * Math.sin(startAngle);
        const ix2 = cx + innerRadius * Math.cos(endAngle); const iy2 = cy + innerRadius * Math.sin(endAngle);
        const d = [`M ${x1} ${y1}`, `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
        `L ${ix2} ${iy2}`, `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`, `Z`].join(" ");
        const midAngle = startAngle + angle / 2;
        const labelR = (r + innerRadius) / 2;
        return {
            ...slice, d, lx: cx + labelR * Math.cos(midAngle), ly: cy + labelR * Math.sin(midAngle),
            pct: ((slice.value / total) * 100).toFixed(1)
        };
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

export function ChartsTab({ capcode, companyName, stockType }: {
    capcode: string; companyName: string; stockType: "C" | "S";
}) {
    const [plData, setPlData] = useState<any>(null);
    const [bsData, setBsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selVal, setSelVal] = useState(0);
    const [selRatio, setSelRatio] = useState(0);
    const abortRef = useRef<AbortController | null>(null);

    const load = useCallback(async () => {
        if (!capcode) return;
        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        setLoading(true); setError(null);
        try {
            const q = `capcode=${capcode}&type=${stockType}`;
            const [pl, bs] = await Promise.all([
                apiFetch(`${SCREENER}/getProfitLoss?${q}`, ctrl.signal).catch(() => null),
                apiFetch(`${SCREENER}/getBalanceSheet?${q}`, ctrl.signal).catch(() => null),
            ]);
            if (!ctrl.signal.aborted) {
                setPlData(pl); setBsData(bs);
            }
        } catch (e: any) {
            if (e?.name !== "AbortError") setError(e?.message || "Failed to load chart data");
        }
        if (!ctrl.signal.aborted) setLoading(false);
    }, [capcode, stockType]);

    useEffect(() => { load(); return () => abortRef.current?.abort(); }, [load]);

    const buildSeries = useCallback((key: string, source: string) => {
        const response = source === "pl" ? plData : bsData;
        if (!response?.results) return [];
        const periods = getPeriodKeys(response);
        return periods.map(p => {
            const data = getSectionDataForPeriod(response, p);
            const val = data?.[key];
            return { x: p, y: typeof val === "number" ? val : parseFloat(String(val || "")) };
        }).filter(d => !isNaN(d.y)).reverse();
    }, [plData, bsData]);

    if (loading) return <SkeletonLoader rows={8} />;
    if (error) return <ErrorState message={error} onRetry={load} />;
    if (!plData && !bsData) return <EmptyState message="No chart data available." icon="bar-chart-outline" />;

    const renderChart = (metric: typeof VAL_METRICS[number] | typeof RATIO_METRICS[number]) => {
        const pts = buildSeries(metric.key, metric.source);
        if (!pts.length) return <EmptyState message={`No ${metric.label} data.`} icon="bar-chart-outline" />;
        const vals = pts.map(p => p.y);
        const latest = vals[vals.length - 1]; const first = vals[0];
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
                <SvgLineChart data={pts} color={up ? GREEN : RED}
                    areaColor={up ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)"} />
            </View>
        );
    };

    return (
        <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
            <View style={s.chartGroup}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={s.chartTabs}>
                        {VAL_METRICS.map((m, i) => (
                            <TouchableOpacity key={m.key} style={[s.cTab, selVal === i && s.cTabOn]}
                                onPress={() => setSelVal(i)} activeOpacity={0.7}>
                                <Text style={[s.cTabText, selVal === i && s.cTabTextOn]}>{m.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
                {renderChart(VAL_METRICS[selVal])}
            </View>
            <View style={s.chartGroup}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={s.chartTabs}>
                        {RATIO_METRICS.map((m, i) => (
                            <TouchableOpacity key={m.key} style={[s.cTab, selRatio === i && s.cTabOn]}
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
   ✅ Correct API: screener/getBulkBlockDeals?capcode=X&type=Bulk&page=1
   ✅ Server-side pagination with pages from API response
   ✅ AbortController for cleanup
═══════════════════════════════════════════════════════════ */
export function BulkBlockDealsTab({ capcode, stockType = "C" }: { capcode: string; stockType?: "C" | "S" }) {
    const [dtype, setDtype] = useState<"Bulk" | "Block">("Bulk");
    const [data, setData] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<number | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const load = useCallback(async (type: string, pg: number) => {
        if (!capcode) return;
        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;

        setLoading(true); setError(null);
        try {
            const raw = await apiFetch(
                `${SCREENER}/getBulkBlockDeals?capcode=${capcode}&type=${type}&page=${pg}`,
                ctrl.signal
            );
            if (!ctrl.signal.aborted) {
                setData(normalise(raw));
                const pages = raw?.pages ?? raw?.totalPages ?? raw?.total_pages ?? 1;
                setTotalPages(Math.max(1, pages));
            }
        } catch (e: any) {
            if (e?.name === "AbortError") return;
            if (!ctrl.signal.aborted) setError(e?.message || "Failed to load deals");
        }
        if (!ctrl.signal.aborted) setLoading(false);
    }, [capcode]);

    useEffect(() => { load(dtype, page); return () => abortRef.current?.abort(); }, [dtype, page, load]);

    const badge = dtype === "Bulk"
        ? { bg: "#EEF2FF", text: "#4338CA" }
        : { bg: "#FEF3C7", text: "#92400E" };

    const HIDDEN_HEADERS = ["Company Name", "Capitaline Code", "_id", "Serial No", "__v"];

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const exp = expanded === index;

        const rows = Object.entries(item || {}).filter(
            ([k]) => !HIDDEN_HEADERS.includes(k) && !k.startsWith("_")
        );

        return (
            <TouchableOpacity
                style={[s.evCard, exp && s.evCardOpen]}
                onPress={() => setExpanded(exp ? null : index)}
                activeOpacity={0.8}
            >
                <View style={s.evHeader}>
                    <View style={[s.evBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[s.evBadgeText, { color: badge.text }]}>{dtype} Deal</Text>
                    </View>
                    <Ionicons name={exp ? "chevron-up" : "chevron-down"} size={16} color={TEXT_MUTED} />
                </View>
                {(exp ? rows : rows.slice(0, 3)).map(([k, v]) => {
                    const colL = k.toLowerCase();
                    const isTx = colL.includes("type") || colL.includes("activity") ||
                        colL.includes("buy") || colL.includes("sell") || colL.includes("trans");
                    const displayVal = fmtVal(k, v);
                    const isBuy = isTx && String(v ?? "").toLowerCase().includes("buy");
                    const isSell = isTx && String(v ?? "").toLowerCase().includes("sell");
                    return (
                        <View key={k} style={s.kvRow}>
                            <Text style={s.kvLabel}>{k}</Text>
                            {isTx && (isBuy || isSell) ? (
                                <View style={[s.bsBadge, { backgroundColor: isBuy ? "#DCFCE7" : "#FEE2E2" }]}>
                                    <Text style={[s.bsText, { color: isBuy ? GREEN : RED }]}>{displayVal}</Text>
                                </View>
                            ) : (
                                <Text style={[s.kvVal, { color: valueColor(v) }]}>{displayVal}</Text>
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
                        onPress={() => { setDtype(t); setPage(1); setExpanded(null); }}
                        activeOpacity={0.7}>
                        <Ionicons name={t === "Bulk" ? "layers-outline" : "cube-outline"} size={15}
                            color={dtype === t ? ACCENT : TEXT_MUTED} style={{ marginRight: 6 }} />
                        <Text style={[s.toggleText, dtype === t && s.toggleTextOn]}>{t} Deals</Text>
                    </TouchableOpacity>
                ))}
            </View>
            {loading ? <SkeletonLoader rows={5} />
                : error ? <ErrorState message={error} onRetry={() => load(dtype, page)} />
                    : !data.length ? <EmptyState message={`No ${dtype.toLowerCase()} deals found.`} icon="albums-outline" />
                        : (
                            <View>
                                <FlatList data={data} keyExtractor={(_, i) => `d-${dtype}-${page}-${i}`}
                                    renderItem={renderItem} scrollEnabled={false} />
                                {totalPages > 1 && (
                                    <PaginationControls currentPage={page} totalPages={totalPages}
                                        onPrev={() => { setPage(p => Math.max(1, p - 1)); setExpanded(null); }}
                                        onNext={() => { setPage(p => Math.min(totalPages, p + 1)); setExpanded(null); }} />
                                )}
                            </View>
                        )}
        </View>
    );
}

/* ═══════════════════════════════════════════════════════════
   CORPORATE EVENTS TAB
   ✅ Fixed: date formatting + totalPages fallback + AbortController
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
    const abortRef = useRef<AbortController | null>(null);

    const load = useCallback(async (type: string, pg: number) => {
        if (!capcode) return;
        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;

        setLoading(true); setError(null);
        try {
            const raw = await apiFetch(
                `${SCREENER}/getCorporateEvents?capcode=${capcode}&type=${type}&page=${pg}`,
                ctrl.signal
            );
            if (!ctrl.signal.aborted) {
                setData(normalise(raw));
                const pages = raw?.pages ?? raw?.totalPages ?? raw?.total_pages ??
                    (raw?.total ? Math.ceil(raw.total / 10) : 1);
                setTotal(Math.max(1, pages));
            }
        } catch (e: any) {
            if (e?.name === "AbortError") return;
            if (!ctrl.signal.aborted) setError(e?.message || "Failed to load events");
        }
        if (!ctrl.signal.aborted) setLoading(false);
    }, [capcode]);

    useEffect(() => { load(evType, page); return () => abortRef.current?.abort(); }, [evType, page, load]);

    const badge = (EVENT_BADGE_COLORS as any)?.[evType] || { bg: "#EEF2FF", text: "#4338CA" };

    const renderKV = (label: string, value: any, opts?: { isDate?: boolean; isPrice?: boolean }) => (
        <View key={label} style={s.kvRow}>
            <Text style={s.kvLabel}>{label}</Text>
            <Text style={[s.kvVal, opts?.isPrice ? { color: GREEN } : { color: valueColor(value) }]}>
                {value === "-" ? "-" : opts?.isPrice ? `₹${fmt(value)}` : opts?.isDate ? formatDate(value) : fmt(value)}
            </Text>
        </View>
    );

    const renderTxBadge = (label: string, value: string) => {
        const isBuy = String(value).toLowerCase().includes("buy");
        return (
            <View key={label} style={s.kvRow}>
                <Text style={s.kvLabel}>{label}</Text>
                <View style={[s.bsBadge, { backgroundColor: isBuy ? "#DCFCE7" : "#FEE2E2" }]}>
                    <Text style={[s.bsText, { color: isBuy ? GREEN : RED }]}>{value || "-"}</Text>
                </View>
            </View>
        );
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const exp = expanded === index;

        // Header text per type
        let headerText = "";
        if (evType === "InsiderTrading") {
            headerText = String(getFieldValue(item, ["Buyer/Seller", "Name", "Acquirer/Seller", "Person Name"]));
        } else if (evType === "Dividends") {
            headerText = formatDate(getFieldValue(item, ["Ex Dividend Date"]));
        } else {
            headerText = formatDate(getFieldValue(item, ["Source Date", "SourceDate", "Date"]));
        }

        const isExpandable = evType === "InsiderTrading";

        const renderFields = () => {
            switch (evType) {
                case "Dividends":
                    return (
                        <>
                            {renderKV("Ex-Date", getFieldValue(item, ["Ex Dividend Date"]), { isDate: true })}
                            {renderKV("Security Type", getFieldValue(item, ["Security Type", "SecurityType"]))}
                            {renderKV("Type", getFieldValue(item, ["Type", "Dividend Type", "DividendType"]))}
                            {renderKV("Dividend %", getFieldValue(item, ["Dividend %", "Dividend Percentage", "DividendPercentage"]))}
                            {renderKV("Dividend Per Share", getFieldValue(item, ["Dividend Per Share", "DividendPerShare", "Amount"]), { isPrice: true })}
                        </>
                    );
                case "Bonus":
                    return (
                        <>
                            {renderKV("Ex-Date", getFieldValue(item, ["Ex Bonus Date", "ExBonusDate", "Ex-Date"]), { isDate: true })}
                            {renderKV("Record Date", getFieldValue(item, ["Record Date", "RecordDate"]), { isDate: true })}
                            {renderKV("Ratio", getFieldValue(item, ["Ratio", "Bonus Ratio", "BonusRatio"]))}
                        </>
                    );
                case "StockSplit":
                    return (
                        <>
                            {renderKV("Stock Split Date", getFieldValue(item, ["Stock Split Date", "StockSplitDate", "Split Date"]), { isDate: true })}
                            {renderKV("Record Date", getFieldValue(item, ["Record Date", "RecordDate"]), { isDate: true })}
                            {renderKV("Ratio", getFieldValue(item, ["Ratio", "Split Ratio", "SplitRatio"]))}
                        </>
                    );
                case "InsiderTrading": {
                    const txVal = String(getFieldValue(item, ["Transaction Type", "Type", "Buy/Sale"]) ?? "");
                    if (!exp) {
                        return (
                            <>
                                {renderKV("Trade Date", getFieldValue(item, ["Trade Date", "TradeDate", "Date", "Transaction Date"]), { isDate: true })}
                                {renderTxBadge("Transaction Type", txVal)}
                                {renderKV("Total Value", getFieldValue(item, ["Total Value", "Value", "Transaction Value"]), { isPrice: true })}
                            </>
                        );
                    }
                    return (
                        <>
                            {renderKV("Trade Date", getFieldValue(item, ["Trade Date", "TradeDate", "Date", "Transaction Date"]), { isDate: true })}
                            {renderKV("Category", getFieldValue(item, ["Category", "Category of person", "Person Category"]))}
                            {renderKV("Prior Quantity", getFieldValue(item, ["Prior trade Quantity", "Prior Quantity", "Pre-Transaction Quantity"]))}
                            {renderKV("Prior %", getFieldValue(item, ["Prior trade %", "Prior Percentage", "Pre-Transaction %"]))}
                            {renderTxBadge("Transaction Type", txVal)}
                            {renderKV("Total Value", getFieldValue(item, ["Total Value", "Value", "Transaction Value"]), { isPrice: true })}
                            {renderKV("Post Quantity", getFieldValue(item, ["Post trade Quantity", "Post Quantity", "Post-Transaction Quantity"]))}
                            {renderKV("Post %", getFieldValue(item, ["Post trade %", "Post Percentage", "Post-Transaction %"]))}
                        </>
                    );
                }
                default:
                    return null;
            }
        };

        return (
            <TouchableOpacity
                style={[s.evCard, isExpandable && exp && s.evCardOpen]}
                onPress={isExpandable ? () => setExpanded(exp ? null : index) : undefined}
                activeOpacity={isExpandable ? 0.8 : 1}
            >
                <View style={s.evHeader}>
                    <View style={[s.evBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[s.evBadgeText, { color: badge.text }]}>{EV_LABEL[evType]}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        {headerText && headerText !== "-" && (
                            <Text style={{ fontSize: 11, color: TEXT_MUTED }}>{headerText}</Text>
                        )}
                        {isExpandable && (
                            <Ionicons name={exp ? "chevron-up" : "chevron-down"} size={16} color={TEXT_MUTED} />
                        )}
                    </View>
                </View>
                {renderFields()}
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
                            onPress={() => { setEvType(t); setPage(1); setExpanded(null); }}
                            activeOpacity={0.7}>
                            <Text style={[s.filterBtnText, evType === t && s.filterBtnTextOn]}>
                                {EV_LABEL[t]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
            {loading ? <SkeletonLoader rows={5} />
                : error ? <ErrorState message={error} onRetry={() => load(evType, page)} />
                    : !data.length ? <EmptyState message={`No ${EV_LABEL[evType].toLowerCase()} found.`} icon="calendar-outline" />
                        : (
                            <View>
                                <FlatList data={data} keyExtractor={(_, i) => `ev-${evType}-${page}-${i}`}
                                    renderItem={renderItem} scrollEnabled={false} />
                                {total > 1 && (
                                    <PaginationControls currentPage={page} totalPages={total}
                                        onPrev={() => { setPage(p => Math.max(1, p - 1)); setExpanded(null); }}
                                        onNext={() => { setPage(p => Math.min(total, p + 1)); setExpanded(null); }} />
                                )}
                            </View>
                        )}
        </View>
    );
}

/* ═══════════════════════════════════════════════════════════
   SHAREHOLDING PATTERNS TAB
═══════════════════════════════════════════════════════════ */
const SH_COLORS: Record<string, string> = {
    "Promoters": "#6366F1", "FII": "#F59E0B",
    "DII": "#10B981", "Public & Others": "#EF4444", "Others": "#94A3B8",
};

export function ShareholdingPatternsTab({ capcode }: { capcode: string }) {
    const [rawData, setRawData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const load = useCallback(async () => {
        if (!capcode) return;
        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;

        setLoading(true); setError(null);
        try {
            const raw = await apiFetch(
                `${SCREENER}/getShareholdingPatterns?capcode=${capcode}`,
                ctrl.signal
            );
            if (!ctrl.signal.aborted) setRawData(raw);
        } catch (e: any) {
            if (e?.name === "AbortError") return;
            if (!ctrl.signal.aborted) setError(e?.message || "Failed to load shareholding");
        }
        if (!ctrl.signal.aborted) setLoading(false);
    }, [capcode]);

    useEffect(() => { load(); return () => abortRef.current?.abort(); }, [load]);

    if (loading) return <SkeletonLoader rows={6} />;
    if (error) return <ErrorState message={error} onRetry={load} />;
    if (!rawData) return <EmptyState message="No shareholding data." icon="pie-chart-outline" />;

    const pattern = rawData?.["Shareholding Pattern"] || {};
    const pledging = rawData?.["Promoter Pledging %"] || {};
    const slices = Object.entries(pattern)
        .filter(([_, v]) => typeof v === "number" && (v as number) > 0)
        .map(([label, value]) => ({ label, value: value as number, color: SH_COLORS[label] || "#94A3B8" }));

    if (!slices.length) return <EmptyState message="No shareholding data available." icon="pie-chart-outline" />;

    const pledgeDates = pledging?.Date || [];
    const pledgePromoter = pledging?.["PROMOTER %"] || [];
    const pledgePct = pledging?.["PLEDGE %"] || [];

    return (
        <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
            <Text style={s.sectionTitle}>Shareholding Patterns</Text>
            <View style={s.shCard}>
                <SvgPieChart slices={slices} size={240} innerRadius={60} />
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
                                <Text style={[s.tdCell, { flex: 1 }]}>{formatDate(date)}</Text>
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
   ✅ Fixed API flow:
   Step 1: GET companycode?instrument={capcode}  → gets BSE company code
   Step 2: GET documents?instrument={companyCode} → gets documents
   ✅ AbortController for cleanup
═══════════════════════════════════════════════════════════ */
const DOC_CLR: Record<string, { bg: string; text: string }> = {
    "Annual Reports": { bg: "#EEF2FF", text: "#4338CA" },
    "Credit Rating": { bg: "#FEF3C7", text: "#92400E" },
    "Compliance Report": { bg: "#DCFCE7", text: "#166534" },
    "Concall Transcripts": { bg: "#E0F2FE", text: "#075985" },
    "Investor Presentations": { bg: "#FCE7F3", text: "#9D174D" },
    "Other": { bg: "#F3F4F6", text: "#374151" },
};

// ─── Document category config ───────────────────────────
// ✅ Announcements removed (not on website)
// ✅ Annual Reports sorted year descending, deduplicated
const DOC_CATEGORY_CONFIG: Record<string, {
    label: string;
    color: { bg: string; text: string };
    getItems: (data: any) => { title: string; url: string; date: string }[];
}> = {
    AnnualReport: {
        label: "Annual Reports",
        color: { bg: "#EEF2FF", text: "#4338CA" },
        getItems: (arr: any[]) => {
            const seen = new Set<string>();
            return arr
                .filter(d => {
                    const k = d.Download_link || "";
                    if (!k || seen.has(k)) return false;
                    seen.add(k);
                    return true;
                })
                .sort((a, b) => (Number(b.Year) || 0) - (Number(a.Year) || 0))
                .map(d => ({
                    title: `Financial Year ${d.Year || ""}`,
                    url: d.Download_link || "",
                    date: String(d.Year || ""),
                }));
        },
    },
    ConferenceCalls: {
        label: "Conference Calls",
        color: { bg: "#E0F2FE", text: "#075985" },
        getItems: (arr: any[]) =>
            arr.map((d) => ({
                title: "Investor Meet - Outcome",
                url: d.URL || "",
                date: d["Date/Month-Year"] || "",
            })),
    },
    CreditRating: {
        label: "Credit Ratings",
        color: { bg: "#FEF3C7", text: "#92400E" },
        getItems: (arr: any[]) =>
            arr.map(d => {
                const match = (d.Date || "").match(/from\s+(\w+)/i);
                const agency = match ? match[1].toUpperCase() : "Rating";
                const dateStr = (d.Date || "").replace(/\s+from\s+\w+/i, "").trim();
                return {
                    title: agency,
                    url: d["Credit Rating URL"] || "",
                    date: dateStr,
                };
            }),
    },
};

export function DocumentsTab({ capcode, companyName }: {
    capcode: string; companyName?: string;
}) {
    const [grouped, setGrouped] = useState<Record<string, { title: string; url: string; date: string }[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const load = useCallback(async () => {
        if (!capcode) return;
        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;

        setLoading(true); setError(null);

        try {
            // Step 1: Resolve company code
            let companyCode = capcode;
            try {
                const co = await apiFetch(`${HISTORIC}/companycode?instrument=${capcode}`, ctrl.signal);
                companyCode = resolveCompanyCode(co, capcode);
            } catch (e: any) {
                if (e?.name === "AbortError") throw e;
            }

            // Step 2: Fetch documents
            const raw = await apiFetch(`${HISTORIC}/documents?instrument=${companyCode}`, ctrl.signal);

            // Step 3: Parse the categorised response
            const result: Record<string, { title: string; url: string; date: string }[]> = {};

            for (const [key, config] of Object.entries(DOC_CATEGORY_CONFIG)) {
                const arr = raw?.[key];
                if (Array.isArray(arr) && arr.length > 0) {
                    try {
                        result[key] = config.getItems(arr);
                    } catch (e) {
                        console.warn(`[DocumentsTab] failed to parse ${key}:`, e);
                    }
                }
            }

            if (!ctrl.signal.aborted) setGrouped(result);
        } catch (e: any) {
            if (e?.name === "AbortError") return;
            console.error("[DocumentsTab] error:", e);
            if (!ctrl.signal.aborted) setError(e?.message || "Failed to load documents");
        }
        if (!ctrl.signal.aborted) setLoading(false);
    }, [capcode]);

    useEffect(() => { load(); return () => abortRef.current?.abort(); }, [load]);

    const openDoc = useCallback(async (url: string) => {
        if (!url || url === "#N/A") return;
        try {
            const result = await WebBrowser.openBrowserAsync(url);
            if (result.type === "cancel") return;
        } catch {
            try { await Linking.openURL(url); } catch (e) { console.warn("Cannot open URL:", url, e); }
        }
    }, []);

    if (loading) return <SkeletonLoader rows={6} />;
    if (error) return <ErrorState message={error} onRetry={load} />;
    if (!Object.keys(grouped).length) return (
        <EmptyState message="No documents available for this company." icon="document-outline" />
    );

    return (
        <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
            <Text style={s.sectionTitle}>Company Documents</Text>
            {Object.entries(grouped).map(([key, items]) => {
                const config = DOC_CATEGORY_CONFIG[key];
                const clr = config?.color || DOC_CLR["Other"];
                const label = config?.label || key;

                return (
                    <View key={key} style={s.docGroup}>
                        <View style={s.docGroupHdr}>
                            <Ionicons name="document-text-outline" size={17} color={clr.text} />
                            <Text style={[s.docGroupTitle, { color: clr.text }]}>{label}</Text>
                            <View style={[s.docCountBadge, { backgroundColor: clr.bg }]}>
                                <Text style={[s.docCountText, { color: clr.text }]}>{items.length}</Text>
                            </View>
                        </View>

                        {items.map((doc, i) => (
                            <TouchableOpacity
                                key={`${key}-${i}`}
                                style={[s.docCard, i % 2 === 1 && s.zebra]}
                                onPress={() => doc.url && openDoc(doc.url)}
                                activeOpacity={doc.url ? 0.7 : 1}
                            >
                                <View style={[s.docIcon, { backgroundColor: clr.bg }]}>
                                    <Ionicons name="document-text-outline" size={18} color={clr.text} />
                                </View>
                                <View style={s.docBody}>
                                    <Text style={s.docTitle} numberOfLines={2}>{doc.title}</Text>
                                    {!!doc.date && (
                                        <Text style={s.docMeta}>{formatDate(doc.date)}</Text>
                                    )}
                                    <View style={[s.docPill, { backgroundColor: clr.bg }]}>
                                        <Text style={[s.docPillText, { color: clr.text }]}>{label}</Text>
                                    </View>
                                </View>
                                {!!doc.url && (
                                    <Ionicons name="chevron-forward" size={18} color={ACCENT} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                );
            })}
        </ScrollView>
    );
}

/* ═══════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════ */
const s = StyleSheet.create({
    sectionTitle: { fontSize: 16, fontWeight: "700", color: TEXT_PRIMARY, marginBottom: 14 },
    toggleRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
    toggleBtn: {
        flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10,
        borderRadius: 10, backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: BORDER_COLOR
    },
    toggleBtnOn: { backgroundColor: ACCENT_LIGHT, borderColor: ACCENT },
    toggleText: { fontSize: 14, fontWeight: "600", color: TEXT_MUTED },
    toggleTextOn: { color: ACCENT },
    filterRow: { flexDirection: "row", gap: 8, marginBottom: 14, paddingRight: 16 },
    filterBtn: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: BORDER_COLOR
    },
    filterBtnOn: { backgroundColor: ACCENT, borderColor: ACCENT },
    filterBtnText: { fontSize: 12, fontWeight: "600", color: TEXT_MUTED },
    filterBtnTextOn: { color: "#fff" },
    tableCard: {
        backgroundColor: CARD_BG, borderRadius: 12, overflow: "hidden",
        elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06, shadowRadius: 4, borderWidth: 1, borderColor: BORDER_COLOR, marginBottom: 8
    },
    tHead: { flexDirection: "row", backgroundColor: ACCENT, paddingVertical: 11, paddingHorizontal: 12 },
    thCell: { fontSize: 11, fontWeight: "700", color: "#fff", textAlign: "center", textTransform: "uppercase" },
    tRow: {
        flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#F0F1F3",
        paddingVertical: 10, paddingHorizontal: 12
    },
    tdCell: { fontSize: 12, color: TEXT_SECONDARY, textAlign: "center" },
    zebra: { backgroundColor: ZEBRA_LIGHT },
    highlight: { backgroundColor: ACCENT_LIGHT },
    bsBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: "flex-start", marginTop: 2 },
    bsText: { fontSize: 12, fontWeight: "700" },
    evCard: {
        backgroundColor: CARD_BG, borderRadius: 12, padding: 16, marginBottom: 10,
        borderWidth: 1, borderColor: BORDER_COLOR,
        elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04, shadowRadius: 3
    },
    evCardOpen: { borderColor: ACCENT, borderWidth: 1.5 },
    evHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    evBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    evBadgeText: { fontSize: 11, fontWeight: "700" },
    kvRow: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#F4F5F7"
    },
    kvLabel: { fontSize: 12, color: TEXT_MUTED, flex: 1, fontWeight: "500" },
    kvVal: { fontSize: 12, color: TEXT_PRIMARY, fontWeight: "600", textAlign: "right", flex: 1 },
    chartGroup: {
        backgroundColor: CARD_BG, borderRadius: 12, overflow: "hidden",
        borderWidth: 1, borderColor: BORDER_COLOR, marginBottom: 16,
        elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 3
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
    shCard: {
        backgroundColor: CARD_BG, borderRadius: 14, padding: 20, marginBottom: 20,
        elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06, shadowRadius: 4, borderWidth: 1, borderColor: BORDER_COLOR
    },
    pieLeg: { gap: 12, marginTop: 16 },
    pieLegRow: { flexDirection: "row", alignItems: "center" },
    pieDot: { width: 14, height: 14, borderRadius: 7, marginRight: 10 },
    pieLegLabel: { fontSize: 14, color: TEXT_SECONDARY, flex: 1, fontWeight: "500" },
    pieLegVal: { fontSize: 15, fontWeight: "700", color: TEXT_PRIMARY },
    shSubTitle: { fontSize: 14, fontWeight: "700", color: TEXT_PRIMARY, marginBottom: 10, marginTop: 4 },
    docGroup: { marginBottom: 22 },
    docGroupHdr: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
    docGroupTitle: { fontSize: 15, fontWeight: "700", flex: 1 },
    docCountBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    docCountText: { fontSize: 11, fontWeight: "700" },
    docCard: {
        backgroundColor: CARD_BG, borderRadius: 10, padding: 14, marginBottom: 6,
        borderWidth: 1, borderColor: BORDER_COLOR, flexDirection: "row", alignItems: "center"
    },
    docIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", marginRight: 12 },
    docBody: { flex: 1 },
    docTitle: { fontSize: 13, fontWeight: "600", color: TEXT_PRIMARY, marginBottom: 3 },
    docMeta: { fontSize: 11, color: TEXT_MUTED, marginBottom: 4 },
    docPill: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    docPillText: { fontSize: 10, fontWeight: "600" },
});