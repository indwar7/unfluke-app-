import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { updateMTMStopLoss, updateMTMTarget, updateMTMTrailing } from "../../../../redux/slices/basicBacktester/reducer";
import MTMTarget from "./MTMTarget";
import MTMStopLoss from "./MTMStopLoss";
import MTMTrailingSL from "./MTMTrailingSL";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

const MTM = () => {
  const { colors: c, isDark } = useTheme();
  const styles = makeStyles(c, isDark);
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

const makeStyles = (c: AppColors, isDark: boolean) => StyleSheet.create({
  card: {
    backgroundColor: c.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
    marginTop: 0,
    paddingBottom: 10,
    paddingTop:7
  },
  header: {
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: c.text,
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
