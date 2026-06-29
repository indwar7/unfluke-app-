import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import axios from "axios";
import {
  fetchDefaultStrategies,
  fetchBasicStrategyDetails,
} from "../../apis/BasicBacktester";
import { deepCopy } from "../UnflukeMain/BasicBacktester/StrategyLegs/utils";
import {
  setEditStrategy,
  clearValues,
} from "../../redux/slices/basicBacktester/reducer";
import {
  ChevronRight,
  Eye,
  Plus,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  LineChart,
  Wallet,
  FileText,
} from "lucide-react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { Radius, Space, Shadow } from "@/constants/Theme";

const cardWidth = "100%";

const cardIcons = [BarChart3, LineChart, PieChart, TrendingUp, Wallet];

const BasicBacktesterMainPage = () => {
  const dispatch = useDispatch();
  const auth = useSelector((store: any) => store.Login);
  const router = useRouter();
  const { colors: c, isDark } = useTheme();
  const s = makeStyles(c, isDark);
  const [defaultStrategies, setDefaultStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);

  const loadMore = () => setVisibleCount((prev) => prev + 12);

  const normalizeStrategy = (raw) => {
    if (!raw) return raw;
    const legs = raw.positions?.legs || [];
    return {
      ...raw,
      positions: {
        ...(raw.positions || {}),
        legs: legs.map((leg, i) => {
          if (leg._id || leg.id) return leg;
          return { ...leg, id: `leg_${i}` };
        }),
        legSummaries: undefined,
      },
    };
  };

  const handleView = async (item) => {
    try {
      const res = await fetchBasicStrategyDetails(axios, item.user, item._id);
      const strategyObj = normalizeStrategy(res?.data || res);
      if (!strategyObj) {
        Alert.alert("Error", "This strategy could not be loaded.");
        return;
      }

      const rawFileName =
        strategyObj.resultFileName ||
        strategyObj.resultFile ||
        item.resultFileName ||
        "";
      if (!rawFileName || typeof rawFileName !== "string") {
        Alert.alert(
          "Not available",
          "This strategy doesn't have a backtest result available to view yet."
        );
        return;
      }
      const filename = rawFileName.split(".")[0];

      dispatch(setEditStrategy(strategyObj));
      router.push({
        pathname: "/basic-backtester-view",
        params: { filename },
      });
    } catch (e) {
      Alert.alert("Error", "Failed to load strategy details. Please try again.");
    }
  };

  const navigateToSaved = () => {
    dispatch(clearValues());
    router.push("/basic-backtester-home");
  };

  const formatNumber = (num) => {
    if (num == null) return "—";
    return `₹ ${Number(num).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  useEffect(() => {
    const fetchAllStrategy = async () => {
      try {
        const ID = auth?.user?._id;
        if (ID) {
          const resp = await fetchDefaultStrategies(axios);
          // Normalize: the API may return a raw AxiosResponse or the array.
          const raw = resp?.data ?? resp;
          const list = Array.isArray(raw) ? raw : [];
          const normalized = list.map((item: any) => {
            const obj = deepCopy(item);
            obj.name = (obj?.name || "").replace("_Save", "").replace("_save", "");
            obj.maxDrawdown =
              obj.analysis0?.maxDDDays ??
              obj.analysis0?.maxDrawdown ??
              obj.analysis?.analysis?.analysis0?.maxDDDays ??
              obj.analysis?.analysis?.analysis0?.maxDrawdown ??
              null;
            return obj;
          });
          setDefaultStrategies(normalized);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load strategies. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllStrategy();
  }, [auth]);

  const handleClick = () => {
    dispatch(clearValues());
    router.push("/basic-backtester");
  };

  const renderStrategyCard = (item, index) => {
    const CardIcon = cardIcons[index % cardIcons.length];
    const profitRaw = item.rateOfInterest ? parseFloat(item.rateOfInterest) : null;
    const profitPositive = profitRaw == null ? true : profitRaw >= 0;
    const profitColor =
      profitRaw == null ? c.textSecondary : profitPositive ? c.profit : c.loss;
    return (
      <View key={index} style={s.cardContainer}>
        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={s.cardTitleSection}>
              <View style={s.imageContainer}>
                <CardIcon size={24} color={c.gold} strokeWidth={2.2} />
              </View>
              <View style={s.titleContainer}>
                <Text style={s.cardTitle} numberOfLines={2}>{item.name}</Text>
              </View>
            </View>
            <View style={s.actionButtons}>
              <TouchableOpacity onPress={() => handleView(item)} style={s.actionButton}>
                <Eye size={18} color={c.gold} strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.divider} />

          <View style={s.cardContent}>
            <View style={s.metricsRow}>
              <View style={s.metricBlock}>
                <Text style={s.metricLabel}>Overall Profit</Text>
                <Text style={[s.metricValue, { color: profitColor }]}>
                  {item.rateOfInterest && parseFloat(item.rateOfInterest).toFixed(2)}
                </Text>
              </View>
              <View style={s.metricDividerVertical} />
              <View style={s.metricBlock}>
                <Text style={s.metricLabel}>Max Drawdown</Text>
                <Text style={[s.metricValue, { color: c.loss }]}>
                  {item.maxDrawdown == null ? "—" : formatNumber(item.maxDrawdown)}
                </Text>
              </View>
            </View>
            <View style={s.dateSection}>
              <Calendar size={12} color={c.textMuted} strokeWidth={2.2} />
              <Text style={s.dateText}>{item.createdOn}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    // ✅ SafeAreaView only — NO ScreenWithHeader wrapper (that was causing the duplicate navbar)
    <SafeAreaView style={s.container}>

      {/* Single clean header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Backtester Main</Text>
          <View style={s.breadcrumb}>
            <Text style={s.breadcrumbText}>Pages</Text>
            <ChevronRight size={13} color={c.textMuted} />
            <Text style={s.breadcrumbTextActive}>Basic Backtester</Text>
          </View>
        </View>
        <View style={s.buttonGroup}>
          <TouchableOpacity style={s.viewSavedButton} onPress={navigateToSaved} activeOpacity={0.7}>
            <Eye color={c.text} size={13} strokeWidth={2.2} />
            <Text style={s.viewSavedButtonText}>View saved</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClick} activeOpacity={0.85} style={s.createNewWrap}>
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
          <View style={s.loadingContainer}>
            <ActivityIndicator size="large" color={c.gold} />
            <Text style={s.loadingText}>Loading strategies...</Text>
          </View>
        ) : (
          <ScrollView
            style={s.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.scrollContent}
          >
            {defaultStrategies.length > 0 ? (
              <>
                <View style={s.cardsContainer}>
                  {defaultStrategies.slice(0, visibleCount).map((item, index) =>
                    renderStrategyCard(item, index)
                  )}
                </View>
                {visibleCount < defaultStrategies.length && (
                  <View style={s.loadMoreContainer}>
                    <TouchableOpacity onPress={loadMore} activeOpacity={0.85} style={s.loadMoreWrap}>
                      <LinearGradient
                        colors={[c.goldBright, c.gold, c.goldDeep]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={s.loadMoreButton}
                      >
                        <Text style={s.loadMoreButtonText}>Load More</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <View style={s.emptyContainer}>
                <View style={s.emptyIconWrap}>
                  <FileText size={36} color={c.gold} strokeWidth={1.8} />
                </View>
                <Text style={s.emptyText}>No strategies found.</Text>
                <Text style={s.emptySubText}>Create your first strategy to get started.</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const makeStyles = (c: AppColors, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },

  /* ── Single header with title + buttons ── */
  header: {
    backgroundColor: c.headerBg,
    paddingHorizontal: Space.lg,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    ...Shadow.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: c.text,
    letterSpacing: 0.2,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  breadcrumbText: {
    fontSize: 12,
    fontWeight: '600',
    color: c.textMuted,
  },
  breadcrumbTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: c.gold,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  viewSavedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: c.surfaceElevated,
    gap: 6,
  },
  viewSavedButtonText: {
    fontWeight: '700',
    color: c.text,
    fontSize: 12,
  },
  createNewWrap: {
    borderRadius: Radius.md,
    ...Shadow.gold,
  },
  createNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 6,
  },
  createNewButtonText: {
    fontWeight: '800',
    color: c.onGold,
    fontSize: 12,
    letterSpacing: 0.3,
  },

  /* ── Content ── */
  pageContent: {
    flex: 1,
    paddingHorizontal: Space.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: c.textSecondary,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: Space.md, paddingBottom: Space.xl },
  cardsContainer: { gap: Space.md },
  cardContainer: { width: cardWidth },
  card: {
    backgroundColor: c.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: c.border,
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Space.lg,
    paddingBottom: Space.md,
  },
  cardTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  imageContainer: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: c.goldLight,
    borderWidth: 1,
    borderColor: isDark ? c.border : c.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: { flex: 1 },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: c.text,
    lineHeight: 21,
  },
  actionButtons: { flexDirection: 'row', gap: 8 },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: c.borderLight,
    marginHorizontal: Space.lg,
  },
  cardContent: {
    paddingHorizontal: Space.lg,
    paddingTop: Space.md,
    paddingBottom: Space.lg,
    gap: Space.md,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricBlock: {
    flex: 1,
    gap: 5,
  },
  metricDividerVertical: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: c.borderLight,
    marginHorizontal: Space.md,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: c.textMuted,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: c.text,
    fontVariant: ['tabular-nums'] as any,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingTop: 2,
  },
  dateText: { fontSize: 12, fontWeight: '600', color: c.textMuted },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyIconWrap: {
    width: 84,
    height: 84,
    borderRadius: Radius.xl,
    backgroundColor: c.goldLight,
    borderWidth: 1,
    borderColor: isDark ? c.border : c.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyText: { fontSize: 18, fontWeight: '800', color: c.text, marginTop: 16, textAlign: 'center' },
  emptySubText: { fontSize: 14, fontWeight: '500', color: c.textSecondary, marginTop: 8, textAlign: 'center' },
  loadMoreContainer: { alignItems: 'center', marginTop: Space.xl, marginBottom: Space.lg },
  loadMoreWrap: {
    borderRadius: Radius.md,
    ...Shadow.gold,
  },
  loadMoreButton: {
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: Radius.md,
  },
  loadMoreButtonText: { fontSize: 14, fontWeight: '800', color: c.onGold, letterSpacing: 0.3 },
});

export default BasicBacktesterMainPage;
