import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import MyEarnings from "./MyEarnings";
import StrategyEarnings from "./StrategyEarnings";

// For icons, we'll use react-native-vector-icons or similar
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Widgets from "./widgets";
import { ChevronRight } from "lucide-react-native";


const LeadsDashBoard = () => {
  const [activeTab, setActiveTab] = useState("my-earnings");
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

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
      style={[styles.container, isDarkMode && styles.darkContainer]}
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
        <View style={[styles.tabBar, isDarkMode && styles.darkTabBar]}>
          <TouchableOpacity
            onPress={() => handleTabChange("my-earnings")}
            style={[
              styles.tabButton,
              activeTab === "my-earnings" && [
                styles.activeTabButton,
                isDarkMode && styles.darkActiveTabButton,
              ],
            ]}
          >
            <Icon
              name="cash"
              size={18}
              color={
                activeTab === "my-earnings"
                  ? isDarkMode
                    ? "#fff"
                    : "#111827"
                  : isDarkMode
                  ? "#9ca3af"
                  : "#6b7280"
              }
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "my-earnings" && styles.activeTabButtonText,
                isDarkMode &&
                  activeTab !== "my-earnings" &&
                  styles.darkInactiveText,
              ]}
            >
              My Earnings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTabChange("strategy-earnings")}
            style={[
              styles.tabButton,
              activeTab === "strategy-earnings" && [
                styles.activeTabButton,
                isDarkMode && styles.darkActiveTabButton,
              ],
            ]}
          >
            <Icon
              name="chart-bar"
              size={18}
              color={
                activeTab === "strategy-earnings"
                  ? isDarkMode
                    ? "#fff"
                    : "#111827"
                  : isDarkMode
                  ? "#9ca3af"
                  : "#6b7280"
              }
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "strategy-earnings" && styles.activeTabButtonText,
                isDarkMode &&
                  activeTab !== "strategy-earnings" &&
                  styles.darkInactiveText,
              ]}
            >
              Strategies Earnings
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.tabContent, isDarkMode && styles.darkTabContent]}>
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
    paddingTop: 85, // To account for header space
  },
  darkContainer: {
    backgroundColor: "#111827",
  },
  contentContainer: {
        paddingBottom: 130,

  },
  header: {
    marginBottom: 20,
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

  darkText: {
    color: "#fff",
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
  darkTabBar: {
    backgroundColor: "#374151",
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
  darkActiveTabButton: {
    backgroundColor: "#1f2937",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabButtonText: {
    color: "#111827",
  },
  darkInactiveText: {
    color: "#9ca3af",
  },
  tabContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  darkTabContent: {
    backgroundColor: "#1f2937",
  },
});

export default LeadsDashBoard;
