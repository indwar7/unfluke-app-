import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useColorScheme } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import LegOptions from "./LegOptions";
import {
  backtesterTooltipTexts,
  formatTime,
  reEntriesGlobal,
} from "../../Utils/common_vars";
import { useDispatch } from "react-redux";
import {
  changeReEntry,
  onChange,
  onTimeChange,
  setNoreEntryAfter,
} from "../../../../redux/slices/basicBacktester/reducer";
import InfoIconCustom from "../../InfoIcon/InfoIconCustom";
import { StyleSheet } from "react-native";

const StrategyFilters = (props) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getStyles(isDark);

  const { name, handleNameChange } = props;
  const [selectMulti, setselectMulti] = useState();
  const [weekdaysSelected, setWeekdaysSelected] = useState([]);

  // Local state for strategy name to handle input properly
  const [localStrategyName, setLocalStrategyName] = useState(name || "");

  // States for time pickers - more specific state management
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const dispatch = useDispatch();

  const {
    underlying,
    tradeType,
    duration,
    weekDays,
    startTime,
    endTime,
    nextDayEndTime,
    checkConditionNextDayAfter,
    daysBeforeExpiry,
  } = props.strategySettings;

  const [startingTime, setStartingTime] = useState(startTime);
  const [endingTime, setEndingTime] = useState(endTime);

  useEffect(() => {
    setStartingTime(startTime);
    setEndingTime(endTime);
  }, [startTime, endTime]);

  console.log(startTime, endTime, startingTime, endingTime);

  const [weekdaysOptions, setWeekdaysOptions] = useState([
    { label: "Monday", value: "monday", checked: false },
    { label: "Tuesday", value: "tuesday", checked: false },
    { label: "Wednesday", value: "wednesday", checked: false },
    { label: "Thursday", value: "thursday", checked: false },
    { label: "Friday", value: "friday", checked: false },
  ]);

  // Update local state when prop changes
  useEffect(() => {
    setLocalStrategyName(name || "");
  }, [name]);

  useEffect(() => {
    if (weekDays.length > 0) {
      const tmp = [...weekdaysOptions]; // Create a copy
      let tmp1 = [...weekdaysSelected]; // Create a copy

      for (let i in tmp) {
        if (weekDays.indexOf(tmp[i].value) !== -1) {
          tmp[i].checked = true;
          if (!tmp1.includes(tmp[i].value)) {
            tmp1 = tmp1.concat(tmp[i].value);
          }
        }
      }

      setWeekdaysOptions(tmp);
      setWeekdaysSelected(tmp1);
    }
  }, [weekDays]);

  // Handle strategy name change
  function handleLocalNameChange(name, text) {
    setLocalStrategyName(text);
    // Call parent handler if it exists
    console.log(name, text);
    handleNameChange(name, text);
  }

  // Improved format time function
  function formatTimeDisplay(timeObj) {
    if (!timeObj) return "09:15 AM";

    let hour = 9,
      minute = 15; // Default values

    // Handle if it's an object with hour/minute properties
    if (typeof timeObj === "object" && timeObj !== null) {
      if (timeObj.hour !== undefined && timeObj.minute !== undefined) {
        hour = parseInt(timeObj.hour, 10);
        minute = parseInt(timeObj.minute, 10);
      }
    }
    // Handle if it's a string in HH:MM format
    else if (typeof timeObj === "string" && timeObj.includes(":")) {
      const parts = timeObj.split(":");
      if (parts.length >= 2) {
        hour = parseInt(parts[0], 10);
        minute = parseInt(parts[1], 10);
      }
    }

    // Validate hour and minute values
    if (isNaN(hour) || hour < 0 || hour > 23) hour = 9;
    if (isNaN(minute) || minute < 0 || minute > 59) minute = 15;

    // Convert to 12-hour format
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute.toString().padStart(2, "0");

    return `${displayHour}:${displayMinute} ${period}`;
  }

  // Convert time object/string to Date object for picker
  function timeToDate(timeObj) {
    let hour = 9,
      minute = 15; // Default values
    console.log(timeObj.hour, "asfsfas");
    if (timeObj) {
      // Handle if it's an object with hour/minute properties
      if (typeof timeObj === "object" && timeObj !== null) {
        if (timeObj.hour !== undefined && timeObj.minute !== undefined) {
          hour = parseInt(timeObj.hour, 10);
          minute = parseInt(timeObj.minute, 10);
        }
      }
      // Handle if it's a string in HH:MM format
      else if (typeof timeObj === "string" && timeObj.includes(":")) {
        const parts = timeObj.split(":");
        if (parts.length >= 2) {
          hour = parseInt(parts[0], 10);
          minute = parseInt(parts[1], 10);
        }
      }
    }

    // Validate hour and minute values
    if (isNaN(hour) || hour < 0 || hour > 23) hour = 9;
    if (isNaN(minute) || minute < 0 || minute > 59) minute = 15;

    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  }

  // Convert Date object to time object format expected by backend
  function dateToTimeObject(date) {
    const hour = date.getHours().toString();
    const minute = date.getMinutes().toString();
    const second = "0";

    return {
      hour,
      minute,
      second,
    };
  }

  // Improved time picker change handler
  function handleTimePickerChange(event, selectedDate, fieldName) {
    // Always close both pickers first to prevent conflicts
    setShowStartTimePicker(false);
    setShowEndTimePicker(false);

    if (event.type === "dismissed" || !selectedDate) {
      return;
    }
    // console.log(selectedDate, "this is the date");
    // console.log(selectedDate, "This is the selected date");
    // console.log(fieldName, "This is the field name");
    const timeObj = dateToTimeObject(selectedDate);
    console.log(timeObj, "This is the time object being dispatched");
    const { hour, minute } = timeObj;

    // Format with leading zeros
    const formattedTime = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;

    handleTimeChange(fieldName, formattedTime);
  }

  // Handle opening start time picker
  function openStartTimePicker() {
    setShowEndTimePicker(false); // Close end time picker if open
    setShowStartTimePicker(true);
  }

  // Handle opening end time picker
  function openEndTimePicker() {
    setShowStartTimePicker(false); // Close start time picker if open
    setShowEndTimePicker(true);
  }

  // Converted function for React Native
  function handleTimeChange(name, value) {
    // console.log("Dispatching time change:", { name, value });

    if (name === "strategySettings.startTime") {
      setStartingTime(value); // 👈 update start time
    } else {
      setEndingTime(value); // 👈 update end time
    }

    console.log(name, value, "adfsdfafsd")
    // still dispatch to redux if needed
    dispatch(onTimeChange({ name, value }));
  }

  // Converted function for React Native
  function handleChange(name, value) {
    dispatch(onChange({ name, value }));
  }

  // Converted function for React Native
  function handleUnderlying(value) {
    const name = "strategySettings.underlying";
    handleChange(name, value);
  }

  // Converted function for React Native
  function handleTradeType(value) {
    const name = "strategySettings.tradeType";
    handleChange(name, value);
  }

  // Converted function for React Native
  function handleWeekDays(value) {
    let tmp = [...weekdaysSelected]; // Create a copy

    if (value) {
      if (tmp.indexOf(value) === -1) {
        tmp = tmp.concat([value]);
      } else {
        const newArray = tmp.filter((x) => x !== value);
        tmp = newArray;
      }

      setWeekdaysSelected(tmp);

      const name = "strategySettings.weekDays";
      handleChange(name, tmp);
    }
  }

  // Converted function for React Native
  function handleDaysBeforeExpiry(value) {
    const name = "strategySettings.daysBeforeExpiry";
    handleChange(name, value);
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.formRowLarge}>
          {/* Strategy Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Strategy Name</Text>
            <TextInput
              placeholder="Enter here"
              placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
              value={localStrategyName}
              onChangeText={(text) => handleLocalNameChange("name", text)} // pass name + value
              style={styles.input}
            />
          </View>

          {/* Start Time */}
          <View style={styles.inputContainerSmall}>
            <Text style={styles.label}>Start Time</Text>
            <TouchableOpacity
              style={styles.timeInput}
              onPress={openStartTimePicker}
            >
              <Text style={styles.timeText}>
                {formatTimeDisplay(startingTime)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* End Time */}
          <View style={styles.inputContainerSmall}>
            <Text style={styles.label}>End Time</Text>
            <TouchableOpacity
              style={styles.timeInput}
              onPress={openEndTimePicker}
            >
              <Text style={styles.timeText}>
                {formatTimeDisplay(endingTime)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.inputContainer, styles.section]}>
            <View style={styles.labelContainer}>
              <Text style={styles.labelBold}>Underlying</Text>
              <InfoIconCustom tooltipText={backtesterTooltipTexts.underlying} />
            </View>

            <View style={styles.radioContainer}>
              {/* Spot Radio Button */}
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => handleUnderlying("spot")}
              >
                <View
                  style={[
                    styles.radioCircle,
                    underlying === "spot" && styles.radioSelected,
                  ]}
                />
                <Text style={styles.radioText}>Spot</Text>
              </TouchableOpacity>

              {/* Future Radio Button */}
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => handleUnderlying("future")}
              >
                <View
                  style={[
                    styles.radioCircle,
                    underlying === "future" && styles.radioSelected,
                  ]}
                />
                <Text style={styles.radioText}>Future</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.formRow, styles.section]}>
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.labelBold}>Weekdays</Text>
              <InfoIconCustom tooltipText={backtesterTooltipTexts.weekdays} />
            </View>

            <View style={styles.weekdaysContainer}>
              <View style={styles.weekdaysRow}>
                {weekdaysOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.weekdayButton,
                      weekdaysSelected.includes(option.value)
                        ? styles.weekdaySelected
                        : styles.weekdayUnselected,
                    ]}
                    onPress={() => handleWeekDays(option.value)}
                  >
                    <Text
                      style={
                        weekdaysSelected.includes(option.value)
                          ? styles.weekdayTextSelected
                          : styles.weekdayTextUnselected
                      }
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Render Date Time Pickers conditionally */}
      {showStartTimePicker && (
        <DateTimePicker
          value={timeToDate(startingTime)}
          is24Hour={false}
          mode="time"
          display="default"
          onChange={(event, selectedDate) =>
            handleTimePickerChange(
              event,
              selectedDate,
              "strategySettings.startTime"
            )
          }
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={timeToDate(endingTime)}
          is24Hour={false}
          mode="time"
          display="default"
          onChange={(event, selectedDate) =>
            handleTimePickerChange(
              event,
              selectedDate,
              "strategySettings.endTime"
            )
          }
        />
      )}

      {/* LegOptions Component - needs to be converted separately */}
      <LegOptions />
    </ScrollView>
  );
};

const getStyles = (isDark) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? "#14161B" : "#ffffff",
      borderColor: isDark ? "#262A33" : "#d1d5db",
      borderWidth: 1,
      borderRadius: 12,
      marginBottom: 16,
      padding: 16,
    },
    formRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 7,
      gap: 16,
    },
    formRowLarge: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-end",
      gap: 18,
    },
    inputContainer: {
      flex: 1,
      minWidth: 200,
    },
    inputContainerSmall: {
      flex: 0.3,
      minWidth: 150,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      color: isDark ? "#e5e7eb" : "#374151",
      marginBottom: 4,
    },
    labelBold: {
      fontSize: 14,
      fontWeight: "bold",
      color: isDark ? "#e5e7eb" : "#374151",
    },
    labelContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
      gap: 5,
      marginTop: 10,
    },
    input: {
      width: "100%",
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: isDark ? "#14161B" : "#f4f8fd",
      borderColor: isDark ? "#262A33" : "#d1d5db",
      borderWidth: 1,
      borderRadius: 6,
      marginTop: 2,
      color: isDark ? "#f3f4f6" : "#111827",
      fontSize: 14,
    },
    timeInput: {
      width: "100%",
      paddingHorizontal: 12,
      paddingVertical: 12,
      backgroundColor: isDark ? "#14161B" : "#f4f8fd",
      borderColor: isDark ? "#262A33" : "#d1d5db",
      borderWidth: 1,
      borderRadius: 6,
      marginTop: 2,
      justifyContent: "center",
    },
    timeText: {
      color: isDark ? "#f3f4f6" : "#111827",
      fontSize: 14,
      fontWeight: "500",
    },
    radioContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 24,
    },
    radioOption: {
      flexDirection: "row",
      alignItems: "center",
    },
    radioCircle: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: "#2563eb",
      alignItems: "center",
      justifyContent: "center",
    },
    radioSelected: {
      backgroundColor: "#2563eb",
    },
    radioText: {
      marginLeft: 8,
      fontSize: 14,
      color: isDark ? "#e5e7eb" : "#374151",
    },
    weekdaysContainer: {
      marginTop: 3,
    },
    weekdaysRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    weekdayButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      marginBottom: 8,
    },
    weekdaySelected: {
      backgroundColor: "#2563eb",
      borderColor: "#2563eb",
    },
    weekdayUnselected: {
      backgroundColor: isDark ? "#14161B" : "#ffffff",
      borderColor: isDark ? "#262A33" : "#d1d5db",
    },
    weekdayTextSelected: {
      color: "#ffffff",
      fontSize: 14,
    },
    weekdayTextUnselected: {
      color: isDark ? "#e5e7eb" : "#374151",
      fontSize: 14,
    },
    section: {
      marginTop: 10,
    },
  });

export default StrategyFilters;
