import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ChevronRight, Eye, Plus } from "lucide-react-native";
import axios from "axios";
import { ScreenWithHeader } from "../components/AppHeader";

const ScannerList = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    category,
    scanners: fallbackScanners,
    type,
    alerts,
  } = route.params || {};

  console.log(alerts);

  const [scanners, setScanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const totalItems = scanners.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const fetchScanners = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "/in/scanner/getAdminScannersByCategory",
        {
          params: {
            category,
            limit: 1000,
            page: 1,
          },
        }
      );
      setScanners(
        Array.isArray(response.data) ? response.data : fallbackScanners || []
      );
    } catch (error) {
      setScanners(fallbackScanners || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScanners();
  }, [category]);

  const getInitials = (name) => {
    const words = name?.split(" ") || [];
    return words
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("");
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderScannerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.scannerItem}
      onPress={() =>
        navigation.navigate(alerts ? "alert" : "scanner", {
          state: item,
          type:
            type === "technical"
              ? "scanner"
              : type === "fundamental"
                ? "fundamental"
                : "alerts",
        })
      }
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
      </View>
      <View style={styles.scannerInfo}>
        <Text style={styles.scannerName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.scannerDescription} numberOfLines={3}>
          {item.description || "No description"}
        </Text>
      </View>
      <ChevronRight size={16} color="#64748B" />
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (totalPages <= 1) return null;

    return (
      <View style={styles.pagination}>
        <TouchableOpacity
          onPress={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          style={[
            styles.pageButton,
            currentPage === 1 && styles.disabledButton,
          ]}
        >
          <Text style={styles.pageButtonText}>Previous</Text>
        </TouchableOpacity>

        <Text style={styles.pageInfo}>
          Page {currentPage} of {totalPages}
        </Text>

        <TouchableOpacity
          onPress={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={[
            styles.pageButton,
            currentPage === totalPages && styles.disabledButton,
          ]}
        >
          <Text style={styles.pageButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenWithHeader>
      {/* Original Header Container - Kept exactly as you had it */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.title}>{category || "Scanners"}</Text>
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbText}>Pages</Text>
            <ChevronRight size={13} color="#6B7280" />
            <Text style={styles.breadcrumbText}>Scanners</Text>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.viewSavedButton}
            onPress={() =>
              navigation.navigate(alerts ? "alerts" : "scannerhome")
            }
          >
            <Eye color="#000" size={12} />
            <Text style={styles.viewSavedButtonText}>View saved</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createNewButton}
            onPress={() =>
              navigation.navigate("scanner", {
                type:
                  type === "technical"
                    ? "scanner"
                    : type === "fundamental"
                      ? "fundamental"
                      : "alerts",
              })
            }
          >
            <Plus color="white" size={12} strokeWidth={3} />
            <Text style={styles.createNewButtonText}>Create new</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Improved List and Pagination */}
      {loading ? (
        <View>
          {[...Array(8)].map((_, i) => (
            <View key={i} style={styles.skeletonItem}>
              <View style={styles.skeletonAvatar} />
              <View style={styles.skeletonText}>
                <View style={styles.skeletonLine} />
                <View style={[styles.skeletonLine, { width: "70%" }]} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={scanners.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
          )}
          renderItem={renderScannerItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenWithHeader>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 12,
    paddingBottom: 10,
  },
  // Original Header Styles - Kept exactly as you had them
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
  skeletonItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 8,
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F1F5F9",
  },
  skeletonText: {
    marginLeft: 16,
    flex: 1,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    marginBottom: 8,
    width: "60%",
  },
  listContent: {
    padding: 1,
    paddingBottom: 105,
  },
  scannerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
  scannerInfo: {
    flex: 1,
  },
  scannerName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
    marginBottom: 4,
  },
  scannerDescription: {
    fontSize: 13,
    color: "#64748B",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 1,
  },
  pageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  pageButtonText: {
    color: "#0F172A",
    fontWeight: "500",
  },
  pageInfo: {
    color: "#64748B",
    fontWeight: "500",
  },
});

export default ScannerList;
