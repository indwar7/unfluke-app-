import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import {
  fetchAdvancedDefaultStrategies,
  fetchAdvancedStrategyDetails,
  fetchDefaultStrategies,
  fetchStrategies,
  goToAdvancedStrategyPage,
} from "../../apis/BasicBacktester";
import { deepCopy } from "../UnflukeMain/BasicBacktester/StrategyLegs/utils";
import { fetchRandomImage } from "../BasicBacktester/randomImageFetcher";
import {
  setEditStrategy,
  clearValues,
} from "../../redux/slices/basicBacktester/reducer";
import { ChevronRight, Eye, Plus } from "lucide-react-native";
import { Image } from "expo-image";
import Icon from "react-native-vector-icons/Ionicons";

const cardWidth = "100%"; // 2 columns with proper spacing


const AdvancedBacktestMainPage = () => {
  const dispatch = useDispatch();
  const auth = useSelector((store) => store.Login);
  const navigation = useNavigation();
  const globalState = useSelector((store) => store.Layout);

  const [defaultStrategies, setDefaultStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const [subUrl, setSubUrl] = useState("");

  const loadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  const handleView = async (item) => {
    try {
      const res = await fetchAdvancedStrategyDetails(axios, item.user, item._id);
      const data = res?.data || res;

      if (data) {
        console.log("➡️ Advanced strategy details:", data);
        console.log("entry value", data.entries);

        dispatch(setEditStrategy(data));

        navigation.navigate("basic-backtester-view", {
          filename: item.fileName.split(".")[0],
          advanced: "yes",
          strategyName: data.name || data.strategyName || "",
          reEntry: JSON.stringify(data.entries ?? ""),
        });
      }
    } catch (e) {
      console.error("❌ View strategy failed", e);
      Alert.alert("Error", "Failed to load strategy details. Please try again.");
    }
  };

  const navigateToSaved = () => {
    navigation.navigate("advanced-backtester-home");
  };

  const navigateToCreate = () => {
    navigation.navigate("advanced-backtester");
  };

  useEffect(() => {
    const fetchAllStrategy = async () => {
      const ID = auth.user._id;
      if (ID) {
        try {
          const defaultStrats = await fetchAdvancedDefaultStrategies(axios);

          if (defaultStrats) {
            for (let index in defaultStrats) {
              const obj = deepCopy(defaultStrats[index]);
              const name = obj.name
                ? obj.name.replace("_Save", "").replace("_save", "")
                : obj.strategyName.replace("_Save", "").replace("_save", "");

              if (obj.name) {
                obj.name = name;
              } else {
                obj.strategyName = name;
              }

              defaultStrats[index] = obj;
            }

            setDefaultStrategies(defaultStrats);
          }
        } catch (error) {
          console.error("Error fetching strategies:", error);
          Alert.alert("Error", "Failed to load strategies. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAllStrategy();
  }, [auth]);

  useEffect(() => {
    if (globalState && globalState.appType) {
      setSubUrl(globalState.appType);
    }
  }, [globalState]);

const renderStrategyCard = (item, index) => (
    <View key={index} style={styles.cardContainer}>
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleSection}>
            <View style={styles.imageContainer}>
              <Image
                source={fetchRandomImage(index)}
                style={styles.cardImage}
                contentFit="cover"
              />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.strategyName || item.name}
              </Text>
              <Text style={styles.cardSubtitle}>
                {item.isPrivate ? "Private" : "Public"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => handleView(item)}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <Icon name="eye" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Card Content */}
        <View style={styles.cardContent}>
          <View style={styles.detailsSection}>
            <Text style={styles.detailsLabel}>Details</Text>
            <Text style={styles.detailsText}>
              Overall Profit:{" "}
              {item.rateOfInterest && parseFloat(item.rateOfInterest).toFixed(2)}
            </Text>
          </View>

          <View style={styles.dateSection}>
            <Icon name="calendar" size={12} color="#9CA3AF" />
            <Text style={styles.dateText}>{item.createdOn}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.pageContent}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          {/* Left section: Title + breadcrumb */}
          <View>
            <Text style={styles.title}>Backtester Home</Text>
            <View style={styles.breadcrumb}>
              <Text style={styles.breadcrumbText}>Pages</Text>
              <ChevronRight size={13} color="#6B7280" />
              <Text style={styles.breadcrumbText}>Advanced Backtester</Text>
            </View>
          </View>

          {/* Right section: Buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.viewSavedButton}
              onPress={navigateToSaved}
            >
              <Eye color="#000" size={12} />
              <Text style={styles.viewSavedButtonText}>View saved</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createNewButton}
              onPress={navigateToCreate}
            >
              <Plus color="white" size={12} strokeWidth={3} />
              <Text style={styles.createNewButtonText}>Create new</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Section */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
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
                  {defaultStrategies
                    .slice(0, visibleCount)
                    .map((item, index) => renderStrategyCard(item, index))}
                </View>

                {visibleCount < defaultStrategies.length && (
                  <View style={styles.loadMoreContainer}>
                    <TouchableOpacity
                      style={styles.loadMoreButton}
                      onPress={loadMore}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.loadMoreButtonText}>Load More</Text>
                    </TouchableOpacity>
                  </View>
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
    paddingTop: 85,
  },
  pageContent: {
    flex: 1,
    paddingHorizontal: 12,
  },
  // Header Styles
  headerContainer: {
    paddingBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
  },
  title: {
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
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#9CA3AF",
    borderRadius: 6,
    backgroundColor: "#ffffff",
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#2563EB",
    borderRadius: 6,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#6B7280",
  },

  // Content Styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  cardsContainer: {
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 2,
  },

  // Card Styles
  cardContainer: {
    width: cardWidth,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  titleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  // Card Content Styles
  cardContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
    gap: 16,
  },
  detailsSection: {
    gap: 4,
  },
  detailsLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    lineHeight: 20,
  },
  dateSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#6B7280",
  },

  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 40,
    marginTop: 40,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },

  // Load More Styles
  loadMoreContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  loadMoreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadMoreButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
});

export default AdvancedBacktestMainPage;
