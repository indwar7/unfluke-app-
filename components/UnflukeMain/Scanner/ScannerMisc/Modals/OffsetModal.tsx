import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useBottomGutter } from "../../../../../utils/bottomGutter";

const OffsetModal = ({ settings, closeModal, indicators }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bottomGutter = useBottomGutter();
  const dynamicStyles = styles(isDark, bottomGutter);

  const dailyCandles = ["Daily", 1, 2, 3, 4, 5, 6, 7, "n days ago"];
  const intradayMinsCandles = [
    1, 2, 3, 5, 10, 15, 30, 45, 60, 75, 90, 120, 180, 240,
  ];
  const weeklyCandles = ["Weekly", 1, 2, 3, "n weeks ago"];
  const monthlyCandles = ["Monthly", 1, 2, 3, "n months ago"];
  const quarterlyCandles = ["Quarterly", 1, 2, 3, "n quarter ago"];
  const yearlyCandles = ["Yearly", 1, 2, 3, "n years ago"];

  const [selected, setSelected] = useState("");
  const [source, setSource] = useState("Close");
  const [customCandles, setCustomCandles] = useState([]);
  const [showCandlePicker, setShowCandlePicker] = useState(false);

  // Custom Prompt State
  const [promptVisible, setPromptVisible] = useState(false);
  const [promptValue, setPromptValue] = useState("");
  const [currentItem, setCurrentItem] = useState(null);

  const handleNPrompt = (val) => {
    if (typeof val === "string" && val.startsWith("n")) {
      setCurrentItem(val);
      setPromptValue("");
      setPromptVisible(true);
    } else {
      setSelected(val);
      setShowCandlePicker(false);
    }
  };

  const onPromptSubmit = () => {
    const raw = (promptValue ?? "").toString().trim();
    const parsed = Number(raw);
    if (!raw || !Number.isFinite(parsed) || parsed <= 0) {
      Alert.alert("Error", "Please enter a valid positive number");
      return;
    }
    if (!currentItem || typeof currentItem !== "string") {
      setPromptVisible(false);
      return;
    }

    const newVal = currentItem.replace(/^n/, raw);
    const tmp = [...customCandles];
    if (!tmp.includes(newVal)) {
      tmp.push(newVal);
      setCustomCandles(tmp);
    }
    setSelected(newVal);
    setShowCandlePicker(false);
    setPromptVisible(false);
  };

  const handleSubmit = () => {
    closeModal({
      indicatorName: "offset",
      value: selected ? selected : "1 min",
      source: source ? source : "Close",
    });
  };

  const renderCandleSection = (title, candles, format) => (
    <View style={dynamicStyles.section} key={title}>
      <Text style={dynamicStyles.sectionTitle}>{title}</Text>
      {candles.map((n, index) => {
        let displayText, value;
        if (!isNaN(n)) {
          displayText = format(n);
          value = format(n);
        } else {
          displayText = n;
          value = n;
        }

        return (
          <TouchableOpacity
            key={`${title}-${index}`}
            style={[
              dynamicStyles.option,
              selected === value && dynamicStyles.optionSelected,
            ]}
            onPress={() => handleNPrompt(value)}
          >
            <Text
              style={[
                dynamicStyles.optionText,
                selected === value && dynamicStyles.optionTextSelected,
              ]}
            >
              {displayText}
            </Text>
            {selected === value && (
              <Text style={dynamicStyles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  useEffect(() => {
    if (settings) {
      const value = settings.value;
      const src = settings.source;

      if (
        typeof value === "string" &&
        value.trim() !== "" &&
        !customCandles.includes(value)
      ) {
        const tmp = [...customCandles];
        tmp.push(value);
        setCustomCandles(tmp);
      }

      setSelected(value || "1 min");
      setSource(src || "Close");
    } else {
      setSelected("1 min");
      setSource("Close");
    }
  }, []);

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={() => closeModal()}
    >
      <View style={dynamicStyles.overlay}>
        <View style={dynamicStyles.modalContainer}>
          {/* Header */}
          <View style={dynamicStyles.header}>
            <Text style={dynamicStyles.title}>Offset</Text>
            <TouchableOpacity onPress={() => closeModal()}>
              <Text style={dynamicStyles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={dynamicStyles.body}>
            {/* Candle Selection Button */}
            <TouchableOpacity
              style={dynamicStyles.selectButton}
              onPress={() => setShowCandlePicker(!showCandlePicker)}
            >
              <Text style={dynamicStyles.selectButtonText}>
                {selected || "Select Candle"}
              </Text>
              <Text style={dynamicStyles.selectButtonIcon}>
                {showCandlePicker ? "▲" : "▼"}
              </Text>
            </TouchableOpacity>

            {/* Candle Picker Dropdown */}
            {showCandlePicker && (
              <ScrollView style={dynamicStyles.candleScroll}>
                {renderCandleSection("Intraday Candles", intradayMinsCandles, (n) => `${n} min`)}
                {renderCandleSection("Daily Candles", dailyCandles, (n) => `${n} day/s ago`)}
                {renderCandleSection("Weekly Candles", weeklyCandles, (n) => `${n} week/s ago`)}
                {renderCandleSection("Monthly Candles", monthlyCandles, (n) => `${n} month/s ago`)}
                {renderCandleSection("Quarterly Candles", quarterlyCandles, (n) => `${n} quarter ago`)}
                {renderCandleSection("Yearly Candles", yearlyCandles, (n) => `${n} year/s ago`)}

                {customCandles.length > 0 && (
                  <View style={dynamicStyles.section}>
                    <Text style={dynamicStyles.sectionTitle}>Custom</Text>
                    {customCandles.map((n, index) => (
                      <TouchableOpacity
                        key={`custom-${index}`}
                        style={[
                          dynamicStyles.option,
                          selected === n && dynamicStyles.optionSelected,
                        ]}
                        onPress={() => {
                          setSelected(n);
                          setShowCandlePicker(false);
                        }}
                      >
                        <Text
                          style={[
                            dynamicStyles.optionText,
                            selected === n && dynamicStyles.optionTextSelected,
                          ]}
                        >
                          {n}
                        </Text>
                        {selected === n && (
                          <Text style={dynamicStyles.checkmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </ScrollView>
            )}

            {/* Source Selection */}
            <View style={dynamicStyles.sourceContainer}>
              <Text style={dynamicStyles.label}>Source</Text>
              <View style={dynamicStyles.sourceButtons}>
                {["Open", "High", "Low", "Close", "Bracket"].map((src) => (
                  <TouchableOpacity
                    key={src}
                    style={[
                      dynamicStyles.sourceButton,
                      source === src && dynamicStyles.sourceButtonSelected,
                    ]}
                    onPress={() => setSource(src)}
                  >
                    <Text
                      style={[
                        dynamicStyles.sourceButtonText,
                        source === src && dynamicStyles.sourceButtonTextSelected,
                      ]}
                    >
                      {src}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

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
              <Text style={dynamicStyles.promptMessage}>Enter the value of n:</Text>
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
                  style={[dynamicStyles.promptButton, dynamicStyles.promptCancelButton]}
                  onPress={() => setPromptVisible(false)}
                >
                  <Text style={dynamicStyles.promptCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[dynamicStyles.promptButton, dynamicStyles.promptSubmitButton]}
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
      justifyContent: "flex-end",
      // Push the whole sheet up so bottom buttons clear the Android nav bar.
      paddingBottom: bottomInset,
    },
    modalContainer: {
      backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: "80%",
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
    selectButton: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#D1D5DB",
      borderRadius: 8,
      padding: 14,
      backgroundColor: isDark ? "#111827" : "#FFFFFF",
      marginBottom: 16,
    },
    selectButtonText: {
      fontSize: 16,
      color: isDark ? "#FFFFFF" : "#111827",
      flex: 1,
    },
    selectButtonIcon: {
      fontSize: 14,
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    candleScroll: {
      maxHeight: 300,
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#D1D5DB",
      borderRadius: 8,
      marginBottom: 16,
      backgroundColor: isDark ? "#111827" : "#FFFFFF",
    },
    section: {
      paddingVertical: 8,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "600",
      color: isDark ? "#9CA3AF" : "#6B7280",
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: isDark ? "#1F2937" : "#F3F4F6",
    },
    option: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#374151" : "#F3F4F6",
    },
    optionSelected: {
      backgroundColor: isDark ? "#1E40AF" : "#DBEAFE",
    },
    optionText: {
      fontSize: 15,
      color: isDark ? "#FFFFFF" : "#111827",
    },
    optionTextSelected: {
      color: isDark ? "#FFFFFF" : "#1E40AF",
      fontWeight: "600",
    },
    checkmark: {
      fontSize: 18,
      color: isDark ? "#60A5FA" : "#3B82F6",
      fontWeight: "bold",
    },
    sourceContainer: {
      marginTop: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      color: isDark ? "#D1D5DB" : "#374151",
      marginBottom: 8,
    },
    sourceButtons: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    sourceButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#D1D5DB",
      backgroundColor: isDark ? "#111827" : "#FFFFFF",
    },
    sourceButtonSelected: {
      backgroundColor: "#3B82F6",
      borderColor: "#3B82F6",
    },
    sourceButtonText: {
      fontSize: 14,
      color: isDark ? "#FFFFFF" : "#111827",
    },
    sourceButtonTextSelected: {
      color: "#FFFFFF",
      fontWeight: "600",
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

export default OffsetModal;
