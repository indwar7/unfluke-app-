import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Share,
} from "react-native";
import { Switch } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  ChevronRight,
  ChevronLeft,
  Pencil,
  Share2,
  Eye,
  Trash2,
  Plus,
  FileText,
  TrendingDown,
  CalendarDays,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  fetchAdvancedStrategyDetails,
  toggleStrategyMonetize,
  toggleStrategyVisibility,
} from "../../apis/BasicBacktester";
import { deepCopy } from "../../components/UnflukeMain/Utils/common_vars";
import { Config } from "../../helpers/config";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

const AdvancedBacktesterHome = () => {
  const router = useRouter();
  const { colors: c, isDark } = useTheme();
  const styles = makeStyles(c, isDark);

  const [savedStrategies, setSavedStrategies] = useState([]);
  const [listStrategies, setListStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("1");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const auth = useSelector((state: any) => state.Login);
  const globalState = useSelector((store: any) => store.Layout);

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

  const handleDeleteStrategy = (strategyId: string) => {
    Alert.alert(
      "Delete Strategy",
      "Are you sure you want to delete this strategy? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (auth.user?._id) {
              axios
                .delete(`${Config.BACKEND_URL}/api/stocks/deleteStrategy`, {
                  params: { user: auth.user._id, id: strategyId },
                })
                .then(() => {
                  setSavedStrategies((prev: any[]) =>
                    prev.filter((x) => x._id !== strategyId)
                  );
                  setListStrategies((prev: any[]) =>
                    prev.filter((x) => x._id !== strategyId)
                  );
                  Alert.alert("Success", "Strategy deleted successfully");
                })
                .catch((err) => {
                  console.error(err);
                  Alert.alert("Error", "Failed to delete strategy");
                });
            }
          },
        },
      ]
    );
  };

  const handlePrivate = async (index: number, isChecked: boolean) => {
    const newFiles = [...savedStrategies] as any[];
    newFiles[index].isPrivate = isChecked;
    setSavedStrategies(newFiles);
    setListStrategies(newFiles);
    if (!newFiles[index].fileName) return;
    try {
      await toggleStrategyVisibility(
        axios,
        newFiles[index].fileName.split(".")[0],
        true
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update privacy settings");
    }
  };

  const handleMonetize = async (index: number, isChecked: boolean) => {
    const newFiles = [...savedStrategies] as any[];
    newFiles[index].monetize = isChecked;
    setSavedStrategies(newFiles);
    setListStrategies(newFiles);
    if (!newFiles[index].fileName) return;
    try {
      await toggleStrategyMonetize(
        axios,
        newFiles[index].fileName.split(".")[0],
        true
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update monetization settings");
    }
  };

  const shareBacktester = async (fileName: string) => {
    if (!fileName) {
      Alert.alert("Error", "Could not generate share link");
      return;
    }
    const link = `${Config.PUBLIC_URL}/basic-backtester-view?filename=${fileName.split(".")[0]
      }&advanced=yes`;
    try {
      await Share.share({ message: link, url: link });
    } catch {
      Alert.alert("Error", "Could not share link");
    }
  };

  const navigateToStrategyView = (fileName: string) => {
    if (!fileName) return;
    router.push({
      pathname: "/basic-backtester-view",
      params: {
        filename: fileName.replace(".csv", ""),
        advanced: "yes",
      },
    });
  };

  const navigateToStrategyPage = async (userId: string, strategyId: string) => {
    try {
      const stratDetails = await fetchAdvancedStrategyDetails(
        axios,
        userId,
        strategyId
      );
      if (stratDetails) {
        router.push({
          pathname: "/advanced-backtester",
          params: { state: JSON.stringify(stratDetails) },
        });
      }
    } catch (e) {
      Alert.alert("Error", "Failed to load strategy");
    }
  };

  // Re-fetch saved strategies every time the screen comes into focus so
  // a new strategy saved in the editor appears in the list on return.
  useFocusEffect(
    useCallback(() => {
      if (auth?.user?._id) {
        setLoading(true);
        axios
          .get(
            `${Config.BACKEND_URL}/api/stocks/getSavedStrategies?user=${auth.user._id}`
          )
          .then((res) => {
            const data = res.data ?? res;
            const list = Array.isArray(data) ? data : [];
            setSavedStrategies(list);
            setListStrategies(list);
            setLoading(false);
          })
          .catch((err) => {
            console.error(err);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    }, [auth])
  );

  const StrategyCard = ({ item, index }: { item: any; index: number }) => {
    const drawdown = item.maxDrawdown ?? item.max_drawdown;
    const formatDate = (value: any): string => {
      if (value == null || value === "") return "—";
      const d = new Date(value);
      if (isNaN(d.getTime())) {
        return typeof value === "string" ? value : "—";
      }
      return d.toISOString().slice(0, 10);
    };
    const createdOn = item.createdAt
      ? formatDate(item.createdAt)
      : item.date
      ? formatDate(item.date)
      : "—";

    return (
      <View style={styles.stratCard}>
        {/* Card Header — Name + Actions */}
        <View style={styles.stratCardHeader}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => navigateToStrategyPage(item.user, item._id)}
          >
            <Text style={styles.stratName} numberOfLines={2}>
              {item.strategyName ?? item.name ?? "—"}
            </Text>
          </TouchableOpacity>
          <View style={styles.stratActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigateToStrategyPage(item.user, item._id)}>
              <Pencil size={15} color={c.gold} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => shareBacktester(item.fileName)}>
              <Share2 size={15} color={c.gold} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigateToStrategyView(item.fileName)}>
              <Eye size={15} color={c.profit} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={() => handleDeleteStrategy(item._id)}>
              <Trash2 size={15} color={c.loss} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Metrics Row */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <View style={styles.metricLabelRow}>
              <TrendingDown size={12} color={c.textMuted} />
              <Text style={styles.metricLabel}>Max Drawdown</Text>
            </View>
            <Text style={[styles.metricValue, { color: c.loss }]}>
              {drawdown != null ? `₹${Number(drawdown).toFixed(0)}` : "—"}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <View style={styles.metricLabelRow}>
              <CalendarDays size={12} color={c.textMuted} />
              <Text style={styles.metricLabel}>Created On</Text>
            </View>
            <Text style={styles.metricValue}>{createdOn}</Text>
          </View>
        </View>

        {/* Toggles Row */}
        <View style={styles.togglesRow}>
          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>Private</Text>
            <Switch
              value={!!item.isPrivate}
              onValueChange={(val) => handlePrivate(index, val)}
              trackColor={{ false: c.inputBorder, true: c.gold }}
              thumbColor={c.white}
              ios_backgroundColor={c.inputBorder}
            />
          </View>
          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>Monetize</Text>
            <Switch
              value={!!item.monetize}
              disabled={item.isPrivate}
              onValueChange={(val) => handleMonetize(index, val)}
              trackColor={{ false: c.inputBorder, true: c.gold }}
              thumbColor={c.white}
              ios_backgroundColor={c.inputBorder}
            />
          </View>
        </View>
      </View>
    );
  };

  const totalPages = Math.ceil(listStrategies.length / ITEMS_PER_PAGE);
  const paginatedStrategies = listStrategies.slice(
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
          <ChevronLeft size={16} color={currentPage === 1 ? c.textMuted : c.text} />
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
          <ChevronRight size={16} color={currentPage === totalPages ? c.textMuted : c.text} />
        </TouchableOpacity>
      </View>
    );
  };

  const StrategyList = ({ strategies }: { strategies: any[] }) => (
    strategies.length === 0 ? (
      <View style={styles.emptyBox}>
        <View style={styles.emptyIconWrap}>
          <FileText size={30} color={c.gold} />
        </View>
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
      {/* Single clean header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Backtester Home</Text>
        <View style={styles.breadcrumb}>
          <Text style={styles.breadcrumbText}>Pages</Text>
          <ChevronRight size={13} color={c.textMuted} />
          <Text style={styles.breadcrumbActive}>Advanced Backtester</Text>
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
              activeOpacity={0.85}
              onPress={() => router.push("/advanced-backtester")}
            >
              <LinearGradient
                colors={[c.goldBright, c.gold, c.goldDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.createButton}
              >
                <Plus size={15} color={c.onGold} />
                <Text style={styles.createButtonText}>Create new</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            {[
              { id: "1", label: "Your strategies", type: "all" },
              { id: "2", label: "Purchased strategies", type: "purchased" },
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
                <ActivityIndicator size="large" color={c.gold} />
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

const makeStyles = (c: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },

    /* ── Header ── */
    header: {
      backgroundColor: c.headerBg,
      paddingHorizontal: 18,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 6,
      elevation: 3,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: c.text,
      letterSpacing: 0.2,
    },
    breadcrumb: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
      gap: 4,
    },
    breadcrumbText: {
      fontSize: 12,
      fontWeight: "600",
      color: c.textMuted,
    },
    breadcrumbActive: {
      fontSize: 12,
      fontWeight: "700",
      color: c.gold,
    },

    /* ── Scroll ── */
    scrollView: { flex: 1 },
    scrollContent: { padding: 14, paddingBottom: 36 },

    /* ── Card ── */
    card: {
      backgroundColor: c.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.25 : 0.06,
      shadowRadius: 12,
      elevation: 2,
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
      color: c.text,
      letterSpacing: 0.2,
    },
    createButton: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    createButtonText: {
      color: c.onGold,
      fontSize: 13,
      fontWeight: "800",
      letterSpacing: 0.2,
    },

    /* ── Tabs ── */
    tabContainer: {
      flexDirection: "row",
      backgroundColor: c.surfaceElevated,
      marginHorizontal: 18,
      marginTop: 18,
      borderRadius: 12,
      padding: 4,
      borderWidth: 1,
      borderColor: c.borderLight,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 9,
      alignItems: "center",
    },
    activeTab: {
      backgroundColor: c.gold,
      shadowColor: c.gold,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.35,
      shadowRadius: 5,
      elevation: 2,
    },
    tabText: { fontSize: 13, fontWeight: "700", color: c.textMuted },
    activeTabText: { color: c.onGold },

    content: { padding: 18 },

    /* ── Strategy Cards ── */
    stratCard: {
      backgroundColor: c.surfaceElevated,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.22 : 0.04,
      shadowRadius: 8,
      elevation: 1,
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
      color: c.text,
      flex: 1,
      marginRight: 8,
      letterSpacing: 0.1,
    },
    stratActions: {
      flexDirection: "row",
      gap: 6,
    },
    actionBtn: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    actionBtnDanger: {
      backgroundColor: c.lossBg,
      borderColor: c.lossBg,
    },
    metricsRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 14,
    },
    metricItem: {
      flex: 1,
      backgroundColor: c.card,
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
      color: c.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    metricValue: {
      fontSize: 16,
      fontWeight: "800",
      color: c.text,
      fontVariant: ["tabular-nums"],
    },
    togglesRow: {
      flexDirection: "row",
      gap: 18,
      borderTopWidth: 1,
      borderTopColor: c.borderLight,
      paddingTop: 12,
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
    loaderBox: {
      paddingVertical: 44,
      alignItems: "center",
      gap: 14,
    },
    loaderText: { fontSize: 14, fontWeight: "600", color: c.textSecondary },
    emptyBox: {
      paddingVertical: 44,
      alignItems: "center",
      gap: 14,
    },
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
      gap: 6,
    },
    pageBtn: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: c.surfaceElevated,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    pageBtnActive: {
      backgroundColor: c.gold,
      borderColor: c.gold,
    },
    pageBtnDisabled: {
      opacity: 0.4,
    },
    pageBtnText: {
      fontSize: 13,
      fontWeight: "700",
      color: c.text,
      fontVariant: ["tabular-nums"],
    },
    pageBtnTextActive: {
      color: c.onGold,
    },
  });

export default AdvancedBacktesterHome;
