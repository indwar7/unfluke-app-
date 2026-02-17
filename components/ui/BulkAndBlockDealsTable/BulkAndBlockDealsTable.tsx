import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { getBulkBlockDealsData } from "../../../constants/Unfluke_helpers/backend_helper";

const BulkAndBlockDealsTable = ({ company, isConsolidated }) => {
  const [loading, setLoading] = useState(true);
  const [bulkData, setBulkData] = useState([]);
  const [blockData, setBlockData] = useState([]);
  const [bulkHeadings, setBulkHeadings] = useState([]);
  const [blockHeadings, setBlockHeadings] = useState([]);
  const [activeTab, setActiveTab] = useState("bulk"); // "bulk" or "block"
  const [visibleCount, setVisibleCount] = useState(20); // Number of cards to show
  const CARDS_PER_PAGE = 20;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch Bulk deals (all pages)
        const firstBulk = await getBulkBlockDealsData({
          capcode: company,
          type: "Bulk",
          page: 1,
        });
        const bulkPages = Number(firstBulk?.pages || 1);
        const bulkResults = Array.isArray(firstBulk?.results)
          ? [...firstBulk.results]
          : [];
        setBulkHeadings(
          Array.isArray(firstBulk?.headings) ? firstBulk.headings : []
        );
        if (bulkPages > 1) {
          const bulkPromises = [];
          for (let p = 2; p <= bulkPages; p++) {
            bulkPromises.push(
              getBulkBlockDealsData({
                capcode: company,
                type: "Bulk",
                page: p,
              })
            );
          }
          const bulkPagesData = await Promise.all(bulkPromises);
          for (const pageData of bulkPagesData) {
            if (Array.isArray(pageData?.results)) {
              bulkResults.push(...pageData.results);
            }
          }
        }

        // Fetch Block deals (all pages)
        const firstBlock = await getBulkBlockDealsData({
          capcode: company,
          type: "Block",
          page: 1,
        });
        const blockPages = Number(firstBlock?.pages || 1);
        const blockResults = Array.isArray(firstBlock?.results)
          ? [...firstBlock.results]
          : [];
        setBlockHeadings(
          Array.isArray(firstBlock?.headings) ? firstBlock.headings : []
        );
        if (blockPages > 1) {
          const blockPromises = [];
          for (let p = 2; p <= blockPages; p++) {
            blockPromises.push(
              getBulkBlockDealsData({
                capcode: company,
                type: "Block",
                page: p,
              })
            );
          }
          const blockPagesData = await Promise.all(blockPromises);
          for (const pageData of blockPagesData) {
            if (Array.isArray(pageData?.results)) {
              blockResults.push(...pageData.results);
            }
          }
        }

        // Helper to locate a date-like key
        const findDateKey = (rows) => {
          if (!rows || !rows.length) return null;
          return (
            Object.keys(rows[0]).find((k) =>
              k.toLowerCase().includes("date")
            ) || null
          );
        };

        // Generic newest-first sort
        const sortNewestFirst = (rows) => {
          if (!rows || rows.length === 0) return rows;
          const dateKey = findDateKey(rows);
          if (!dateKey) return rows;
          return [...rows].sort((a, b) => {
            const aTime = new Date(a[dateKey]).getTime();
            const bTime = new Date(b[dateKey]).getTime();
            if (isNaN(aTime) && isNaN(bTime)) return 0;
            if (isNaN(aTime)) return 1;
            if (isNaN(bTime)) return -1;
            return bTime - aTime;
          });
        };

        setBulkData(sortNewestFirst(bulkResults));
        setBlockData(sortNewestFirst(blockResults));
      } catch (error) {
        console.error("Error fetching deals data:", error);
        setBulkData([]);
        setBlockData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [company, isConsolidated]);

  // Reset visible count when switching tabs
  useEffect(() => {
    setVisibleCount(CARDS_PER_PAGE);
  }, [activeTab]);

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const months = [
      "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
      "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
    ];

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${monthName} ${year}`;
  };

  const formatVolume = (volume) => {
    if (!volume) return "0";
    return volume.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getFieldValue = (deal, possibleKeys) => {
    for (const key of possibleKeys) {
      if (deal[key] !== undefined && deal[key] !== null) {
        return deal[key];
      }
    }
    return "";
  };

  const renderDealItem = (deal, isBlock = false) => {
    const dateValue = getFieldValue(deal, ["Deal Date", "Date", "date"]);
    const nameValue = getFieldValue(deal, ["Client Name", "Name", "Company Name", "client_name", "name"]);
    const volumeValue = getFieldValue(deal, ["Traded Volume", "traded_volume", "Volume"]);
    const activityValue = getFieldValue(deal, ["Activity", "activity", "Type"]);
    const priceValue = getFieldValue(deal, ["Average Price", "average_price", "Price"]);

    return (
      <View style={styles.dealCard} key={deal._id || deal["Serial No"] || Math.random()}>
        <Text style={styles.dateText}>
          {formatDate(dateValue)}
        </Text>
        <Text style={styles.nameText}>
          {nameValue || "N/A"}
        </Text>

        <View style={styles.dataRow}>
          <Text style={styles.label}>Traded Volume:</Text>
          <Text style={styles.value}>{formatVolume(volumeValue)}</Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={styles.label}>Activity:</Text>
          <Text
            style={[
              styles.value,
              activityValue?.toUpperCase() === "BUY" ? styles.buyText : styles.sellText,
            ]}
          >
            {activityValue?.toUpperCase() || "N/A"}
          </Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={styles.label}>Average Price:</Text>
          <Text style={styles.value}>₹{priceValue || "0"}</Text>
        </View>
      </View>
    );
  };

  const handleViewMore = () => {
    setVisibleCount((prev) => prev + CARDS_PER_PAGE);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const hasNoData = bulkData.length === 0 && blockData.length === 0;
  const showBulk = activeTab === "bulk";
  const dataToRender = showBulk ? bulkData : blockData;
  const visibleData = dataToRender.slice(0, visibleCount);
  const hasMore = visibleCount < dataToRender.length;

  return (
    <ScrollView style={styles.container}>
      {/* Toggle Header */}
      <View style={styles.toggleRow}>
        <Pressable
          style={[
            styles.tabButton,
            activeTab === "bulk" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("bulk")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "bulk" && styles.activeTabText,
            ]}
          >
            Bulk Deals
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.tabButton,
            activeTab === "block" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("block")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "block" && styles.activeTabText,
            ]}
          >
            Block Deals
          </Text>
        </Pressable>
      </View>

      {hasNoData ? (
        <Text style={styles.noDataText}>No data available</Text>
      ) : dataToRender.length === 0 ? (
        <Text style={styles.noDataText}>
          No {activeTab === "bulk" ? "Bulk" : "Block"} deals available
        </Text>
      ) : (
        <>
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              gap: 14,
              marginTop: 16,
            }}
          >
            {visibleData.map((deal, index) =>
              renderDealItem(deal, activeTab === "block")
            )}
          </View>

          {hasMore && (
            <Pressable style={styles.viewMoreButton} onPress={handleViewMore}>
              <Text style={styles.viewMoreText}>View More</Text>
            </Pressable>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 200,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: "#d0f0fd",
    borderBottomColor: "#006400",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#777",
  },
  activeTabText: {
    color: "#2441F0",
    fontWeight: "bold",
  },
  dealCard: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dateText: {
    fontSize: 13,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: "#A0A0A0",
    marginBottom: 6,
    borderBottomWidth: 0.5,
    borderColor: "#E0E0E0",
    backgroundColor: "#fcfcfc",
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
  },
  nameText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 14,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 13,
    color: "#999",
  },
  value: {
    fontSize: 13,
    fontWeight: "500",
    color: "#000",
  },
  buyText: {
    color: "#006400",
    paddingVertical: 4,
    paddingHorizontal: 13,
    backgroundColor: "#DFFFE0",
    borderRadius: 20,
  },
  sellText: {
    color: "#8B0000",
    paddingVertical: 4,
    paddingHorizontal: 13,
    backgroundColor: "#FFE0E0",
    borderRadius: 20,
  },
  noDataText: {
    textAlign: "center",
    marginVertical: 20,
    color: "#666",
  },
  viewMoreButton: {
    backgroundColor: "#2441F0",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
    marginHorizontal: 16,
  },
  viewMoreText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default BulkAndBlockDealsTable;