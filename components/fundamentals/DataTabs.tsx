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
import { fmt } from "./constants";
import { getSectionDataForPeriod, getPeriodKeys } from "../../hooks/useFundamentalData";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

// Theme-aware value color: green for positive, red for negative, primary text otherwise.
const themedValueColor = (c: AppColors, val: any): string => {
    if (val === undefined || val === null) return c.text;
    const num = typeof val === "number" ? val : parseFloat(val);
    if (isNaN(num)) return c.text;
    if (num > 0) return c.profit;
    if (num < 0) return c.loss;
    return c.text;
};

// Theme-aware shareholding pie palette (keyed to labels the API returns).
const shColors = (c: AppColors): Record<string, string> => ({
    "Promoters": c.gold, "FII": c.warning,
    "DII": c.success, "Public & Others": c.loss, "Others": c.textMuted,
});

// Theme-aware event badge palette.
const eventBadgeColors = (c: AppColors): Record<string, { bg: string; text: string }> => ({
    Dividends: { bg: c.successLight, text: c.success },
    Bonus: { bg: c.warningLight, text: c.warning },
    StockSplit: { bg: c.goldLight, text: c.gold },
    InsiderTrading: { bg: c.errorLight, text: c.loss },
    default: { bg: c.surfaceElevated, text: c.textSecondary },
});

// Theme-aware document category badge palette (keyed by DOC_CATEGORY_CONFIG key).
const docColors = (c: AppColors): Record<string, { bg: string; text: string }> => ({
    AnnualReport: { bg: c.goldLight, text: c.gold },
    ConferenceCalls: { bg: c.goldLight, text: c.gold },
    CreditRating: { bg: c.warningLight, text: c.warning },
    Other: { bg: c.surfaceElevated, text: c.textSecondary },
});

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

/** Month name → 0-based index (Hermes-safe, no reliance on new Date(string)) */
const MONTH_MAP: Record<string, number> = {
    jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
    apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
    aug: 7, august: 7, sep: 8, september: 8, oct: 9, october: 9,
    nov: 10, november: 10, dec: 11, december: 11,
};

/** Parse any date format the API returns into a timestamp for sorting.
 *  Hermes-safe: does NOT rely on new Date(string) for non-ISO formats. */
function parseDate(raw: any): number {
    if (raw == null || raw === "" || raw === "-") return 0;
    const s = String(raw).trim();
    if (!s || s === "null" || s === "undefined") return 0;

    // ISO: 2024-01-15 or 2024-01-15T00:00:00Z  (Hermes supports ISO fine)
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
        const t = new Date(s).getTime();
        return isNaN(t) ? 0 : t;
    }

    // DD-MM-YYYY or DD/MM/YYYY (all numeric)
    const ddmmyyyy = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (ddmmyyyy) {
        const t = new Date(+ddmmyyyy[3], +ddmmyyyy[2] - 1, +ddmmyyyy[1]).getTime();
        return isNaN(t) ? 0 : t;
    }

    // YYYYMMDD
    if (/^\d{8}$/.test(s)) {
        const t = new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8)).getTime();
        return isNaN(t) ? 0 : t;
    }

    // "15 Jan 2024" or "15-Jan-2024" or "15/Jan/2024" (DD Mon YYYY)
    const dmy = s.match(/^(\d{1,2})[\s\-/]+([A-Za-z]+)[\s\-/]+(\d{4})$/);
    if (dmy) {
        const m = MONTH_MAP[dmy[2].toLowerCase()];
        if (m !== undefined) return new Date(+dmy[3], m, +dmy[1]).getTime();
    }

    // "Jan 15, 2024" or "January 15 2024" (Mon DD, YYYY)
    const mdy = s.match(/^([A-Za-z]+)[\s\-/]+(\d{1,2})[,\s]*[\s\-/]+(\d{4})$/);
    if (mdy) {
        const m = MONTH_MAP[mdy[1].toLowerCase()];
        if (m !== undefined) return new Date(+mdy[3], m, +mdy[2]).getTime();
    }

    // "2024 Jan 15" (YYYY Mon DD)
    const ymd = s.match(/^(\d{4})[\s\-/]+([A-Za-z]+)[\s\-/]+(\d{1,2})$/);
    if (ymd) {
        const m = MONTH_MAP[ymd[2].toLowerCase()];
        if (m !== undefined) return new Date(+ymd[1], m, +ymd[3]).getTime();
    }

    // Last resort: try new Date() (works on V8, may fail on Hermes)
    const t = new Date(s).getTime();
    return isNaN(t) ? 0 : t;
}

/** Date field candidates used for sorting */
const DATE_FIELDS = [
    "Date", "Trade Date", "TradeDate", "Transaction Date",
    "Deal Date", "DealDate", "Dt", "Deal Dt",
    "Ex Dividend Date", "Ex Bonus Date", "ExBonusDate",
    "Stock Split Date", "StockSplitDate", "Split Date",
    "Source Date", "SourceDate", "Record Date", "RecordDate",
    "date", "createdAt", "created_at",
];

/** Find the best date value from an item — try known fields first, then scan all keys */
function extractDate(item: any): number {
    if (!item || typeof item !== "object") return 0;
    // Try known date fields first
    const known = getFieldValue(item, DATE_FIELDS);
    if (known !== "-") {
        const t = parseDate(known);
        if (t > 0) return t;
    }
    // Fallback: scan all keys for any key containing "date" or "dt"
    for (const [k, v] of Object.entries(item)) {
        const kl = k.toLowerCase();
        if (kl.includes("date") || kl === "dt" || kl.includes("_dt")) {
            const t = parseDate(v);
            if (t > 0) return t;
        }
    }
    // Last resort: try Serial No or any numeric ordering field
    return 0;
}

/** Sort array by date descending (latest first) */
function sortByDateDesc(items: any[]): any[] {
    if (!items.length) return items;
    const withDates = items.map((item, i) => ({ item, date: extractDate(item), idx: i }));
    const anyDatesFound = withDates.some(w => w.date > 0);
    if (anyDatesFound) {
        withDates.sort((a, b) => b.date - a.date);
        return withDates.map(w => w.item);
    }
    // API likely returns latest first already — preserve original order
    return items;
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
    color,
    areaColor = "rgba(99,102,241,0.08)",
    showLabels = true,
}: {
    data: { x: string; y: number }[];
    width?: number; height?: number;
    color?: string; areaColor?: string;
    showLabels?: boolean;
}) {
    const { colors: c } = useTheme();
    const lineColor = color ?? c.gold;
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
                                stroke={c.border} strokeWidth={1} strokeDasharray="4,4" />
                            <SvgText x={padL - 6} y={py + 3} fontSize={9} fill={c.textMuted} textAnchor="end">
                                {fmtAxis(yVal)}
                            </SvgText>
                        </G>
                    );
                })}
                <Path d={areaPath} fill={areaColor} />
                <Path d={linePath} fill="none" stroke={lineColor} strokeWidth={2.5}
                    strokeLinecap="round" strokeLinejoin="round" />
                {data.length <= 20 && data.map((d, i) => (
                    <Circle key={`dot-${i}`} cx={toX(i)} cy={toY(d.y)} r={3}
                        fill={c.card} stroke={lineColor} strokeWidth={2} />
                ))}
                {showLabels && data.map((d, i) => {
                    if (i % xTickStep !== 0 && i !== data.length - 1) return null;
                    return (
                        <SvgText key={`xl-${i}`} x={toX(i)} y={h - 8} fontSize={9}
                            fill={c.textMuted} textAnchor="middle">
                            {d.x.length > 4 ? d.x.slice(-4) : d.x}
                        </SvgText>
                    );
                })}
                <Line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke={c.border} strokeWidth={1} />
                <Line x1={padL} y1={padT + plotH} x2={w - padR} y2={padT + plotH} stroke={c.border} strokeWidth={1} />
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
    const { colors: c } = useTheme();
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
                        <Path d={arc.d} fill={arc.color} stroke={c.card} strokeWidth={2} />
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
    const { colors: c, isDark } = useTheme();
    const s = useMemo(() => makeStyles(c, isDark), [c, isDark]);
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
                    <View style={[s.chgBadge, { backgroundColor: up ? c.profitBg : c.lossBg }]}>
                        <Text style={[s.chgText, { color: up ? c.profit : c.loss }]}>
                            {up ? "▲" : "▼"} {Math.abs(chg).toFixed(1)}%
                        </Text>
                    </View>
                </View>
                <SvgLineChart data={pts} color={up ? c.profit : c.loss}
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
    const { colors: c, isDark } = useTheme();
    const s = useMemo(() => makeStyles(c, isDark), [c, isDark]);
    const [dtype, setDtype] = useState<"Bulk" | "Block">("Bulk");
    const [data, setData] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<number | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    // Cache totalPages per deal type so we only need 1 extra request per type
    const pagesCache = useRef<Record<string, number>>({});

    const load = useCallback(async (type: string, pg: number) => {
        if (!capcode) return;
        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;

        setLoading(true); setError(null);
        try {
            let knownPages = pagesCache.current[type];

            // First time for this type — fetch page 1 to discover totalPages
            if (knownPages === undefined) {
                const probe = await apiFetch(
                    `${SCREENER}/getBulkBlockDeals?capcode=${capcode}&type=${type}&page=1`,
                    ctrl.signal
                );
                if (ctrl.signal.aborted) return;
                knownPages = Math.max(1, probe?.pages ?? probe?.totalPages ?? probe?.total_pages ?? 1);
                pagesCache.current[type] = knownPages;
                setTotalPages(knownPages);

                // If only 1 page, use this data directly (no second request needed)
                if (knownPages === 1) {
                    setData(sortByDateDesc(normalise(probe)));
                    setLoading(false);
                    return;
                }
            }

            // Reverse page mapping: UI page 1 → API last page (newest data)
            const apiPage = Math.max(1, knownPages - pg + 1);
            console.log(`[BulkBlock] UI page ${pg} → API page ${apiPage} (totalPages: ${knownPages})`);

            const raw = await apiFetch(
                `${SCREENER}/getBulkBlockDeals?capcode=${capcode}&type=${type}&page=${apiPage}`,
                ctrl.signal
            );
            if (!ctrl.signal.aborted) {
                setData(sortByDateDesc(normalise(raw)));
                const pages = raw?.pages ?? raw?.totalPages ?? raw?.total_pages ?? knownPages;
                setTotalPages(Math.max(1, pages));
            }
        } catch (e: any) {
            if (e?.name === "AbortError") return;
            if (!ctrl.signal.aborted) setError(e?.message || "Failed to load deals");
        }
        if (!ctrl.signal.aborted) setLoading(false);
    }, [capcode]);

    // Reset pages cache when capcode changes
    useEffect(() => { pagesCache.current = {}; }, [capcode]);

    useEffect(() => { load(dtype, page); return () => abortRef.current?.abort(); }, [dtype, page, load]);

    const badge = dtype === "Bulk"
        ? { bg: c.goldLight, text: c.gold }
        : { bg: c.warningLight, text: c.warning };

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
                    <Ionicons name={exp ? "chevron-up" : "chevron-down"} size={16} color={c.textMuted} />
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
                                <View style={[s.bsBadge, { backgroundColor: isBuy ? c.profitBg : c.lossBg }]}>
                                    <Text style={[s.bsText, { color: isBuy ? c.profit : c.loss }]}>{displayVal}</Text>
                                </View>
                            ) : (
                                <Text style={[s.kvVal, { color: themedValueColor(c, v) }]}>{displayVal}</Text>
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
                            color={dtype === t ? c.gold : c.textMuted} style={{ marginRight: 6 }} />
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
    const { colors: c, isDark } = useTheme();
    const s = useMemo(() => makeStyles(c, isDark), [c, isDark]);
    const EVENT_BADGE_COLORS = useMemo(() => eventBadgeColors(c), [c]);
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
                setData(sortByDateDesc(normalise(raw)));
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

    const badge = (EVENT_BADGE_COLORS as any)?.[evType] || EVENT_BADGE_COLORS.default;

    const renderKV = (label: string, value: any, opts?: { isDate?: boolean; isPrice?: boolean }) => (
        <View key={label} style={s.kvRow}>
            <Text style={s.kvLabel}>{label}</Text>
            <Text style={[s.kvVal, opts?.isPrice ? { color: c.profit } : { color: themedValueColor(c, value) }]}>
                {value === "-" ? "-" : opts?.isPrice ? `₹${fmt(value)}` : opts?.isDate ? formatDate(value) : fmt(value)}
            </Text>
        </View>
    );

    const renderTxBadge = (label: string, value: string) => {
        const isBuy = String(value).toLowerCase().includes("buy");
        return (
            <View key={label} style={s.kvRow}>
                <Text style={s.kvLabel}>{label}</Text>
                <View style={[s.bsBadge, { backgroundColor: isBuy ? c.profitBg : c.lossBg }]}>
                    <Text style={[s.bsText, { color: isBuy ? c.profit : c.loss }]}>{value || "-"}</Text>
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
                            <Text style={{ fontSize: 11, color: c.textMuted }}>{headerText}</Text>
                        )}
                        {isExpandable && (
                            <Ionicons name={exp ? "chevron-up" : "chevron-down"} size={16} color={c.textMuted} />
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
export function ShareholdingPatternsTab({ capcode }: { capcode: string }) {
    const { colors: c, isDark } = useTheme();
    const s = useMemo(() => makeStyles(c, isDark), [c, isDark]);
    const SH_COLORS = useMemo(() => shColors(c), [c]);
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
        .map(([label, value]) => ({ label, value: value as number, color: SH_COLORS[label] || c.textMuted }));

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
                                <Text style={[s.tdCell, { flex: 1, color: pledgePct[i] > 0 ? c.loss : c.profit }]}>
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
    "Annual Reports": { bg: "#F1F5F9", text: "#1A1A2E" },
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
        color: { bg: "#F1F5F9", text: "#1A1A2E" },
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
    const { colors: c, isDark } = useTheme();
    const s = useMemo(() => makeStyles(c, isDark), [c, isDark]);
    const DOC_CLR = useMemo(() => docColors(c), [c]);
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
                const clr = DOC_CLR[key] || DOC_CLR["Other"];
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
                                    <Ionicons name="chevron-forward" size={18} color={c.gold} />
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
const makeStyles = (c: AppColors, isDark: boolean) => StyleSheet.create({
    sectionTitle: { fontSize: 16, fontWeight: "700", color: c.text, marginBottom: 14 },
    toggleRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
    toggleBtn: {
        flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10,
        borderRadius: 10, backgroundColor: c.surfaceElevated, borderWidth: 1, borderColor: c.border
    },
    toggleBtnOn: { backgroundColor: c.goldLight, borderColor: c.gold },
    toggleText: { fontSize: 14, fontWeight: "600", color: c.textMuted },
    toggleTextOn: { color: c.gold },
    filterRow: { flexDirection: "row", gap: 8, marginBottom: 14, paddingRight: 16 },
    filterBtn: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        backgroundColor: c.surfaceElevated, borderWidth: 1, borderColor: c.border
    },
    filterBtnOn: { backgroundColor: c.gold, borderColor: c.gold },
    filterBtnText: { fontSize: 12, fontWeight: "600", color: c.textMuted },
    filterBtnTextOn: { color: c.onGold },
    tableCard: {
        backgroundColor: c.card, borderRadius: 12, overflow: "hidden",
        elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.35 : 0.06, shadowRadius: 4, borderWidth: 1, borderColor: c.border, marginBottom: 8
    },
    tHead: { flexDirection: "row", backgroundColor: c.gold, paddingVertical: 11, paddingHorizontal: 12 },
    thCell: { fontSize: 11, fontWeight: "700", color: c.onGold, textAlign: "center", textTransform: "uppercase" },
    tRow: {
        flexDirection: "row", borderBottomWidth: 1, borderBottomColor: c.borderLight,
        paddingVertical: 10, paddingHorizontal: 12
    },
    tdCell: { fontSize: 12, color: c.textSecondary, textAlign: "center" },
    zebra: { backgroundColor: c.surfaceElevated },
    highlight: { backgroundColor: c.goldLight },
    bsBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: "flex-start", marginTop: 2 },
    bsText: { fontSize: 12, fontWeight: "700" },
    evCard: {
        backgroundColor: c.card, borderRadius: 12, padding: 16, marginBottom: 10,
        borderWidth: 1, borderColor: c.border,
        elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.3 : 0.04, shadowRadius: 3
    },
    evCardOpen: { borderColor: c.gold, borderWidth: 1.5 },
    evHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    evBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    evBadgeText: { fontSize: 11, fontWeight: "700" },
    kvRow: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: c.borderLight
    },
    kvLabel: { fontSize: 12, color: c.textMuted, flex: 1, fontWeight: "500" },
    kvVal: { fontSize: 12, color: c.text, fontWeight: "600", textAlign: "right", flex: 1 },
    chartGroup: {
        backgroundColor: c.card, borderRadius: 12, overflow: "hidden",
        borderWidth: 1, borderColor: c.border, marginBottom: 16,
        elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.35 : 0.05, shadowRadius: 3
    },
    chartTabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: c.border },
    cTab: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: "transparent" },
    cTabOn: { borderBottomColor: c.gold },
    cTabText: { fontSize: 12, fontWeight: "600", color: c.textMuted },
    cTabTextOn: { color: c.gold },
    chartPanel: { padding: 16 },
    chartLabel: { fontSize: 14, fontWeight: "700", color: c.text, marginBottom: 8 },
    chartMeta: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
    chartVal: { fontSize: 22, fontWeight: "800", color: c.text },
    chgBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    chgText: { fontSize: 11, fontWeight: "700" },
    shCard: {
        backgroundColor: c.card, borderRadius: 14, padding: 20, marginBottom: 20,
        elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.35 : 0.06, shadowRadius: 4, borderWidth: 1, borderColor: c.border
    },
    pieLeg: { gap: 12, marginTop: 16 },
    pieLegRow: { flexDirection: "row", alignItems: "center" },
    pieDot: { width: 14, height: 14, borderRadius: 7, marginRight: 10 },
    pieLegLabel: { fontSize: 14, color: c.textSecondary, flex: 1, fontWeight: "500" },
    pieLegVal: { fontSize: 15, fontWeight: "700", color: c.text },
    shSubTitle: { fontSize: 14, fontWeight: "700", color: c.text, marginBottom: 10, marginTop: 4 },
    docGroup: { marginBottom: 22 },
    docGroupHdr: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
    docGroupTitle: { fontSize: 15, fontWeight: "700", flex: 1 },
    docCountBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    docCountText: { fontSize: 11, fontWeight: "700" },
    docCard: {
        backgroundColor: c.card, borderRadius: 10, padding: 14, marginBottom: 6,
        borderWidth: 1, borderColor: c.border, flexDirection: "row", alignItems: "center"
    },
    docIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", marginRight: 12 },
    docBody: { flex: 1 },
    docTitle: { fontSize: 13, fontWeight: "600", color: c.text, marginBottom: 3 },
    docMeta: { fontSize: 11, color: c.textMuted, marginBottom: 4 },
    docPill: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    docPillText: { fontSize: 10, fontWeight: "600" },
});