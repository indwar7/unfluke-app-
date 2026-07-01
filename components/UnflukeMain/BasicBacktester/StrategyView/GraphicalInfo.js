import React from "react";
import { View, Text, StyleSheet, Dimensions, useWindowDimensions } from "react-native";
import { useTheme } from "@/constants/ThemeContext";


const GraphicalInfo = (props) => {
  const { width } = useWindowDimensions()
  const { colors: c, isDark } = useTheme();
  const styles = makeStyles(c, isDark);

  const {
    numberOfTrades,
    totalPNL,
    drawDawn,
    drawDawnDays,
    winner,
    losser,
    winStreak,
    lossStreak,
    overallProfit,
    averageProfit,
    avgDailyProfit,
    maxDailyProfit,
    maxDailyLoss,
    winPercentage,
    lossPercentage,
    maxWinStreak,
    maxLossStreak,
    maxDDdays,
    DDdays,
    avgProfitOnWinDays,
    avgProfitOnLossDays,
    expectancy,
    profitFactor,
    returnToMDD,
    winTotal,
    lossTotal,
  } = props;

  const cardData = [
    {
      title: "Number of Trades",
      value: numberOfTrades,
    },
    {
      title: "Overall Profit",
      value: `₹ ${overallProfit.toLocaleString("en-US")}`,
      isPositive: overallProfit >= 0,
    },
    {
      title: "Average Profit/Trade",
      value: `₹ ${averageProfit.toLocaleString("en-US")}`,
      isPositive: averageProfit >= 0,
    },
    {
      title: "Avg Daily Profit",
      value: `₹ ${avgDailyProfit.toLocaleString("en-US")}`,
      isPositive: avgDailyProfit >= 0,
    },
    {
      title: "Max Profit in Single Day",
      value: `₹ ${maxDailyProfit.toLocaleString("en-US")}`,
      isPositive: maxDailyProfit >= 0,
    },
    {
      title: "Max Loss in Single Day",
      value: `₹ ${maxDailyLoss.toLocaleString("en-US")}`,
      isPositive: maxDailyLoss >= 0,
    },
    {
      title: "Win % (Days)",
      value: `${winPercentage.toLocaleString(
        "en-US"
      )} (${winTotal.toLocaleString("en-US")})`,
    },
    {
      title: "Loss % (Days)",
      value: `${lossPercentage.toLocaleString(
        "en-US"
      )} (${lossTotal.toLocaleString("en-US")})`,
    },
    {
      title: "Avg Profit on Win Days",
      value: `₹ ${avgProfitOnWinDays.toLocaleString("en-US")}`,
      isPositive: avgProfitOnWinDays >= 0,
    },
    {
      title: "Avg Loss on Loss Days",
      value: `₹ ${avgProfitOnLossDays.toLocaleString("en-US")}`,
      isPositive: avgProfitOnLossDays >= 0,
    },
    {
      title: "Max Winning Streak Days",
      value: maxWinStreak,
      customColor: c.profit,
    },
    {
      title: "Max Losing Streak Days",
      value: maxLossStreak,
      customColor: c.loss,
    },
    {
      title: "Max Drawdown (Max DD Days)",
      value: `₹ ${maxDDdays.toLocaleString("en-US")} (${DDdays.toLocaleString(
        "en-US"
      )})`,
      isPositive: maxDDdays >= 0,
    },
    {
      title: "Return to MDD",
      value: returnToMDD,
      isPositive: returnToMDD >= 0,
    },
    {
      title: "Expectancy",
      value: expectancy,
    },
    {
      title: "Profit Factor",
      value: profitFactor,
    },
  ];

  
  // Decide number of columns based on screen width
  let columns = 2; // default for smallest screens
  if (width >= 1400) {
    columns = 5;
  } else if (width >= 1100) {
    columns = 4;
  } else if (width >= 800) {
    columns = 3;
  } else {
    columns = 2;
  }
  
  // Calculate card dimensions with gaps
  const gap = 12; // Gap between cards
  const containerPadding = 16; // Padding inside wrapper
  const availableWidth = width - (containerPadding * 2); // Account for wrapper padding
  const totalGapWidth = gap * (columns - 1); // Total width taken by gaps
  const cardWidth = (availableWidth - totalGapWidth) / columns-7;
  
  // Function to render each row
  const renderRow = (rowCards, rowIndex) => (
    <View key={rowIndex} style={[styles.row,{gap}]}>
      {rowCards.map((card, cardIndex) => (
        <View 
          key={cardIndex} 
          style={[
            styles.card, 
            { width: cardWidth }
          ]}
        >
          <Text style={styles.cardTitle}>{card.title}</Text>
          <Text
            style={[
              styles.cardValue,
              card.hasOwnProperty("isPositive")
                ? card.isPositive
                  ? styles.positive
                  : styles.negative
                : styles.defaultText,
              card.customColor && { color: card.customColor },
            ]}
          >
            {card.value}
          </Text>
        </View>
      ))}
      
      {/* Fill remaining space if last row has fewer items */}
      {rowCards.length < columns && 
        Array.from({ length: columns - rowCards.length }).map((_, emptyIndex) => (
          <View 
            key={`empty-${emptyIndex}`} 
            style={{ width: cardWidth }} 
          />
        ))
      }
    </View>
  );
  
  // Split cards into rows
  const rows = [];
  for (let i = 0; i < cardData.length; i += columns) {
    rows.push(cardData.slice(i, i + columns));
  }
  
  return (
    <View style={[styles.wrapper,{gap}]}>
        {rows.map((rowCards, rowIndex) => renderRow(rowCards, rowIndex))}
    </View>
  );
};

// Example usage component
const GridExample = () => {
  const sampleCardData = [
    { title: "Total Revenue", value: "$1,234,567", isPositive: true },
    { title: "Active Users", value: "45,231", isPositive: true },
    { title: "Growth Rate", value: "-2.4%", isPositive: false },
    { title: "Conversion", value: "3.2%", customColor: "#8B5CF6" },
    { title: "Bounce Rate", value: "34.5%", isPositive: false },
    { title: "Sessions", value: "12,345", isPositive: true },
    { title: "Page Views", value: "87,654", isPositive: true },
    { title: "Avg. Duration", value: "2m 45s" },
    { title: "New Visitors", value: "1,234", isPositive: true },
    { title: "Return Rate", value: "67.8%", isPositive: true },
  ];

  return (
      <ResponsiveGrid cardData={sampleCardData} />
  );
};

const makeStyles = (c, isDark) => StyleSheet.create({

  wrapper: {
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    marginBottom: 15,
    flex:1,
alignItems:"center",
justifyContent:"center",
flexDirection:"row",
flexWrap:"wrap",
padding:12
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    // FIXED: Removed marginBottom and using gap instead
  },
  card: {
    backgroundColor: c.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
    padding: 16,
    // Shadow for better visual separation
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: isDark ? 0.3 : 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 14,
    color: c.textMuted,
    marginBottom: 8,
    fontWeight: "500",
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 28,
  },
  positive: {
    color: c.profit,
  },
  negative: {
    color: c.loss,
  },
  defaultText: {
    color: c.text,
  },
});



export default GraphicalInfo;
