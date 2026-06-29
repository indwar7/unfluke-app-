import React, { useEffect, useState, useMemo } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    Alert,
    Switch,
    Share,
    TextInput,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import axios from "axios";
import {
    ChevronRight,
    ChevronLeft,
    Plus,
    Search,
    X,
    Pencil,
    Eye,
    Trash2,
    FileText,
    TrendingUp,
    TrendingDown,
    CalendarDays,
    Tag,
} from "lucide-react-native";
import {
    fetchStrategies,
    fetchBasicStrategyDetails,
    toggleStrategyMonetize,
    toggleStrategyVisibility,
    deleteStrategies,
} from "../../apis/BasicBacktester";
import { setEditStrategy, clearValues } from "../../redux/slices/basicBacktester/reducer";
import { deepCopy } from "../UnflukeMain/Utils/common_vars";
import { Config } from "../../helpers/config";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

const BasicBacktesterHomePage = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { colors: c, isDark } = useTheme();
    const s = useMemo(() => makeStyles(c, isDark), [c, isDark]);

    const [savedStrategies, setSavedStrategies] = useState<any[]>([]);
    const [listStrategies, setListStrategies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("1");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const ITEMS_PER_PAGE = 10;

    // Filter strategies by search query
    const filteredStrategies = useMemo(() => {
        if (!searchQuery.trim()) return listStrategies;
        const q = searchQuery.toLowerCase();
        return listStrategies.filter((s: any) =>
            (s.name || s.strategyName || "").toLowerCase().includes(q)
        );
    }, [listStrategies, searchQuery]);

    const auth = useSelector((state: any) => state.Login);

    const toggleTab = (tab: string, type: string) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
            setCurrentPage(1);
            let tmp = deepCopy(savedStrategies);
            if (type === "purchased") {
                tmp = tmp.filter((strat: any) => strat.monetize === true);
            }
            setListStrategies(tmp);
        }
    };

    const handleDeleteStrategy = (strategyId: string, fileName: string) => {
        Alert.alert(
            "Delete Strategy",
            "Are you sure you want to delete this strategy? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteStrategies(axios, fileName.split(".")[0]);
                            setSavedStrategies((prev: any[]) =>
                                prev.filter((x) => x._id !== strategyId)
                            );
                            setListStrategies((prev: any[]) =>
                                prev.filter((x) => x._id !== strategyId)
                            );
                            Alert.alert("Success", "Strategy deleted successfully");
                        } catch (err) {
                            console.error(err);
                            Alert.alert("Error", "Failed to delete strategy");
                        }
                    },
                },
            ]
        );
    };

    const handlePrivate = async (index: number, isChecked: boolean) => {
        const newFiles = [...savedStrategies];
        newFiles[index] = { ...newFiles[index], isPrivate: isChecked };
        setSavedStrategies(newFiles);
        setListStrategies(newFiles);
        try {
            await toggleStrategyVisibility(
                axios,
                newFiles[index].resultFileName?.split(".")[0] ?? newFiles[index].fileName?.split(".")[0],
                false
            );
        } catch (error) {
            Alert.alert("Error", "Failed to update privacy settings");
        }
    };

    const handleMonetize = async (index: number, isChecked: boolean) => {
        const newFiles = [...savedStrategies];
        newFiles[index] = { ...newFiles[index], monetize: isChecked };
        setSavedStrategies(newFiles);
        setListStrategies(newFiles);
        try {
            await toggleStrategyMonetize(
                axios,
                newFiles[index].resultFileName?.split(".")[0] ?? newFiles[index].fileName?.split(".")[0],
                false
            );
        } catch (error) {
            Alert.alert("Error", "Failed to update monetization settings");
        }
    };

    const handleView = async (item: any) => {
        try {
            const res = await fetchBasicStrategyDetails(axios, item.user, item._id);
            const data = res?.data ?? res;
            if (data) {
                const legs = data.positions?.legs || [];
                const normalized = {
                    ...data,
                    positions: {
                        ...(data.positions || {}),
                        legs: legs.map((leg: any, i: number) => {
                            if (leg._id || leg.id) return leg;
                            return { ...leg, id: `leg_${i}` };
                        }),
                        legSummaries: undefined,
                    },
                };
                dispatch(setEditStrategy(normalized));
                router.push({
                    pathname: "/basic-backtester-view",
                    params: { filename: data.resultFileName?.split(".")[0] ?? "" },
                });
            }
        } catch (e) {
            Alert.alert("Error", "Failed to load strategy details");
        }
    };

    const handleEdit = async (item: any) => {
        try {
            const stratDetails = await fetchBasicStrategyDetails(axios, item.user, item._id);
            const data = stratDetails?.data ?? stratDetails;
            if (data) {
                dispatch(clearValues());
                dispatch(setEditStrategy(data));
                router.push("/basic-backtester");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to edit strategy. Please try again.");
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            if (auth?.user?._id) {
                setLoading(true);
                fetchStrategies(axios, { ID: auth.user._id })
                    .then((res: any) => {
                        const data = res?.data ?? res;
                        const list = Array.isArray(data) ? data : [];
                        if (list.length > 0) console.log("[BasicBacktester] strategy keys:", Object.keys(list[0]));
                        setSavedStrategies(list);
                        setListStrategies(list);
                        setLoading(false);
                    })
                    .catch((err: any) => {
                        console.error(err);
                        setLoading(false);
                    });
            } else {
                setLoading(false);
            }
        }, [auth])
    );

    const StrategyCard = ({ item, index }: { item: any; index: number }) => {
        const profit = item.rateOfInterest ?? item.profit ?? item.pnl;
        const drawdown = item.maxDD ?? item.analysis0?.maxDDDays ?? item.maxDrawdown;
        const sellingPrice = item.sellPrice ?? item.sellingPrice;
        const isPositive = (profit ?? 0) >= 0;
        const createdOn = item.createdOn ?? "—";

        return (
            <View style={s.stratCard}>
                {/* Card Header — Name + Actions */}
                <View style={s.stratCardHeader}>
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => handleView(item)}
                    >
                        <Text style={s.stratName} numberOfLines={2}>
                            {item.name ?? item.strategyName ?? "—"}
                        </Text>
                    </TouchableOpacity>
                    <View style={s.stratActions}>
                        <TouchableOpacity style={s.actionBtn} onPress={() => handleEdit(item)}>
                            <Pencil size={15} color={c.gold} />
                        </TouchableOpacity>
                        <TouchableOpacity style={s.actionBtn} onPress={() => handleView(item)}>
                            <Eye size={15} color={c.profit} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[s.actionBtn, s.actionBtnDanger]}
                            onPress={() =>
                                handleDeleteStrategy(
                                    item._id,
                                    item.resultFileName ?? item.fileName ?? ""
                                )
                            }
                        >
                            <Trash2 size={15} color={c.loss} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Metrics Row */}
                <View style={s.metricsRow}>
                    <View style={s.metricItem}>
                        <View style={s.metricLabelRow}>
                            {isPositive ? (
                                <TrendingUp size={12} color={c.profit} />
                            ) : (
                                <TrendingDown size={12} color={c.loss} />
                            )}
                            <Text style={s.metricLabel}>Profit</Text>
                        </View>
                        <Text style={[s.metricValue, { color: isPositive ? c.profit : c.loss }]}>
                            {profit != null ? `₹${Number(profit).toFixed(0)}` : "—"}
                        </Text>
                    </View>
                    <View style={s.metricItem}>
                        <View style={s.metricLabelRow}>
                            <TrendingDown size={12} color={c.loss} />
                            <Text style={s.metricLabel}>Max Drawdown</Text>
                        </View>
                        <Text style={[s.metricValue, { color: c.loss }]}>
                            {drawdown != null ? `₹${Number(drawdown).toFixed(0)}` : "—"}
                        </Text>
                    </View>
                </View>
                <View style={s.metricsRow}>
                    <View style={s.metricItem}>
                        <View style={s.metricLabelRow}>
                            <CalendarDays size={12} color={c.textMuted} />
                            <Text style={s.metricLabel}>Created On</Text>
                        </View>
                        <Text style={s.metricValue}>{createdOn}</Text>
                    </View>
                    <View style={s.metricItem}>
                        <View style={s.metricLabelRow}>
                            <Tag size={12} color={c.gold} />
                            <Text style={s.metricLabel}>Selling Price</Text>
                        </View>
                        <Text style={[s.metricValue, { color: c.gold }]}>
                            {sellingPrice != null ? `₹${Number(sellingPrice).toFixed(0)}` : "—"}
                        </Text>
                    </View>
                </View>

                {/* Toggles Row */}
                <View style={s.togglesRow}>
                    <View style={s.toggleItem}>
                        <Text style={s.toggleLabel}>Private</Text>
                        <Switch
                            value={!!item.isPrivate}
                            onValueChange={(val) => handlePrivate(index, val)}
                            trackColor={{ false: c.border, true: c.gold }}
                            thumbColor={isDark ? c.surface : c.white}
                            ios_backgroundColor={c.border}
                        />
                    </View>
                    <View style={s.toggleItem}>
                        <Text style={s.toggleLabel}>Monetize</Text>
                        <Switch
                            value={!!item.monetize}
                            disabled={item.isPrivate}
                            onValueChange={(val) => handleMonetize(index, val)}
                            trackColor={{ false: c.border, true: c.gold }}
                            thumbColor={isDark ? c.surface : c.white}
                            ios_backgroundColor={c.border}
                        />
                    </View>
                </View>
            </View>
        );
    };

    const totalPages = Math.ceil(filteredStrategies.length / ITEMS_PER_PAGE);
    const paginatedStrategies = filteredStrategies.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const PaginationControls = () => {
        if (totalPages <= 1) return null;
        const pages: number[] = [];
        for (let i = 1; i <= totalPages; i++) pages.push(i);
        return (
            <View style={s.paginationContainer}>
                <TouchableOpacity
                    style={[s.pageBtn, currentPage === 1 && s.pageBtnDisabled]}
                    onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft size={16} color={currentPage === 1 ? c.textMuted : c.textSecondary} />
                </TouchableOpacity>
                {pages.map((p) => (
                    <TouchableOpacity
                        key={p}
                        style={[s.pageBtn, currentPage === p && s.pageBtnActive]}
                        onPress={() => setCurrentPage(p)}
                    >
                        <Text style={[s.pageBtnText, currentPage === p && s.pageBtnTextActive]}>
                            {p}
                        </Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity
                    style={[s.pageBtn, currentPage === totalPages && s.pageBtnDisabled]}
                    onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight size={16} color={currentPage === totalPages ? c.textMuted : c.textSecondary} />
                </TouchableOpacity>
            </View>
        );
    };

    const StrategyList = ({ strategies }: { strategies: any[] }) => (
        strategies.length === 0 ? (
            <View style={s.emptyBox}>
                <View style={s.emptyIconWrap}>
                    <FileText size={30} color={c.gold} />
                </View>
                <Text style={s.emptyText}>No strategies found.</Text>
            </View>
        ) : (
            <View>
                {strategies.map((item: any, index: number) => {
                    const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                    return <StrategyCard key={item._id ?? index} item={item} index={globalIndex} />;
                })}
                <PaginationControls />
            </View>
        )
    );

    return (
        <SafeAreaView style={s.container}>
            {/* Header */}
            <View style={s.header}>
                <Text style={s.headerTitle}>Backtester Home</Text>
                <View style={s.breadcrumb}>
                    <Text style={s.breadcrumbText}>Pages</Text>
                    <ChevronRight size={13} color={c.textMuted} />
                    <Text style={s.breadcrumbAccent}>Basic Backtester</Text>
                </View>
            </View>

            <ScrollView
                style={s.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={s.scrollContent}
            >
                <View style={s.card}>
                    {/* Card Header */}
                    <View style={s.cardHeader}>
                        <Text style={s.cardTitle}>Your saved strategies</Text>
                        <TouchableOpacity
                            style={s.createButton}
                            activeOpacity={0.85}
                            onPress={() => {
                                dispatch(clearValues());
                                requestAnimationFrame(() => router.push("/basic-backtester"));
                            }}
                        >
                            <Plus size={15} color={c.onGold} />
                            <Text style={s.createButtonText}>Create new</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View style={s.searchContainer}>
                        <Search size={16} color={c.textMuted} style={{ marginRight: 8 }} />
                        <TextInput
                            style={s.searchInput}
                            placeholder="Search strategies..."
                            placeholderTextColor={c.textMuted}
                            value={searchQuery}
                            onChangeText={(text) => { setSearchQuery(text); setCurrentPage(1); }}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => { setSearchQuery(""); setCurrentPage(1); }}>
                                <X size={18} color={c.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Tabs */}
                    <View style={s.tabContainer}>
                        {[
                            { id: "1", label: "Your strategies", type: "all" },
                            { id: "2", label: "Purchased", type: "purchased" },
                        ].map((tab) => (
                            <TouchableOpacity
                                key={tab.id}
                                style={[s.tab, activeTab === tab.id && s.activeTab]}
                                onPress={() => toggleTab(tab.id, tab.type)}
                            >
                                <Text
                                    style={[
                                        s.tabText,
                                        activeTab === tab.id && s.activeTabText,
                                    ]}
                                >
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Content */}
                    <View style={s.content}>
                        {loading ? (
                            <View style={s.loaderBox}>
                                <ActivityIndicator size="large" color={c.gold} />
                                <Text style={s.loaderText}>Loading strategies...</Text>
                            </View>
                        ) : (
                            <StrategyList strategies={paginatedStrategies} />
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const makeStyles = (c: AppColors, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: c.background,
    },

    /* ── Header ── */
    header: {
        backgroundColor: c.headerBg,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: c.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.3 : 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "800",
        letterSpacing: -0.3,
        color: c.text,
    },
    breadcrumb: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
        gap: 4,
    },
    breadcrumbText: { fontSize: 12, fontWeight: "500", color: c.textMuted },
    breadcrumbAccent: { fontSize: 12, fontWeight: "700", color: c.gold },

    /* ── Scroll ── */
    scrollView: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 36 },

    /* ── Card ── */
    card: {
        backgroundColor: c.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: c.border,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.35 : 0.06,
        shadowRadius: 14,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 18,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: c.borderLight,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: -0.2,
        color: c.text,
        flex: 1,
    },
    createButton: {
        backgroundColor: c.gold,
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        shadowColor: c.goldDeep,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 4,
    },
    createButtonText: { color: c.onGold, fontSize: 13, fontWeight: "800", letterSpacing: 0.2 },

    /* ── Search ── */
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: c.inputBg,
        borderRadius: 14,
        marginHorizontal: 18,
        marginTop: 16,
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderWidth: 1,
        borderColor: c.inputBorder,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: "500",
        color: c.text,
        padding: 0,
    },

    /* ── Tabs ── */
    tabContainer: {
        flexDirection: "row",
        backgroundColor: c.surfaceElevated,
        marginHorizontal: 18,
        marginTop: 16,
        borderRadius: 14,
        padding: 4,
        borderWidth: 1,
        borderColor: c.borderLight,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
    },
    activeTab: {
        backgroundColor: c.gold,
        shadowColor: c.goldDeep,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    tabText: { fontSize: 13, fontWeight: "700", color: c.textSecondary },
    activeTabText: { color: c.onGold },

    content: { padding: 18 },

    /* ── Strategy Cards ── */
    stratCard: {
        backgroundColor: c.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: c.border,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.25 : 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    stratCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 14,
    },
    stratName: {
        fontSize: 15,
        fontWeight: "800",
        letterSpacing: -0.2,
        color: c.text,
        flex: 1,
        marginRight: 8,
    },
    stratActions: {
        flexDirection: "row",
        gap: 6,
    },
    actionBtn: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: c.surfaceElevated,
        borderWidth: 1,
        borderColor: c.borderLight,
        alignItems: "center",
        justifyContent: "center",
    },
    actionBtnDanger: {
        backgroundColor: c.lossBg,
        borderColor: c.lossBg,
    },
    metricsRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 10,
    },
    metricItem: {
        flex: 1,
        backgroundColor: c.surfaceElevated,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: c.borderLight,
        padding: 12,
    },
    metricLabelRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        marginBottom: 6,
    },
    metricLabel: {
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 0.6,
        color: c.textMuted,
        textTransform: "uppercase",
    },
    metricValue: {
        fontSize: 15,
        fontWeight: "800",
        color: c.text,
        fontVariant: ["tabular-nums"] as any,
    },
    togglesRow: {
        flexDirection: "row",
        gap: 20,
        borderTopWidth: 1,
        borderTopColor: c.borderLight,
        paddingTop: 14,
        marginTop: 4,
    },
    toggleItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    toggleLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: c.textSecondary,
    },

    /* ── States ── */
    loaderBox: { paddingVertical: 48, alignItems: "center", gap: 14 },
    loaderText: { fontSize: 14, fontWeight: "500", color: c.textSecondary },
    emptyBox: { paddingVertical: 48, alignItems: "center", gap: 14 },
    emptyIconWrap: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: c.goldLight,
        borderWidth: 1,
        borderColor: c.border,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyText: { fontSize: 15, fontWeight: "600", color: c.textSecondary },

    /* ── Pagination ── */
    paginationContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 18,
        gap: 8,
    },
    pageBtn: {
        minWidth: 36,
        height: 36,
        paddingHorizontal: 8,
        borderRadius: 10,
        backgroundColor: c.surfaceElevated,
        borderWidth: 1,
        borderColor: c.border,
        alignItems: "center",
        justifyContent: "center",
    },
    pageBtnActive: {
        backgroundColor: c.gold,
        borderColor: c.gold,
        shadowColor: c.goldDeep,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    pageBtnDisabled: {
        opacity: 0.4,
    },
    pageBtnText: {
        fontSize: 13,
        fontWeight: "700",
        color: c.textSecondary,
    },
    pageBtnTextActive: {
        color: c.onGold,
    },
});

export default BasicBacktesterHomePage;
