import React from "react";
import {
    View, Text, StyleSheet, ActivityIndicator, TouchableOpacity,
    Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
    ACCENT, ACCENT_LIGHT, GREEN, RED, TEXT_PRIMARY, TEXT_SECONDARY,
    TEXT_MUTED, BORDER_COLOR, ZEBRA_LIGHT, CARD_BG, fmt, valueColor,
} from "./constants";

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
    const headingVal = data?.[heading];
    return (
        <View style={styles.groupCard}>
            <View style={styles.groupRow}>
                <Text style={styles.groupHeaderText}>{heading}</Text>
                <Text style={[styles.groupHeaderValue, { color: valueColor(headingVal) }]}>
                    {headingVal !== undefined && headingVal !== null ? fmt(headingVal) : ""}
                </Text>
            </View>
            {Array.isArray(children) && children.map((child, idx) => (
                <View key={child + idx} style={[styles.groupRow, idx % 2 === 1 && styles.zebraRow]}>
                    <Text style={styles.groupChildText}>{child}</Text>
                    <Text style={[styles.groupChildValue, { color: valueColor(data?.[child]) }]}>
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
    const numVal = parseFloat(String(value ?? "").replace(/,/g, ""));
    const color = !isNaN(numVal) ? valueColor(numVal) : TEXT_PRIMARY;
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
export const LoadingState = ({ message }: { message?: string }) => (
    <View style={styles.stateContainer}>
        <ActivityIndicator size="large" color={ACCENT} />
        <Text style={styles.stateText}>{message || "Loading data..."}</Text>
    </View>
);

// ─── Error State with Retry ────────────────────────────
export const ErrorState = ({ message, onRetry }: { message?: string; onRetry?: () => void }) => (
    <View style={styles.stateContainer}>
        <View style={styles.errorIconWrap}>
            <Ionicons name="alert-circle-outline" size={48} color={RED} />
        </View>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.stateText}>{message || "Failed to load data"}</Text>
        {onRetry && (
            <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.7}>
                <Ionicons name="refresh" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
        )}
    </View>
);

// ─── Empty State ───────────────────────────────────────
export const EmptyState = ({ message, icon }: { message?: string; icon?: string }) => (
    <View style={styles.stateContainer}>
        <View style={styles.emptyIconWrap}>
            <Ionicons name={(icon as any) || "document-text-outline"} size={48} color={TEXT_MUTED} />
        </View>
        <Text style={styles.stateText}>{message || "No data available"}</Text>
    </View>
);

// ─── Skeleton Loader (actual skeleton rows) ────────────
export const SkeletonLoader = ({ rows = 5 }: { rows?: number }) => (
    <View style={styles.skeletonContainer}>
        {/* Card skeleton */}
        <View style={styles.skeletonCard}>
            {Array.from({ length: rows }).map((_, i) => (
                <View key={i} style={[styles.skeletonRow, i % 2 === 1 && { backgroundColor: "#F9FAFB" }]}>
                    <View style={[styles.skeletonBlock, { width: "55%", height: 12 }]} />
                    <View style={[styles.skeletonBlock, { width: "20%", height: 12 }]} />
                </View>
            ))}
        </View>
    </View>
);

// ─── Table Skeleton ────────────────────────────────────
export const TableSkeleton = ({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) => (
    <View style={styles.skeletonCard}>
        {/* Header skeleton */}
        <View style={[styles.skeletonRow, { backgroundColor: "#E8E9EB" }]}>
            {Array.from({ length: cols }).map((_, j) => (
                <View key={j} style={[styles.skeletonBlock, { width: `${80 / cols}%`, height: 12 }]} />
            ))}
        </View>
        {Array.from({ length: rows }).map((_, i) => (
            <View key={i} style={[styles.skeletonRow, i % 2 === 0 && { backgroundColor: "#F9FAFB" }]}>
                {Array.from({ length: cols }).map((_, j) => (
                    <View key={j} style={[styles.skeletonBlock, { width: `${80 / cols}%`, height: 10 }]} />
                ))}
            </View>
        ))}
    </View>
);

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
}) => (
    <View style={styles.pagination}>
        <TouchableOpacity
            style={[styles.pageButton, currentPage <= 1 && styles.pageButtonDisabled]}
            onPress={currentPage > 1 ? onPrev : undefined}
            disabled={currentPage <= 1}
            activeOpacity={0.7}
        >
            <Ionicons name="chevron-back" size={16} color={currentPage > 1 ? ACCENT : "#ccc"} />
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
            <Ionicons name="chevron-forward" size={16} color={currentPage < totalPages ? ACCENT : "#ccc"} />
        </TouchableOpacity>
    </View>
);

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
    const isPositive = (yoyChange ?? 0) >= 0;
    return (
        <View style={styles.ratioCardTop}>
            <Text style={styles.ratioCardLabel} numberOfLines={2}>{label}</Text>
            <Text style={styles.ratioCardValue}>{fmt(value)}</Text>
            {yoyChange !== undefined && yoyChange !== null && !isNaN(yoyChange) && (
                <View style={styles.ratioCardYoy}>
                    <Text style={[styles.ratioCardYoyText, { color: isPositive ? GREEN : RED }]}>
                        {isPositive ? "↗" : "↘"} {isPositive ? "+" : ""}{typeof yoyChange === "number" ? yoyChange.toFixed(2) : yoyChange}% YoY
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    groupCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        marginBottom: 14,
        borderLeftWidth: 4,
        borderLeftColor: ACCENT,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
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
        borderBottomColor: "#F4F5F7",
    },
    zebraRow: { backgroundColor: ZEBRA_LIGHT },
    groupHeaderText: { fontSize: 13, fontWeight: "700", color: TEXT_PRIMARY, flex: 1 },
    groupHeaderValue: { fontSize: 13, fontWeight: "700", color: TEXT_PRIMARY, textAlign: "right" },
    groupChildText: { fontSize: 12, color: TEXT_SECONDARY, flex: 1, paddingLeft: 8 },
    groupChildValue: { fontSize: 12, color: TEXT_SECONDARY, textAlign: "right", fontWeight: "500" },
    dataRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F4F5F7",
    },
    dataRowBold: { backgroundColor: ACCENT_LIGHT },
    dataRowLabel: { fontSize: 13, color: TEXT_SECONDARY, flex: 1 },
    dataRowValue: { fontSize: 13, color: TEXT_PRIMARY, textAlign: "right", fontWeight: "500", minWidth: 80 },
    boldText: { fontWeight: "700", color: TEXT_PRIMARY },
    childIndent: { paddingLeft: 16, color: TEXT_SECONDARY },
    stateContainer: { padding: 40, alignItems: "center", justifyContent: "center" },
    errorIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#FEF2F2", alignItems: "center", justifyContent: "center", marginBottom: 16 },
    emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center", marginBottom: 16 },
    errorTitle: { fontSize: 17, fontWeight: "700", color: TEXT_PRIMARY, marginBottom: 6 },
    stateText: { fontSize: 14, color: TEXT_MUTED, textAlign: "center", lineHeight: 20 },
    retryButton: {
        flexDirection: "row", alignItems: "center", marginTop: 16,
        backgroundColor: ACCENT, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8,
    },
    retryButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
    skeletonContainer: { padding: 16 },
    skeletonCard: {
        backgroundColor: CARD_BG, borderRadius: 12, overflow: "hidden",
        borderWidth: 1, borderColor: BORDER_COLOR,
    },
    skeletonRow: {
        flexDirection: "row", justifyContent: "space-between",
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: "#F0F1F3",
    },
    skeletonBlock: { backgroundColor: "#E5E7EB", borderRadius: 4 },
    pagination: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingVertical: 14, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: BORDER_COLOR,
    },
    pageButton: {
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, backgroundColor: ACCENT_LIGHT,
    },
    pageButtonDisabled: { backgroundColor: "#F3F4F6" },
    pageButtonText: { fontSize: 13, color: ACCENT, fontWeight: "600" },
    pageButtonTextDisabled: { color: "#ccc" },
    pageInfo: { fontSize: 13, color: TEXT_MUTED },
    ratioCardTop: {
        backgroundColor: CARD_BG, borderRadius: 12, padding: 16, minWidth: 170, maxWidth: 200,
        marginRight: 10, justifyContent: "center",
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
        elevation: 2, borderWidth: 1, borderColor: BORDER_COLOR,
    },
    ratioCardLabel: { fontSize: 11, color: TEXT_MUTED, fontWeight: "500", marginBottom: 8, lineHeight: 15 },
    ratioCardValue: { fontSize: 28, fontWeight: "800", color: TEXT_PRIMARY, marginBottom: 6 },
    ratioCardYoy: { flexDirection: "row", alignItems: "center" },
    ratioCardYoyText: { fontSize: 11, fontWeight: "600" },
});
