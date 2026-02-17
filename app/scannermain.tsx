import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ChevronRight, Eye, Plus } from "lucide-react-native";

const ScannerMain = () => {
  const [defaultScanners, setDefaultScanners] = useState({});
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [appType, setAppType] = useState("default");

  useEffect(() => {
    const fetchScanners = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://api.unfluke.in/api/scanner/getAdminScanners?type=technical"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data) {
          setDefaultScanners(data);
        } else {
          console.warn("Received empty data from API");
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScanners();
  }, []);

  const capitalizeFirstLetter = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

  const ScannerCard = ({ title, items }) => {
    const displayItems = items.slice(0, 6);

    return (
      <View style={styles.cardContainer}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            {capitalizeFirstLetter(title.replace("-", " "))}
          </Text>
          <TouchableOpacity
            style={styles.showAllButton}
            onPress={() =>
              navigation.navigate("scannerlist", {
                category: title,
                scanners: items,
                type: "technical",
                // alerts: true,
              })
            }
          >
            <Text style={styles.showAllButtonText}>Show All Scans</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scannerList}
          contentContainerStyle={styles.scannerListContent}
          showsVerticalScrollIndicator={false}
        >
          {displayItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.scannerItem}
              onPress={() =>
                navigation.navigate("scanner", {
                  state: item,
                  type: "scanner",
                  // shared: false,
                })
              }
            >
              <View style={styles.scannerItemContent}>
                <Text
                  style={styles.scannerName}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {/* Add fallback for undefined names */}
                  {item?.name || "Unnamed Scanner"}
                </Text>
                <ChevronRight size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        {/* Left section: Title + breadcrumb */}
        <View>
          <Text style={styles.title}>Scanner Home</Text>
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbText}>Pages</Text>
            <ChevronRight size={13} color="#6B7280" />
            <Text style={styles.breadcrumbText}>Technical Scanner</Text>
          </View>
        </View>

        {/* Right section: Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.viewSavedButton}
            onPress={() => {
              console.log("View saved pressed");
              navigation.navigate("scannerhome")
            }}
          >
            <Eye color="#000" size={12} />
            <Text style={styles.viewSavedButtonText}>View saved</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createNewButton}
            onPress={() =>
                navigation.navigate("scanner", {
                  type: "scanner",
                })
              }
          >
            <Plus color="white" size={12} strokeWidth={3} />
            <Text style={styles.createNewButtonText}>Create new</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading scanners...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scannerGrid}
          showsVerticalScrollIndicator={false}
        >
          {Object.keys(defaultScanners).length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No scanners available</Text>
            </View>
          ) : (
            Object.keys(defaultScanners).map((category) => (
              <ScannerCard
                key={category}
                title={category}
                items={defaultScanners[category] || []}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    paddingTop: 85,
    paddingBottom: 20,
    backgroundColor: "#f8f9fa",
    flexGrow: 1,
  },
  headerContainer: {
    paddingBottom: 18,
    flexDirection: "column",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "white",
  },
  loadingText: {
    marginTop: 8,
    color: "#374151",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "white",
  },
  emptyStateText: {
    color: "#6B7280",
    fontSize: 16,
  },
  scannerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 18,
    paddingBottom: 110,
  },
  cardContainer: {
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  showAllButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: "flex-end",
  },
  showAllButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 11,
  },
  scannerList: {
    maxHeight: 320,
  },
  scannerListContent: {
    paddingRight: 8,
  },
  scannerItem: {
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  scannerItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  scannerName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#111827",
    flex: 1,
    marginRight: 8,
    // Removed flexWrap as it's not valid for Text components
    // Text wrapping is handled by numberOfLines and ellipsizeMode props
  },
});

export default ScannerMain;
