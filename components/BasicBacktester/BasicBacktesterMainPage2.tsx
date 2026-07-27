import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  RefreshControl,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { Ionicons as Icon } from "@expo/vector-icons";
import {
  fetchDefaultStrategies,
  fetchStrategies,
  goToBasicStrategyPage,
} from "../../apis/BasicBacktester";
import { deepCopy } from "../../components/UnflukeMain/BasicBacktester/StrategyLegs/utils";
import { fetchRandomImage } from "./randomImageFetcher";
import { getCsvUrl } from "../../apis/BasicBacktester";
import { setEditStrategy } from "../../redux/slices/basicBacktester/reducer";
import { fetchBasicStrategyDetails } from "../../apis/BasicBacktester";
import { ChevronRight, Eye, Plus } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";

const BasicBacktesterMainPage = () => {
  const dispatch = useDispatch();
  const auth = useSelector((store: any) => store.Login);
  const navigation = useNavigation();
  const [defaultStrategies, setDefaultStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  // Set navigation title
  useEffect(() => {
    navigation.setOptions({
      title: "Basic Backtester",
    });
  }, [navigation]);

  const loadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

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
        legSummaries: undefined, // force rebuild in reducer
      },
    };
  };

  const handleView = async (item) => {
    try {
      const res = await fetchBasicStrategyDetails(axios, item.user, item._id);
      const strategyObj = normalizeStrategy(res?.data || res);
      if (strategyObj) {
        dispatch(setEditStrategy(strategyObj));
        // navigation.navigate("BasicBacktesterView", {
        //   filename: strategyObj.resultFileName.split(".")[0],
        // });
      }
    } catch (e) {
      console.error("View strategy failed", e);
    }
  };

  const handleEdit = (item) => {
    goToBasicStrategyPage(axios, navigation, item.user, item._id);
  };

  // const fetchAllStrategy = async () => {
  //   const ID = auth.user._id;
  //   if (ID) {
  //     const defaultStrats = await fetchDefaultStrategies(axios);

  //     console.log("Default strats");

  //     if (defaultStrats) {
  //       for (let index in defaultStrats) {
  //         const obj = deepCopy(defaultStrats[index]);
  //         const name = obj.name.replace("_Save", "").replace("_save", "");
  //         obj.name = name;
  //         obj.maxDrawdown = null;
  //         defaultStrats[index] = obj;
  //       }
  //       setDefaultStrategies(defaultStrats);
  //       setLoading(false);
  //       fetchDrawdowns(defaultStrats, ID);
  //     }
  //   }
  // };

  const fetchAllStrategy = async () => {
    const ID = auth.user._id;
    if (ID) {
      const defaultStrats = await fetchDefaultStrategies(axios);
      console.log("Default strats");

      if (defaultStrats) {
        let processedStrats = defaultStrats.map((strat) => {
          const obj = deepCopy(strat);
          const name = obj.name.replace("_Save", "").replace("_save", "");
          obj.name = name;
          obj.maxDrawdown = null;
          return obj;
        });

        // ✅ save to state
        setDefaultStrategies(processedStrats);
        setLoading(false);

        // ✅ save to AsyncStorage
        try {
          await AsyncStorage.setItem(
            "defaultStrategies",
            JSON.stringify(processedStrats)
          );
          console.log("Default strategies saved in AsyncStorage");
        } catch (e) {
          console.error("Failed to save strategies", e);
        }

        fetchDrawdowns(processedStrats, ID);
      }
    }
  };

  // Run fetch on login/auth change
  useEffect(() => {
    fetchAllStrategy();
  }, [auth]);

  // // ✅ optional: load saved strategies on app start
  // useEffect(() => {
  //   const loadSavedStrategies = async () => {
  //     try {
  //       const savedStrats = await AsyncStorage.getItem("defaultStrategies");
  //       if (savedStrats) {
  //         setDefaultStrategies(JSON.parse(savedStrats));
  //         console.log("Loaded strategies from AsyncStorage");
  //       }
  //     } catch (e) {
  //       console.error("Failed to load saved strategies", e);
  //     }
  //   };
  //   loadSavedStrategies();
  // }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllStrategy();
    setRefreshing(false);
  };

  // fetch default draw down
  const fetchDrawdowns = async (strategies, userId) => {
    for (const strat of strategies) {
      try {
        if (!strat.resultFileName) continue;
        const base = strat.resultFileName.split(".")[0];
        if (!base || base.length < 3) continue;
        const normalFilename = base.substring(2);
        const fileName1 = "0.5_" + normalFilename;
        const fileName2 = "1_" + normalFilename;
        const data = await getCsvUrl(axios, {
          fileName: base,
          fileName1,
          fileName2,
          ID: userId,
          advancedBacktester: false,
        });
        let drawdownVal = null;
        if (
          data &&
          data.analysis &&
          data.analysis.analysis &&
          data.analysis.analysis.analysis0
        ) {
          drawdownVal = data.analysis.analysis.analysis0.maxDDDays ?? null;
        }
        if (drawdownVal !== null) {
          setDefaultStrategies((prev) =>
            prev.map((s) =>
              s._id === strat._id ? { ...s, maxDrawdown: drawdownVal } : s
            )
          );
        }
      } catch (e) {
        // Silent fail for individual strategy
      }
    }
  };

  const renderStrategyCard = ({ item, index }) => (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.imageContainer}>
              <Image
                source={fetchRandomImage(index)}
                style={styles.cardImage}
                contentFit="cover"

              />
            </View>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.name}
              </Text>
            </View>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              // onPress={() => handleEdit(item)}
              style={styles.actionButton}
            >
              <Icon name="pencil" size={18} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              // onPress={() => handleView(item)}
              style={styles.actionButton}
            >
              <Icon name="eye" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Card Content */}
        <View style={styles.cardContent}>
          <View style={styles.detailsSection}>
            <Text style={styles.sectionLabel}>Details</Text>
            <Text style={styles.detailText}>
              Overall Profit:{" "}
              {item.rateOfInterest &&
                parseFloat(item.rateOfInterest).toFixed(2)}
            </Text>
            <Text style={styles.detailText}>
              Max Drawdown:{" "}
              {item.maxDrawdown === null
                ? "Loading..."
                : `₹ ${Number(item.maxDrawdown).toLocaleString("en-US")}`}
            </Text>
          </View>
          <View style={styles.dateContainer}>
            <Icon name="calendar" size={12} color="#9CA3AF" />
            <Text style={styles.dateText}>{item.createdOn}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.headerTitle}>Backtester Home</Text>
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbText}>Pages</Text>
            <ChevronRight size={13} color="#6B7280" />
            <Text style={styles.breadcrumbText}>Basic Backtester</Text>
          </View>
        </View>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.viewSavedButton}
          // onPress={() => navigation.navigate("BasicBacktesterHome")}
          >
            <Eye color="#000" size={12} />
            <Text style={styles.viewSavedButtonText}>View saved</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createNewButton}
          // onPress={() => navigation.navigate("BasicBacktester")}
          >
            <Plus color="white" size={12} strokeWidth={3} />

            <Text style={styles.createNewButtonText}>Create new</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (visibleCount >= defaultStrategies.length) return null;

    return (
      <View style={styles.loadMoreContainer}>
        <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No strategies found.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading strategies...</Text>
        </View>
      ) : defaultStrategies.length > 0 ? (
        <FlatList
          data={defaultStrategies.slice(0, visibleCount)}
          renderItem={renderStrategyCard}
          keyExtractor={(item, index) => `${item._id}-${index}`}
          numColumns={1}
          contentContainerStyle={styles.listContainer}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {renderEmptyState()}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 85,
    backgroundColor: "#f8f9fa",
    flexGrow: 1,
    padding: 12,
  },
  headerContainer: {
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: "column",
    gap: 10,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  breadcrumbText: {
    fontSize: 12,
    color: "#6B7280",
  },
  buttonGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  viewSavedButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#9CA3AF",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 7,
    backgroundColor: "white",
  },
  viewSavedButtonText: {
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 3,
    fontSize: 12,
  },
  createNewButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 7,
    backgroundColor: "#3B82F6",
  },
  createNewButtonText: {
    fontWeight: "600",
    color: "white",
    marginLeft: 3,
    fontSize: 12,
  },
  listContainer: {
    paddingBottom: 110,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  cardContainer: {
    flex: 1,
    marginBottom: 12, // 👈 this adds gap between cards
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    paddingBottom: 8,
  },
  cardHeaderLeft: {
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
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  detailsSection: {
    gap: 4,
  },
  sectionLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    lineHeight: 18,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
  loadMoreContainer: {
    padding: 16,
    alignItems: "center",
  },
  loadMoreButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  loadMoreText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default BasicBacktesterMainPage;
