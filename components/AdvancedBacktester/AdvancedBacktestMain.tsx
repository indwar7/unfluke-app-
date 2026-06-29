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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import axios from "axios";
import {
  fetchAdvancedDefaultStrategies,
  fetchAdvancedStrategyDetails,
} from "../../apis/BasicBacktester";
import { deepCopy } from "../UnflukeMain/BasicBacktester/StrategyLegs/utils";
import { fetchRandomImage } from "../BasicBacktester/randomImageFetcher";
import { setEditStrategy, clearValues } from "../../redux/slices/basicBacktester/reducer";
import {
  ChevronRight,
  Eye,
  Plus,
  Calendar,
  FileText,
  TrendingUp,
} from "lucide-react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { Radius, Space, Shadow } from "@/constants/Theme";


const AdvancedBacktestMainPage = () => {
  const dispatch = useDispatch();
  const auth = useSelector((store: any) => store.Login);
  const router = useRouter();
  const globalState = useSelector((store: any) => store.Layout);
  const { colors: c, isDark } = useTheme();
  const s = makeStyles(c, isDark);

  const [defaultStrategies, setDefaultStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);

  const loadMore = () => setVisibleCount((prev) => prev + 12);

  const navigateToSaved = () =>
    router.push("/advanced-backtester-home");

  const navigateToCreate = () =>
    router.push("/advanced-backtester");

  const handleView = async (item: any) => {
    try {
      const res = await fetchAdvancedStrategyDetails(axios, item.user, item._id);
      // ✅ Fixed: handle both axios response and plain object
      const data = res?.data ?? res;

      if (data) {
        dispatch(setEditStrategy(data));
        router.push({
          pathname: "/basic-backtester-view",
          params: {
            filename: item.fileName.split(".")[0],
            advanced: "yes",
            strategyName: data.name ?? data.strategyName ?? "",
            reEntry: JSON.stringify(data.entries ?? ""),
          },
        });
      }
    } catch (e) {
      console.error("View strategy failed", e);
      Alert.alert("Error", "Failed to load strategy details. Please try again.");
    }
  };

  useEffect(() => {
    const fetchAllStrategy = async () => {
      const ID = auth.user?._id;
      if (!ID) return;
      try {
        const defaultStrats = await fetchAdvancedDefaultStrategies(axios);
        if (defaultStrats) {
          const normalized = defaultStrats.map((obj: any) => {
            const copy = deepCopy(obj);
            const raw = copy.name ?? copy.strategyName ?? "";
            const name = raw.replace("_Save", "").replace("_save", "");
            if (copy.name) copy.name = name;
            else copy.strategyName = name;
            return copy;
          });
          if (normalized.length > 0) console.log("ADV STRATEGY KEYS:", Object.keys(normalized[0]));
          setDefaultStrategies(normalized);
        }
      } catch (error) {
        console.error("Error fetching strategies:", error);
        Alert.alert("Error", "Failed to load strategies. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllStrategy();
  }, [auth]);

  const renderStrategyCard = (item: any, index: number) => {
    const isPrivate = item.isPrivate;
    return (
      <View key={item._id ?? index} style={s.card}>
        {/* Card Header */}
        <View style={s.cardHeader}>
          <View style={s.cardTitleSection}>
            <View style={[
              s.imageContainer,
              { backgroundColor: fetchRandomImage(index).bg },
            ]}>
              <Ionicons
                name={fetchRandomImage(index).icon as any}
                size={26}
                color={fetchRandomImage(index).color}
              />
            </View>
            <View style={s.titleContainer}>
              <Text style={s.cardTitle} numberOfLines={2}>
                {item.strategyName ?? item.name}
              </Text>
              <View
                style={[
                  s.statusPill,
                  {
                    backgroundColor: isPrivate ? c.surfaceElevated : c.goldLight,
                    borderColor: isPrivate ? c.border : c.gold,
                  },
                ]}
              >
                <Text
                  style={[
                    s.statusText,
                    { color: isPrivate ? c.textMuted : c.gold },
                  ]}
                >
                  {isPrivate ? "Private" : "Public"}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => handleView(item)}
            style={s.actionButton}
            activeOpacity={0.7}
          >
            <Eye size={18} color={c.gold} />
          </TouchableOpacity>
        </View>

        {/* Card Content */}
        <View style={s.cardContent}>
          <View style={s.detailsSection}>
            <Text style={s.detailsLabel}>Overall Profit</Text>
            <View style={s.detailsValueRow}>
              <TrendingUp size={14} color={c.profit} />
              <Text style={s.detailsText}>
                {item.rateOfInterest
                  ? parseFloat(item.rateOfInterest).toFixed(2)
                  : "—"}
              </Text>
            </View>
          </View>
          <View style={s.dateSection}>
            <Calendar size={12} color={c.textMuted} />
            <Text style={s.dateText}>{item.createdAt ?? item.createdOn ?? "—"}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      {/* ✅ Single clean header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Advanced Backtester</Text>
          <View style={s.breadcrumb}>
            <Text style={s.breadcrumbText}>Pages</Text>
            <ChevronRight size={13} color={c.textMuted} />
            <Text style={s.breadcrumbTextActive}>Advanced Backtester</Text>
          </View>
        </View>
        <View style={s.buttonGroup}>
          <TouchableOpacity style={s.viewSavedButton} onPress={navigateToSaved} activeOpacity={0.8}>
            <Eye color={c.text} size={13} />
            <Text style={s.viewSavedButtonText}>View saved</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToCreate} activeOpacity={0.9} style={Shadow.gold}>
            <LinearGradient
              colors={[c.goldBright, c.gold, c.goldDeep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.createNewButton}
            >
              <Plus color={c.onGold} size={13} strokeWidth={3} />
              <Text style={s.createNewButtonText}>Create new</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.pageContent}>
        {loading ? (
          <View style={s.loaderBox}>
            <ActivityIndicator size="large" color={c.gold} />
            <Text style={s.loaderText}>Loading strategies...</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.scrollContent}
          >
            {defaultStrategies.length > 0 ? (
              <>
                <View style={s.cardsContainer}>
                  {defaultStrategies
                    .slice(0, visibleCount)
                    .map((item, index) => renderStrategyCard(item, index))}
                </View>
                {visibleCount < defaultStrategies.length && (
                  <TouchableOpacity onPress={loadMore} activeOpacity={0.8} style={s.loadMoreWrap}>
                    <View style={s.loadMoreButton}>
                      <Text style={s.loadMoreButtonText}>Load More</Text>
                      <ChevronRight size={16} color={c.gold} />
                    </View>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={s.emptyContainer}>
                <View style={s.emptyIconWrap}>
                  <FileText size={40} color={c.gold} />
                </View>
                <Text style={s.emptyText}>No strategies found.</Text>
                <Text style={s.emptySubText}>
                  Create your first strategy to get started.
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
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
      paddingHorizontal: Space.lg,
      paddingVertical: Space.lg,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 10,
      ...Shadow.sm,
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
    breadcrumbTextActive: { fontSize: 12, fontWeight: "600", color: c.gold },
    buttonGroup: { flexDirection: "row", alignItems: "center", gap: 9 },
    viewSavedButton: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: Radius.md,
      paddingHorizontal: 12,
      paddingVertical: 9,
      backgroundColor: c.surface,
      gap: 6,
    },
    viewSavedButtonText: { fontWeight: "700", color: c.text, fontSize: 12 },
    createNewButton: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: Radius.md,
      paddingHorizontal: 12,
      paddingVertical: 9,
      gap: 6,
    },
    createNewButtonText: { fontWeight: "800", color: c.onGold, fontSize: 12, letterSpacing: 0.2 },

    /* ── Content ── */
    pageContent: { flex: 1, paddingHorizontal: Space.md },
    loaderBox: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 80,
      gap: 14,
    },
    loaderText: { fontSize: 15, fontWeight: "500", color: c.textSecondary },
    scrollContent: { paddingTop: Space.lg, paddingBottom: Space.xxl },
    cardsContainer: { gap: Space.md },

    /* ── Card ── */
    card: {
      backgroundColor: c.card,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      ...Shadow.sm,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      padding: Space.lg,
      paddingBottom: Space.md,
    },
    cardTitleSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: Space.md,
    },
    imageContainer: {
      width: 56,
      height: 56,
      borderRadius: Radius.md,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.surfaceElevated,
    },
    cardImage: { width: "100%", height: "100%" },
    titleContainer: { flex: 1, gap: 6 },
    cardTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: c.text,
      lineHeight: 20,
      letterSpacing: -0.2,
    },
    statusPill: {
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: Radius.full,
      borderWidth: 1,
    },
    statusText: {
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: Radius.md,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: c.goldLight,
      borderWidth: 1,
      borderColor: isDark ? c.border : c.goldLight,
    },
    cardContent: {
      paddingHorizontal: Space.lg,
      paddingTop: Space.xs,
      paddingBottom: Space.lg,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: Space.md,
    },
    detailsSection: { gap: 6 },
    detailsLabel: {
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
      color: c.textMuted,
    },
    detailsValueRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    detailsText: {
      fontSize: 16,
      fontWeight: "800",
      color: c.text,
      fontVariant: ["tabular-nums"],
    },
    dateSection: { flexDirection: "row", alignItems: "center", gap: 5 },
    dateText: { fontSize: 12, fontWeight: "500", color: c.textMuted },

    /* ── Empty / Load More ── */
    emptyContainer: {
      alignItems: "center",
      padding: Space.huge,
      marginTop: Space.huge,
      backgroundColor: c.card,
      borderRadius: Radius.xl,
      borderWidth: 1,
      borderColor: c.border,
      ...Shadow.sm,
    },
    emptyIconWrap: {
      width: 84,
      height: 84,
      borderRadius: Radius.full,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.goldLight,
      borderWidth: 1,
      borderColor: isDark ? c.border : c.gold,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: "800",
      color: c.text,
      marginTop: Space.lg,
      textAlign: "center",
    },
    emptySubText: {
      fontSize: 14,
      fontWeight: "500",
      color: c.textSecondary,
      marginTop: Space.sm,
      textAlign: "center",
    },
    loadMoreWrap: {
      alignSelf: "center",
      marginTop: Space.xl,
    },
    loadMoreButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: Space.xxl,
      paddingVertical: Space.md,
      backgroundColor: c.goldLight,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: c.gold,
    },
    loadMoreButtonText: { fontSize: 14, fontWeight: "800", color: c.gold, letterSpacing: 0.2 },
  });

export default AdvancedBacktestMainPage;
