import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";
import { SetMyEarnings } from "../../redux/Unfluke_slices/thunks";
import { fetchData } from "../../Unfluke_helpers/backend_helper";
import { AppId, Name } from "./TableCols";
import {
  Search,
  Wallet,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Users,
  FileText,
  CalendarRange,
} from "lucide-react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { Radius, Space, Shadow } from "@/constants/Theme";

const groupByMonthAndYear = (data) => {
  const groupedData = {};

  data.forEach((item) => {
    const date = new Date(item.updatedOn);
    const year = date.getFullYear();
    const month = date.getMonth();

    const key = `${year}-${month}`;

    if (!groupedData[key]) {
      groupedData[key] = {
        id: Object.keys(groupedData).length + 1,
        month: new Date(year, month).toLocaleString("default", {
          month: "long",
          year: "numeric",
        }),
        brokerage: 0,
        share: 0,
      };
    }

    groupedData[key].brokerage += item.totalBrokerage;
    groupedData[key].share += item.apBrokerage;
  });

  return Object.values(groupedData);
};

const MyEarnings = ({ user }) => {
  const dispatch = useDispatch();
  const { colors: c, isDark } = useTheme();
  const s = makeStyles(c, isDark);

  const data = user?.partnerList || [];
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [partnersPage, setPartnersPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 8;

  const groupedData = useMemo(() => groupByMonthAndYear(data), [data]);

  const filteredData = useMemo(
    () =>
      (data || []).filter((item) =>
        (item?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [data, searchTerm]
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const displayedItems = useMemo(() => {
    const startIndex = (partnersPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, partnersPage]);

  const totalBrokerage = useMemo(
    () => data.reduce((sum, item) => sum + item.totalBrokerage, 0),
    [data]
  );
  const hisEarnings = useMemo(
    () => data.reduce((sum, item) => sum + item.apBrokerage, 0),
    [data]
  );

  useEffect(() => {
    dispatch(SetMyEarnings(hisEarnings));
  }, [hisEarnings, dispatch]);

  const handleNext = () => {
    if (currentPage < Math.ceil(groupedData.length / itemsPerPage))
      setCurrentPage((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handlePartnersNext = () => {
    if (partnersPage < totalPages) setPartnersPage((prev) => prev + 1);
  };

  const handlePartnersPrevious = () => {
    if (partnersPage > 1) setPartnersPage((prev) => prev - 1);
  };

  // Render earnings items
  const renderEarningsItems = () => {
    const paginatedData = groupedData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    return paginatedData.map((item, index) => (
      <View
        key={item.id}
        style={[s.tableRow, index % 2 === 1 && s.tableRowAlt]}
      >
        <View style={[s.tableCell, s.cellNarrow]}>
          <AppId getValue={() => (currentPage - 1) * itemsPerPage + index + 1} />
        </View>
        <View style={s.tableCell}>
          <Text style={s.tableCellText}>{item.month}</Text>
        </View>
        <View style={s.tableCell}>
          <Text style={s.tableCellNum}>
            ₹{item.brokerage.toLocaleString()}
          </Text>
        </View>
        <View style={s.tableCell}>
          <Text style={[s.tableCellNum, s.tableCellNumGold]}>
            ₹{item.share.toLocaleString()}
          </Text>
        </View>
        <View style={s.tableCell}>
          <TouchableOpacity style={s.invoiceBtn}>
            <FileText color={c.gold} size={13} />
            <Text style={s.viewLink}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    ));
  };

  // Render partners items
  const renderPartnersItems = () => {
    return displayedItems.map((item, index) => (
      <View
        key={item.id}
        style={[s.tableRow, index % 2 === 1 && s.tableRowAlt]}
      >
        <View style={[s.tableCell, s.cellNarrow]}>
          <AppId
            getValue={() => (partnersPage - 1) * itemsPerPage + index + 1}
          />
        </View>
        <View style={[s.tableCell]}>
          <Text style={s.tableCellText}>{item.client}</Text>
        </View>
        <View style={[s.tableCell, styles.amountColumn]}>
          <Text style={s.tableCellNum}>
            ₹{item.totalBrokerage?.toLocaleString()}
          </Text>
        </View>
        <View style={[s.tableCell]}>
          <View style={s.sharePill}>
            <Text style={s.sharePillText}>{item.share}%</Text>
          </View>
        </View>
        <View style={[s.tableCell]}>
          <Text style={[s.tableCellNum, s.tableCellNumGold]}>
            ₹{item.apBrokerage?.toLocaleString()}
          </Text>
        </View>
        <View style={[s.tableCell]}>
          <Text style={s.tableCellMuted}>{item.date}</Text>
        </View>
      </View>
    ));
  };

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color={c.gold} />
        <Text style={s.loadingText}>Loading earnings data...</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Summary stat cards */}
      <View style={s.statsRow}>
        <View style={s.statCard}>
          <View style={[s.statIconWrap, { backgroundColor: c.goldLight }]}>
            <Wallet color={c.gold} size={18} />
          </View>
          <Text style={s.statLabel}>Total Brokerage</Text>
          <Text style={s.statValue}>₹{totalBrokerage.toLocaleString()}</Text>
        </View>
        <View style={s.statCard}>
          <View style={[s.statIconWrap, { backgroundColor: c.profitBg }]}>
            <TrendingUp color={c.profit} size={18} />
          </View>
          <Text style={s.statLabel}>My Earnings</Text>
          <Text style={[s.statValue, { color: c.profit }]}>
            ₹{hisEarnings.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* My Earnings Section */}
      <View style={s.outerSectionContainer}>
        <View style={s.sectionContainer}>
          <View style={s.header}>
            <CalendarRange color={c.gold} size={16} />
            <Text style={s.headerTitle}>My Earnings</Text>
          </View>

          <View style={s.tableContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={s.table}>
                {/* Table Header */}
                <View style={s.tableHeader}>
                  <View style={[s.tableCell, s.cellNarrow]}>
                    <Text style={s.tableHeaderText}>SL NO.</Text>
                  </View>
                  <View style={s.tableCell}>
                    <Text style={s.tableHeaderText}>MONTH</Text>
                  </View>
                  <View style={s.tableCell}>
                    <Text style={s.tableHeaderText}>TOTAL BROKERAGE</Text>
                  </View>
                  <View style={s.tableCell}>
                    <Text style={s.tableHeaderText}>MY SHARE</Text>
                  </View>
                  <View style={s.tableCell}>
                    <Text style={s.tableHeaderText}>INVOICE</Text>
                  </View>
                </View>

                {/* Table Body */}
                <ScrollView style={s.tableBody}>
                  {groupedData.length > 0 ? (
                    renderEarningsItems()
                  ) : (
                    <View style={s.noDataContainer}>
                      <Text style={s.noDataText}>No data available</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </ScrollView>
          </View>

          <View style={s.paginationContainer}>
            <Text style={s.paginationInfo}>
              Showing {Math.min(groupedData.length, itemsPerPage)} of{" "}
              {groupedData.length} Results
            </Text>

            <View style={s.paginationControls}>
              <TouchableOpacity
                style={[
                  s.paginationButton,
                  currentPage === 1 && s.paginationButtonDisabled,
                ]}
                disabled={currentPage === 1}
                onPress={handlePrevious}
              >
                <ChevronLeft
                  size={14}
                  color={currentPage === 1 ? c.textMuted : c.text}
                />
                <Text
                  style={[
                    s.paginationButtonText,
                    currentPage === 1 && s.paginationButtonTextDisabled,
                  ]}
                >
                  Previous
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  s.paginationButton,
                  currentPage ===
                    Math.ceil(groupedData.length / itemsPerPage) &&
                    s.paginationButtonDisabled,
                ]}
                disabled={
                  currentPage === Math.ceil(groupedData.length / itemsPerPage)
                }
                onPress={handleNext}
              >
                <Text
                  style={[
                    s.paginationButtonText,
                    currentPage ===
                      Math.ceil(groupedData.length / itemsPerPage) &&
                      s.paginationButtonTextDisabled,
                  ]}
                >
                  Next
                </Text>
                <ChevronRight
                  size={14}
                  color={
                    currentPage ===
                    Math.ceil(groupedData.length / itemsPerPage)
                      ? c.textMuted
                      : c.text
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      {/* My Partners Section */}
      <View style={s.outerSectionContainer}>
        <View style={s.sectionContainer}>
          <View style={s.header}>
            <Users color={c.gold} size={16} />
            <Text style={s.headerTitle}>My Partners</Text>
          </View>

          {/* Search Bar */}
          <View style={s.searchContainer}>
            <View style={s.searchBox}>
              <Search color={c.textMuted} style={s.searchIcon} size={16} />
              <TextInput
                style={s.searchInput}
                value={searchTerm}
                onChangeText={(text) => {
                  setSearchTerm(text);
                  setPartnersPage(1);
                }}
                placeholder="Search for Name"
                placeholderTextColor={c.textMuted}
              />
            </View>
          </View>

          <View style={s.tableContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={s.table}>
                {/* Table Header */}
                <View style={s.tableHeader}>
                  <View style={[s.tableCell, s.cellNarrow]}>
                    <Text style={s.tableHeaderText}>SL NO.</Text>
                  </View>
                  <View style={[s.tableCell]}>
                    <Text style={s.tableHeaderText}>CLIENT ID</Text>
                  </View>
                  <View style={[s.tableCell]}>
                    <Text style={s.tableHeaderText}>TOTAL BROKERAGE</Text>
                  </View>
                  <View style={[s.tableCell]}>
                    <Text style={s.tableHeaderText}>SHARING (%)</Text>
                  </View>
                  <View style={[s.tableCell]}>
                    <Text style={s.tableHeaderText}>MY SHARE</Text>
                  </View>
                  <View style={[s.tableCell]}>
                    <Text style={s.tableHeaderText}>ACTIVATION DATE</Text>
                  </View>
                </View>

                {/* Table Body */}
                <ScrollView style={s.tableBody}>
                  {displayedItems.length > 0 ? (
                    renderPartnersItems()
                  ) : (
                    <View style={s.noDataContainer}>
                      <Text style={s.noDataText}>No data available</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </ScrollView>
          </View>

          <View style={s.paginationContainer}>
            <Text style={s.paginationInfo}>
              Showing {displayedItems.length} of {filteredData.length} Results
            </Text>

            <View style={s.paginationControls}>
              <TouchableOpacity
                style={[
                  s.paginationButton,
                  partnersPage === 1 && s.paginationButtonDisabled,
                ]}
                disabled={partnersPage === 1}
                onPress={handlePartnersPrevious}
              >
                <ChevronLeft
                  size={14}
                  color={partnersPage === 1 ? c.textMuted : c.text}
                />
                <Text
                  style={[
                    s.paginationButtonText,
                    partnersPage === 1 && s.paginationButtonTextDisabled,
                  ]}
                >
                  Previous
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  s.paginationButton,
                  partnersPage === totalPages && s.paginationButtonDisabled,
                ]}
                disabled={partnersPage === totalPages}
                onPress={handlePartnersNext}
              >
                <Text
                  style={[
                    s.paginationButtonText,
                    partnersPage === totalPages &&
                      s.paginationButtonTextDisabled,
                  ]}
                >
                  Next
                </Text>
                <ChevronRight
                  size={14}
                  color={partnersPage === totalPages ? c.textMuted : c.text}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const makeStyles = (c: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      gap: Space.lg,
      backgroundColor: c.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: c.background,
    },
    loadingText: {
      marginTop: 12,
      color: c.textSecondary,
      fontSize: 15,
      fontWeight: "500",
    },

    // ─── Summary stat cards ───────────────────────────
    statsRow: {
      flexDirection: "row",
      gap: Space.md,
    },
    statCard: {
      flex: 1,
      backgroundColor: c.card,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      padding: Space.lg,
      ...Shadow.sm,
    },
    statIconWrap: {
      width: 38,
      height: 38,
      borderRadius: Radius.md,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: Space.md,
    },
    statLabel: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
      color: c.textMuted,
      marginBottom: 6,
    },
    statValue: {
      fontSize: 22,
      fontWeight: "800",
      fontVariant: ["tabular-nums"],
      letterSpacing: -0.4,
      color: c.text,
    },

    // ─── Section card shell ───────────────────────────
    outerSectionContainer: {
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden",
      backgroundColor: c.card,
      ...Shadow.sm,
    },
    sectionContainer: {
      backgroundColor: c.card,
    },
    header: {
      backgroundColor: c.card,
      paddingHorizontal: Space.lg,
      paddingVertical: Space.lg,
      flexDirection: "row",
      alignItems: "center",
      gap: Space.sm,
    },
    headerTitle: {
      fontSize: 15,
      fontWeight: "800",
      letterSpacing: 0.2,
      color: c.text,
    },

    // ─── Search ───────────────────────────────────────
    searchContainer: {
      backgroundColor: c.card,
      paddingHorizontal: Space.lg,
      paddingBottom: Space.lg,
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
      borderRadius: Radius.md,
      paddingHorizontal: 12,
      paddingVertical: 11,
      paddingLeft: 40,
      fontSize: 14,
      color: c.text,
      backgroundColor: c.inputBg,
    },
    searchIcon: {
      position: "absolute",
      left: 14,
      zIndex: 1,
    },

    // ─── Table ────────────────────────────────────────
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
      paddingVertical: 13,
    },
    tableHeaderText: {
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      color: c.textMuted,
      textAlign: "center",
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: c.borderLight,
      paddingVertical: 14,
      backgroundColor: c.card,
    },
    tableRowAlt: {
      backgroundColor: isDark ? c.surfaceElevated : c.background,
    },
    tableCell: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 22,
    },
    cellNarrow: {
      flex: 0.6,
    },
    tableCellText: {
      fontSize: 14,
      color: c.text,
      fontWeight: "500",
      textAlign: "center",
    },
    tableCellMuted: {
      fontSize: 13,
      color: c.textSecondary,
      textAlign: "center",
    },
    tableCellNum: {
      fontSize: 14,
      fontWeight: "700",
      fontVariant: ["tabular-nums"],
      color: c.text,
      textAlign: "center",
    },
    tableCellNumGold: {
      color: c.gold,
      fontWeight: "800",
    },
    sharePill: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: Radius.full,
      backgroundColor: c.goldLight,
    },
    sharePillText: {
      fontSize: 12,
      fontWeight: "700",
      color: isDark ? c.gold : c.goldDeep,
      fontVariant: ["tabular-nums"],
    },
    tableBody: {
      flex: 1,
    },

    invoiceBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: c.gold,
      backgroundColor: c.goldLight,
    },
    viewLink: {
      fontSize: 13,
      color: isDark ? c.gold : c.goldDeep,
      fontWeight: "700",
    },

    noDataContainer: {
      padding: Space.huge,
      alignItems: "center",
    },
    noDataText: {
      fontSize: 14,
      fontWeight: "500",
      color: c.textMuted,
    },

    // ─── Pagination ───────────────────────────────────
    paginationContainer: {
      backgroundColor: c.card,
      padding: Space.lg,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    paginationInfo: {
      fontSize: 13,
      color: c.textSecondary,
      marginBottom: Space.md,
      fontWeight: "500",
    },
    paginationControls: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    paginationButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: Radius.md,
      backgroundColor: c.surfaceElevated,
      borderWidth: 1,
      borderColor: c.border,
    },
    paginationButtonDisabled: {
      backgroundColor: c.background,
      borderColor: c.borderLight,
      opacity: 0.6,
    },
    paginationButtonText: {
      fontSize: 13,
      color: c.text,
      fontWeight: "600",
    },
    paginationButtonTextDisabled: {
      color: c.textMuted,
    },
  });

const styles = StyleSheet.create({
  amountColumn: {},
});

export default MyEarnings;
