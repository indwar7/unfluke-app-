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
import { ScreenWithHeader } from "../components/AppHeader";

const ScannerFundamental = () => {
  const [defaultScanners, setDefaultScanners] = useState({});
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [appType, setAppType] = useState("default"); // You can set a default value or get it from props

  useEffect(() => {
    const fetchScanners = async () => {

      console.log("Asdfsaf")
      try {
        setLoading(true);
        const response = await fetch(
          "https://api.unfluke.in/api/scanner/getAdminScanners?type=fundamental"
          // "http://10.184.31.9:80/api/scanner/getAdminScanners?type=fundamental"
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
                type: "fundamental",
                // alerts:true
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
                  type: "fundamental",
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
                  {item.name}
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
    <ScreenWithHeader>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          {/* Left section: Title + breadcrumb */}
          <View>
            <Text style={styles.title}>Scanner Home</Text>
            <View style={styles.breadcrumb}>
              <Text style={styles.breadcrumbText}>Pages</Text>
              <ChevronRight size={13} color="#6B7280" />
              <Text style={styles.breadcrumbText}>Fundamental Scanner</Text>
            </View>
          </View>

          {/* Right section: Buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.viewSavedButton}
              onPress={() => navigation.navigate("scannerhome")}
            >
              <Eye color="#000" size={12} />
              <Text style={styles.viewSavedButtonText}>View saved</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createNewButton}
              onPress={() =>
                navigation.navigate("scanner", {
                  type: "fundamental",
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
            {Object.keys(defaultScanners).map((category) => (
              <ScannerCard
                key={category}
                title={category}
                items={defaultScanners[category]}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </ScreenWithHeader>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f3f4f6",
    padding: 12,
    paddingBottom: 20,
  },
  headerContainer: {
    paddingBottom: 18,
    flexDirection: "column",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10
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
    alignItems: "center", // Changed from 'center' to 'flex-start'
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    flex: 1, // Added to allow text to take available space
    marginRight: 8, // Added to create space between title and button
    flexWrap: "wrap", // Allow text to wrap
  },
  showAllButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: "flex-end", // Align button to bottom of header
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
    flex: 1, // Add this to allow proper space distribution
  },
  scannerName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#111827",
    flex: 1, // Add this to allow text to take available space
    marginRight: 8, // Add space between text and icon
    flexWrap: "wrap", // Allow text wrapping
  },
});

export default ScannerFundamental;
