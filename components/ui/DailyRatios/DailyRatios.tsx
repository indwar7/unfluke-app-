import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, useWindowDimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useColorScheme } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

const DailyRatios = ({ data, loading }) => {
  const [leftTab, setLeftTab] = useState("ev");
  const [rightTab, setRightTab] = useState("pe");
  const colorScheme = useColorScheme();
  const { colors: c, isDark } = useTheme();
  const styles = makeStyles(c, isDark);

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
        <ActivityIndicator size="large" color={c.gold} />
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

  const mainColor = c.gold;
  const gradientFromColor = c.gold;
  const gradientToColor = c.goldMuted;

  // Parse a hex color into an rgba() string generator for react-native-chart-kit.
  const hexToRgba = (hex, opacity = 1) => {
    const clean = hex.replace("#", "");
    const full =
      clean.length === 3
        ? clean.split("").map((ch) => ch + ch).join("")
        : clean;
    const r = parseInt(full.substring(0, 2), 16);
    const g = parseInt(full.substring(2, 4), 16);
    const b = parseInt(full.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const getChartConfig = () => ({
    backgroundColor: c.card,
    backgroundGradientFrom: c.card,
    backgroundGradientTo: c.card,
    decimalPlaces: 2,
    color: (opacity = 1) => hexToRgba(mainColor, opacity),
    labelColor: (opacity = 1) => hexToRgba(c.textSecondary, opacity),
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
      stroke: c.border,
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
            color={c.textSecondary}
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

const makeStyles = (c: AppColors, isDark: boolean) =>
  StyleSheet.create({
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
      color: c.textSecondary,
    },
    noDataTextDark: {
      color: c.textSecondary,
    },
    chartSection: {
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: c.text,
      marginBottom: 12,
    },
    sectionTitleDark: {
      color: c.text,
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
      backgroundColor: isDark ? "rgba(10,11,14,0.9)" : "rgba(255,255,255,0.9)",
    },
    tabButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: c.surfaceElevated,
      borderWidth: 1,
      borderColor: c.border,
    },
    tabButtonActive: {
      backgroundColor: c.gold,
      borderColor: c.gold,
    },
    tabButtonActiveDark: {
      backgroundColor: c.gold,
      borderColor: c.gold,
    },
    tabButtonInactiveDark: {
      backgroundColor: c.surfaceElevated,
      borderColor: c.border,
    },
    tabText: {
      fontSize: 13,
      fontWeight: "600",
      color: c.textSecondary,
    },
    tabTextActive: {
      color: c.onGold,
    },
    cardContainer: {
      backgroundColor: c.card,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 16,
      paddingTop: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    cardContainerDark: {
      backgroundColor: c.card,
      borderColor: c.border,
    },
    chartContainer: {
      paddingTop: 0,
    },
    chartTitle: {
      fontSize: 15,
      fontWeight: "600",
      marginBottom: 16,
      color: c.text,
    },
    chartTitleDark: {
      color: c.text,
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
      color: c.textSecondary,
      fontSize: 14,
    },
    emptyChartTextDark: {
      color: c.textSecondary,
    },
  });

export default DailyRatios;