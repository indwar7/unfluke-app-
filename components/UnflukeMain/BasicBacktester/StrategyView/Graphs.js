import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useTheme } from "@/constants/ThemeContext";

const SCREEN_WIDTH = Dimensions.get("window").width;

const Graphs = (props) => {
  const [activeTab, setActiveTab] = useState("Profit"); // "Profit" | "Cumulative" | "Drawdown"
  const { colors: c, isDark } = useTheme();
  const styles = makeStyles(c, isDark);

  // Props: totalPNL, cummulative, drawDawn (Note: typo in prop name 'drawDawn' from parent)
  const { totalPNL, cummulative, drawDawn } = props;

  // Helper to process data for ChartKit
  const processData = (data) => {
    if (!data || data.length === 0) return { labels: [], data: [] };

    // Optimize: ChartKit can differ laggy with too many points.
    // If > 50 points, sample them.
    let displayData = data;
    const maxPoints = 50;

    if (data.length > maxPoints) {
      const step = Math.ceil(data.length / maxPoints);
      displayData = data.filter((_, index) => index % step === 0);
    }

    // Extract labels (dates) and values (y)
    // Assuming data structure is { x: "timestamp/date", y: value } based on previous Recharts usage
    const labels = displayData.map(d => {
      const date = new Date(d.x);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    const values = displayData.map(d => parseFloat(d.y) || 0);

    return { labels, data: values };
  };

  const chartData = useMemo(() => {
    let rawData = [];
    switch (activeTab) {
      case "Profit":
        rawData = totalPNL || [];
        break;
      case "Cumulative":
        rawData = cummulative || [];
        break;
      case "Drawdown":
        rawData = drawDawn || [];
        break;
      default:
        rawData = totalPNL || [];
    }
    return processData(rawData);
  }, [activeTab, totalPNL, cummulative, drawDawn]);

  if (!chartData.data.length) {
    return (
      <View style={styles.chartContainer}>
        <Text style={{ textAlign: 'center', margin: 20, color: c.textSecondary }}>No chart data available</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        {["Cumulative", "Profit", "Drawdown"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <ScrollView horizontal contentContainerStyle={{ paddingRight: 20 }}>
          <LineChart
            data={{
              labels: chartData.labels,
              datasets: [
                {
                  data: chartData.data,
                },
              ],
            }}
            width={Math.max(SCREEN_WIDTH - 40, chartData.labels.length * 40)} // Dynamic width for scrolling
            height={260}
            yAxisLabel="₹"
            yAxisSuffix=""
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: c.card,
              backgroundGradientFrom: c.card,
              backgroundGradientTo: c.card,
              decimalPlaces: 0,
              // Gold accent line — matches the premium dark/amber theme
              color: (opacity = 1) =>
                isDark
                  ? `rgba(233, 196, 106, ${opacity})`
                  : `rgba(201, 154, 46, ${opacity})`,
              labelColor: (opacity = 1) =>
                isDark
                  ? `rgba(166, 171, 181, ${opacity})`
                  : `rgba(91, 100, 114, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "3",
                strokeWidth: "1",
                stroke: c.gold,
              },
              propsForLabels: {
                fontSize: 10
              }

            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
            withInnerLines={false}
          />
        </ScrollView>
      </View>
    </View>
  );
};

const makeStyles = (c, isDark) => StyleSheet.create({
  container: {
    marginVertical: 16,
    backgroundColor: c.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: c.surfaceElevated,
    borderRadius: 8,
    padding: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: c.gold,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: c.textSecondary,
  },
  activeTabText: {
    color: c.onGold,
    fontWeight: "600",
  },
  chartContainer: {
    alignItems: "center",
  },
});

export default Graphs;
