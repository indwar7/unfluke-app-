import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { ChevronDown } from "lucide-react-native"; // yarn add lucide-react-native

const CustomSelect = ({
  options,
  selected,
  onChange,
  placeholder,
  name,
  disableTyping = false,
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // update input when selected changes
  useEffect(() => {
    const selectedOption = options.find((opt) => opt.value === selected);
    if (selectedOption) setInputValue(selectedOption.label.toString());
  }, [selected, options]);

  // filter options (search logic)
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

  const handleSelect = (value, label) => {
    setInputValue(label.toString());
    setOpen(false);
    onChange(value);
  };

  return (
    <View style={styles.container}>
      {/* Input with dropdown icon */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          if (disableTyping) {
            setOpen(true);
          }
        }}
        style={{ width: "100%" }}
      >
        <TextInput
          style={[styles.input, disableTyping && styles.readOnly]}
          placeholder={placeholder}
          value={inputValue}
          editable={!disableTyping}
          onFocus={() => setOpen(true)}
          onChangeText={(text) => {
            if (!disableTyping) {
              setInputValue(text);
              setOpen(true);
            }
          }}
        />
        <ChevronDown
          size={18}
          color="#6B7280"
          style={styles.icon}
        />
      </TouchableOpacity>

      {/* Dropdown */}
      <Modal visible={open} transparent animationType="fade">
        <TouchableWithoutFeedback
          onPress={() => {
            setOpen(false);
            Keyboard.dismiss();
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.dropdown}>
              {filteredOptions.length > 0 ? (
                <FlatList
                  data={filteredOptions}
                  keyExtractor={(item, index) => index.toString()}
                  style={{ maxHeight: 240 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => handleSelect(item.value, item.label)}
                    >
                      <Text style={styles.optionText}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <View style={styles.option}>
                  <Text style={styles.noMatch}>No matches found.</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  input: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingRight: 36, // space for icon
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderColor: "#d1d5db", // gray-300
    color: "#1f2937", // gray-800
    fontSize: 16,
  },
  readOnly: {
    color: "#1f2937",
  },
  icon: {
    position: "absolute",
    right: 12,
    top: "35%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
    color: "#374151", // gray-700
  },
  noMatch: {
    fontSize: 14,
    color: "#9CA3AF", // gray-400
  },
});

export default CustomSelect;
