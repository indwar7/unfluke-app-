import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { updateMTMStopLoss, updateMTMTarget, updateMTMTrailing } from "../../../../redux/slices/basicBacktester/reducer";
import MTMTarget from "./MTMTarget";
import MTMStopLoss from "./MTMStopLoss";
import MTMTrailingSL from "./MTMTrailingSL";

const MTM = () => {
  return (
    <View style={styles.card}>
      {/* Header */}
      <Text style={styles.header}>MTM</Text>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.row}>
          <MTMTarget
            {...{ updateMTMTarget, updateMTMStopLoss, updateMTMTrailing }}
          />
          <MTMStopLoss {...{ updateMTMStopLoss }} />
          <MTMTrailingSL {...{ updateMTMTrailing }} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db", // gray-300
    marginTop: 0,
    paddingBottom: 10,
    paddingTop:7
    // Dark mode fallback (if you handle dark theme manually)
    // You can also use a theme provider if you have one
  },
  header: {
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: "#111827", // gray-900
  },
  body: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  row: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16, // expo sdk49+ supports gap in RN
  },
});

export default MTM;
