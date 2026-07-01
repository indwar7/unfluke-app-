import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
} from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

const CustomExpirySelect = ({ options, selected, onChange, placeholder, name }) => {
  const { colors: c, isDark } = useTheme();
  const styles = makeStyles(c, isDark);

  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          {options.find((o) => o.value.to_expiry === selected?.to_expiry)?.label || placeholder}
        </Text>
        <ChevronDown size={18} color={c.textSecondary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.overlay}>
            <View style={styles.dropdown}>
              <ScrollView style={{ maxHeight: 300 }}>
                {options.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.option}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                  >
                    <Text style={styles.optionText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const CustomSelect = ({
  options,
  selected,
  onChange,
  placeholder,
  name,
  disableTyping = false,
}) => {
  const { colors: c, isDark } = useTheme();
  const styles = makeStyles(c, isDark);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef(null);

  const filteredOptions = disableTyping
    ? options
    : options.filter((opt) => {
        if (typeof opt.label === "string") {
          return opt.label.toLowerCase().includes(inputValue.toLowerCase());
        }
        if (typeof opt.label === "number") {
          return String(opt.label).includes(inputValue);
        }
        return false;
      });

  const closeDropdown = () => {
    setOpen(false);
    setInputValue("");
  };

  const openDropdown = () => {
    setInputValue("");
    setOpen(true);
  };

  const handleSelect = (value) => {
    setInputValue("");
    setOpen(false);
    onChange(value);
  };

  const handleInputChange = (text) => {
    if (!disableTyping) {
      setInputValue(text);
    }
  };

  const displayValue =
    options.find((opt) => opt.value === selected)?.label?.toString() || "";

  return (
    <View style={styles.container} ref={containerRef}>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.7}
        onPress={openDropdown}
      >
        <Text
          style={[styles.buttonText, !displayValue && styles.placeholderText]}
          numberOfLines={1}
        >
          {displayValue || placeholder}
        </Text>
        {open ? (
          <ChevronUp size={18} color={c.textSecondary} />
        ) : (
          <ChevronDown size={18} color={c.textSecondary} />
        )}
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={closeDropdown}
      >
        <TouchableWithoutFeedback onPress={closeDropdown}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalDropdown}>
                {!disableTyping && (
                  <TextInput
                    style={styles.modalSearchInput}
                    placeholder={placeholder || "Search..."}
                    placeholderTextColor={c.textMuted}
                    value={inputValue}
                    onChangeText={handleInputChange}
                    autoFocus
                  />
                )}
                <ScrollView
                  style={styles.modalScrollView}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                >
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.option,
                          selected === item.value && styles.selectedOption,
                        ]}
                        onPress={() => handleSelect(item.value)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selected === item.value &&
                              styles.selectedOptionText,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.option}>
                      <Text style={styles.noMatch}>No matches found.</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const makeStyles = (c: AppColors, isDark: boolean) => StyleSheet.create({
  container: {
    width: "100%",
    zIndex: 1000,
  },
  inputContainer: {
    position: "relative",
    width: "100%",
  },
  button: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: c.inputBg,
    borderColor: c.inputBorder,
  },
  buttonText: {
    color: c.text,
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  placeholderText: {
    color: c.textMuted,
  },
  input: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingRight: 36,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: c.inputBg,
    borderColor: c.inputBorder,
    color: c.text,
    fontSize: 16,
  },
  readOnly: {
    color: c.text,
  },
  iconContainer: {
    position: "absolute",
    right: 12,
    top: "45%",
    transform: [{ translateY: -9 }],
    padding: 4,
  },
  inlineDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: c.surfaceElevated,
    borderWidth: 1,
    borderColor: c.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
    zIndex: 1001,
  },
  scrollView: {
    maxHeight: 240,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: c.overlay,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalDropdown: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "70%",
    backgroundColor: c.card,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
  },
  modalSearchInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: c.text,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  modalScrollView: {
    maxHeight: 380,
  },
  dropdown: {
    position: "absolute",
    backgroundColor: c.surfaceElevated,
    borderWidth: 1,
    borderColor: c.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
    zIndex: 1001,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  selectedOption: {
    backgroundColor: c.goldLight,
  },
  optionText: {
    fontSize: 16,
    color: c.text,
  },
  selectedOptionText: {
    color: c.gold,
    fontWeight: "500",
  },
  noMatch: {
    fontSize: 14,
    color: c.textMuted,
    fontStyle: "italic",
  },
  overlay: {
    flex: 1,
    backgroundColor: c.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
});

export { CustomExpirySelect, CustomSelect };