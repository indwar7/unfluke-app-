import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Checkbox } from "expo-checkbox";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

//import PayoffChart from "./chart";
import PayoffChart from "./chartTest";
import PositionItem from "./Positions";
import GreeksTable from "./greeks";
import ProfitAndLoss from "./ProfitAndLoss";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const StrategyPositions = ({
  positions,
  minute,
  instrument,
  setPositions,
  currentPrice,
  selectedInstrument,
  togglePosition,
  deletePosition,
  editPosition,
}) => {
  const { colors: c, isDark } = useTheme();
   console.log(instrument)
  const styles = getStyles(c, isDark);
  const [activeTab, setActiveTab] = useState("chart");

  const [positionalGreeks, setPositionalGreeks] = useState({
    delta: 0,
    gamma: 0,
    theta: 0,
    vega: 0,
  });

  const [positionalPnlData, setPositionalPNLData] = useState({
    totalPnl: 0,
    maxProfit: "unlimited",
    maxLoss: "unlimited",
    breakevens: "0",
  });


console.log("position",positionalPnlData)


  const updatePNLData = (maxLoss, maxProfit, breakevensList) => {
    setPositionalPNLData((prev) => ({
      ...prev,
      maxLoss: maxLoss,
      maxProfit: maxProfit,
      breakevens: breakevensList.join("-"),
    }));
  };

  const updateTotalPnlData = (totalPnl) => {
    setPositionalPNLData((prev) => ({
      ...prev,
      totalPnl: totalPnl,
    }));
  };

  // const styles = {
  //     container: { marginTop: "50px" },
  //     navLink: {
  //         margin: "0.5rem auto",
  //         cursor: "pointer",
  //         height: "1.5rem",
  //         borderRadius: "0.5rem",
  //     },
  //     sidebarText: {
  //         fontSize: "1rem",
  //         display: "flex",
  //         gap: "1rem",
  //         alignItems: "center",
  //         textTransform: "capitalize",
  //     },
  //     global: {
  //         "*": {
  //             margin: "0%",
  //             padding: "0%",
  //             boxSizing: "border-box",
  //         },
  //     },
  // };

  function handleClick(tab) {
    if (activeTab !== tab) setActiveTab(tab);
  }

  useEffect(() => {
    let positionalGamma = 0;
    let positionalVega = 0;
    let positionalTheta = 0;
    let positionalDelta = 0;

    positions?.forEach((position) => {
      positionalDelta +=
        parseInt(position.lotQuantity) * parseFloat(position.delta);
      positionalGamma +=
        parseInt(position.lotQuantity) * parseFloat(position.gamma);
      positionalTheta +=
        parseInt(position.lotQuantity) * parseFloat(position.theta);
      positionalVega +=
        parseInt(position.lotQuantity) * parseFloat(position.vega);
    });

    setPositionalGreeks({
      delta: positionalDelta.toFixed(2),
      gamma: positionalGamma.toFixed(2),
      theta: positionalTheta.toFixed(2),
      vega: positionalVega.toFixed(2),
    });
  }, [positions]);

  return (
    <>
      {positions && positions.length > 0 && (
        <ScrollView style={styles.container}>
          <View style={styles.mainGrid}>
            {/* Strategy Positions */}
            <View style={styles.strategyPositionsContainer}>
              <View style={styles.headerContainer}>
                <Text style={styles.title}>Strategy Positions</Text>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() => setPositions([])}
                  >
                    <Text style={styles.resetButtonText}>Reset</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.selectAllContainer}>
                <Checkbox
                  value={positions.every((p) => p.isActive)}
                  onValueChange={() =>
                    setPositions(
                      positions.map((p) => ({
                        ...p,
                        isActive: !positions.every((pos) => pos.isActive),
                      }))
                    )
                  }
                  style={styles.checkbox}
                />
                <Text style={styles.selectAllText}>Select All</Text>
              </View>

              {positions.map((position) => (
                <PositionItem
                  key={position.id}
                  position={position}
                  onToggle={togglePosition}
                  onDelete={deletePosition}
                  onEdit={editPosition}
                />
              ))}

              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Max. Profit</Text>
                  <Text style={styles.profitText}>
                    {positions.every((position) => position.type === "Buy")
                      ? "Unlimited"
                      : "₹ " + positionalPnlData["maxProfit"]}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Max. Loss</Text>
                  <Text style={styles.lossText}>
                    {positions.every((position) => position.type === "Sell")
                      ? "Unlimited"
                      : "₹ " + positionalPnlData["maxLoss"]}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Breakevens</Text>
                  <Text style={styles.summaryValue}>
                    {positionalPnlData.breakevens}
                  </Text>
                </View>

                <View style={[styles.summaryRow, styles.totalPnlRow]}>
                  <Text style={styles.totalPnlLabel}>Total PnL</Text>
                  <Text
                    style={[
                      styles.totalPnlValue,
                      positionalPnlData.totalPnl >= 0
                        ? styles.profitText
                        : styles.lossText,
                    ]}
                  >
                    ₹ {positionalPnlData.totalPnl}
                  </Text>
                </View>
              </View>
            </View>

            {/* Chart, Greeks, P&L Section */}
            <View style={styles.chartContainer}>
              {/* Tab Buttons */}
              <View style={styles.tabButtonsContainer}>
                {[
                  { id: "chart", label: "Pay-off Chart" },
                  { id: "greeks", label: "Greeks" },
                  { id: "pnl", label: "P&L" },
                ].map((tab) => (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => handleClick(tab.id)}
                    style={[
                      styles.tabButton,
                      activeTab === tab.id
                        ? styles.activeTabButton
                        : styles.inactiveTabButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabButtonText,
                        activeTab === tab.id
                          ? styles.activeTabButtonText
                          : styles.inactiveTabButtonText,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tab Content */}
              <View style={styles.tabContent}>
                {activeTab === "chart" && (
                  <PayoffChart
                    selectedInstrument={selectedInstrument}
                    currentPrice={currentPrice}
                    positions={positions}
                    updatePNLData={updatePNLData}
                  />
                )}

                {activeTab === "greeks" && (
                  <GreeksTable positions={positions} />
                )}

                {activeTab === "pnl" && (
                  <ProfitAndLoss
                    minute={minute}
                    instrument={instrument}
                    positions={positions}
                    updateTotalPnlData={updateTotalPnlData}
                  />
                )}
              </View>

              {/* Greeks Summary */}
              <View style={styles.greeksSummaryContainer}>
                <View style={styles.greeksGrid}>
                  <View style={[styles.greekCard, styles.deltaCard]}>
                    <Text style={styles.greekLabel}>Delta</Text>
                    <Text style={styles.greekValue}>
                      {positionalGreeks.delta}
                    </Text>
                  </View>
                  <View style={[styles.greekCard, styles.thetaCard]}>
                    <Text style={styles.greekLabel}>Theta</Text>
                    <Text style={styles.greekValue}>
                      {positionalGreeks.theta}
                    </Text>
                  </View>
                  <View style={[styles.greekCard, styles.gammaCard]}>
                    <Text style={styles.greekLabel}>Gamma</Text>
                    <Text style={styles.greekValue}>
                      {positionalGreeks.gamma}
                    </Text>
                  </View>
                  <View style={[styles.greekCard, styles.vegaCard]}>
                    <Text style={styles.greekLabel}>Vega</Text>
                    <Text style={styles.greekValue}>
                      {positionalGreeks.vega}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </>
  );
};

const getStyles = (c: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    mainGrid: {
      gap: 16,
    },
    strategyPositionsContainer: {
      padding: 16,
      borderWidth: 1,
      borderRadius: 12,
      borderColor: c.border,
      backgroundColor: c.card,
      marginBottom: 16,
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
      flexWrap: "wrap",
      gap: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: c.text,
    },
    buttonGroup: {
      flexDirection: "row",
      gap: 12,
    },
    resetButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: c.loss,
      borderRadius: 8,
      backgroundColor: c.card,
    },
    resetButtonText: {
      color: c.loss,
    },
    selectAllContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      marginBottom: 8,
    },
    checkbox: {
      marginRight: 8,
    },
    selectAllText: {
      color: c.text,
    },
    summaryContainer: {
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: c.border,
      gap: 8,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    summaryLabel: {
      fontSize: 14,
      color: c.textSecondary,
    },
    summaryValue: {
      fontSize: 14,
      color: c.text,
    },
    profitText: {
      color: c.profit,
    },
    lossText: {
      color: c.loss,
    },
    totalPnlRow: {
      borderTopWidth: 1,
      borderTopColor: c.border,
      paddingTop: 8,
    },
    totalPnlLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: c.text,
    },
    totalPnlValue: {
      fontSize: 14,
      fontWeight: "500",
    },
    chartContainer: {
      padding: 16,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
      borderRadius: 12,
    },
    tabButtonsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      marginBottom: 12,
    },
    tabButton: {
      borderRadius: 6,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    activeTabButton: {
      backgroundColor: c.gold,
    },
    inactiveTabButton: {
      backgroundColor: c.surfaceElevated,
    },
    tabButtonText: {
      fontSize: 14,
      fontWeight: "600",
      textTransform: "capitalize",
    },
    activeTabButtonText: {
      color: c.onGold,
    },
    inactiveTabButtonText: {
      color: c.textSecondary,
    },
    tabContent: {
      marginBottom: 8,
    },
    greeksSummaryContainer: {
      backgroundColor: c.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 16,
      paddingTop:16,
      paddingBottom:6
    },
    greeksGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      justifyContent: "space-between",
    },
    greekCard: {
      minWidth: "45%",
      flex: 1,
      alignItems: "center",
      paddingVertical: 12,
      borderRadius: 8,
    },
    deltaCard: {
      backgroundColor: c.surfaceElevated,
    },
    thetaCard: {
      backgroundColor: c.lossBg,
    },
    gammaCard: {
      backgroundColor: c.goldLight,
    },
    vegaCard: {
      backgroundColor: c.profitBg,
    },
    greekLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: c.textSecondary,
      // marginBottom: 4,
    },
    greekValue: {
      fontSize: 16,
      fontWeight: "600",
      color: c.text,
    },
  });

export default StrategyPositions;
