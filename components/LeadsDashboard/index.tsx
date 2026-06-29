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

import Widgets from "./widgets";
import { ChevronRight, Wallet, BarChart3 } from "lucide-react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { Radius, Space, Shadow } from "@/constants/Theme";

const LeadsDashBoard = () => {
  const { colors: c, isDark } = useTheme();
  const s = makeStyles(c, isDark);

  const [activeTab, setActiveTab] = useState("my-earnings");

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
      style={s.container}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.header}>
        <Text style={s.title}>My Earnings</Text>
        <View style={s.breadcrumb}>
          <Text style={s.breadcrumbText}>Pages</Text>
          <ChevronRight size={13} color={c.textMuted} />
          <Text style={s.breadcrumbCurrent}>My Earnings</Text>
        </View>
      </View>

      <Widgets />

      <View style={s.tabContainer}>
        <View style={s.tabBar}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleTabChange("my-earnings")}
            style={[
              s.tabButton,
              activeTab === "my-earnings" && s.activeTabButton,
            ]}
          >
            <Wallet
              size={17}
              color={activeTab === "my-earnings" ? c.onGold : c.textMuted}
            />
            <Text
              style={[
                s.tabButtonText,
                activeTab === "my-earnings" && s.activeTabButtonText,
              ]}
            >
              My Earnings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleTabChange("strategy-earnings")}
            style={[
              s.tabButton,
              activeTab === "strategy-earnings" && s.activeTabButton,
            ]}
          >
            <BarChart3
              size={17}
              color={activeTab === "strategy-earnings" ? c.onGold : c.textMuted}
            />
            <Text
              style={[
                s.tabButtonText,
                activeTab === "strategy-earnings" && s.activeTabButtonText,
              ]}
            >
              Strategies Earnings
            </Text>
          </TouchableOpacity>
        </View>

        <View style={s.tabContent}>
          {activeTab === "my-earnings" && <MyEarnings user={user} />}
          {activeTab === "strategy-earnings" && <StrategyEarnings user={user} />}
        </View>
      </View>
    </ScrollView>
  );
};

const makeStyles = (c: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: Space.md,
      backgroundColor: c.background,
      // No paddingTop — ScreenWithHeader already accounts for the header
    },
    contentContainer: {
      paddingBottom: 130,
    },
    header: {
      marginBottom: Space.xs,
    },
    title: {
      fontSize: 22,
      fontWeight: "800",
      letterSpacing: -0.4,
      color: c.text,
    },
    breadcrumb: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
      gap: 2,
    },
    breadcrumbText: {
      fontSize: 12,
      fontWeight: "600",
      color: c.textMuted,
    },
    breadcrumbCurrent: {
      fontSize: 12,
      fontWeight: "700",
      color: c.gold,
    },
    tabContainer: {
      marginTop: Space.lg,
    },
    tabBar: {
      flexDirection: "row",
      backgroundColor: c.surfaceElevated,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      padding: 5,
      marginBottom: Space.lg,
      gap: 4,
    },
    tabButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 11,
      paddingHorizontal: 12,
      borderRadius: Radius.md,
      gap: 8,
    },
    activeTabButton: {
      backgroundColor: c.gold,
      ...Shadow.gold,
    },
    tabButtonText: {
      fontSize: 13.5,
      fontWeight: "700",
      letterSpacing: 0.2,
      color: c.textMuted,
    },
    activeTabButtonText: {
      color: c.onGold,
    },
    tabContent: {
      backgroundColor: c.card,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden",
      ...Shadow.sm,
    },
  });

export default LeadsDashBoard;
