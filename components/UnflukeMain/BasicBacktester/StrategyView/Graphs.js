import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";

const SCREEN_WIDTH = Dimensions.get("window").width;

const Graphs = (props) => {
  const [activeTab, setActiveTab] = useState("Profit"); // "Profit" | "Cumulative" | "Drawdown"

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
        <Text style={{ textAlign: 'center', margin: 20 }}>No chart data available</Text>
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
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`, // Blue
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "3",
                strokeWidth: "1",
                stroke: "#2563EB",
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

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#F3F4F6",
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
    backgroundColor: "#2563EB",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4B5563",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  chartContainer: {
    alignItems: "center",
  },
});

export default Graphs;
