import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";

import { ScreenWithHeader } from "../components/AppHeader";

const API_URL = "https://unfluke.in/in/fundamentals/RELIANCE";

export default function FundamentalScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<"overview" | "pl">("overview");

  const fetchData = async () => {
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.log("API error", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Loading fundamentals…</Text>
      </View>
    );
  }

  if (!data?.results) {
    return (
      <View style={styles.center}>
        <Text>No data available</Text>
      </View>
    );
  }

  /* ---------- PARSE LATEST YEAR ---------- */
  const years = Object.keys(data.results).sort();
  const latestYear = years[years.length - 1];
  const blocks = data.results[latestYear];

  const findValue = (key: string) => {
    for (const block of blocks) {
      if (block[key] !== undefined) return block[key];
    }
    return null;
  };

  const sales = findValue("Sales");
  const netProfit = findValue("Net Profit");
  const opm = findValue("OPM%");
  const npm = findValue("NPM%");
  const eps = findValue("EPS (Adjusted)");
  const bookValue = findValue("Book Value (Adjusted)");

  return (
    <ScreenWithHeader>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.symbol}>RELIANCE</Text>
          <Text style={styles.sub}>Fundamental Analysis • {latestYear}</Text>
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
          {["overview", "pl"].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t as any)}
              style={[styles.tab, tab === t && styles.tabActive]}
            >
              <Text style={tab === t ? styles.tabTextActive : styles.tabText}>
                {t === "overview" ? "OVERVIEW" : "P&L"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
          }
        >
          {/* OVERVIEW */}
          {tab === "overview" && (
            <>
              <Card>
                <Metric title="Sales" value={sales} />
                <Metric title="Net Profit" value={netProfit} />
              </Card>

              <Card>
                <Metric title="OPM %" value={opm} />
                <Metric title="NPM %" value={npm} />
              </Card>

              <Card>
                <Metric title="EPS" value={eps} />
                <Metric title="Book Value" value={bookValue} />
              </Card>
            </>
          )}

          {/* PROFIT & LOSS TABLE */}
          {tab === "pl" && (
            <Card>
              {blocks.map((block: any, idx: number) =>
                Object.entries(block).map(([k, v]) => (
                  <Row key={`${idx}-${k}`} label={k} value={v} />
                ))
              )}
            </Card>
          )}
        </ScrollView>
      </View>
    </ScreenWithHeader>
  );
}

/* ---------------- UI ---------------- */

const Card = ({ children }: any) => (
  <View style={styles.card}>{children}</View>
);

const Metric = ({ title, value }: any) => (
  <View style={styles.metric}>
    <Text style={styles.metricLabel}>{title}</Text>
    <Text style={styles.metricValue}>
      {value !== null ? Number(value).toLocaleString("en-IN") : "--"}
    </Text>
  </View>
);

const Row = ({ label, value }: any) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>
      {Number(value).toLocaleString("en-IN")}
    </Text>
  </View>
);

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },

  symbol: { fontSize: 22, fontWeight: "700" },
  sub: { color: "#6b7280", marginTop: 4 },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },

  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 3, borderColor: "#2563eb" },
  tabText: { color: "#6b7280" },
  tabTextActive: { color: "#2563eb", fontWeight: "700" },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },

  metric: {
    marginBottom: 12,
  },

  metricLabel: { color: "#6b7280", fontSize: 12 },
  metricValue: { fontSize: 20, fontWeight: "700" },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },

  label: { color: "#6b7280", flex: 1 },
  value: { fontWeight: "600" },

  muted: { color: "#6b7280", marginTop: 10 },
});