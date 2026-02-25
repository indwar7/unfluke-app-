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
import { ChevronRight, Eye, Plus } from "lucide-react-native";


const AdvancedBacktestMainPage = () => {
  const dispatch = useDispatch();
  const auth = useSelector((store: any) => store.Login);
  const router = useRouter();
  const globalState = useSelector((store: any) => store.Layout);

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

  const renderStrategyCard = (item: any, index: number) => (
    <View key={item._id ?? index} style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleSection}>
          <View style={[
            styles.imageContainer,
            { backgroundColor: fetchRandomImage(index).bg },
          ]}>
            <Ionicons
              name={fetchRandomImage(index).icon as any}
              size={26}
              color={fetchRandomImage(index).color}
            />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.strategyName ?? item.name}
            </Text>
            <Text style={styles.cardSubtitle}>
              {item.isPrivate ? "Private" : "Public"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleView(item)}
          style={styles.actionButton}
        >
          <Ionicons name="eye" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Card Content */}
      <View style={styles.cardContent}>
        <View style={styles.detailsSection}>
          <Text style={styles.detailsLabel}>Details</Text>
          <Text style={styles.detailsText}>
            Overall Profit:{" "}
            {item.rateOfInterest
              ? parseFloat(item.rateOfInterest).toFixed(2)
              : "—"}
          </Text>
        </View>
        <View style={styles.dateSection}>
          <Ionicons name="calendar" size={12} color="#9CA3AF" />
          <Text style={styles.dateText}>{item.createdOn ?? "—"}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ Single clean header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Advanced Backtester</Text>
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbText}>Pages</Text>
            <ChevronRight size={13} color="#9ca3af" />
            <Text style={styles.breadcrumbText}>Advanced Backtester</Text>
          </View>
        </View>
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.viewSavedButton} onPress={navigateToSaved}>
            <Eye color="#000" size={12} />
            <Text style={styles.viewSavedButtonText}>View saved</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createNewButton} onPress={navigateToCreate}>
            <Plus color="white" size={12} strokeWidth={3} />
            <Text style={styles.createNewButtonText}>Create new</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.pageContent}>
        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loaderText}>Loading strategies...</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {defaultStrategies.length > 0 ? (
              <>
                <View style={styles.cardsContainer}>
                  {defaultStrategies
                    .slice(0, visibleCount)
                    .map((item, index) => renderStrategyCard(item, index))}
                </View>
                {visibleCount < defaultStrategies.length && (
                  <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
                    <Text style={styles.loadMoreButtonText}>Load More</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>No strategies found.</Text>
                <Text style={styles.emptySubText}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    // ✅ NO paddingTop: 85
  },

  /* ── Header ── */
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
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
  buttonGroup: { flexDirection: "row", alignItems: "center", gap: 9 },
  viewSavedButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#9CA3AF",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 7,
    backgroundColor: "white",
    gap: 4,
  },
  viewSavedButtonText: { fontWeight: "600", color: "#1F2937", fontSize: 12 },
  createNewButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 7,
    backgroundColor: "#3B82F6",
    gap: 4,
  },
  createNewButtonText: { fontWeight: "600", color: "white", fontSize: 12 },

  /* ── Content ── */
  pageContent: { flex: 1, paddingHorizontal: 12 },
  loaderBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
    gap: 12,
  },
  loaderText: { fontSize: 16, color: "#6B7280" },
  scrollContent: { paddingTop: 12, paddingBottom: 20 },
  cardsContainer: { gap: 12 },

  /* ── Card ── */
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    paddingBottom: 8,
  },
  cardTitleSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  imageContainer: {
    width: 56,
    height: 56,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
  },
  cardImage: { width: "100%", height: "100%" },
  titleContainer: { flex: 1 },
  cardTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    lineHeight: 20,
  },
  cardSubtitle: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  actionButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
    gap: 12,
  },
  detailsSection: { gap: 4 },
  detailsLabel: { fontSize: 12, color: "#6B7280" },
  detailsText: { fontSize: 14, fontWeight: "500", color: "#111827" },
  dateSection: { flexDirection: "row", alignItems: "center", gap: 4 },
  dateText: { fontSize: 12, color: "#6B7280" },

  /* ── Empty / Load More ── */
  emptyContainer: {
    alignItems: "center",
    padding: 40,
    marginTop: 40,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 1,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubText: { fontSize: 14, color: "#6B7280", marginTop: 8, textAlign: "center" },
  loadMoreButton: {
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    marginTop: 20,
    elevation: 2,
  },
  loadMoreButtonText: { fontSize: 14, fontWeight: "600", color: "#ffffff" },
});

export default AdvancedBacktestMainPage;