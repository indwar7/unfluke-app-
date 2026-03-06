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
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import axios from "axios";
import { ChevronRight } from "lucide-react-native";
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

const BasicBacktesterHomePage = () => {
    const router = useRouter();
    const dispatch = useDispatch();

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
            <View style={styles.stratCard}>
                {/* Card Header — Name + Actions */}
                <View style={styles.stratCardHeader}>
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => handleView(item)}
                    >
                        <Text style={styles.stratName} numberOfLines={2}>
                            {item.name ?? item.strategyName ?? "—"}
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.stratActions}>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(item)}>
                            <Ionicons name="pencil" size={15} color="#3b82f6" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleView(item)}>
                            <Ionicons name="eye" size={15} color="#16a34a" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() =>
                                handleDeleteStrategy(
                                    item._id,
                                    item.resultFileName ?? item.fileName ?? ""
                                )
                            }
                        >
                            <Ionicons name="trash" size={15} color="#dc2626" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Metrics Row */}
                <View style={styles.metricsRow}>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Profit</Text>
                        <Text style={[styles.metricValue, { color: isPositive ? "#16a34a" : "#dc2626" }]}>
                            {profit != null ? `₹${Number(profit).toFixed(0)}` : "—"}
                        </Text>
                    </View>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Max Drawdown</Text>
                        <Text style={[styles.metricValue, { color: "#dc2626" }]}>
                            {drawdown != null ? `₹${Number(drawdown).toFixed(0)}` : "—"}
                        </Text>
                    </View>
                </View>
                <View style={styles.metricsRow}>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Created On</Text>
                        <Text style={styles.metricValue}>{createdOn}</Text>
                    </View>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Selling Price</Text>
                        <Text style={[styles.metricValue, { color: "#6366f1" }]}>
                            {sellingPrice != null ? `₹${Number(sellingPrice).toFixed(0)}` : "—"}
                        </Text>
                    </View>
                </View>

                {/* Toggles Row */}
                <View style={styles.togglesRow}>
                    <View style={styles.toggleItem}>
                        <Text style={styles.toggleLabel}>Private</Text>
                        <Switch
                            value={!!item.isPrivate}
                            onValueChange={(val) => handlePrivate(index, val)}
                            trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
                            thumbColor="#fff"
                        />
                    </View>
                    <View style={styles.toggleItem}>
                        <Text style={styles.toggleLabel}>Monetize</Text>
                        <Switch
                            value={!!item.monetize}
                            disabled={item.isPrivate}
                            onValueChange={(val) => handleMonetize(index, val)}
                            trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
                            thumbColor="#fff"
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
            <View style={styles.paginationContainer}>
                <TouchableOpacity
                    style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                    onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                >
                    <Ionicons name="chevron-back" size={16} color={currentPage === 1 ? "#d1d5db" : "#374151"} />
                </TouchableOpacity>
                {pages.map((p) => (
                    <TouchableOpacity
                        key={p}
                        style={[styles.pageBtn, currentPage === p && styles.pageBtnActive]}
                        onPress={() => setCurrentPage(p)}
                    >
                        <Text style={[styles.pageBtnText, currentPage === p && styles.pageBtnTextActive]}>
                            {p}
                        </Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity
                    style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
                    onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                >
                    <Ionicons name="chevron-forward" size={16} color={currentPage === totalPages ? "#d1d5db" : "#374151"} />
                </TouchableOpacity>
            </View>
        );
    };

    const StrategyList = ({ strategies }: { strategies: any[] }) => (
        strategies.length === 0 ? (
            <View style={styles.emptyBox}>
                <Ionicons name="document-outline" size={36} color="#9CA3AF" />
                <Text style={styles.emptyText}>No strategies found.</Text>
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
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Backtester Home</Text>
                <View style={styles.breadcrumb}>
                    <Text style={styles.breadcrumbText}>Pages</Text>
                    <ChevronRight size={13} color="#9ca3af" />
                    <Text style={styles.breadcrumbText}>Basic Backtester</Text>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.card}>
                    {/* Card Header */}
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Your saved strategies</Text>
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={() => {
                                dispatch(clearValues());
                                requestAnimationFrame(() => router.push("/basic-backtester"));
                            }}
                        >
                            <Ionicons name="add" size={15} color="white" />
                            <Text style={styles.createButtonText}>Create new</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={16} color="#9ca3af" style={{ marginRight: 8 }} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search strategies..."
                            placeholderTextColor="#9ca3af"
                            value={searchQuery}
                            onChangeText={(text) => { setSearchQuery(text); setCurrentPage(1); }}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => { setSearchQuery(""); setCurrentPage(1); }}>
                                <Ionicons name="close-circle" size={18} color="#9ca3af" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabContainer}>
                        {[
                            { id: "1", label: "Your strategies", type: "all" },
                            { id: "2", label: "Purchased", type: "purchased" },
                        ].map((tab) => (
                            <TouchableOpacity
                                key={tab.id}
                                style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                                onPress={() => toggleTab(tab.id, tab.type)}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        activeTab === tab.id && styles.activeTabText,
                                    ]}
                                >
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        {loading ? (
                            <View style={styles.loaderBox}>
                                <ActivityIndicator size="large" color="#3b82f6" />
                                <Text style={styles.loaderText}>Loading strategies...</Text>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },

    /* ── Header ── */
    header: {
        backgroundColor: "#ffffff",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },
    breadcrumb: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 3,
        gap: 4,
    },
    breadcrumbText: { fontSize: 12, color: "#9ca3af" },

    /* ── Scroll ── */
    scrollView: { flex: 1 },
    scrollContent: { padding: 12, paddingBottom: 30 },

    /* ── Card ── */
    card: {
        backgroundColor: "#fff",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        elevation: 1,
        overflow: "hidden",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    cardTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
    createButton: {
        backgroundColor: "#3b82f6",
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 6,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    createButtonText: { color: "white", fontSize: 13, fontWeight: "600" },

    /* ── Search ── */
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f3f4f6",
        borderRadius: 8,
        marginHorizontal: 16,
        marginTop: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    searchInput: {
        flex: 1,
        fontSize: 13,
        color: "#111827",
        padding: 0,
    },

    /* ── Tabs ── */
    tabContainer: {
        flexDirection: "row",
        backgroundColor: "#f3f4f6",
        margin: 16,
        borderRadius: 8,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: "center",
    },
    activeTab: {
        backgroundColor: "#fff",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tabText: { fontSize: 13, fontWeight: "600", color: "#64748b" },
    activeTabText: { color: "#111827" },

    content: { padding: 16 },

    /* ── Strategy Cards ── */
    stratCard: {
        backgroundColor: "#fff",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        padding: 14,
        marginBottom: 10,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    stratCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    stratName: {
        fontSize: 14,
        fontWeight: "700",
        color: "#3b82f6",
        flex: 1,
        marginRight: 8,
    },
    stratActions: {
        flexDirection: "row",
        gap: 4,
    },
    actionBtn: {
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: "#f3f4f6",
        alignItems: "center",
        justifyContent: "center",
    },
    metricsRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 12,
    },
    metricItem: {
        flex: 1,
        backgroundColor: "#f9fafb",
        borderRadius: 8,
        padding: 10,
    },
    metricLabel: {
        fontSize: 10,
        fontWeight: "600",
        color: "#6b7280",
        textTransform: "uppercase",
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 13,
        fontWeight: "700",
        color: "#111827",
    },
    togglesRow: {
        flexDirection: "row",
        gap: 16,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        paddingTop: 10,
    },
    toggleItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    toggleLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#6b7280",
    },

    /* ── States ── */
    loaderBox: { paddingVertical: 40, alignItems: "center", gap: 12 },
    loaderText: { fontSize: 14, color: "#6b7280" },
    emptyBox: { paddingVertical: 40, alignItems: "center", gap: 12 },
    emptyText: { fontSize: 15, color: "#6b7280" },

    /* ── Pagination ── */
    paginationContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
        gap: 6,
    },
    pageBtn: {
        width: 34,
        height: 34,
        borderRadius: 8,
        backgroundColor: "#f3f4f6",
        alignItems: "center",
        justifyContent: "center",
    },
    pageBtnActive: {
        backgroundColor: "#3b82f6",
    },
    pageBtnDisabled: {
        opacity: 0.4,
    },
    pageBtnText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#374151",
    },
    pageBtnTextActive: {
        color: "#ffffff",
    },
});

export default BasicBacktesterHomePage;
