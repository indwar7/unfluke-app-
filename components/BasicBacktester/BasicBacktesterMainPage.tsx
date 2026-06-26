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
import { Ionicons } from "@expo/vector-icons";
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
import { ChevronRight, Eye, Plus } from "lucide-react-native";

const cardWidth = "100%";

const BasicBacktesterMainPage = () => {
  const dispatch = useDispatch();
  const auth = useSelector((store: any) => store.Login);
  const router = useRouter();
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
        const ID = auth.user._id;
        if (ID) {
          const defaultStrats = await fetchDefaultStrategies(axios);
          if (defaultStrats) {
            for (let index in defaultStrats) {
              const obj = deepCopy(defaultStrats[index]);
              obj.name = obj.name.replace("_Save", "").replace("_save", "");
              obj.maxDrawdown =
                obj.analysis0?.maxDDDays ??
                obj.analysis0?.maxDrawdown ??
                obj.analysis?.analysis?.analysis0?.maxDDDays ??
                obj.analysis?.analysis?.analysis0?.maxDrawdown ??
                null;
              defaultStrats[index] = obj;
            }
            setDefaultStrategies(defaultStrats);
          }
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

  const renderStrategyCard = (item, index) => (
    <View key={index} style={styles.cardContainer}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleSection}>
            <View style={styles.imageContainer}>
              <Ionicons
                name={["stats-chart", "bar-chart", "pie-chart", "trending-up", "cash"][index % 5] as any}
                size={28}
                color="#2962FF"
              />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
            </View>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={() => handleView(item)} style={styles.actionButton}>
              <Ionicons name="eye" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.detailsSection}>
            <Text style={styles.detailsLabel}>Details</Text>
            <Text style={styles.detailsText}>
              Overall Profit: {item.rateOfInterest && parseFloat(item.rateOfInterest).toFixed(2)}
            </Text>
            <Text style={styles.detailsText}>
              Max Drawdown: {item.maxDrawdown == null ? "—" : formatNumber(item.maxDrawdown)}
            </Text>
          </View>
          <View style={styles.dateSection}>
            <Ionicons name="calendar" size={12} color="#9CA3AF" />
            <Text style={styles.dateText}>{item.createdOn}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    // ✅ SafeAreaView only — NO ScreenWithHeader wrapper (that was causing the duplicate navbar)
    <SafeAreaView style={styles.container}>

      {/* Single clean header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Backtester Main</Text>
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbText}>Pages</Text>
            <ChevronRight size={13} color="#4C525E" />
            <Text style={styles.breadcrumbText}>Basic Backtester</Text>
          </View>
        </View>
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.viewSavedButton} onPress={navigateToSaved}>
            <Eye color="#000" size={12} />
            <Text style={styles.viewSavedButtonText}>View saved</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createNewButton} onPress={handleClick}>
            <Plus color="white" size={12} strokeWidth={3} />
            <Text style={styles.createNewButtonText}>Create new</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.pageContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2962FF" />
            <Text style={styles.loadingText}>Loading strategies...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {defaultStrategies.length > 0 ? (
              <>
                <View style={styles.cardsContainer}>
                  {defaultStrategies.slice(0, visibleCount).map((item, index) =>
                    renderStrategyCard(item, index)
                  )}
                </View>
                {visibleCount < defaultStrategies.length && (
                  <View style={styles.loadMoreContainer}>
                    <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
                      <Text style={styles.loadMoreButtonText}>Load More</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>No strategies found.</Text>
                <Text style={styles.emptySubText}>Create your first strategy to get started.</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131722',
  },

  /* ── Single header with title + buttons ── */
  header: {
    backgroundColor: '#1E222D',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D1D4DC',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  breadcrumbText: {
    fontSize: 12,
    color: '#4C525E',
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
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 7,
    backgroundColor: '#2A2E39',
    gap: 4,
  },
  viewSavedButtonText: {
    fontWeight: '600',
    color: '#D1D4DC',
    fontSize: 12,
  },
  createNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 7,
    backgroundColor: '#2962FF',
    gap: 4,
  },
  createNewButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontSize: 12,
  },

  /* ── Content ── */
  pageContent: {
    flex: 1,
    paddingHorizontal: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#787B86',
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 12, paddingBottom: 20 },
  cardsContainer: { gap: 12 },
  cardContainer: { width: cardWidth },
  card: {
    backgroundColor: '#1E222D',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 8,
  },
  cardTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  imageContainer: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#2A2E39',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: { flex: 1 },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D1D4DC',
    lineHeight: 20,
  },
  actionButtons: { flexDirection: 'row', gap: 8 },
  actionButton: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  cardContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
    gap: 12,
  },
  detailsSection: { gap: 4 },
  detailsLabel: { fontSize: 12, color: '#4C525E', marginBottom: 2 },
  detailsText: { fontSize: 14, fontWeight: '500', color: '#D1D4DC', lineHeight: 20, fontVariant: ['tabular-nums'] as any },
  dateSection: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, color: '#4C525E' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#787B86', marginTop: 16, textAlign: 'center' },
  emptySubText: { fontSize: 14, color: '#4C525E', marginTop: 8, textAlign: 'center' },
  loadMoreContainer: { alignItems: 'center', marginTop: 20, marginBottom: 16 },
  loadMoreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2962FF',
    borderRadius: 10,
    elevation: 2,
  },
  loadMoreButtonText: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
});

export default BasicBacktesterMainPage;