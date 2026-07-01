import React from "react";
import {
    View, Text, StyleSheet, ActivityIndicator, TouchableOpacity,
    Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fmt } from "./constants";
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

// ─── Section Group Card (Balance Sheet style) ─────────
export const SectionGroupCard = ({
    heading,
    children,
    data,
}: {
    heading: string;
    children?: string[];
    data: Record<string, any>;
}) => {
    const { colors: c, isDark } = useTheme();
    const styles = makeStyles(c, isDark);
    const headingVal = data?.[heading];
    return (
        <View style={styles.groupCard}>
            <View style={styles.groupRow}>
                <Text style={styles.groupHeaderText}>{heading}</Text>
                <Text style={[styles.groupHeaderValue, { color: themedValueColor(c, headingVal) }]}>
                    {headingVal !== undefined && headingVal !== null ? fmt(headingVal) : ""}
                </Text>
            </View>
            {Array.isArray(children) && children.map((child, idx) => (
                <View key={child + idx} style={[styles.groupRow, idx % 2 === 1 && styles.zebraRow]}>
                    <Text style={styles.groupChildText}>{child}</Text>
                    <Text style={[styles.groupChildValue, { color: themedValueColor(c, data?.[child]) }]}>
                        {data?.[child] !== undefined && data?.[child] !== null ? fmt(data[child]) : "-"}
                    </Text>
                </View>
            ))}
        </View>
    );
};

// ─── Data Row (P&L / CashFlow style) ──────────────────
export const DataRow = ({
    label,
    value,
    isBold,
    isChild,
    index,
}: {
    label: string;
    value: string;
    isBold?: boolean;
    isChild?: boolean;
    index?: number;
}) => {
    const { colors: c, isDark } = useTheme();
    const styles = makeStyles(c, isDark);
    const numVal = parseFloat(String(value ?? "").replace(/,/g, ""));
    const color = !isNaN(numVal) ? themedValueColor(c, numVal) : c.text;
    return (
        <View style={[
            styles.dataRow,
            isBold && styles.dataRowBold,
            index !== undefined && index % 2 === 1 && !isBold && styles.zebraRow,
        ]}>
            <Text
                style={[
                    styles.dataRowLabel,
                    isBold && styles.boldText,
                    isChild && styles.childIndent,
                ]}
                numberOfLines={2}
            >
                {label}
            </Text>
            <Text style={[styles.dataRowValue, isBold && styles.boldText, { color }]}>{value}</Text>
        </View>
    );
};

// ─── Loading State ─────────────────────────────────────
export const LoadingState = ({ message }: { message?: string }) => {
    const { colors: c, isDark } = useTheme();
    const styles = makeStyles(c, isDark);
    return (
        <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color={c.gold} />
            <Text style={styles.stateText}>{message || "Loading data..."}</Text>
        </View>
    );
};

// ─── Error State with Retry ────────────────────────────
export const ErrorState = ({ message, onRetry }: { message?: string; onRetry?: () => void }) => {
    const { colors: c, isDark } = useTheme();
    const styles = makeStyles(c, isDark);
    return (
        <View style={styles.stateContainer}>
            <View style={styles.errorIconWrap}>
                <Ionicons name="alert-circle-outline" size={48} color={c.loss} />
            </View>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.stateText}>{message || "Failed to load data"}</Text>
            {onRetry && (
                <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.7}>
                    <Ionicons name="refresh" size={16} color={c.onGold} style={{ marginRight: 6 }} />
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

// ─── Empty State ───────────────────────────────────────
export const EmptyState = ({ message, icon }: { message?: string; icon?: string }) => {
    const { colors: c, isDark } = useTheme();
    const styles = makeStyles(c, isDark);
    return (
        <View style={styles.stateContainer}>
            <View style={styles.emptyIconWrap}>
                <Ionicons name={(icon as any) || "document-text-outline"} size={48} color={c.textMuted} />
            </View>
            <Text style={styles.stateText}>{message || "No data available"}</Text>
        </View>
    );
};

// ─── Skeleton Loader (actual skeleton rows) ────────────
export const SkeletonLoader = ({ rows = 5 }: { rows?: number }) => {
    const { colors: c, isDark } = useTheme();
    const styles = makeStyles(c, isDark);
    return (
        <View style={styles.skeletonContainer}>
            {/* Card skeleton */}
            <View style={styles.skeletonCard}>
                {Array.from({ length: rows }).map((_, i) => (
                    <View key={i} style={[styles.skeletonRow, i % 2 === 1 && { backgroundColor: c.surfaceElevated }]}>
                        <View style={[styles.skeletonBlock, { width: "55%", height: 12 }]} />
                        <View style={[styles.skeletonBlock, { width: "20%", height: 12 }]} />
                    </View>
                ))}
            </View>
        </View>
    );
};

// ─── Table Skeleton ────────────────────────────────────
export const TableSkeleton = ({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) => {
    const { colors: c, isDark } = useTheme();
    const styles = makeStyles(c, isDark);
    return (
        <View style={styles.skeletonCard}>
            {/* Header skeleton */}
            <View style={[styles.skeletonRow, { backgroundColor: c.border }]}>
                {Array.from({ length: cols }).map((_, j) => (
                    <View key={j} style={[styles.skeletonBlock, { width: `${80 / cols}%`, height: 12 }]} />
                ))}
            </View>
            {Array.from({ length: rows }).map((_, i) => (
                <View key={i} style={[styles.skeletonRow, i % 2 === 0 && { backgroundColor: c.surfaceElevated }]}>
                    {Array.from({ length: cols }).map((_, j) => (
                        <View key={j} style={[styles.skeletonBlock, { width: `${80 / cols}%`, height: 10 }]} />
                    ))}
                </View>
            ))}
        </View>
    );
};

// ─── Pagination Controls ──────────────────────────────
export const PaginationControls = ({
    currentPage,
    totalPages,
    onPrev,
    onNext,
}: {
    currentPage: number;
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
}) => {
    const { colors: c, isDark } = useTheme();
    const styles = makeStyles(c, isDark);
    return (
        <View style={styles.pagination}>
            <TouchableOpacity
                style={[styles.pageButton, currentPage <= 1 && styles.pageButtonDisabled]}
                onPress={currentPage > 1 ? onPrev : undefined}
                disabled={currentPage <= 1}
                activeOpacity={0.7}
            >
                <Ionicons name="chevron-back" size={16} color={currentPage > 1 ? c.gold : c.textMuted} />
                <Text style={[styles.pageButtonText, currentPage <= 1 && styles.pageButtonTextDisabled]}>Prev</Text>
            </TouchableOpacity>
            <Text style={styles.pageInfo}>Page {currentPage} of {totalPages || 1}</Text>
            <TouchableOpacity
                style={[styles.pageButton, currentPage >= totalPages && styles.pageButtonDisabled]}
                onPress={currentPage < totalPages ? onNext : undefined}
                disabled={currentPage >= totalPages}
                activeOpacity={0.7}
            >
                <Text style={[styles.pageButtonText, currentPage >= totalPages && styles.pageButtonTextDisabled]}>Next</Text>
                <Ionicons name="chevron-forward" size={16} color={currentPage < totalPages ? c.gold : c.textMuted} />
            </TouchableOpacity>
        </View>
    );
};

// ─── Key Ratio Card (top cards on website) ─────────────
export const KeyRatioCard = ({
    label,
    value,
    yoyChange,
}: {
    label: string;
    value: string | number;
    yoyChange?: number;
}) => {
    const { colors: c, isDark } = useTheme();
    const styles = makeStyles(c, isDark);
    const isPositive = (yoyChange ?? 0) >= 0;
    return (
        <View style={styles.ratioCardTop}>
            <Text style={styles.ratioCardLabel} numberOfLines={2}>{label}</Text>
            <Text style={styles.ratioCardValue}>{fmt(value)}</Text>
            {yoyChange !== undefined && yoyChange !== null && !isNaN(yoyChange) && (
                <View style={styles.ratioCardYoy}>
                    <Text style={[styles.ratioCardYoyText, { color: isPositive ? c.profit : c.loss }]}>
                        {isPositive ? "↗" : "↘"} {isPositive ? "+" : ""}{typeof yoyChange === "number" ? yoyChange.toFixed(2) : yoyChange}% YoY
                    </Text>
                </View>
            )}
        </View>
    );
};

const makeStyles = (c: AppColors, isDark: boolean) => StyleSheet.create({
    groupCard: {
        backgroundColor: c.card,
        borderRadius: 12,
        marginBottom: 14,
        borderLeftWidth: 4,
        borderLeftColor: c.gold,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.35 : 0.05,
        shadowRadius: 3,
        elevation: 1,
        overflow: "hidden",
    },
    groupRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 13,
        borderBottomWidth: 1,
        borderBottomColor: c.borderLight,
    },
    zebraRow: { backgroundColor: c.surfaceElevated },
    groupHeaderText: { fontSize: 13, fontWeight: "700", color: c.text, flex: 1 },
    groupHeaderValue: { fontSize: 13, fontWeight: "700", color: c.text, textAlign: "right" },
    groupChildText: { fontSize: 12, color: c.textSecondary, flex: 1, paddingLeft: 8 },
    groupChildValue: { fontSize: 12, color: c.textSecondary, textAlign: "right", fontWeight: "500" },
    dataRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: c.borderLight,
    },
    dataRowBold: { backgroundColor: c.surfaceElevated },
    dataRowLabel: { fontSize: 13, color: c.textSecondary, flex: 1 },
    dataRowValue: { fontSize: 13, color: c.text, textAlign: "right", fontWeight: "500", minWidth: 80 },
    boldText: { fontWeight: "700", color: c.text },
    childIndent: { paddingLeft: 16, color: c.textSecondary },
    stateContainer: { padding: 40, alignItems: "center", justifyContent: "center" },
    errorIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: c.errorLight, alignItems: "center", justifyContent: "center", marginBottom: 16 },
    emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: c.surfaceElevated, alignItems: "center", justifyContent: "center", marginBottom: 16 },
    errorTitle: { fontSize: 17, fontWeight: "700", color: c.text, marginBottom: 6 },
    stateText: { fontSize: 14, color: c.textMuted, textAlign: "center", lineHeight: 20 },
    retryButton: {
        flexDirection: "row", alignItems: "center", marginTop: 16,
        backgroundColor: c.gold, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8,
    },
    retryButtonText: { color: c.onGold, fontWeight: "600", fontSize: 14 },
    skeletonContainer: { padding: 16 },
    skeletonCard: {
        backgroundColor: c.card, borderRadius: 12, overflow: "hidden",
        borderWidth: 1, borderColor: c.border,
    },
    skeletonRow: {
        flexDirection: "row", justifyContent: "space-between",
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: c.borderLight,
    },
    skeletonBlock: { backgroundColor: c.borderLight, borderRadius: 4 },
    pagination: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingVertical: 14, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: c.border,
    },
    pageButton: {
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, backgroundColor: c.surfaceElevated,
    },
    pageButtonDisabled: { backgroundColor: c.surfaceElevated },
    pageButtonText: { fontSize: 13, color: c.gold, fontWeight: "600" },
    pageButtonTextDisabled: { color: c.textMuted },
    pageInfo: { fontSize: 13, color: c.textMuted },
    ratioCardTop: {
        backgroundColor: c.card, borderRadius: 12, padding: 16, minWidth: 170, maxWidth: 200,
        marginRight: 10, justifyContent: "center",
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.35 : 0.06, shadowRadius: 4,
        elevation: 2, borderWidth: 1, borderColor: c.border,
    },
    ratioCardLabel: { fontSize: 11, color: c.textMuted, fontWeight: "500", marginBottom: 8, lineHeight: 15 },
    ratioCardValue: { fontSize: 28, fontWeight: "800", color: c.text, marginBottom: 6 },
    ratioCardYoy: { flexDirection: "row", alignItems: "center" },
    ratioCardYoyText: { fontSize: 11, fontWeight: "600" },
});
