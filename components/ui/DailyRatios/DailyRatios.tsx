import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, useWindowDimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useColorScheme } from "react-native";
import { Ionicons } from '@expo/vector-icons';

const DailyRatios = ({ data, loading }) => {
  const [leftTab, setLeftTab] = useState("ev");
  const [rightTab, setRightTab] = useState("pe");
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const {width:screenWidth} = useWindowDimensions()

  // Robust timestamp parser
  const parseDate = (d) => {
    if (!d) return null;

    if (typeof d === "number") {
      return d < 1e12 ? d * 1000 : d;
    }

    if (typeof d === "string") {
      // Handle M/D/YYYY or MM/DD/YYYY format
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(d)) {
        const [month, day, year] = d.split("/");
        return new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day))).getTime();
      }
      
      // Handle DD-MM-YYYY format
      if (/^\d{2}-\d{2}-\d{4}$/.test(d)) {
        const [dd, mm, yyyy] = d.split("-");
        return new Date(Date.UTC(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd))).getTime();
      }
      
      const ts = Date.parse(d);
      return isNaN(ts) ? null : ts;
    }

    return null;
  };

  const getSeriesData = (arr = [], label = "") => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) {
      if (__DEV__) {
        console.warn(`[DailyRatios][${label}] Invalid or empty array`);
      }
      return [];
    }

    const cleaned = arr
      .map((item) => {
        if (!item) return null;

        const ts = parseDate(item.date);
        const num = Number(item.value);

        if (!ts || !isFinite(num)) {
          return null;
        }

        return { ts, num };
      })
      .filter(Boolean)
      .sort((a, b) => a.ts - b.ts);

    if (__DEV__ && cleaned.length > 0) {
      console.log(`[DailyRatios][${label}] Processed ${cleaned.length} data points`);
    }

    return cleaned;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const getChartLabels = (dataPoints, maxLabels = 15) => {
    if (dataPoints.length === 0) return [];
    if (dataPoints.length <= maxLabels) {
      return dataPoints.map(d => formatDate(d.ts));
    }

    const indices = [];
    const step = (dataPoints.length - 1) / (maxLabels - 1);
    for (let i = 0; i < maxLabels; i++) {
      indices.push(Math.round(i * step));
    }

    return indices.map(i => formatDate(dataPoints[i].ts));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={[styles.noDataText, isDark && styles.noDataTextDark]}>
          No data available.
        </Text>
      </View>
    );
  }

  const charts = {
    ev: { 
      name: "Enterprise Value", 
      data: getSeriesData(data["Enterprise Value Chart"] || [], "EV")
    },
    dy: { 
      name: "Dividend Yield", 
      data: getSeriesData(data["Dividend Yield Chart"] || [], "DY")
    },
    bv: { 
      name: "Book Value", 
      data: getSeriesData(data["Book Value Chart"] || [], "BV")
    },
    eps: { 
      name: "EPS", 
      data: getSeriesData(data["EPS Chart"] || [], "EPS")
    },
    pe: { 
      name: "PE Ratio", 
      data: getSeriesData(data["PE Chart"] || [], "PE")
    },
    pb: { 
      name: "PB Ratio", 
      data: getSeriesData(data["PB Chart"] || [], "PB")
    },
    ff: { 
      name: "Price / FCFF", 
      data: getSeriesData(data["Price/FCFF Chart"] || [], "FCFF")
    },
    fe: { 
      name: "Price / FCFE", 
      data: getSeriesData(data["Price/FCFE Chart"] || [], "FCFE")
    },
  };

  const mainColor = "#44558B";
  const gradientFromColor = "#44558B";
  const gradientToColor = "#90CAF9";

  const getChartConfig = () => ({
    backgroundColor: isDark ? "#111827" : "#ffffff",
    backgroundGradientFrom: isDark ? "#111827" : "#ffffff",
    backgroundGradientTo: isDark ? "#111827" : "#ffffff",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(68, 85, 139, ${opacity})`,
    labelColor: (opacity = 1) => isDark ? `rgba(229, 231, 235, ${opacity})` : `rgba(55, 65, 81, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "0",
      strokeWidth: "0",
    },
    fillShadowGradient: gradientFromColor,
    fillShadowGradientOpacity: 0.3,
    fillShadowGradientTo: gradientToColor,
    fillShadowGradientToOpacity: 0.1,
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: isDark ? "#374151" : "#E5E7EB",
      strokeDasharray: "0",
    },
    propsForLabels: {
      fontSize: 9,
      fontWeight: "500",
    },
  });

  const renderChart = (chartKey) => {
    const chartData = charts[chartKey].data;
    
    if (!chartData || chartData.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={[styles.emptyChartText, isDark && styles.emptyChartTextDark]}>
            No data available
          </Text>
        </View>
      );
    }

    const values = chartData.map(d => d.num);
    const labels = getChartLabels(chartData, 15);

    const chartWidth = screenWidth * 2.5;

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        style={styles.chartScrollView}
      >
        <LineChart
          data={{
            labels: labels,
            datasets: [{
              data: values,
            }],
          }}
          width={chartWidth}
          height={300}
          chartConfig={getChartConfig()}
          bezier
          style={styles.chart}
          withVerticalLines={false}
          withHorizontalLines={true}
          withDots={false}
          withShadow={true}
          withInnerLines={true}
          withOuterLines={false}
          fromZero={false}
          segments={5}
          formatYLabel={(value) => {
            const num = parseFloat(value);
            return isFinite(num) ? num.toFixed(2) : "0";
          }}
        />
      </ScrollView>
    );
  };

  const renderTabButtons = (tabs, activeTab, setActiveTab) => (
    <View style={styles.tabOuterContainer}>
      <View style={styles.tabScrollContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabButton,
                activeTab === tab && styles.tabButtonActive,
                isDark && activeTab === tab && styles.tabButtonActiveDark,
                isDark && activeTab !== tab && styles.tabButtonInactiveDark,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {charts[tab].name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.scrollIndicator}>
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={isDark ? "#9CA3AF" : "#6B7280"} 
          />
        </View>
      </View>
    </View>
  );

  const renderChartSection = (tabs, activeTab, setActiveTab, title) => (
    <View style={styles.chartSection}>
      <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
        {title}
      </Text>
      {renderTabButtons(tabs, activeTab, setActiveTab)}
      <View style={[styles.cardContainer, isDark && styles.cardContainerDark]}>
        <View style={styles.chartContainer}>
          <Text style={[styles.chartTitle, isDark && styles.chartTitleDark]}>
            {charts[activeTab].name}
          </Text>
          {renderChart(activeTab)}
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.wrapper}>
        {/* FINANCIAL METRICS */}
        {renderChartSection(["ev", "dy", "bv", "eps"], leftTab, setLeftTab, "Financial Metrics")}

        {/* VALUATION RATIOS */}
        {renderChartSection(["pe", "pb", "ff", "fe"], rightTab, setRightTab, "Valuation Ratios")}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 256,
  },
  noDataContainer: {
    padding: 16,
    alignItems: "center",
  },
  noDataText: {
    textAlign: "center",
    color: "#374151",
  },
  noDataTextDark: {
    color: "#D1D5DB",
  },
  chartSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: "#F9FAFB",
  },
  tabOuterContainer: {
    marginBottom: 12,
  },
  tabScrollContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  tabScrollContent: {
    paddingRight: 32,
    gap: 8,
  },
  scrollIndicator: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tabButtonActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  tabButtonActiveDark: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  tabButtonInactiveDark: {
    backgroundColor: "#374151",
    borderColor: "#4B5563",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  cardContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContainerDark: {
    backgroundColor: "#111827",
    borderColor: "#374151",
  },
  chartContainer: {
    paddingTop: 0,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 16,
    color: "#111827",
  },
  chartTitleDark: {
    color: "#F9FAFB",
  },
  chartScrollView: {
    width: "100%",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyChart: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyChartText: {
    color: "#6B7280",
    fontSize: 14,
  },
  emptyChartTextDark: {
    color: "#9CA3AF",
  },
});

export default DailyRatios;