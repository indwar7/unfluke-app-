import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  TextInput,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart } from "react-native-chart-kit";

/* ================= CONFIG ================= */

const WIDTH = Dimensions.get("window").width;
const CHART_WIDTH = WIDTH - 48;

/* ================= TYPES ================= */

interface StockInfo {
  name: string;
  code: number;
  type: string;
  symbol: string;
}

interface FinancialData {
  profitLoss: Record<string, string | number>;
  balanceSheet: Record<string, string | number>;
  cashFlow: Record<string, string | number>;
  ratios: Record<string, string | number>;
  charts: {
    years: string[];
    sales: number[];
    profit: number[];
    eps: number[];
    operatingProfit: number[];
    ebitda: number[];
    operatingCashFlow: number[];
  };
}

/* ================= HELPERS ================= */

const formatCr = (v: any): string => {
  if (v === null || v === undefined || v === "" || v === "-") return "-";
  const num = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(num)) return "-";
  
  const absNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";
  
  if (absNum >= 100000) return `${sign}₹${(absNum / 100000).toFixed(2)} L Cr`;
  if (absNum >= 1000) return `${sign}₹${(absNum / 1000).toFixed(2)} K Cr`;
  return `${sign}₹${absNum.toFixed(2)} Cr`;
};

const formatPercent = (v: any): string => {
  if (v === null || v === undefined || v === "" || v === "-") return "-";
  const num = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(num)) return "-";
  return `${num.toFixed(2)}%`;
};

const formatRatio = (v: any): string => {
  if (v === null || v === undefined || v === "" || v === "-") return "-";
  const num = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(num)) return "-";
  return num.toFixed(2);
};

const safeNum = (v: any): number => {
  if (v === null || v === undefined || v === "" || v === "-") return 0;
  const num = typeof v === "string" ? parseFloat(v) : v;
  return isNaN(num) ? 0 : num;
};

// SUPER FLEXIBLE VALUE FINDER - searches ALL possible variations
const findValue = (obj: any, ...possibleKeys: string[]): any => {
  if (!obj || typeof obj !== 'object') return null;
  
  // First try exact matches
  for (const key of possibleKeys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      return obj[key];
    }
  }
  
  // Then try case-insensitive matches
  const objKeys = Object.keys(obj);
  for (const searchKey of possibleKeys) {
    const lowerSearch = searchKey.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const objKey of objKeys) {
      const lowerObj = objKey.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (lowerObj === lowerSearch || lowerObj.includes(lowerSearch) || lowerSearch.includes(lowerObj)) {
        if (obj[objKey] !== undefined && obj[objKey] !== null && obj[objKey] !== "") {
          return obj[objKey];
        }
      }
    }
  }
  
  return null;
};

/* ================= SCREEN ================= */

export default function FundamentalScreen() {
  const [selectedStock, setSelectedStock] = useState<StockInfo>({
    name: "Reliance Industries",
    code: 476,
    type: "S",
    symbol: "RELIANCE",
  });
  const [allStocks, setAllStocks] = useState<StockInfo[]>([]);
  const [loadingStocks, setLoadingStocks] = useState(false);
  const [tab, setTab] = useState("Profit & Loss");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FinancialData | null>(null);
  const [showStockPicker, setShowStockPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadFundamentals();
  }, [selectedStock]);

  useEffect(() => {
    if (showStockPicker && allStocks.length === 0) {
      fetchAllStocks();
    }
  }, [showStockPicker]);

  const fetchAllStocks = async () => {
    try {
      setLoadingStocks(true);
      setAllStocks(getStockList());
    } catch (e) {
      setAllStocks(getStockList());
    } finally {
      setLoadingStocks(false);
    }
  };

  const getStockList = (): StockInfo[] => {
    return [
      { name: "Reliance Industries", code: 476, type: "S", symbol: "RELIANCE" },
      { name: "TCS", code: 11536, type: "S", symbol: "TCS" },
      { name: "HDFC Bank", code: 7229, type: "S", symbol: "HDFCBANK" },
      { name: "Infosys", code: 7595, type: "S", symbol: "INFY" },
      { name: "ICICI Bank", code: 4963, type: "S", symbol: "ICICIBANK" },
      { name: "Hindustan Unilever", code: 1594, type: "S", symbol: "HINDUNILVR" },
      { name: "ITC", code: 1660, type: "S", symbol: "ITC" },
      { name: "State Bank of India", code: 3045, type: "S", symbol: "SBIN" },
      { name: "Bharti Airtel", code: 10604, type: "S", symbol: "BHARTIARTL" },
      { name: "Kotak Mahindra Bank", code: 1922, type: "S", symbol: "KOTAKBANK" },
      { name: "Bajaj Finance", code: 16675, type: "S", symbol: "BAJFINANCE" },
      { name: "Asian Paints", code: 3718, type: "S", symbol: "ASIANPAINT" },
      { name: "HCL Technologies", code: 7229, type: "S", symbol: "HCLTECH" },
      { name: "Larsen & Toubro", code: 11483, type: "S", symbol: "LT" },
      { name: "Axis Bank", code: 5900, type: "S", symbol: "AXISBANK" },
      { name: "Wipro", code: 3787, type: "S", symbol: "WIPRO" },
      { name: "Maruti Suzuki", code: 10999, type: "S", symbol: "MARUTI" },
      { name: "Sun Pharma", code: 3351, type: "S", symbol: "SUNPHARMA" },
      { name: "Titan Company", code: 3506, type: "S", symbol: "TITAN" },
      { name: "Nestle India", code: 17963, type: "S", symbol: "NESTLEIND" },
      { name: "UltraTech Cement", code: 2952, type: "S", symbol: "ULTRACEMCO" },
      { name: "Tech Mahindra", code: 13538, type: "S", symbol: "TECHM" },
      { name: "Power Grid", code: 14977, type: "S", symbol: "POWERGRID" },
      { name: "NTPC", code: 11630, type: "S", symbol: "NTPC" },
      { name: "Tata Steel", code: 3499, type: "S", symbol: "TATASTEEL" },
      { name: "IndusInd Bank", code: 5258, type: "S", symbol: "INDUSINDBK" },
      { name: "Bajaj Finserv", code: 16675, type: "S", symbol: "BAJAJFINSV" },
      { name: "Mahindra & Mahindra", code: 2304, type: "S", symbol: "M&M" },
      { name: "Coal India", code: 20374, type: "S", symbol: "COALINDIA" },
      { name: "Tata Motors", code: 3456, type: "S", symbol: "TATAMOTORS" },
      { name: "JSW Steel", code: 3150, type: "S", symbol: "JSWSTEEL" },
      { name: "Adani Ports", code: 15083, type: "S", symbol: "ADANIPORTS" },
      { name: "Cipla", code: 694, type: "S", symbol: "CIPLA" },
      { name: "Grasim Industries", code: 1215, type: "S", symbol: "GRASIM" },
      { name: "Britannia", code: 547, type: "S", symbol: "BRITANNIA" },
      { name: "Hindalco", code: 1363, type: "S", symbol: "HINDALCO" },
      { name: "Dr Reddy's", code: 3962, type: "S", symbol: "DRREDDY" },
      { name: "Eicher Motors", code: 505, type: "S", symbol: "EICHERMOT" },
      { name: "Hero MotoCorp", code: 1348, type: "S", symbol: "HEROMOTOCO" },
      { name: "Shree Cement", code: 20930, type: "S", symbol: "SHREECEM" },
      { name: "ONGC", code: 2475, type: "S", symbol: "ONGC" },
      { name: "Tata Consumer", code: 3432, type: "S", symbol: "TATACONSUM" },
      { name: "Divis Labs", code: 10940, type: "S", symbol: "DIVISLAB" },
      { name: "Adani Enterprises", code: 25, type: "S", symbol: "ADANIENT" },
      { name: "Apollo Hospitals", code: 157, type: "S", symbol: "APOLLOHOSP" },
      { name: "Bajaj Auto", code: 16669, type: "S", symbol: "BAJAJ-AUTO" },
      { name: "BPCL", code: 526, type: "S", symbol: "BPCL" },
      { name: "SBI Life", code: 21808, type: "S", symbol: "SBILIFE" },
      { name: "HDFC Life", code: 21809, type: "S", symbol: "HDFCLIFE" },
      { name: "UPL", code: 13404, type: "S", symbol: "UPL" },
      { name: "DMart", code: 23450, type: "S", symbol: "DMART" },
      { name: "Bank of Baroda", code: 238, type: "S", symbol: "BANKBARODA" },
      { name: "Canara Bank", code: 580, type: "S", symbol: "CANBK" },
      { name: "PNB", code: 2730, type: "S", symbol: "PNB" },
      { name: "Trent", code: 3547, type: "S", symbol: "TRENT" },
      { name: "Vedanta", code: 3063, type: "S", symbol: "VEDL" },
      { name: "Adani Green", code: 25228, type: "S", symbol: "ADANIGREEN" },
      { name: "Adani Power", code: 15272, type: "S", symbol: "ADANIPOWER" },
      { name: "Tata Power", code: 3486, type: "S", symbol: "TATAPOWER" },
      { name: "Yes Bank", code: 11693, type: "S", symbol: "YESBANK" },
      { name: "Vodafone Idea", code: 11321, type: "S", symbol: "IDEA" },
      { name: "Zomato", code: 543320, type: "S", symbol: "ZOMATO" },
      { name: "Paytm", code: 543396, type: "S", symbol: "PAYTM" },
    ].sort((a, b) => a.name.localeCompare(b.name));
  };

  const loadFundamentals = async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log(`🔍 Fetching ${selectedStock.name} (${selectedStock.code})...`);

      const [plRes, bsRes, cfRes] = await Promise.all([
        fetch(`https://api.unfluke.in/api/screener/getProfitLoss?type=${selectedStock.type}&capcode=${selectedStock.code}`),
        fetch(`https://api.unfluke.in/api/screener/getBalanceSheet?type=${selectedStock.type}&capcode=${selectedStock.code}`),
        fetch(`https://api.unfluke.in/api/screener/getCashFlow?type=${selectedStock.type}&capcode=${selectedStock.code}`),
      ]);

      if (!plRes.ok || !bsRes.ok || !cfRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [pl, bs, cf] = await Promise.all([plRes.json(), bsRes.json(), cfRes.json()]);

      console.log("✅ API Response received");
      console.log(`P&L years: ${pl?.results ? Object.keys(pl.results).length : 0}`);
      console.log(`BS years: ${bs?.results ? Object.keys(bs.results).length : 0}`);
      console.log(`CF years: ${cf?.results ? Object.keys(cf.results).length : 0}`);

      const transformedData = transform(pl, bs, cf);
      setData(transformedData);
      console.log("✅ Data transformed successfully");
    } catch (e: any) {
      console.error("❌ Error:", e);
      setError(e.message || "Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const transform = (pl: any, bs: any, cf: any): FinancialData => {
    // Get ALL available years
    const getYears = (data: any): string[] => {
      if (!data?.results) return [];
      return Object.keys(data.results).sort();
    };

    const years = getYears(pl);
    const last5Years = years.slice(-5);
    const latestYear = years[years.length - 1];

    console.log(`📅 Years: ${years.join(", ")}`);
    console.log(`📅 Latest: ${latestYear}`);

    // ULTRA ROBUST VALUE EXTRACTOR
    const extractLatest = (data: any, ...keys: string[]): any => {
      if (!data?.results || !latestYear) return null;
      const yearData = data.results[latestYear];
      if (!yearData) return null;

      // Handle array format
      if (Array.isArray(yearData)) {
        for (const item of yearData) {
          const val = findValue(item, ...keys);
          if (val !== null) return val;
        }
      } else {
        // Handle object format
        const val = findValue(yearData, ...keys);
        if (val !== null) return val;
      }
      return null;
    };

    // EXTRACT TREND DATA
    const extractTrend = (data: any, ...keys: string[]): number[] => {
      if (!data?.results) return [];
      return last5Years.map(year => {
        const yearData = data.results[year];
        if (!yearData) return 0;

        if (Array.isArray(yearData)) {
          for (const item of yearData) {
            const val = findValue(item, ...keys);
            if (val !== null) return safeNum(val);
          }
        } else {
          const val = findValue(yearData, ...keys);
          if (val !== null) return safeNum(val);
        }
        return 0;
      });
    };

    // COMPREHENSIVE FIELD NAME VARIATIONS
    const sales = extractLatest(pl, 
      "Sales", "Total Revenue", "Revenue", "Total Sales", "Net Sales", 
      "Total Income", "Operating Revenue", "Turnover"
    );
    
    const expenses = extractLatest(pl,
      "Expenses", "Total Expenses", "Operating Expenses", "Total Cost",
      "Cost of Revenue", "Operating Cost"
    );
    
    const operatingProfit = extractLatest(pl,
      "Operating Profit", "EBIT", "Operating Income", "PBIT",
      "Profit from Operations", "Operating EBIT"
    );
    
    const opm = extractLatest(pl,
      "OPM%", "OPM", "Operating Margin", "Operating Profit Margin",
      "EBIT Margin", "Operating Margin %"
    );
    
    const ebitda = extractLatest(pl,
      "EBITDA", "EBIDTA", "Earnings Before Interest Tax Depreciation Amortization"
    );
    
    const depreciation = extractLatest(pl,
      "Depreciation expense", "Depreciation", "Depreciation and Amortization",
      "Depreciation & Amortization", "D&A", "Amortisation"
    );
    
    const ebit = extractLatest(pl,
      "EBIT", "Operating Profit", "Earnings Before Interest and Tax",
      "Operating EBIT"
    );
    
    const interest = extractLatest(pl,
      "Interest expense", "Interest", "Finance Cost", "Interest Expenses",
      "Financial Expenses", "Interest Cost"
    );
    
    const pbt = extractLatest(pl,
      "Profit Before Tax", "PBT", "Earnings Before Tax", "Pre-tax Profit",
      "Profit before taxation"
    );
    
    const tax = extractLatest(pl,
      "Tax expense", "Tax", "Income Tax", "Tax Expenses",
      "Provision for Tax", "Taxation"
    );
    
    const taxPercent = extractLatest(pl,
      "Tax%", "Tax Rate", "Tax Percentage", "Effective Tax Rate"
    );
    
    const netProfit = extractLatest(pl,
      "Net Profit", "Profit After Tax", "PAT", "Net Income",
      "Profit for the year", "Net Earnings", "Bottom Line"
    );
    
    const npm = extractLatest(pl,
      "NPM%", "NPM", "Net Profit Margin", "Net Margin",
      "Profit Margin", "Net Profit Margin %"
    );
    
    const eps = extractLatest(pl,
      "EPS (Adjusted)", "EPS", "Earnings Per Share", "Basic EPS",
      "Diluted EPS", "EPS Adjusted"
    );
    
    const bookValue = extractLatest(pl,
      "Book Value (Adjusted)", "Book Value", "Book Value per Share",
      "BVPS", "Net Asset Value"
    );

    // BALANCE SHEET
    const totalAssets = extractLatest(bs,
      "Total Assets", "Assets", "Total Asset"
    );
    
    const fixedAssets = extractLatest(bs,
      "Fixed Assets", "Net Fixed Assets", "Property Plant Equipment",
      "PPE", "Tangible Assets", "Non-Current Assets"
    );
    
    const currentAssets = extractLatest(bs,
      "Current Assets", "Total Current Assets"
    );
    
    const investments = extractLatest(bs,
      "Investments", "Total Investments", "Investment"
    );
    
    const shareCapital = extractLatest(bs,
      "Share Capital", "Equity Share Capital", "Capital Stock"
    );
    
    const reserves = extractLatest(bs,
      "Reserves and Surplus", "Reserves", "Retained Earnings",
      "Reserves & Surplus"
    );
    
    const shareholdersEquity = extractLatest(bs,
      "Shareholders Equity", "Total Equity", "Net Worth",
      "Shareholders' Equity", "Equity", "Stockholders Equity"
    );
    
    const totalDebt = extractLatest(bs,
      "Total Debt", "Debt", "Borrowings", "Total Borrowings",
      "Long Term Debt", "Financial Debt"
    );
    
    const currentLiabilities = extractLatest(bs,
      "Current Liabilities", "Total Current Liabilities"
    );
    
    const totalLiabilities = extractLatest(bs,
      "Total Liabilities", "Liabilities", "Total Liability"
    );

    // CASH FLOW
    const cashBegin = extractLatest(cf,
      "Cash at beginning of year", "Opening Cash", "Cash Beginning",
      "Beginning Cash Balance"
    );
    
    const operatingCF = extractLatest(cf,
      "Cash from operating activities", "Operating Cash Flow", "CFO",
      "Cash Flow from Operations", "Operating Activities"
    );
    
    const investingCF = extractLatest(cf,
      "Cash from investing activities", "Investing Cash Flow", "CFI",
      "Cash Flow from Investing", "Investing Activities"
    );
    
    const financingCF = extractLatest(cf,
      "Cash from financing activities", "Financing Cash Flow", "CFF",
      "Cash Flow from Financing", "Financing Activities"
    );
    
    const netCF = extractLatest(cf,
      "Net Cash Flow", "Net Change in Cash", "Net Cash"
    );
    
    const cashEnd = extractLatest(cf,
      "Cash at end of year", "Closing Cash", "Cash End",
      "Ending Cash Balance"
    );

    // CALCULATE RATIOS
    const netProfitNum = safeNum(netProfit);
    const shareholdersEquityNum = safeNum(shareholdersEquity);
    const totalDebtNum = safeNum(totalDebt);
    const currentAssetsNum = safeNum(currentAssets);
    const currentLiabilitiesNum = safeNum(currentLiabilities);

    const roe = netProfitNum && shareholdersEquityNum 
      ? (netProfitNum / shareholdersEquityNum) * 100 : 0;
    const debtToEquity = totalDebtNum && shareholdersEquityNum
      ? totalDebtNum / shareholdersEquityNum : 0;
    const currentRatio = currentAssetsNum && currentLiabilitiesNum
      ? currentAssetsNum / currentLiabilitiesNum : 0;

    // TREND DATA
    const salesTrend = extractTrend(pl, "Sales", "Total Revenue", "Revenue", "Net Sales");
    const profitTrend = extractTrend(pl, "Net Profit", "PAT", "Profit After Tax", "Net Income");
    const epsTrend = extractTrend(pl, "EPS (Adjusted)", "EPS", "Earnings Per Share");
    const opTrend = extractTrend(pl, "Operating Profit", "EBIT", "Operating Income");
    const ebitdaTrend = extractTrend(pl, "EBITDA");
    const ocfTrend = extractTrend(cf, "Cash from operating activities", "Operating Cash Flow", "CFO");

    console.log(`📊 Sales trend: ${salesTrend.join(", ")}`);
    console.log(`📊 Profit trend: ${profitTrend.join(", ")}`);

    return {
      profitLoss: {
        "Sales": formatCr(sales),
        "Expenses": formatCr(expenses),
        "Operating Profit": formatCr(operatingProfit),
        "OPM %": formatPercent(opm),
        "EBITDA": formatCr(ebitda),
        "Depreciation": formatCr(depreciation),
        "EBIT": formatCr(ebit),
        "Interest": formatCr(interest),
        "Profit Before Tax": formatCr(pbt),
        "Tax": formatCr(tax),
        "Tax %": formatPercent(taxPercent),
        "Net Profit": formatCr(netProfit),
        "NPM %": formatPercent(npm),
        "EPS": formatRatio(eps),
        "Book Value": formatRatio(bookValue),
      },
      balanceSheet: {
        "Total Assets": formatCr(totalAssets),
        "Fixed Assets": formatCr(fixedAssets),
        "Current Assets": formatCr(currentAssets),
        "Investments": formatCr(investments),
        "Share Capital": formatCr(shareCapital),
        "Reserves & Surplus": formatCr(reserves),
        "Shareholders Equity": formatCr(shareholdersEquity),
        "Total Debt": formatCr(totalDebt),
        "Current Liabilities": formatCr(currentLiabilities),
        "Total Liabilities": formatCr(totalLiabilities),
      },
      cashFlow: {
        "Cash at Beginning": formatCr(cashBegin),
        "Operating Cash Flow": formatCr(operatingCF),
        "Investing Cash Flow": formatCr(investingCF),
        "Financing Cash Flow": formatCr(financingCF),
        "Net Cash Flow": formatCr(netCF),
        "Cash at End": formatCr(cashEnd),
      },
      ratios: {
        "ROE %": formatPercent(roe),
        "Debt/Equity": formatRatio(debtToEquity),
        "Current Ratio": formatRatio(currentRatio),
        "OPM %": formatPercent(opm),
        "NPM %": formatPercent(npm),
        "Tax %": formatPercent(taxPercent),
      },
      charts: {
        years: last5Years,
        sales: salesTrend,
        profit: profitTrend,
        eps: epsTrend,
        operatingProfit: opTrend,
        ebitda: ebitdaTrend,
        operatingCashFlow: ocfTrend,
      },
    };
  };

  const filteredStocks = allStocks.filter((stock) =>
    stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectStock = (stock: StockInfo) => {
    setSelectedStock(stock);
    setShowStockPicker(false);
    setSearchQuery("");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar backgroundColor="#4f46e5" barStyle="light-content" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading {selectedStock.name}...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar backgroundColor="#4f46e5" barStyle="light-content" />
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadFundamentals()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.retryButton, { marginTop: 12, backgroundColor: "#6b7280" }]}
            onPress={() => setShowStockPicker(true)}
          >
            <Text style={styles.retryText}>Change Stock</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderRows = (obj: Record<string, string | number>) =>
    Object.entries(obj).map(([k, v], index, arr) => (
      <View key={k} style={[styles.row, index === arr.length - 1 && styles.rowLast]}>
        <Text style={styles.label}>{k}</Text>
        <Text style={styles.value}>{String(v)}</Text>
      </View>
    ));

  const renderChart = (title: string, chartData: number[], color: string) => {
    const validData = chartData.filter((v) => !isNaN(v) && v !== 0);
    if (validData.length < 2) return null;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <LineChart
          data={{
            labels: data.charts.years.slice(0, validData.length),
            datasets: [{ data: validData }],
          }}
          width={CHART_WIDTH}
          height={220}
          chartConfig={{
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: (opacity = 1) => color,
            labelColor: (opacity = 1) => "#6b7280",
            strokeWidth: 2,
            propsForDots: { r: "4", strokeWidth: "2", stroke: color },
          }}
          bezier
          style={styles.chart}
          formatYLabel={(value) => {
            const num = parseFloat(value);
            if (num >= 100000) return `${(num / 100000).toFixed(0)}L`;
            if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
            return num.toFixed(0);
          }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#4f46e5" barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.stockSelector} onPress={() => setShowStockPicker(true)}>
          <View style={styles.stockInfo}>
            <Text style={styles.title} numberOfLines={1}>{selectedStock.name}</Text>
            <Text style={styles.subtitle}>NSE: {selectedStock.symbol}</Text>
          </View>
          <Text style={styles.changeButton}>Change ▼</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {["Profit & Loss", "Balance Sheet", "Cash Flow", "Ratios"].map((t) => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]} numberOfLines={2}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadFundamentals(true)} colors={["#4f46e5"]} tintColor="#4f46e5" />}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📊 Performance Trends (5Y)</Text>
          {renderChart("Revenue Growth", data.charts.sales, "#4f46e5")}
          {renderChart("Net Profit", data.charts.profit, "#10b981")}
          {renderChart("EPS", data.charts.eps, "#f59e0b")}
          {renderChart("Operating Profit", data.charts.operatingProfit, "#8b5cf6")}
          {renderChart("EBITDA", data.charts.ebitda, "#3b82f6")}
          {renderChart("Operating Cash Flow", data.charts.operatingCashFlow, "#06b6d4")}
          {!data.charts.sales.some(v => v !== 0) && !data.charts.profit.some(v => v !== 0) && (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>📉 Limited chart data available</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {tab === "Profit & Loss" && "💰 Profit & Loss"}
            {tab === "Balance Sheet" && "📋 Balance Sheet"}
            {tab === "Cash Flow" && "💵 Cash Flow"}
            {tab === "Ratios" && "📈 Ratios"}
          </Text>
          <View style={styles.tableContainer}>
            {tab === "Profit & Loss" && renderRows(data.profitLoss)}
            {tab === "Balance Sheet" && renderRows(data.balanceSheet)}
            {tab === "Cash Flow" && renderRows(data.cashFlow)}
            {tab === "Ratios" && renderRows(data.ratios)}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Data from Unfluke • Pull to refresh</Text>
          <Text style={styles.footerSubtext}>Latest financial year displayed</Text>
        </View>
      </ScrollView>

      <Modal visible={showStockPicker} animationType="slide" transparent={true} onRequestClose={() => setShowStockPicker(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowStockPicker(false)} />
          <SafeAreaView style={styles.modalSafeArea} edges={['bottom']}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Stock</Text>
                <TouchableOpacity onPress={() => setShowStockPicker(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9ca3af"
              />
              {loadingStocks ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4f46e5" />
                </View>
              ) : (
                <FlatList
                  data={filteredStocks}
                  keyExtractor={(item) => `${item.code}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.stockItem} onPress={() => selectStock(item)}>
                      <View style={styles.stockItemContent}>
                        <Text style={styles.stockName}>{item.name}</Text>
                        <Text style={styles.stockSymbol}>NSE: {item.symbol}</Text>
                      </View>
                      {selectedStock.code === item.code && <Text style={styles.selectedCheck}>✓</Text>}
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No stocks found</Text>
                    </View>
                  }
                />
              )}
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  header: { backgroundColor: "#4f46e5", paddingHorizontal: 16, paddingVertical: 16, elevation: 4 },
  stockSelector: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  stockInfo: { flex: 1, marginRight: 12 },
  title: { color: "#fff", fontSize: 18, fontWeight: "700" },
  subtitle: { color: "#e0e7ff", fontSize: 12, marginTop: 4 },
  changeButton: { color: "#fff", fontSize: 13, fontWeight: "600", backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 },
  tabs: { flexDirection: "row", backgroundColor: "#fff", elevation: 2 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 3, borderBottomColor: "#4f46e5" },
  tabText: { fontSize: 10, color: "#6b7280", fontWeight: "600" },
  tabTextActive: { color: "#4f46e5", fontWeight: "700" },
  content: { flex: 1, padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 16 },
  chartContainer: { marginBottom: 24 },
  chartTitle: { fontSize: 15, fontWeight: "600", color: "#374151", marginBottom: 12 },
  chart: { marginVertical: 8, borderRadius: 12 },
  noDataContainer: { padding: 40, alignItems: "center" },
  noDataText: { fontSize: 14, color: "#9ca3af" },
  tableContainer: { borderRadius: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  rowLast: { borderBottomWidth: 0 },
  label: { color: "#4b5563", fontSize: 14, flex: 1, fontWeight: "500" },
  value: { fontWeight: "700", color: "#111827", fontSize: 14, textAlign: "right", flex: 1 },
  loadingText: { marginTop: 12, color: "#6b7280", fontSize: 14 },
  errorText: { color: "#ef4444", fontSize: 16, fontWeight: "600", textAlign: "center" },
  retryButton: { marginTop: 20, backgroundColor: "#4f46e5", paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8 },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  footer: { alignItems: "center", paddingVertical: 24 },
  footerText: { color: "#9ca3af", fontSize: 12 },
  footerSubtext: { color: "#d1d5db", fontSize: 11, marginTop: 4 },
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  modalSafeArea: { backgroundColor: "transparent" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, paddingHorizontal: 20, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  closeButton: { fontSize: 28, color: "#6b7280", paddingHorizontal: 8 },
  searchInput: { backgroundColor: "#f3f4f6", borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 16, color: "#111827" },
  stockItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  stockItemContent: { flex: 1 },
  stockName: { fontSize: 16, fontWeight: "600", color: "#111827" },
  stockSymbol: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  selectedCheck: { fontSize: 24, color: "#4f46e5", fontWeight: "700" },
  loadingContainer: { padding: 40, alignItems: "center" },
  emptyContainer: { padding: 40, alignItems: "center" },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#6b7280" },
});