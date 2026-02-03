import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart } from "react-native-chart-kit";

/* ================= COMPREHENSIVE FUNDAMENTAL SCREEN ================= */

export default function FundamentalScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStock, setSelectedStock] = useState("RELIANCE");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("Profit & Loss");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const screenWidth = Dimensions.get("window").width;

  // Sample stock list for search (replace with API call)
  const stockList = [
    { symbol: "RELIANCE", name: "Reliance Industries Ltd" },
    { symbol: "TCS", name: "Tata Consultancy Services" },
    { symbol: "INFY", name: "Infosys Ltd" },
    { symbol: "HDFCBANK", name: "HDFC Bank Ltd" },
    { symbol: "ICICIBANK", name: "ICICI Bank Ltd" },
    { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd" },
    { symbol: "ITC", name: "ITC Ltd" },
    { symbol: "SBIN", name: "State Bank of India" },
    { symbol: "WIPRO", name: "Wipro Ltd" },
    { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd" },
  ];

  useEffect(() => {
    fetchFundamentalData(selectedStock);
  }, [selectedStock]);

  // Search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const filtered = stockList.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const selectStock = (stock) => {
    setSelectedStock(stock.symbol);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  // Fetch fundamental data
  const fetchFundamentalData = async (symbol) => {
    try {
      setLoading(true);
      setError(null);

      // Replace with your actual API endpoint
      // const response = await fetch(`https://unfluke.in/api/fundamentals/${symbol}`);
      // const result = await response.json();

      // Mock data for demonstration
      const mockData = generateMockData(symbol);
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setData(mockData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data (replace with real API data)
  const generateMockData = (symbol) => {
    return {
      stockInfo: {
        symbol: symbol,
        name: stockList.find((s) => s.symbol === symbol)?.name || symbol,
        currentPrice: "2,456.30",
        change: "+23.50 (0.97%)",
        marketCap: "16,54,231 Cr",
      },
      "Profit & Loss": {
        Sales: "5,17,298 Cr",
        Expenses: "4,69,908 Cr",
        OperatingProfit: "47,390 Cr",
        OPM: "9.16%",
        OtherIncome: "26,773 Cr",
        EBITDA: "74,163 Cr",
        Depreciation: "17,981 Cr",
        EBIT: "56,182 Cr",
        Interest: "10,054 Cr",
        PBT: "46,128 Cr",
        Tax: "10,866 Cr",
        NetProfit: "35,262 Cr",
        NPM: "6.81%",
        EPS: "26.06",
      },
      "Balance Sheet": {
        TotalAssets: "9,52,000 Cr",
        CurrentAssets: "3,45,000 Cr",
        FixedAssets: "4,80,000 Cr",
        Cash: "1,12,000 Cr",
        Inventory: "98,000 Cr",
        TotalLiabilities: "4,20,000 Cr",
        CurrentLiabilities: "1,10,000 Cr",
        LongTermDebt: "3,10,000 Cr",
        NetWorth: "5,32,000 Cr",
        BookValue: "401.34",
      },
      "Cash Flow": {
        CashFromOperations: "62,400 Cr",
        CashFromInvesting: "-41,200 Cr",
        CashFromFinancing: "-9,800 Cr",
        NetCashFlow: "11,400 Cr",
        FreeCashFlow: "34,500 Cr",
      },
      Ratios: {
        ROE: "14.2%",
        ROCE: "16.8%",
        ROA: "8.5%",
        DebtEquity: "0.58",
        CurrentRatio: "3.14",
        PE: "24.8",
        PB: "3.9",
        DividendYield: "0.35%",
      },
      charts: {
        revenue: [400, 420, 450, 480, 517],
        profit: [25, 28, 30, 33, 35],
        years: ["2020", "2021", "2022", "2023", "2024"],
      },
    };
  };

  const tabs = ["Profit & Loss", "Balance Sheet", "Cash Flow", "Ratios"];

  // Loading state
  if (loading && !data) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar backgroundColor="#4f46e5" barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.title}>Fundamentals</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar backgroundColor="#4f46e5" barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Fundamentals</Text>
        
        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search stocks..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setShowSearchResults(false);
              }}
              style={styles.clearBtn}
            >
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* SEARCH RESULTS DROPDOWN */}
        {showSearchResults && searchResults.length > 0 && (
          <View style={styles.searchResults}>
            <ScrollView style={styles.searchResultsScroll} nestedScrollEnabled>
              {searchResults.map((stock) => (
                <TouchableOpacity
                  key={stock.symbol}
                  style={styles.searchResultItem}
                  onPress={() => selectStock(stock)}
                >
                  <Text style={styles.searchResultSymbol}>{stock.symbol}</Text>
                  <Text style={styles.searchResultName}>{stock.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* STOCK INFO BANNER */}
      {data && (
        <View style={styles.stockBanner}>
          <View style={styles.stockBannerLeft}>
            <Text style={styles.stockSymbol}>{data.stockInfo.symbol}</Text>
            <Text style={styles.stockName}>{data.stockInfo.name}</Text>
          </View>
          <View style={styles.stockBannerRight}>
            <Text style={styles.stockPrice}>{data.stockInfo.currentPrice}</Text>
            <Text style={styles.stockChange}>{data.stockInfo.change}</Text>
          </View>
        </View>
      )}

      {/* TABS */}
      <View style={styles.tabs}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tabBtn, tab === t && styles.tabActive]}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[styles.tabText, tab === t && styles.tabTextActive]}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CONTENT */}
      <ScrollView style={styles.content}>
        {/* CHARTS SECTION */}
        {data && data.charts && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Performance Trends</Text>
            
            {/* Revenue Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartLabel}>Revenue (in Cr)</Text>
              <LineChart
                data={{
                  labels: data.charts.years,
                  datasets: [{ data: data.charts.revenue }],
                }}
                width={screenWidth - 64}
                height={180}
                chartConfig={{
                  backgroundColor: "#fff",
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: "#4f46e5",
                  },
                }}
                bezier
                style={styles.chart}
              />
            </View>

            {/* Profit Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartLabel}>Net Profit (in Cr)</Text>
              <LineChart
                data={{
                  labels: data.charts.years,
                  datasets: [{ data: data.charts.profit }],
                }}
                width={screenWidth - 64}
                height={180}
                chartConfig={{
                  backgroundColor: "#fff",
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: "#10b981",
                  },
                }}
                bezier
                style={styles.chart}
              />
            </View>
          </View>
        )}

        {/* DATA CARD */}
        {data && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{tab}</Text>

            {Object.entries(data[tab] || {}).map(([k, v]) => (
              <View key={k} style={styles.row}>
                <Text style={styles.label}>
                  {k.replace(/([A-Z])/g, " $1").trim()}
                </Text>
                <Text style={[
                  styles.value,
                  v.toString().includes("-") && styles.negativeValue,
                  v.toString().includes("+") && styles.positiveValue,
                ]}>
                  {v}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* MARKET CAP INFO */}
        {data && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Market Information</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Market Cap</Text>
              <Text style={styles.value}>{data.stockInfo.marketCap}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>52 Week High</Text>
              <Text style={styles.value}>2,856.75</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>52 Week Low</Text>
              <Text style={styles.value}>2,120.30</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Volume</Text>
              <Text style={styles.value}>1.2M</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* REFRESH BUTTON */}
      <TouchableOpacity
        style={styles.refreshBtn}
        onPress={() => fetchFundamentalData(selectedStock)}
      >
        <Text style={styles.refreshText}>
          {loading ? "↻" : "⟳"} Refresh
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#4f46e5",
  },

  header: {
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 12 : 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#4f46e5",
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 12,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginTop: 8,
  },

  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: "#111827",
  },

  clearBtn: {
    padding: 4,
  },

  clearText: {
    fontSize: 18,
    color: "#6b7280",
  },

  searchResults: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 8,
    maxHeight: 200,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  searchResultsScroll: {
    maxHeight: 200,
  },

  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  searchResultSymbol: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  searchResultName: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  stockBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#5b52ea",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  stockBannerLeft: {
    flex: 1,
  },

  stockSymbol: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },

  stockName: {
    color: "#e0e7ff",
    fontSize: 12,
    marginTop: 2,
  },

  stockBannerRight: {
    alignItems: "flex-end",
  },

  stockPrice: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  stockChange: {
    color: "#10b981",
    fontSize: 13,
    marginTop: 2,
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    elevation: 4,
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },

  tabActive: {
    borderBottomWidth: 3,
    borderColor: "#4f46e5",
  },

  tabText: {
    fontSize: 10,
    color: "#6b7280",
    fontWeight: "500",
  },

  tabTextActive: {
    color: "#4f46e5",
    fontWeight: "700",
  },

  content: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f4f6fb",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "#111827",
  },

  chartContainer: {
    marginBottom: 20,
  },

  chartLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },

  chart: {
    borderRadius: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: "#e5e7eb",
  },

  label: {
    color: "#374151",
    fontSize: 14,
    width: "60%",
  },

  value: {
    fontWeight: "700",
    color: "#111827",
    fontSize: 14,
    textAlign: "right",
  },

  positiveValue: {
    color: "#10b981",
  },

  negativeValue: {
    color: "#ef4444",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6fb",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },

  refreshBtn: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#4f46e5",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  refreshText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});