import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  Dimensions,
} from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";

const CustomExpirySelect = ({ options, selected, onChange, placeholder, name }) => {
  
    
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
        <ChevronDown size={18} color="#6B7280" />
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
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const selectedOption = options.find((opt) => opt.value === selected);
    if (selectedOption) setInputValue(selectedOption.label.toString());
  }, [selected, options]);

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
    inputRef.current?.blur(); // Remove focus from input
  };

  const toggleDropdown = () => {
    setOpen(!open);
  };

  const handleInputFocus = () => {
    if (!disableTyping) {
      setOpen(true);
    }
  };

  const handleInputChange = (text) => {
    if (!disableTyping) {
      setInputValue(text);
      if (!open) setOpen(true);
    }
  };

  return (
    <View style={styles.container} ref={containerRef}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={[styles.input, disableTyping && styles.readOnly]}
          placeholder={placeholder}
          value={inputValue}
          editable={!disableTyping}
          onFocus={handleInputFocus}
          onChangeText={handleInputChange}
        />
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={toggleDropdown}
        >
          {open ? (
            <ChevronUp size={18} color="#6B7280" />
          ) : (
            <ChevronDown size={18} color="#6B7280" />
          )}
        </TouchableOpacity>
      </View>

      {open && (
        <View style={styles.inlineDropdown}>
          <ScrollView 
            style={styles.scrollView}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.option,
                    selected === item.value && styles.selectedOption
                  ]}
                  onPress={() => handleSelect(item.value, item.label)}
                >
                  <Text style={[
                    styles.optionText,
                    selected === item.value && styles.selectedOptionText
                  ]}>
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: "#fff",
    borderColor: "#d1d5db",
  },
  buttonText: {
    color: "#1f2937",
    fontSize: 16,
  },
  input: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingRight: 36,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderColor: "#d1d5db",
    color: "#1f2937",
    fontSize: 16,
  },
  readOnly: {
    color: "#1f2937",
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
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
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
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  dropdown: {
    position: "absolute",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
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
    borderBottomColor: "#f3f4f6",
  },
  selectedOption: {
    backgroundColor: "#f3f4f6",
  },
  optionText: {
    fontSize: 16,
    color: "#374151",
  },
  selectedOptionText: {
    color: "#1f2937",
    fontWeight: "500",
  },
  noMatch: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export { CustomExpirySelect, CustomSelect };