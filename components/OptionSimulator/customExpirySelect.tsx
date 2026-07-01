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
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

const CustomExpirySelect = ({ options, selected, onChange, placeholder, name }) => {
  const { colors: c, isDark } = useTheme();
  const styles = makeStyles(c, isDark);
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
        <ChevronDown size={18} color={c.textSecondary} />
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

const makeStyles = (c: AppColors, isDark: boolean) => StyleSheet.create({
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
    backgroundColor: c.inputBg,
    borderColor: c.inputBorder,
  },
  buttonText: {
    color: c.text,
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: c.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    width: "90%",
    backgroundColor: c.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
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
    borderBottomColor: c.border,
  },
  optionText: {
    fontSize: 16,
    color: c.text,
  },
});

export default CustomExpirySelect;
