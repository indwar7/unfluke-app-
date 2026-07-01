import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { updateMTMTrailing } from "../../../../redux/slices/basicBacktester/reducer";
import InfoIconCustom from "../../InfoIcon/InfoIconCustom";
import { backtesterTooltipTexts } from "../../Utils/common_vars";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

const MTMTrailingSL = () => {
  const dispatch = useDispatch();
  const { MTMTrailing } = useSelector((store) => store.BasicBacktester);
  const [showYTooltip, setShowYTooltip] = useState(false);
  const { colors: c, isDark } = useTheme();
  const styles = makeStyles(c, isDark);

  function handleChange(name, value) {
    // remove non-numeric/non-dot & prevent multiple dots
    value = value
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*)\./g, "$1");

    setShowYTooltip(false);

    if (name === "value" && value === "None") {
      const payload = { name: "values", value: { x: "0", y: "0" } };
      dispatch(updateMTMTrailing(payload));
      return;
    }

    if (name.split(".")[0] === "values" && parseFloat(value) < 0) {
      value = "0";
    }

    if (name === "values.y" && parseFloat(value) > parseFloat(MTMTrailing.values.x)) {
      value = String(MTMTrailing.values.x);
      setShowYTooltip(true);
    }

    if (name === "values.x" && parseFloat(value) < parseFloat(MTMTrailing.values.y)) {
      const payloadY = { name: "values.y", value };
      dispatch(updateMTMTrailing(payloadY));
    }

    const payload = { name, value };
    dispatch(updateMTMTrailing(payload));
  }

  function handleTrailingStopLossType(value) {
    if (value !== null) {
      const payload = { name: "type", value };
      dispatch(updateMTMTrailing(payload));
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>MTM Trailing SL (in rupees)</Text>
        <InfoIconCustom tooltipText={backtesterTooltipTexts.mtmTrailingSL} />
      </View>

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Trailing SL X"
          placeholderTextColor={c.textMuted}
          value={String(MTMTrailing.values.x)}
          keyboardType="numeric"
          onChangeText={(val) => handleChange("values.x", val)}
        />

        <TextInput
          style={styles.input}
          placeholder="Trailing SL Y"
          placeholderTextColor={c.textMuted}
          value={String(MTMTrailing.values.y)}
          keyboardType="numeric"
          onChangeText={(val) => handleChange("values.y", val)}
        />
      </View>

      {showYTooltip && (
        <Text style={styles.tooltipText}>
          Y cannot be greater than X
        </Text>
      )}
    </View>
  );
};

export default MTMTrailingSL;

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
  row: {
    flexDirection: "row",
    gap: 8, // similar to gap-2 in web
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: c.inputBorder,
    backgroundColor: c.inputBg,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    fontSize: 14,
    color: c.text,
  },
  tooltipText: {
    marginTop: 4,
    color: c.error,
    fontSize: 12,
  },
});
