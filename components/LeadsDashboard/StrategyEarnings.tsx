import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from "react-native";
import { useDispatch } from "react-redux";
import { fetchData } from "../../Unfluke_helpers/backend_helper";
import { SetStrategyEarnings } from "../../redux/Unfluke_slices/thunks";
import { AppId, Name } from "./TableCols";
import { Search } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";


const StrategyEarnings = ({ user }) => {
  const { width, height } = useWindowDimensions()
  const { colors: c, isDark } = useTheme();
  const styles = makeStyles(c, isDark);
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchStrategyEarnings = async () => {
      try {
        setLoading(true);
        const id = user?._id;
        if (id) {
          const response = await fetchData(
            `api/wallet/strategyEarnings/?i=${id}`
          );
          if (response?.data) {
            setData(response.data);
          } else {
             Toast.show({
                type: "error",
                text1: "Fetch Failed",
                text2: "Failed to fetch strategy earnings",
                position: "top",
                visibilityTime: 3000,
                autoHide: true,
              });
            // console.error('No data received:', response);
          }
        } else {
          console.error("User ID is undefined");
        }
      } catch (error) {
        console.error("Error fetching strategy earnings:", error);
         Toast.show({
                type: "error",
                text1: "Fetch Failed",
                text2: "Failed to fetch strategy earnings",
                position: "top",
                visibilityTime: 3000,
                autoHide: true,
              });
      } finally {
        setLoading(false);
      }
    };
    fetchStrategyEarnings();
  }, [user]);

  // Calculate total earnings
  const totalBrokerage = useMemo(
    () => (data || []).reduce((sum, item) => sum + item.sellPrice, 0),
    [data]
  );

  useEffect(() => {
    dispatch(SetStrategyEarnings(totalBrokerage));
  }, [totalBrokerage, dispatch]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return (data || []).filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil((filteredData || []).length / itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Determine the items to display based on current page and items per page
  const displayedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return (filteredData || []).slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.paginationButton,
            currentPage === i && styles.paginationButtonActive,
          ]}
          onPress={() => setCurrentPage(i)}
        >
          <Text
            style={[
              styles.paginationButtonText,
              currentPage === i && styles.paginationButtonTextActive,
            ]}
          >
            {i}
          </Text>
        </TouchableOpacity>
      );
    }
    return buttons;
  };

  if (loading) {
    return (
      <View style={styles.outerLoadingContainer}>
        <View style={[styles.loadingContainer,{height: height * 0.48}]}>
          <ActivityIndicator size="large" color={c.gold} />
          <Text style={styles.loadingText}>Loading strategy earnings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Strategy Earnings</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={(text) => {
                setSearchTerm(text);
                setCurrentPage(1);
              }}
              placeholder="Search for Name"
              placeholderTextColor={c.textMuted}
            />
            <Search color={c.textMuted} style={styles.searchIcon} size={15} />
          </View>
        </View>

        {/* Table */}
        <View style={styles.tableContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <View style={[styles.tableCell]}>
                  <Text style={styles.tableHeaderText}>SL NO.</Text>
                </View>
                <View style={[styles.tableCell]}>
                  <Text style={styles.tableHeaderText}>STRATEGY NAME</Text>
                </View>
                <View style={[styles.tableCell]}>
                  <Text style={styles.tableHeaderText}>AMOUNT (₹)</Text>
                </View>
                <View style={[styles.tableCell]}>
                  <Text style={styles.tableHeaderText}>DATE</Text>
                </View>
              </View>

              {/* Table Body */}
              <ScrollView style={styles.tableBody}>
                {displayedItems.length > 0 ? (
                  displayedItems.map((row, index) => (
                    <View key={row._id || index} style={styles.tableRow}>
                      <View style={[styles.tableCell]}>
                        <AppId
                          getValue={() =>
                            (currentPage - 1) * itemsPerPage + index + 1
                          }
                        />
                      </View>
                      <View style={[styles.tableCell]}>
                        <Name getValue={() => row.name} />
                      </View>
                      <View style={[styles.tableCell]}>
                        <Text style={styles.tableCellText}>
                          ₹{row.sellPrice?.toLocaleString()}
                        </Text>
                      </View>
                      <View style={[styles.tableCell]}>
                        <Text style={styles.tableCellText}>{row.date}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>No data available</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </ScrollView>
        </View>

        {/* Pagination */}
        <View style={styles.paginationContainer}>
          <Text style={styles.paginationInfo}>
            Showing {displayedItems.length} of {filteredData.length} Results
          </Text>

          <View style={styles.paginationControls}>
            <TouchableOpacity
              style={[
                styles.paginationButton,
                currentPage === 1 && styles.paginationButtonDisabled,
              ]}
              disabled={currentPage === 1}
              onPress={handlePrevious}
            >
              <Text
                style={[
                  styles.paginationButtonText,
                  currentPage === 1 && styles.paginationButtonTextDisabled,
                ]}
              >
                Previous
              </Text>
            </TouchableOpacity>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.paginationNumbers}
            >
              {renderPaginationButtons()}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.paginationButton,
                currentPage === totalPages && styles.paginationButtonDisabled,
              ]}
              disabled={currentPage === totalPages}
              onPress={handleNext}
            >
              <Text
                style={[
                  styles.paginationButtonText,
                  currentPage === totalPages &&
                    styles.paginationButtonTextDisabled,
                ]}
              >
                Next
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const makeStyles = (c: AppColors, isDark: boolean) =>
  StyleSheet.create({
  outerContainer: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 0.2,
    borderColor: c.border,
    overflow: "hidden",
    backgroundColor: c.card,
  },
  container: {
    flex: 1,
    backgroundColor: c.card,
  },
  outerLoadingContainer: {
    borderWidth: 0.2,
    borderColor: c.border,
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: c.card,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: c.card,
  },
  loadingText: {
    marginTop: 10,
    color: c.textSecondary,
    fontSize: 16,
  },
  header: {
    backgroundColor: c.card,
    padding: 16,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: c.text,
  },
  searchContainer: {
    backgroundColor: c.card,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBox: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: c.inputBorder,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    paddingLeft: 37,
    fontSize: 13,
    color: c.text,
    backgroundColor: c.inputBg,
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    fontSize: 16,
    color: c.textMuted,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: c.card,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  table: {
    minWidth: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: isDark ? c.surfaceElevated : c.background,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    paddingVertical: 12,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: c.textMuted,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
    paddingVertical: 12,
    backgroundColor: c.card,
  },
  tableCell: {
    flex: 1, // Equal distribution of space
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  tableCellText: {
    fontSize: 14,
    color: c.text,
    textAlign: "center",
  },
  tableBody: {
    flex: 1,
  },
  noDataContainer: {
    padding: 40,
    alignItems: "center",
  },
  noDataText: {
    fontSize: 16,
    color: c.textMuted,
  },
  paginationContainer: {
    backgroundColor: c.card,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  paginationInfo: {
    fontSize: 14,
    color: c.textSecondary,
    marginBottom: 12,
  },
  paginationControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paginationNumbers: {
    flex: 1,
    marginHorizontal: 8,
  },
  paginationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: c.surfaceElevated,
    borderWidth: 1,
    borderColor: c.border,
    marginHorizontal: 2,
  },
  paginationButtonActive: {
    backgroundColor: c.gold,
    borderColor: c.gold,
  },
  paginationButtonDisabled: {
    backgroundColor: c.background,
    borderColor: c.borderLight,
    opacity: 0.6,
  },
  paginationButtonText: {
    fontSize: 14,
    color: c.text,
    fontWeight: "500",
  },
  paginationButtonTextActive: {
    color: c.onGold,
  },
  paginationButtonTextDisabled: {
    color: c.textMuted,
  },
});

export default StrategyEarnings;
