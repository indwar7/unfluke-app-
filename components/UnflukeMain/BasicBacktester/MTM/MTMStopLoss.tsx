import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { updateMTMStopLoss } from "../../../../redux/slices/basicBacktester/reducer";
import InfoIconCustom from "../../InfoIcon/InfoIconCustom";
import { backtesterTooltipTexts } from "../../Utils/common_vars";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

const MTMStopLoss = () => {
  const dispatch = useDispatch();
  const { MTMStopLoss } = useSelector((store) => store.BasicBacktester);
  const { colors: c, isDark } = useTheme();
  const styles = makeStyles(c, isDark);

  function handleChange(value) {
    // remove non-numeric/non-dot and prevent multiple dots
    value = value
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*)\./g, "$1");

    if (value && parseFloat(value) < 0) {
      value = "0";
    }

    const payload = { name: "value", value };
    dispatch(updateMTMStopLoss(payload));
  }

  function handleMTMFixedStoploss(value) {
    const name = "fixedStopLoss";
    if (value !== null) {
      if (value === "None") {
        const payload = { name: "value", value: "0" };
        dispatch(updateMTMStopLoss(payload));
      }
      const payload = { name, value };
      dispatch(updateMTMStopLoss(payload));
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>MTM Stoploss</Text>
        <InfoIconCustom tooltipText={backtesterTooltipTexts.mtmStopLoss} />
      </View>

      <TextInput
        style={styles.input}
        placeholder="SL"
        placeholderTextColor={c.textMuted}
        value={String(MTMStopLoss.value)}
        keyboardType="numeric"
        onChangeText={handleChange}
      />
    </View>
  );
};

export default MTMStopLoss;

const makeStyles = (c: AppColors, isDark: boolean) => StyleSheet.create({
  container: {
    width: "100%",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 6,
    color: c.text,
  },
  input: {
    borderWidth: 1,
    borderColor: c.inputBorder,
    backgroundColor: c.inputBg,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    fontSize: 14,
    color: c.text,
  },
});
