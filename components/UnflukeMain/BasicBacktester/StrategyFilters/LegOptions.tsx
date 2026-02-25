import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import {
  formatTime,
  initialLegPositions,
  reEntriesGlobal,
} from "../../Utils/common_vars";
import { setDeepObjProp as set } from "../StrategyLegs/utils";
import {
  changeLegOptions,
  changeLegReEntries,
  changeLegReEntryConditions,
  changeReEntry,
  setNoreEntryAfter,
  toggleReentrySlTargetExit,
} from "../../../../redux/slices/basicBacktester/reducer";
import { useDispatch } from "react-redux";
import { backtesterTooltipTexts } from "../../Utils/common_vars";
import InfoIconCustom from "../../InfoIcon/InfoIconCustom";
import { deepCopy } from "../StrategyLegs/utils";
import {
  addLeg,
  updateLeg,
} from "../../../../redux/slices/basicBacktester/reducer";
import { Alert } from "react-native";
// import 'react-native-get-random-values'; 
import * as Crypto from "expo-crypto";

const LegOptions = () => {
  const colorScheme = useColorScheme();
  const isDark = false;

  const styles = createStyles(isDark);
  const [reEntryDisabled, setreEntryDisabled] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const dispatch = useDispatch();

  const { legs, legOptions, reEntrySlTargetExit, reEntry, noReentryAfter } =
    useSelector((store) => store.BasicBacktester.positions);

  const [positions, setPositions] = useState({
    ...initialLegPositions,
    legOptions: { ...legOptions },
  });

  // Fixed checkbox handler for React Native
  function handleCheckBox(name, value) {
    setPositions((prev) => {
      const newPositions = { ...prev };
      set(newPositions, name.split("."), value);
      return newPositions;
    });
  }

  // Fixed re-entry conditions handler
  function handleReentryConditions() {
    dispatch(toggleReentrySlTargetExit());
  }

  function handleSquareoff(value) {
    dispatch(
      changeLegOptions({
        ...legOptions,
        squareOff: value,
      })
    );
  }

  function handleReEntry(value) {
    dispatch(changeReEntry(value));
  }

  // Fixed no re-entry after handler
  function handleNoReEntryAfter(name, value) {
    if (name === "noReEntryAfterSwitch") {
      dispatch(
        setNoreEntryAfter({
          isEnabled: value,
          value: noReentryAfter.value,
        })
      );
    } else {
      dispatch(
        setNoreEntryAfter({
          isEnabled: noReentryAfter.isEnabled,
          value: value,
        })
      );
    }
  }

  const handleAddLeg = ({
  }) => {
    if (legs.length < 10) {
      // Collapse all existing legs
      legs.forEach((l) => {
        dispatch(updateLeg({ id: l.id, name: "expanded", value: false }));
      });

      // Create a deep copy and assign a unique ID
      let leg = deepCopy(positions);
      leg = { id: Crypto.randomUUID(), ...leg }; // ✅ Works in Expo (SDK 49+)

      // Validation check
      if (leg.strike === "based_on_premium" && leg.strikeDetails === "ATM_0") {
        Alert.alert("Validation Error", "Please add a valid Premium value.");
        return;
      }

      delete leg.legOptions;

      // Handle re-entry logic
      if (reEntrySlTargetExit) {
        leg.reEntryCondition = {
          ...leg.reEntryCondition,
          target: true,
          sl: true,
          targetReentries: parseInt(reEntry),
          slReentries: parseInt(reEntry),
        };
      }

      dispatch(addLeg(leg));
    }
  };


  // Fixed time picker handler
  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime && event.type === "set") {
      const timeString = selectedTime.toTimeString().slice(0, 5);
      handleNoReEntryAfter("noReEntryAfterTime", timeString);
    }
  };

  useEffect(() => {
    dispatch(changeLegOptions(positions.legOptions));
  }, [
    positions.legOptions.waitAndTrade,
    positions.legOptions.moveSlToCost,
    positions.legOptions.squareOff,
  ]);

  useEffect(() => {
    dispatch(setNoreEntryAfter(noReentryAfter));
  }, [noReentryAfter]);

  useEffect(() => {
    dispatch(changeReEntry(reEntry));
  }, [reEntry]);

  useEffect(() => {
    if (!reEntrySlTargetExit) {
      dispatch(changeLegReEntries(0));
      dispatch(changeLegReEntryConditions({ target: false, sl: false }));
    } else {
      dispatch(changeLegReEntries(reEntry));
      dispatch(changeLegReEntryConditions({ target: true, sl: true }));
    }
  }, [reEntrySlTargetExit]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leg Options</Text>
        <TouchableOpacity
          style={[
            styles.addButton,
            legs.length >= 10 && styles.addButtonDisabled,
          ]}
          onPress={handleAddLeg}
          disabled={legs.length >= 10}
        >
          <Ionicons name="add" size={16} color="white" style={styles.addIcon} />
          <Text style={styles.addButtonText}>Add Leg</Text>
          {legs.length >= 10 && <Text style={styles.maxText}>(max)</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Grid layout */}
        <View style={styles.gridContainer}>
          {/* Square-off */}
          <View style={styles.gridItem}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Square-off</Text>
              <InfoIconCustom tooltipText={backtesterTooltipTexts.squareOff} />
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={positions.legOptions.squareOff}
                onValueChange={handleSquareoff}
                style={[styles.picker]}
                dropdownIconColor={isDark ? "#fff" : "#000"}
              >
                <Picker.Item style={{ fontSize: 14 }} label="Partial" value="partial" />
                <Picker.Item style={{ fontSize: 14 }} label="Complete" value="complete" />
              </Picker>
            </View>
          </View>

          {/* Re-entry */}
          <View style={styles.gridItem}>
            <Text style={styles.label}>Re-entry</Text>
            <View
              style={[
                styles.pickerContainer,
                reEntryDisabled && styles.disabled,
              ]}
            >
              <Picker
                selectedValue={reEntry}
                onValueChange={handleReEntry}
                enabled={!reEntryDisabled}
                style={styles.picker}
                dropdownIconColor={isDark ? "#fff" : "#000"}
              >
                {reEntriesGlobal.map((entry) => (
                  <Picker.Item
                    key={entry}
                    label={entry.toString()}
                    value={entry}
                    style={{ fontSize: 14 }}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* No re-entry after */}
          <View style={styles.gridItem}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>No re-entry after</Text>
              <InfoIconCustom
                tooltipText={backtesterTooltipTexts.noReEntryAfter}
              />
            </View>

            {noReentryAfter.isEnabled ? (
              <View style={styles.timePickerDiv}>
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.timePickerButtonText}>
                    {noReentryAfter.value || "Select Time"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.timePickerDiv}>
                <View style={styles.timePickerDisabled}>
                  <Text style={styles.timePickerDisabledText}>--:--</Text>
                </View>
              </View>
            )}

            {showTimePicker && (
              <DateTimePicker
                value={
                  noReentryAfter.value
                    ? new Date(`2000-01-01T${noReentryAfter.value}:00`)
                    : new Date()
                }
                mode="time"
                is24Hour={true}
                display="default"
                onChange={handleTimeChange}
              />
            )}
          </View>
        </View>

        {/* Checkboxes */}
        <View style={styles.checkboxContainer}>
          {/* Move SL to cost */}
          <View style={styles.checkboxRow}>
            <Switch
              value={positions.legOptions.moveSlToCost}
              onValueChange={(value) =>
                handleCheckBox("legOptions.moveSlToCost", value)
              }
              disabled={legs.length > 2}
              trackColor={{ false: "#767577", true: "#3b82f6" }}
              thumbColor={
                positions.legOptions.moveSlToCost ? "#ffffff" : "#f4f3f4"
              }
            />
            <Text
              style={[styles.checkboxLabel, legs.length > 2 && styles.disabled]}
            >
              Move SL to cost
            </Text>
            <InfoIconCustom tooltipText={backtesterTooltipTexts.moveSlToCost} />
          </View>

          {/* No re-entry after switch */}
          <View style={styles.checkboxRow}>
            <Switch
              value={noReentryAfter.isEnabled}
              onValueChange={(value) =>
                handleNoReEntryAfter("noReEntryAfterSwitch", value)
              }
              trackColor={{ false: "#767577", true: "#3b82f6" }}
              thumbColor={noReentryAfter.isEnabled ? "#ffffff" : "#f4f3f4"}
            />
            <Text style={styles.checkboxLabel}>No re-entry after</Text>
            <InfoIconCustom
              tooltipText={backtesterTooltipTexts.noReEntryAfter}
            />
          </View>
        </View>

        {/* Re-entry conditions */}
        <View style={styles.reentryContainer}>
          <View style={styles.checkboxRow}>
            <Switch
              value={reEntrySlTargetExit}
              onValueChange={handleReentryConditions}
              trackColor={{ false: "#767577", true: "#3b82f6" }}
              thumbColor={reEntrySlTargetExit ? "#ffffff" : "#f4f3f4"}
            />
            <Text style={styles.checkboxLabel}>
              Re-enter either on SL or Target Exit
            </Text>
          </View>

          <View style={styles.checkboxRow}>
            <Switch
              value={!reEntrySlTargetExit}
              onValueChange={() => handleReentryConditions()}
              trackColor={{ false: "#767577", true: "#3b82f6" }}
              thumbColor={!reEntrySlTargetExit ? "#ffffff" : "#f4f3f4"}
            />
            <Text style={styles.checkboxLabel}>
              Re-enter after all legs are exited
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (isDark) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? "#1f2937" : "#ffffff",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#d1d5db",
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 7
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#ffffff" : "#111827",
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 7,
      borderRadius: 6,
      backgroundColor: "#2563eb",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    addButtonDisabled: {
      opacity: 0.5,
    },
    addIcon: {
      marginRight: 4,
    },
    addButtonText: {
      color: "#ffffff",
      fontSize: 13,
      fontWeight: "500",
    },
    maxText: {
      color: "#ffffff",
      fontSize: 10,
      opacity: 0.8,
      marginLeft: 4,
    },
    gridContainer: {
      gap: 4,
    },
    gridItem: {
      marginBottom: 16,
    },
    labelContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      color: isDark ? "#d1d5db" : "#374151",
      marginRight: 4,
    },
    pickerContainer: {
      marginTop: 6,
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#d1d5db",
      borderRadius: 8,
      backgroundColor: isDark ? "#111827" : "#f4f8fd",
      fontSize: 12,
      paddingVertical: 1
    },
    picker: {
      color: isDark ? "#ffffff" : "#000000",
    },
    //    input: {
    //   width: '100%',
    //   paddingHorizontal: 12,
    //   paddingVertical: 10,
    //   backgroundColor: isDark ? '#111827' : '#f4f8fd',
    //   borderColor: isDark ? '#374151' : '#d1d5db',
    //   borderWidth: 1,
    //   borderRadius: 6,
    //   marginTop:2,
    //   color: isDark ? '#f3f4f6' : '#111827',
    //   fontSize: 14,
    // },
    disabled: {
      opacity: 0.5,
    },
    timePickerDiv: {
      marginTop: 6,
    },
    timePickerButton: {
      height: 50,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#d1d5db",
      borderRadius: 8,
      backgroundColor: isDark ? "#111827" : "#f4f8fd",
      justifyContent: "center",
    },
    timePickerButtonText: {
      color: isDark ? "#ffffff" : "#000000",
      fontSize: 16,
    },
    timePickerDisabled: {
      height: 50,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#d1d5db",
      borderRadius: 8,
      backgroundColor: isDark ? "#111827" : "#f4f8fd",
      opacity: 0.5,
      justifyContent: "center",
    },
    timePickerDisabledText: {
      color: isDark ? "#9ca3af" : "#6b7280",
      fontSize: 16,
    },
    checkboxContainer: {
    },
    checkboxRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    checkboxLabel: {
      fontSize: 13,
      color: isDark ? "#d1d5db" : "#374151",
      marginLeft: 4,
    },
    reentryContainer: {
    },
  });

export default LegOptions;
