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

/* Images */
import aiBot from "../../assets/images/DashboardImages/AIBot_new.png";
import fundamental from "../../assets/images/DashboardImages/fundamental_new.png";
import historical from "../../assets/images/DashboardImages/historical.png";
import option from "../../assets/images/DashboardImages/option.png";
import indictor from "../../assets/images/DashboardImages/indicator_new.png";
import stcharts from "../../assets/images/DashboardImages/strategy_charts_new.png";
import scanner from "../../assets/images/DashboardImages/Scanner_new.png";
import timebacktest from "../../assets/images/DashboardImages/time_based_backtesting_new.png";

const UnDashboard = () => {
  const { width } = useWindowDimensions();
  // Responsive: 1 column on narrow, 2 columns on wider screens
  const isWide = width > 500;
  const cardWidth = isWide ? (width - 48) / 2 : width - 32;

  const cardData = [
    { id: 1, title: "AI-Bot", imageSrc: aiBot, nav: "chatbot", bgColor: "#f0e6ff" },
    { id: 2, title: "Fundamentals", imageSrc: fundamental, nav: "fundamental", bgColor: "#fff5e6" },
    { id: 3, title: "Historical Charts", imageSrc: historical, nav: "historical", bgColor: "#e6f0ff" },
    { id: 4, title: "Option Simulator", imageSrc: option, nav: "simulator", bgColor: "#f0e6ff" },
    { id: 5, title: "Time Based Backtest", imageSrc: timebacktest, nav: "basic-backtester-main", bgColor: "#F7DDE3" },
    { id: 6, title: "Scanner", imageSrc: scanner, nav: "scannermain", bgColor: "#E1FAF7" },
    { id: 7, title: "Strategy Charts", imageSrc: stcharts, nav: "strategy-charts", bgColor: "#FDE4E4" },
    { id: 8, title: "Indicator Backtest", imageSrc: indictor, nav: "basic-backtester-home", bgColor: "#FFE6F2" },
  ];

  const handleNavigation = (card: any) => {
    if (card.nav === "strategy-charts") {
      router.push("/strategy-charts?strategyId=123" as any);
      return;
    }
    router.push(`/${card.nav}` as any);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>Welcome to Unfluke Dashboard</Text>
      <Text style={styles.subHeader}>Select a module to get started</Text>

      <View style={styles.cardGrid}>
        {cardData.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[styles.card, { backgroundColor: card.bgColor, width: cardWidth }]}
            onPress={() => handleNavigation(card)}
            activeOpacity={0.75}
          >
            <Text style={styles.title}>{card.title}</Text>
            <Image
              source={card.imageSrc}
              style={styles.image}
              resizeMode="contain"
            />
            <View style={styles.button}>
              <Text style={styles.buttonText}>Explore →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 18,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 140,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#4f46e5",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});

export default UnDashboard;