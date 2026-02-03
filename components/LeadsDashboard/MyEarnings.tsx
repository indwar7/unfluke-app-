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
import { Search } from "lucide-react-native";

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

  const data = user.partnerList || [];
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [partnersPage, setPartnersPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 8;

  const groupedData = useMemo(() => groupByMonthAndYear(data), [data]);

  const filteredData = useMemo(
    () =>
      data.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
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
      <View key={item.id} style={styles.tableRow}>
  <View style={styles.tableCell}>
    <AppId getValue={() => (currentPage - 1) * itemsPerPage + index + 1} />
  </View>
  <View style={styles.tableCell}>
    <Text style={styles.tableCellText}>{item.month}</Text>
  </View>
  <View style={styles.tableCell}>
    <Text style={styles.tableCellText}>
      ₹{item.brokerage.toLocaleString()}
    </Text>
  </View>
  <View style={styles.tableCell}>
    <Text style={styles.tableCellText}>
      ₹{item.share.toLocaleString()}
    </Text>
  </View>
  <View style={styles.tableCell}>
    <TouchableOpacity>
      <Text style={styles.viewLink}>View</Text>
    </TouchableOpacity>
  </View>
</View>
    ));
  };

  // Render partners items
  const renderPartnersItems = () => {
    return displayedItems.map((item, index) => (
      <View key={item.id} style={styles.tableRow}>
        <View style={[styles.tableCell]}>
          <AppId
            getValue={() => (partnersPage - 1) * itemsPerPage + index + 1}
          />
        </View>
        <View style={[styles.tableCell]}>
          <Text style={styles.tableCellText}>{item.client}</Text>
        </View>
        <View style={[styles.tableCell, styles.amountColumn]}>
          <Text style={styles.tableCellText}>
            ₹{item.totalBrokerage?.toLocaleString()}
          </Text>
        </View>
        <View style={[styles.tableCell]}>
          <Text style={styles.tableCellText}>{item.share}%</Text>
        </View>
        <View style={[styles.tableCell,]}>
          <Text style={styles.tableCellText}>
            ₹{item.apBrokerage?.toLocaleString()}
          </Text>
        </View>
        <View style={[styles.tableCell]}>
          <Text style={styles.tableCellText}>{item.date}</Text>
        </View>
      </View>
    ));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading earnings data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* My Earnings Section */}
      <View style={styles.outerSectionContainer}>
        <View style={styles.sectionContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Earnings</Text>
          </View>

          <View style={styles.tableContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.table}>
                {/* Table Header */}
               <View style={styles.tableHeader}>
  <View style={styles.tableCell}>
    <Text style={styles.tableHeaderText}>SL NO.</Text>
  </View>
  <View style={styles.tableCell}>
    <Text style={styles.tableHeaderText}>MONTH</Text>
  </View>
  <View style={styles.tableCell}>
    <Text style={styles.tableHeaderText}>TOTAL BROKERAGE</Text>
  </View>
  <View style={styles.tableCell}>
    <Text style={styles.tableHeaderText}>MY SHARE</Text>
  </View>
  <View style={styles.tableCell}>
    <Text style={styles.tableHeaderText}>INVOICE</Text>
  </View>
</View>

                {/* Table Body */}
                <ScrollView style={styles.tableBody}>
                  {groupedData.length > 0 ? (
                    renderEarningsItems()
                  ) : (
                    <View style={styles.noDataContainer}>
                      <Text style={styles.noDataText}>No data available</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </ScrollView>
          </View>

          <View style={styles.paginationContainer}>
            <Text style={styles.paginationInfo}>
              Showing {Math.min(groupedData.length, itemsPerPage)} of{" "}
              {groupedData.length} Results
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

              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  currentPage ===
                    Math.ceil(groupedData.length / itemsPerPage) &&
                    styles.paginationButtonDisabled,
                ]}
                disabled={
                  currentPage === Math.ceil(groupedData.length / itemsPerPage)
                }
                onPress={handleNext}
              >
                <Text
                  style={[
                    styles.paginationButtonText,
                    currentPage ===
                      Math.ceil(groupedData.length / itemsPerPage) &&
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
      {/* My Partners Section */}
      <View style={styles.outerSectionContainer}>
        <View style={styles.sectionContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Partners</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <TextInput
                style={styles.searchInput}
                value={searchTerm}
                onChangeText={(text) => {
                  setSearchTerm(text);
                  setPartnersPage(1);
                }}
                placeholder="Search for Name"
                placeholderTextColor="#9ca3af"
              />
              <Search color="#D3D3D3" style={styles.searchIcon} size={15} />
            </View>
          </View>

          <View style={styles.tableContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <View style={[styles.tableCell]}>
                    <Text style={styles.tableHeaderText}>SL NO.</Text>
                  </View>
                  <View style={[styles.tableCell]}>
                    <Text style={styles.tableHeaderText}>CLIENT ID</Text>
                  </View>
                  <View style={[styles.tableCell]}>
                    <Text style={styles.tableHeaderText}>TOTAL BROKERAGE</Text>
                  </View>
                  <View style={[styles.tableCell]}>
                    <Text style={styles.tableHeaderText}>SHARING (%)</Text>
                  </View>
                  <View style={[styles.tableCell,]}>
                    <Text style={styles.tableHeaderText}>MY SHARE</Text>
                  </View>
                  <View style={[styles.tableCell]}>
                    <Text style={styles.tableHeaderText}>ACTIVATION DATE</Text>
                  </View>
                </View>

                {/* Table Body */}
                <ScrollView style={styles.tableBody}>
                  {displayedItems.length > 0 ? (
                    renderPartnersItems()
                  ) : (
                    <View style={styles.noDataContainer}>
                      <Text style={styles.noDataText}>No data available</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </ScrollView>
          </View>

          <View style={styles.paginationContainer}>
            <Text style={styles.paginationInfo}>
              Showing {displayedItems.length} of {filteredData.length} Results
            </Text>

            <View style={styles.paginationControls}>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  partnersPage === 1 && styles.paginationButtonDisabled,
                ]}
                disabled={partnersPage === 1}
                onPress={handlePartnersPrevious}
              >
                <Text
                  style={[
                    styles.paginationButtonText,
                    partnersPage === 1 && styles.paginationButtonTextDisabled,
                  ]}
                >
                  Previous
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  partnersPage === totalPages &&
                    styles.paginationButtonDisabled,
                ]}
                disabled={partnersPage === totalPages}
                onPress={handlePartnersNext}
              >
                <Text
                  style={[
                    styles.paginationButtonText,
                    partnersPage === totalPages &&
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 18,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: '#f4f8fd',
  },
  loadingText: {
    marginTop: 10,
    color: "#6b7280",
    fontSize: 16,
  },
  outerSectionContainer: {
    borderRadius: 8,
    borderWidth: 0.2,
    overflow: "hidden",
  },
  sectionContainer: {
    backgroundColor: "#ffffff",
    //  shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  header: {
    backgroundColor: "#ffffff",
    padding: 16,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  searchContainer: {
    backgroundColor: "#ffffff",
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
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    paddingLeft: 37,
    fontSize: 13,
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  tableContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  table: {
    minWidth: "100%",
  },
    tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 12,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 12,
  },
  tableCell: {
    flex: 1, // Equal distribution of space
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  tableCellText: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
  },
  
  tableBody: {
    flex: 1,
  },
  
  // Column widths
  // slNoColumn: {
  //   width: 60,
  // },
  // monthColumn: {
  //   width: 150,
  // },
  // clientColumn: {
  //   width: 150,
  // },
  // amountColumn: {
  //   width: 125,
  // },
  // percentColumn: {
  //   width: 100,
  // },
  // shareColumn: {
  //   width: 120,
  // },
  // invoiceColumn: {
  //   width: 100,
  // },
  // dateColumn: {
  //   width: 120,
  // },
  noDataContainer: {
    padding: 40,
    alignItems: "center",
  },
  noDataText: {
    fontSize: 16,
    color: "#6b7280",
  },
  paginationContainer: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  paginationInfo: {
    fontSize: 14,
    color: "#6b7280",
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
    backgroundColor: "#f3f4f6",
    marginHorizontal: 2,
  },
  paginationButtonActive: {
    backgroundColor: "#3b82f6",
  },
  paginationButtonDisabled: {
    backgroundColor: "#f9fafb",
  },
  paginationButtonText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  paginationButtonTextActive: {
    color: "#ffffff",
  },
  paginationButtonTextDisabled: {
    color: "#9ca3af",
  },
  viewLink: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
  },
});

export default MyEarnings;
