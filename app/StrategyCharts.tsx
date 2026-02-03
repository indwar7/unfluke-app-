import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from "victory-native";

// ✅ reusable component
import CustomSelect from "../components/StrategyCharts/CustomSelect";

const screenWidth = Dimensions.get("window").width;

// dummy price data (safe for demo)
const priceData = [
  { x: 1, y: 120 },
  { x: 2, y: 125 },
  { x: 3, y: 118 },
  { x: 4, y: 130 },
  { x: 5, y: 128 },
  { x: 6, y: 135 },
  { x: 7, y: 140 },
];

const timeframes = ["1D", "1W", "1M", "1Y"];
const indicators = ["EMA", "SMA", "RSI"];

export default function StrategyCharts() {
  const [activeTf, setActiveTf] = useState("1D");
  const [activeIndicator, setActiveIndicator] = useState("EMA");

  return (
    <ScrollView style={styles.container}>
      {/* 🔙 Back */}
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Header */}
      <Text style={styles.title}>Strategy Charts</Text>
      <Text style={styles.subtitle}>EMA Breakout Strategy</Text>

      {/* Timeframes */}
      <View style={styles.row}>
        {timeframes.map(tf => (
          <TouchableOpacity
            key={tf}
            onPress={() => setActiveTf(tf)}
            style={[styles.chip, activeTf === tf && styles.activeChip]}
          >
            <Text style={activeTf === tf ? styles.activeText : styles.text}>
              {tf}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.card}>
        <VictoryChart
          width={screenWidth - 32}
          height={260}
          theme={VictoryTheme.material}
        >
          <VictoryAxis />
          <VictoryAxis dependentAxis />
          <VictoryLine
            data={priceData}
            style={{
              data: { stroke: "#4F46E5", strokeWidth: 2 },
            }}
          />
        </VictoryChart>
      </View>

      {/* Indicator Select */}
      <Text style={styles.sectionTitle}>Indicator</Text>

      {/* 👇 reusable component usage */}
      <CustomSelect
  options={indicators}
  selected={activeIndicator}
  onChange={setActiveIndicator}
  placeholder="Select Indicator"
  name="indicator"
/>

      {/* Strategy Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Strategy Logic</Text>
        <Text style={styles.infoText}>
          Buy when price breaks above EMA with volume confirmation.
          Exit when price closes below EMA.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
    padding: 16,
  },

  backText: {
    color: "#4F46E5",
    marginBottom: 8,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#6B7280",
    marginBottom: 16,
  },

  row: {
    flexDirection: "row",
    marginBottom: 12,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    marginRight: 8,
  },

  activeChip: {
    backgroundColor: "#4F46E5",
  },

  text: {
    fontSize: 13,
    color: "#374151",
  },

  activeText: {
    fontSize: 13,
    color: "#FFF",
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: "center",
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  infoCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
  },

  infoTitle: {
    fontWeight: "600",
    marginBottom: 6,
  },

  infoText: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
  },
});