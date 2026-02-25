import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import MyEarnings from "./MyEarnings";
import StrategyEarnings from "./StrategyEarnings";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Widgets from "./widgets";
import { ChevronRight } from "lucide-react-native";

const LeadsDashBoard = () => {
  const [activeTab, setActiveTab] = useState("my-earnings");
  // Always white theme — no dark mode in this app
  const isDarkMode = false;

  const auth = createSelector(
    (state) => state.Login,
    (auth) => auth.user
  );
  const user = useSelector(auth);

  const handleTabChange = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Text style={styles.title}>My Earnings</Text>
        <View style={styles.breadcrumb}>
          <Text style={styles.breadcrumbText}>Pages</Text>
          <ChevronRight size={13} color="#6B7280" />
          <Text style={styles.breadcrumbText}>My Earnings</Text>
        </View>
      </View>

      <Widgets />

      <View style={styles.tabContainer}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            onPress={() => handleTabChange("my-earnings")}
            style={[
              styles.tabButton,
              activeTab === "my-earnings" && styles.activeTabButton,
            ]}
          >
            <Icon
              name="cash"
              size={18}
              color={activeTab === "my-earnings" ? "#111827" : "#6b7280"}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "my-earnings" && styles.activeTabButtonText,
              ]}
            >
              My Earnings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTabChange("strategy-earnings")}
            style={[
              styles.tabButton,
              activeTab === "strategy-earnings" && styles.activeTabButton,
            ]}
          >
            <Icon
              name="chart-bar"
              size={18}
              color={activeTab === "strategy-earnings" ? "#111827" : "#6b7280"}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "strategy-earnings" && styles.activeTabButtonText,
              ]}
            >
              Strategies Earnings
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContent}>
          {activeTab === "my-earnings" && <MyEarnings user={user} />}
          {activeTab === "strategy-earnings" && <StrategyEarnings user={user} />}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 12,
    backgroundColor: "#f9fafb",
    // No paddingTop — ScreenWithHeader already accounts for the header
  },
  contentContainer: {
    paddingBottom: 130,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  breadcrumbText: {
    fontSize: 12,
    color: "#6B7280",
  },
  tabContainer: {
    marginTop: 16,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
    maxWidth: 400,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabButtonText: {
    color: "#111827",
  },
  tabContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
});

export default LeadsDashBoard;
