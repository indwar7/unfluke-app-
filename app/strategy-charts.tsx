import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";

export default function StrategyCharts() {
  const { strategyId } = useLocalSearchParams();
  const webViewRef = useRef<WebView>(null);

  const [symbol, setSymbol] = useState("NIFTY");
  const [expiry, setExpiry] = useState("03-Feb-26");
  const [optionType, setOptionType] = useState("CE");
  const [strike, setStrike] = useState("26000");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Generate TradingView chart URL
  const generateChartUrl = () => {
    const baseSymbol = symbol.toUpperCase();
    return `https://www.tradingview.com/chart/?symbol=NSE:${baseSymbol}`;
  };

  const handleSubmit = () => {
    setLoading(true);
    setShowForm(false);
    webViewRef.current?.reload();
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Strategy Charts</Text>
          <Text style={styles.headerSub}>NSE:{symbol} | {optionType} {strike}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.iconBtn}
            onPress={() => setShowForm(!showForm)}
          >
            <Text style={styles.iconText}>{showForm ? "📊" : "⚙️"}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconBtn}
            onPress={handleSubmit}
          >
            <Text style={styles.iconText}>🔄</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings Panel (Collapsible) */}
      {showForm && (
        <ScrollView 
          style={styles.settingsPanel}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Symbol</Text>
            <TextInput
              style={styles.input}
              value={symbol}
              onChangeText={setSymbol}
              placeholder="NIFTY"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Expiry</Text>
            <TextInput
              style={styles.input}
              value={expiry}
              onChangeText={setExpiry}
              placeholder="03-Feb-26"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Option Type</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[styles.radioBtn, optionType === "CE" && styles.radioBtnActive]}
                onPress={() => setOptionType("CE")}
              >
                <Text style={[styles.radioText, optionType === "CE" && styles.radioTextActive]}>
                  CE - Call
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radioBtn, optionType === "PE" && styles.radioBtnActive]}
                onPress={() => setOptionType("PE")}
              >
                <Text style={[styles.radioText, optionType === "PE" && styles.radioTextActive]}>
                  PE - Put
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Strike Price</Text>
            <TextInput
              style={styles.input}
              value={strike}
              onChangeText={setStrike}
              placeholder="26000"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <TouchableOpacity 
            style={styles.submitBtn}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.submitText}>Load Chart</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Chart Area */}
      <View style={styles.chartContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: generateChartUrl() }}
          style={styles.webView}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scalesPageToFit={true}
          injectedJavaScript={`
            const style = document.createElement('style');
            style.innerHTML = \`
              header, .tv-header, .tv-footer, .tv-dialog, .tv-side-toolbar {
                display: none !important;
              }
              body {
                margin: 0 !important;
                overflow: hidden !important;
              }
            \`;
            document.head.appendChild(style);
            true;
          `}
        />
        
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#5B4DB7" />
            <Text style={styles.loadingText}>Loading chart...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8F9FC",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  headerSub: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 18,
  },

  // Settings Panel (Collapsible)
  settingsPanel: {
    maxHeight: 400,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#F9FAFB",
    color: "#111827",
  },
  radioGroup: {
    flexDirection: "row",
    gap: 8,
  },
  radioBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
  },
  radioBtnActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#5B4DB7",
  },
  radioText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  radioTextActive: {
    color: "#5B4DB7",
    fontWeight: "600",
  },
  submitBtn: {
    marginBottom: 16,
    backgroundColor: "#5B4DB7",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // Chart
  chartContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  webView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
});