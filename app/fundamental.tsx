import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ================= DATA ================= */

const DATA = {
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
    TotalLiabilities: "4,20,000 Cr",
    LongTermDebt: "3,10,000 Cr",
    NetWorth: "5,32,000 Cr",
    BookValue: "401.34",
  },
  "Cash Flow": {
    CashFromOperations: "62,400 Cr",
    CashFromInvesting: "-41,200 Cr",
    CashFromFinancing: "-9,800 Cr",
    FreeCashFlow: "34,500 Cr",
  },
  Ratios: {
    ROE: "14.2%",
    ROCE: "16.8%",
    DebtEquity: "0.58",
    PE: "24.8",
    PB: "3.9",
  },
};

/* ================= SCREEN ================= */

export default function FundamentalScreen() {
  const tabs = Object.keys(DATA);
  const [tab, setTab] = useState(tabs[0]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar backgroundColor="#4f46e5" barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>RELIANCE</Text>
        <Text style={styles.subtitle}>Fundamental Analysis</Text>
      </View>

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
              style={[styles.tabText, tab === t && styles.tabTextActive]}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CONTENT */}
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{tab}</Text>

          {Object.entries(DATA[tab]).map(([k, v]) => (
            <View key={k} style={styles.row}>
              <Text style={styles.label}>
                {k.replace(/([A-Z])/g, " $1").trim()}
              </Text>
              <Text style={styles.value}>{v}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
    paddingTop:
      Platform.OS === "android"
        ? (StatusBar.currentHeight ?? 0) + 12
        : 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#4f46e5",
  },

  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
  },

  subtitle: {
    color: "#e0e7ff",
    marginTop: 4,
    fontSize: 13,
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    elevation: 4,
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },

  tabActive: {
    borderBottomWidth: 3,
    borderColor: "#4f46e5",
  },

  tabText: {
    fontSize: 11,
    color: "#6b7280",
  },

  tabTextActive: {
    color: "#4f46e5",
    fontWeight: "700",
  },

  content: {
    padding: 16,
    backgroundColor: "#f4f6fb",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },

  label: {
    color: "#374151",
    fontSize: 13,
    width: "65%",
  },

  value: {
    fontWeight: "700",
    color: "#111827",
    fontSize: 13,
  },
})