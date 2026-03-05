import React, { useEffect, useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

    const auth = useSelector((state: any) => state.Login);

    const toggleTab = (tab: string, type: string) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
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

    useEffect(() => {
        if (auth?.user?._id) {
            fetchStrategies(axios, { ID: auth.user._id })
                .then((res: any) => {
                    const data = res?.data ?? res;
                    const list = Array.isArray(data) ? data : [];
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
    }, [auth]);

    const StrategyTable = ({ strategies }: { strategies: any[] }) => (
        <View style={styles.tableContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.tableWrapper}>
                    {/* Header */}
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={[styles.headerCell, { width: 160 }]}>Strategy Name</Text>
                        <Text style={[styles.headerCell, { width: 90 }]}>Profit</Text>
                        <Text style={[styles.headerCell, { width: 110 }]}>Max Drawdown</Text>
                        <Text style={[styles.headerCell, { width: 120 }]}>Created On</Text>
                        <Text style={[styles.headerCell, { width: 80 }]}>Private</Text>
                        <Text style={[styles.headerCell, { width: 80 }]}>Monetize</Text>
                        <Text style={[styles.headerCell, { width: 130 }]}>Actions</Text>
                    </View>

                    {strategies.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Ionicons name="document-outline" size={36} color="#9CA3AF" />
                            <Text style={styles.emptyText}>No strategies found.</Text>
                        </View>
                    ) : (
                        strategies.map((item: any, index: number) => (
                            <View
                                key={item._id ?? index}
                                style={[
                                    styles.tableRow,
                                    index % 2 === 0 ? styles.evenRow : styles.oddRow,
                                ]}
                            >
                                {/* Name */}
                                <TouchableOpacity
                                    style={{ width: 160, paddingVertical: 10 }}
                                    onPress={() => handleView(item)}
                                >
                                    <Text style={styles.linkText} numberOfLines={2}>
                                        {item.name ?? item.strategyName ?? "—"}
                                    </Text>
                                </TouchableOpacity>

                                {/* Profit */}
                                <Text
                                    style={[
                                        styles.cellText,
                                        { width: 90, color: (item.rateOfInterest ?? 0) >= 0 ? "#16a34a" : "#dc2626" },
                                    ]}
                                >
                                    {item.rateOfInterest != null
                                        ? `₹${Number(item.rateOfInterest).toFixed(0)}`
                                        : "—"}
                                </Text>

                                {/* Max Drawdown */}
                                <Text
                                    style={[
                                        styles.cellText,
                                        { width: 110, color: "#dc2626" },
                                    ]}
                                >
                                    {item.maxDrawdown != null
                                        ? `₹${Number(item.maxDrawdown).toFixed(0)}`
                                        : item.max_drawdown != null
                                            ? `₹${Number(item.max_drawdown).toFixed(0)}`
                                            : "—"}
                                </Text>

                                {/* Created On */}
                                <Text style={[styles.cellText, { width: 120 }]}>
                                    {item.createdAt
                                        ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })
                                        : item.date ?? "—"}
                                </Text>

                                {/* Private */}
                                <View style={styles.switchCell}>
                                    <Switch
                                        value={!!item.isPrivate}
                                        onValueChange={(val) => handlePrivate(index, val)}
                                        trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
                                        thumbColor="#fff"
                                    />
                                </View>

                                {/* Monetize */}
                                <View style={styles.switchCell}>
                                    <Switch
                                        value={!!item.monetize}
                                        disabled={item.isPrivate}
                                        onValueChange={(val) => handleMonetize(index, val)}
                                        trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
                                        thumbColor="#fff"
                                    />
                                </View>

                                {/* Actions */}
                                <View style={styles.actionsCell}>
                                    <TouchableOpacity onPress={() => handleEdit(item)}>
                                        <Ionicons name="pencil" size={16} color="#3b82f6" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleView(item)}>
                                        <Ionicons name="eye" size={16} color="#16a34a" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() =>
                                            handleDeleteStrategy(
                                                item._id,
                                                item.resultFileName ?? item.fileName ?? ""
                                            )
                                        }
                                    >
                                        <Ionicons name="trash" size={16} color="#dc2626" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
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
                                router.push("/basic-backtester");
                            }}
                        >
                            <Ionicons name="add" size={15} color="white" />
                            <Text style={styles.createButtonText}>Create new</Text>
                        </TouchableOpacity>
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
                            <StrategyTable strategies={listStrategies} />
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

    /* ── Table ── */
    tableContainer: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 8,
        overflow: "hidden",
    },
    tableWrapper: { minWidth: 770 },
    tableRow: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        paddingHorizontal: 8,
    },
    tableHeader: { backgroundColor: "#f5f7fa", paddingVertical: 10 },
    evenRow: { backgroundColor: "#fff" },
    oddRow: { backgroundColor: "#f9fafb" },
    headerCell: {
        fontSize: 11,
        fontWeight: "700",
        color: "#6b7280",
        textTransform: "uppercase",
        textAlign: "center",
    },
    cellText: {
        fontSize: 12,
        color: "#374151",
        textAlign: "center",
        paddingVertical: 10,
    },
    linkText: {
        fontSize: 13,
        color: "#3b82f6",
        fontWeight: "600",
        textDecorationLine: "underline",
        paddingHorizontal: 4,
    },
    switchCell: {
        width: 80,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
    },
    actionsCell: {
        width: 130,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 8,
    },

    /* ── States ── */
    loaderBox: { paddingVertical: 40, alignItems: "center", gap: 12 },
    loaderText: { fontSize: 14, color: "#6b7280" },
    emptyBox: { paddingVertical: 40, alignItems: "center", gap: 12 },
    emptyText: { fontSize: 15, color: "#6b7280" },
});

export default BasicBacktesterHomePage;
