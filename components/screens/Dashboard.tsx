import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { ChevronRight } from "lucide-react-native";
import { Colors } from "@/constants/Colors";

const c = Colors.light;

/* Images */
import aiBot from "../../assets/images/DashboardImages/AIBot_new.png";
import fundamental from "../../assets/images/DashboardImages/fundamental_new.png";
import historical from "../../assets/images/DashboardImages/historical.png";
import option from "../../assets/images/DashboardImages/option.png";
import indictor from "../../assets/images/DashboardImages/indicator_new.png";
import stcharts from "../../assets/images/DashboardImages/strategy_charts_new.png";
import scanner from "../../assets/images/DashboardImages/Scanner_new.png";
import timebacktest from "../../assets/images/DashboardImages/time_based_backtesting_new.png";

const authSelector = createSelector(
  (state: any) => state.Login,
  (auth: any) => auth.user
);

const UnDashboard = () => {
  const { width } = useWindowDimensions();
  const user = useSelector(authSelector);
  const firstName = user?.name?.split(" ")[0] || "User";

  const isWide = width > 500;
  const cardWidth = isWide ? (width - 48) / 2 : width - 32;

  const quickActions = [
    { id: 1, title: "Backtester", nav: "basic-backtester-main", icon: "📊" },
    { id: 2, title: "Scanner", nav: "scannermain", icon: "🔍" },
    { id: 3, title: "Option Bot", nav: "simulator", icon: "⚡" },
  ];

  const cardData = [
    { id: 1, title: "AI-Bot", subtitle: "Chat with our AI assistant", imageSrc: aiBot, nav: "chatbot" },
    { id: 2, title: "Fundamentals", subtitle: "Company analysis & ratios", imageSrc: fundamental, nav: "fundamental" },
    { id: 3, title: "Historical Charts", subtitle: "Price & volume history", imageSrc: historical, nav: "historical" },
    { id: 4, title: "Option Simulator", subtitle: "Options strategy builder", imageSrc: option, nav: "simulator" },
    { id: 5, title: "Time Based Backtest", subtitle: "Test strategies over time", imageSrc: timebacktest, nav: "basic-backtester-main" },
    { id: 6, title: "Scanner", subtitle: "Find stocks with patterns", imageSrc: scanner, nav: "scannermain" },
    { id: 7, title: "Strategy Charts", subtitle: "Visualize your strategies", imageSrc: stcharts, nav: "strategy-charts" },
    { id: 8, title: "Indicator Backtest", subtitle: "Backtest with indicators", imageSrc: indictor, nav: "basic-backtester-home" },
  ];

  const handleNavigation = (nav: string) => {
    if (nav === "strategy-charts") {
      router.push("/strategy-charts?strategyId=123" as any);
      return;
    }
    router.push(`/${nav}` as any);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting */}
      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>Hello {firstName}</Text>
        <Text style={styles.greetingSub}>What would you like to explore today?</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsRow}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.quickAction}
            onPress={() => handleNavigation(action.nav)}
            activeOpacity={0.7}
          >
            <Text style={styles.quickActionIcon}>{action.icon}</Text>
            <Text style={styles.quickActionText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Module Cards */}
      <Text style={styles.sectionTitle}>Explore Modules</Text>
      <View style={styles.cardGrid}>
        {cardData.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[styles.card, { width: cardWidth }]}
            onPress={() => handleNavigation(card.nav)}
            activeOpacity={0.7}
          >
            <Image
              source={card.imageSrc}
              style={styles.cardImage}
              resizeMode="contain"
            />
            <View style={styles.cardContent}>
              <View style={styles.cardTextGroup}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
              </View>
              <View style={styles.cardArrow}>
                <ChevronRight size={16} color={c.textMuted} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    backgroundColor: c.background,
  },

  // Greeting
  greetingSection: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "800",
    color: c.text,
    letterSpacing: -0.5,
  },
  greetingSub: {
    fontSize: 14,
    color: c.textSecondary,
    marginTop: 4,
  },

  // Quick Actions
  quickActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  quickAction: {
    flex: 1,
    backgroundColor: c.surface,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: c.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  quickActionIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: c.text,
  },

  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: c.text,
    marginBottom: 12,
    letterSpacing: -0.2,
  },

  // Cards
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: c.surface,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: c.borderLight,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardImage: {
    width: "100%",
    height: 120,
    backgroundColor: c.background,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardTextGroup: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: c.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: c.textSecondary,
  },
  cardArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: c.background,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default UnDashboard;
