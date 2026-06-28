import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { ChevronDown } from "lucide-react-native"; // install lucide-react-native

const CustomExpirySelect = ({ options, selected, onChange, placeholder, name }) => {
  const [open, setOpen] = useState(false);

  // Get selected value for comparison
  const selectedValue =
    typeof selected === "object" && selected !== null
      ? selected.to_expiry
      : selected;

  return (
    <View style={styles.container}>
      {/* Trigger button */}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          {options.find((o) => o.value.to_expiry === selected?.to_expiry)?.label || placeholder}
        </Text>
        <ChevronDown size={18} color="#787B86" />
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal visible={open} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.overlay}>
            <View style={styles.dropdown}>
              <FlatList
                data={options}
                keyExtractor={(item, index) => index.toString()}
                style={{ maxHeight: 300 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => {
                      onChange(item.value); // returns expiry.to_expiry
                      setOpen(false);
                    }}
                  >
                    <Text style={styles.optionText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
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
  button: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#363A45",
    borderColor: "rgba(255,255,255,0.06)",
  },
  buttonText: {
    color: "#D1D4DC",
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    width: "90%",
    backgroundColor: "#1E222D",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  optionText: {
    fontSize: 16,
    color: "#D1D4DC",
  },
});

export default CustomExpirySelect;
