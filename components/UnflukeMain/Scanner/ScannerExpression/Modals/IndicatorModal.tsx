import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  StatusBar,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Compute Android system nav bar height by subtracting the visible window height
// from the full screen height. This works even when the Modal renders outside the
// SafeAreaProvider (where useSafeAreaInsets returns 0). Falls back to 48dp.
const getAndroidBottomNavHeight = () => {
  if (Platform.OS !== "android") return 0;
  const screen = Dimensions.get("screen");
  const window = Dimensions.get("window");
  const statusBar = StatusBar.currentHeight || 0;
  const diff = screen.height - window.height - statusBar;
  // diff > 0 means there's a real nav bar; otherwise assume gesture bar (~24-48dp)
  return diff > 0 ? Math.max(diff, 24) : 48;
};
import {
  addSuffixToNumber,
  deepCopy,
  fundamentalYears,
  indicatorTimeframes,
  offset1s,
  offset2s,
  ohlc,
} from "../../../Utils/common_vars";

const IndicatorModal = ({ closeModal, settings, type }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  // Prefer the measured nav bar height (works inside Modal), fall back to insets.
  const bottomGutter = Math.max(insets.bottom, getAndroidBottomNavHeight());
  const dynamicStyles = styles(isDark, bottomGutter);

  const [customOffset1s, setCustomOffset1s] = useState([]);
  const [customOffset2s, setCustomOffset2s] = useState([]);

  const defaultSettings = {
    timeframe:
      settings.type === "fundamental"
        ? "yearly"
        : type === "fundamental"
          ? "daily"
          : "1-min",
    offset: "latest-candle",
    offset2: "all-candles",
  };

  const [newSettings, setSettings] = useState(settings);

  // Custom Prompt State
  const [promptVisible, setPromptVisible] = useState(false);
  const [promptValue, setPromptValue] = useState("");
  const [promptType, setPromptType] = useState(""); // "offset1", "offset2-todays", "offset2-yester"

  const showErrorToast = (message) => {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: message,
      position: "bottom",
    });
  };

  function handleChange(settingName, value) {
    const tmp = JSON.parse(JSON.stringify(newSettings));
    tmp[settingName] = value;
    setSettings(tmp);
  }

  function handleAdvSettingsChange(settingName, value, datatype = "string") {
    const tmp = JSON.parse(JSON.stringify(newSettings));

    if (!tmp["settings"]) tmp["settings"] = [];

    for (let index in tmp["settings"]) {
      const setting = tmp["settings"][index];

      if (setting.name === settingName) {
        if (datatype === "number" && (isNaN(value) || value === "e")) {
          return;
        }

        const newObj = {
          ...setting,
          name: setting.name,
          value: value,
        };

        tmp["settings"][index] = newObj;
        setSettings(tmp);
        return;
      }
    }

    const newObj = {
      name: settingName,
      value: value,
    };

    tmp["settings"].push(newObj);
    setSettings(tmp);
  }

  function getAdvSettingsValue(settingName) {
    const tmp = newSettings;

    for (let index in tmp["settings"]) {
      const setting = tmp["settings"][index];

      if (setting.name === settingName) {
        return setting.value;
      }
    }

    return defaultSettings[settingName];
  }

  const searchObjArray = (arr, searchStr) => {
    for (let row of arr) {
      if (row.value === searchStr) return true;
    }
    return false;
  };

  const handleCustomOffset = (offsetType) => {
    setPromptType(offsetType);
    setPromptValue("5"); // Default value
    setPromptVisible(true);
  };

  const onPromptSubmit = () => {
    const raw = (promptValue ?? "").toString().trim();
    const customCandle = Number(raw);
    if (!raw || !Number.isFinite(customCandle) || customCandle <= 0) {
      Alert.alert("Error", "Please enter a valid positive number");
      return;
    }

    let newVal, label, tmp;

    if (promptType === "offset1") {
      newVal = customCandle + "-candle";
      label = customCandle + " candle/s ago";

      if (!searchObjArray(offset1s, newVal)) {
        tmp = deepCopy(customOffset1s);
        tmp.push({ value: newVal, label: label });
        setCustomOffset1s(tmp);
      }

      handleChange("offset", newVal);
    } else if (promptType === "offset2-todays") {
      newVal = customCandle + "-todays-candle";
      label = "Todays " + addSuffixToNumber(customCandle) + " candle";

      if (!searchObjArray(offset2s["todays"], newVal)) {
        tmp = deepCopy(customOffset2s);
        tmp.push({ value: newVal, label: label });
        setCustomOffset2s(tmp);
      }

      handleChange("offset2", newVal);
    } else if (promptType === "offset2-yester") {
      newVal = customCandle + "-yester-candle";
      label = "Yesterdays " + addSuffixToNumber(customCandle) + " candle";

      if (!searchObjArray(offset2s["yesterdays"], newVal)) {
        tmp = deepCopy(customOffset2s);
        tmp.push({ value: newVal, label: label });
        setCustomOffset2s(tmp);
      }

      handleChange("offset2", newVal);
    }

    setPromptVisible(false);
  };

  const handleSubmit = () => {
    if (getAdvSettingsValue("Length") === "") {
      showErrorToast("Fields cannot be empty.");
      return;
    }

    closeModal({
      indicatorName: newSettings.indicatorName,
      timeframe: newSettings.timeframe
        ? newSettings.timeframe
        : defaultSettings.timeframe,
      offset: newSettings.offset ? newSettings.offset : defaultSettings.offset,
      offset2: newSettings.offset2
        ? newSettings.offset2
        : defaultSettings.offset2,
      type: newSettings.type ? newSettings.type : settings.type,
      collection: newSettings.collection ? newSettings.collection : null,
      sources: settings.sources ? settings.sources : null,
      quarteryear: newSettings.quarteryear ? newSettings.quarteryear : null,
      settings: newSettings.settings,
    });
  };

  // Initialize custom offsets
  useEffect(() => {
    try {
      if (
        settings.offset &&
        typeof settings.offset === "string" &&
        !searchObjArray(offset1s, settings.offset)
      ) {
        const head = settings.offset.split("-")[0];
        if (head && !isNaN(Number(head))) {
          const tmp = deepCopy(customOffset1s);
          tmp.push({
            value: settings.offset,
            label: head + " candle/s ago",
          });
          setCustomOffset1s(tmp);
        }
      }

      if (settings.offset2 && typeof settings.offset2 === "string") {
        const split = settings.offset2.split("-");
        const head = split[0];
        if (!head || isNaN(Number(head))) return;

        const num = addSuffixToNumber(head);
        let label = "";

        if (split[1] === "todays") {
          label = "Todays " + num + " candle";
          if (searchObjArray(offset2s["todays"], settings.offset2)) return;
        } else if (split[1] === "yester") {
          label = "Yesterdays " + num + " candle";
          if (searchObjArray(offset2s["yesterdays"], settings.offset2)) return;
        }

        if (!label) return;

        const tmp = deepCopy(customOffset2s);
        tmp.push({
          value: settings.offset2,
          label: label,
        });
        setCustomOffset2s(tmp);
      }
    } catch (err) {
      console.warn("IndicatorModal offset init error:", err);
    }
  }, []);

  // Handle offset changes that trigger prompts
  useEffect(() => {
    if (newSettings.offset === "custom-candle") {
      handleCustomOffset("offset1");
    } else if (newSettings.offset2 === "custom-todays-candle") {
      handleCustomOffset("offset2-todays");
    } else if (newSettings.offset2 === "custom-yester-candle") {
      handleCustomOffset("offset2-yester");
    }
  }, [newSettings.offset, newSettings.offset2]);

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={() => closeModal()}
    >
      <View style={dynamicStyles.overlay}>
        <View style={dynamicStyles.modalContainer}>
          {/* Header */}
          <View style={dynamicStyles.header}>
            <Text style={dynamicStyles.title}>{newSettings.indicatorName}</Text>
            <TouchableOpacity onPress={() => closeModal()}>
              <Text style={dynamicStyles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView
            style={dynamicStyles.body}
            showsVerticalScrollIndicator={true}
          >
            {/* Timeframe */}
            {type !== "fundamental" && (
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.label}>Timeframe</Text>
                <View style={dynamicStyles.pickerContainer}>
                  <Picker
                    selectedValue={
                      newSettings.timeframe
                        ? newSettings.timeframe
                        : defaultSettings.timeframe
                    }
                    onValueChange={(value) => handleChange("timeframe", value)}
                    enabled={!(settings && settings.type === "fundamental")}
                    style={dynamicStyles.picker}
                    dropdownIconColor={isDark ? "#9CA3AF" : "#6B7280"}
                  >
                    {indicatorTimeframes.map((timeframe, i) => (
                      <Picker.Item
                        key={i}
                        label={timeframe.label}
                        value={timeframe.value}
                        color={isDark ? "#FFFFFF" : "#111827"}
                      />
                    ))}
                    {settings && settings.type === "fundamental" && (
                      <Picker.Item
                        label="Yearly"
                        value="yearly"
                        color={isDark ? "#FFFFFF" : "#111827"}
                      />
                    )}
                  </Picker>
                </View>
              </View>
            )}

            {/* Offset 1 */}
            {type !== "fundamental" &&
              !newSettings.indicatorName.startsWith("CDL") && (
                <>
                  <View style={dynamicStyles.formGroup}>
                    <Text style={dynamicStyles.label}>Offset 1</Text>
                    <View style={dynamicStyles.pickerContainer}>
                      <Picker
                        selectedValue={
                          newSettings.offset
                            ? newSettings.offset
                            : defaultSettings.offset
                        }
                        onValueChange={(value) => handleChange("offset", value)}
                        style={dynamicStyles.picker}
                        dropdownIconColor={isDark ? "#9CA3AF" : "#6B7280"}
                      >
                        {(type !== "fundamental"
                          ? offset1s
                          : offset1s.slice(0, 2)
                        ).map((offset, i) => (
                          <Picker.Item
                            key={i}
                            label={offset.label}
                            value={offset.value}
                            color={isDark ? "#FFFFFF" : "#111827"}
                          />
                        ))}
                        {type !== "fundamental" && (
                          <>
                            <Picker.Item
                              label="Custom candle/s ago"
                              value="custom-candle"
                              color={isDark ? "#FFFFFF" : "#111827"}
                            />
                            {customOffset1s.map((offset, i) => (
                              <Picker.Item
                                key={`custom1-${i}`}
                                label={offset.label}
                                value={offset.value}
                                color={isDark ? "#FFFFFF" : "#111827"}
                              />
                            ))}
                          </>
                        )}
                      </Picker>
                    </View>
                  </View>

                  {/* Offset 2 */}
                  <View style={dynamicStyles.formGroup}>
                    <Text style={dynamicStyles.label}>Offset 2</Text>
                    <View style={dynamicStyles.pickerContainer}>
                      <Picker
                        selectedValue={
                          newSettings.offset2
                            ? newSettings.offset2
                            : defaultSettings.offset2
                        }
                        onValueChange={(value) => handleChange("offset2", value)}
                        style={dynamicStyles.picker}
                        dropdownIconColor={isDark ? "#9CA3AF" : "#6B7280"}
                      >
                        {offset2s["todays"].map((offset, i) => (
                          <Picker.Item
                            key={i}
                            label={offset.label}
                            value={offset.value}
                            color={isDark ? "#FFFFFF" : "#111827"}
                          />
                        ))}
                        <Picker.Item
                          label="Todays Custom Candle"
                          value="custom-todays-candle"
                          color={isDark ? "#FFFFFF" : "#111827"}
                        />
                        {offset2s["yesterdays"].map((offset, i) => (
                          <Picker.Item
                            key={i}
                            label={offset.label}
                            value={offset.value}
                            color={isDark ? "#FFFFFF" : "#111827"}
                          />
                        ))}
                        <Picker.Item
                          label="Yesterdays custom candle"
                          value="custom-yester-candle"
                          color={isDark ? "#FFFFFF" : "#111827"}
                        />
                        {customOffset2s.map((offset, i) => (
                          <Picker.Item
                            key={`custom2-${i}`}
                            label={offset.label}
                            value={offset.value}
                            color={isDark ? "#FFFFFF" : "#111827"}
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>
                </>
              )}

            {/* Advanced Settings */}
            {settings &&
              settings["settings"] &&
              settings["settings"].map((setting, index) => (
                <View key={index} style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.label}>{setting.name}</Text>
                  {setting.options ? (
                    <View style={dynamicStyles.pickerContainer}>
                      <Picker
                        selectedValue={getAdvSettingsValue(setting.name)}
                        onValueChange={(value) =>
                          handleAdvSettingsChange(
                            setting.name,
                            value,
                            setting.datatype
                          )
                        }
                        style={dynamicStyles.picker}
                        dropdownIconColor={isDark ? "#9CA3AF" : "#6B7280"}
                      >
                        {setting.options.map((option, i) => (
                          <Picker.Item
                            key={i}
                            label={
                              typeof option === "object" ? option.name : option
                            }
                            value={
                              typeof option === "object" ? option.value : option
                            }
                            color={isDark ? "#FFFFFF" : "#111827"}
                          />
                        ))}
                      </Picker>
                    </View>
                  ) : (
                    <TextInput
                      style={dynamicStyles.input}
                      value={String(getAdvSettingsValue(setting.name))}
                      onChangeText={(value) =>
                        handleAdvSettingsChange(
                          setting.name,
                          value,
                          setting.datatype
                        )
                      }
                      keyboardType={
                        setting.datatype === "number" ? "numeric" : "default"
                      }
                      placeholder={setting.name}
                      placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                    />
                  )}
                </View>
              ))}

            <View style={dynamicStyles.footerSpacer} />
          </ScrollView>

          {/* Footer */}
          <View style={dynamicStyles.footer}>
            <TouchableOpacity
              style={[dynamicStyles.button, dynamicStyles.buttonSecondary]}
              onPress={() => closeModal()}
            >
              <Text style={dynamicStyles.buttonTextSecondary}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[dynamicStyles.button, dynamicStyles.buttonPrimary]}
              onPress={handleSubmit}
            >
              <Text style={dynamicStyles.buttonTextPrimary}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Custom Prompt Modal */}
        <Modal
          visible={promptVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setPromptVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={dynamicStyles.promptOverlay}
          >
            <View style={dynamicStyles.promptContainer}>
              <Text style={dynamicStyles.promptTitle}>Enter Value</Text>
              <Text style={dynamicStyles.promptMessage}>
                Enter the number:
              </Text>
              <TextInput
                style={dynamicStyles.promptInput}
                value={promptValue}
                onChangeText={setPromptValue}
                keyboardType="numeric"
                autoFocus
                placeholder="Value"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              />
              <View style={dynamicStyles.promptActions}>
                <TouchableOpacity
                  style={[
                    dynamicStyles.promptButton,
                    dynamicStyles.promptCancelButton,
                  ]}
                  onPress={() => setPromptVisible(false)}
                >
                  <Text style={dynamicStyles.promptCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    dynamicStyles.promptButton,
                    dynamicStyles.promptSubmitButton,
                  ]}
                  onPress={onPromptSubmit}
                >
                  <Text style={dynamicStyles.promptSubmitText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = (isDark, bottomInset = 0) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end", // Bottom sheet style for main modal
      // Push the whole sheet up by the nav bar height so the bottom buttons are
      // never drawn under the Android system navigation area.
      paddingBottom: bottomInset,
    },
    modalContainer: {
      backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: "85%", // allow room for keyboard
      width: "100%",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#374151" : "#E5E7EB",
    },
    title: {
      fontSize: 20,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#111827",
    },
    closeButton: {
      fontSize: 24,
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    body: {
      padding: 16,
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      color: isDark ? "#D1D5DB" : "#374151",
      marginBottom: 8,
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#D1D5DB",
      borderRadius: 8,
      backgroundColor: isDark ? "#111827" : "#FFFFFF",
      overflow: "hidden",
    },
    picker: {
      height: 50,
      color: isDark ? "#FFFFFF" : "#111827",
    },
    input: {
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#D1D5DB",
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: isDark ? "#FFFFFF" : "#111827",
      backgroundColor: isDark ? "#111827" : "#FFFFFF",
    },
    footerSpacer: {
      height: 40,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: isDark ? "#374151" : "#E5E7EB",
    },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      minWidth: 100,
      alignItems: "center",
    },
    buttonPrimary: {
      backgroundColor: "#3B82F6",
    },
    buttonSecondary: {
      backgroundColor: isDark ? "#374151" : "#E5E7EB",
    },
    buttonTextPrimary: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    buttonTextSecondary: {
      color: isDark ? "#FFFFFF" : "#111827",
      fontSize: 16,
      fontWeight: "600",
    },
    // Prompt Styles
    promptOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "center",
      alignItems: "center",
    },
    promptContainer: {
      width: "80%",
      backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
      borderRadius: 12,
      padding: 20,
      elevation: 5,
    },
    promptTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
      color: isDark ? "#FFFFFF" : "#111827",
    },
    promptMessage: {
      fontSize: 14,
      marginBottom: 16,
      color: isDark ? "#D1D5DB" : "#374151",
    },
    promptInput: {
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#D1D5DB",
      borderRadius: 8,
      padding: 10,
      marginBottom: 20,
      fontSize: 16,
      color: isDark ? "#FFFFFF" : "#111827",
      backgroundColor: isDark ? "#111827" : "#F9FAFB",
    },
    promptActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
    },
    promptButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
    },
    promptCancelButton: {
      backgroundColor: isDark ? "#374151" : "#E5E7EB",
    },
    promptSubmitButton: {
      backgroundColor: "#3B82F6",
    },
    promptCancelText: {
      color: isDark ? "#FFFFFF" : "#111827",
      fontWeight: "600",
    },
    promptSubmitText: {
      color: "#FFFFFF",
      fontWeight: "600",
    },
  });

export default IndicatorModal;