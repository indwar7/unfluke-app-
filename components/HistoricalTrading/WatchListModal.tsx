import React, { useEffect, useRef } from "react";
import { Modal, View, Text, TouchableOpacity, Animated, Dimensions, StyleSheet, useWindowDimensions } from "react-native";
import { X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Watchlist from "./Watchlist";
import { useTheme } from "@/constants/ThemeContext";


const SidebarModal = ({ sidebarOpen, setSidebarOpen }) => {

  const { colors: c, isDark } = useTheme();
  const styles = makeStyles(c, isDark);
  const { width,height } = useWindowDimensions()
  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(-width)).current; // Start hidden on the left

  useEffect(() => {
    if (sidebarOpen) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [sidebarOpen]);

  return (
    <Modal
      visible={sidebarOpen}
      transparent
      animationType="none" // disable default bottom slide
      onRequestClose={() => setSidebarOpen(false)}
    >
      <View style={styles.modalOverlay}>
        {/* Sidebar */}
        <Animated.View
          style={[
            styles.mobileSidebar,
            { transform: [{ translateX: slideAnim }] },{    width: Math.min(400, width * 0.85),
}
          ]}
        >
          <View style={[styles.mobileSidebarHeader, { paddingTop: insets.top + 14 }]}>
            <Text style={styles.sidebarTitle}>Watchlist</Text>
            <TouchableOpacity
              onPress={() => setSidebarOpen(false)}
              style={styles.closeButton}
            >
              <X size={24} color={c.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={[styles.mobileSidebarContent,{    maxHeight: height * 0.8,
}]}>
            <Watchlist />
          </View>
        </Animated.View>

        {/* Backdrop */}
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setSidebarOpen(false)}
        />
      </View>
    </Modal>
  );
};

const makeStyles = (c, isDark) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: c.overlay,
    flexDirection: "row",
  },

  modalBackdrop: {
    flex: 1,
  },

  mobileSidebar: {
    backgroundColor: c.card,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  mobileSidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    backgroundColor: c.surfaceElevated,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: c.text,
  },
  closeButton: {
    padding: 4,
  },
  mobileSidebarContent: {
    flex: 1,
    padding: 16,
  },
});

export default SidebarModal;
