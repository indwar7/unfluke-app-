import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
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
  const cardData = [
    {
      id: 1,
      title: "AI-Bot",
      imageSrc: aiBot,
      nav: "chatbot",
      bgColor: "#f0e6ff",
    },
    {
      id: 2,
      title: "Fundamentals",
      imageSrc: fundamental,
      nav: "fundamental",
      bgColor: "#fff5e6",
    },
    {
      id: 3,
      title: "Historical Charts",
      imageSrc: historical,
      nav: "historical",
      bgColor: "#e6f0ff",
    },
    {
      id: 4,
      title: "Option Simulator",
      imageSrc: option,
      nav: "simulator",
      bgColor: "#f0e6ff",
    },
    {
      id: 5,
      title: "Time based Backtest",
      imageSrc: timebacktest,
      nav: "basic-backtester-main",
      bgColor: "#F7DDE3",
    },
    {
      id: 6,
      title: "Scanner",
      imageSrc: scanner,
      nav: "scannermain",
      bgColor: "#E1FAF7",
    },
    {
      id: 7,
      title: "Strategy Charts",
      imageSrc: stcharts,
      nav: "strategy-charts",
      bgColor: "#FDE4E4",
    },
    {
      id: 8,
      title: "Indicator Backtest",
      imageSrc: indictor,
      nav: "basic-backtester-home",
      bgColor: "#FFE6F2",
    },
  ];

  // 🔥 FINAL NAVIGATION — NO TYPE ERROR
  const handleNavigation = (card: any) => {
    if (card.nav === "strategy-charts") {
      const strategyId = "123"; // dummy id

      router.push(
        `/strategy-charts?strategyId=${strategyId}` as any
      );
      return;
    }

    router.push(`/${card.nav}` as any);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Welcome to Unfluke Dashboard</Text>

      {cardData.map((card) => (
        <View
          key={card.id}
          style={[styles.card, { backgroundColor: card.bgColor }]}
        >
          <Text style={styles.title}>{card.title}</Text>

          <Image
            source={card.imageSrc}
            style={styles.image}
            resizeMode="contain"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigation(card)}
          >
            <Text style={styles.buttonText}>Explore</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 80,
  },
  header: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  image: {
    width: "100%",
    height: 180,
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});

export default UnDashboard;