import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { updateMTMTarget } from "../../../../redux/slices/basicBacktester/reducer";
import InfoIconCustom from "../../InfoIcon/InfoIconCustom";
import { backtesterTooltipTexts } from "../../Utils/common_vars";

const MTMTarget = () => {
  const dispatch = useDispatch();
  const { MTMTarget } = useSelector((store) => store.BasicBacktester);

  function handleChange(value) {
    // sanitize input (allow only numbers and one dot)
    let sanitized = value
      .replace(/[^0-9.]/g, "") // remove non-numeric/non-dot
      .replace(/(\..*)\./g, "$1"); // prevent multiple dots

    // ✅ allow empty string during typing
    if (sanitized === "") {
      const payload = { name: "value", value: "" };
      dispatch(updateMTMTarget(payload));
      return;
    }

    // ✅ enforce non-negative numbers
    if (Number(sanitized) < 0) {
      sanitized = "0";
    }

    const payload = { name: "value", value: sanitized };
    dispatch(updateMTMTarget(payload));
  }

  return (
    <View style={styles.container}>
      {/* Label + Tooltip */}
      <View style={styles.labelRow}>
        <Text style={styles.label}>MTM Target (in rupees)</Text>
        <InfoIconCustom tooltipText={backtesterTooltipTexts.mtmTarget} />
      </View>

      {/* Input */}
      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Target"
          keyboardType="numeric"
          value={MTMTarget.value?.toString() ?? ""}
          onChangeText={handleChange}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontWeight: "600",
    fontSize: 14,
    marginRight: 4,
    color: "#111827", // gray-900
  },
  inputGroup: {
    borderWidth: 1,
    borderColor: "#d1d5db", // gray-300
    borderRadius: 6,
    overflow: "hidden",
  },
  input: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#fff",
  },
});

export default MTMTarget;
