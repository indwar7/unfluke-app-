import React, { useEffect, useRef } from "react";
import { Modal, View, Text, TouchableOpacity, Animated, Dimensions, StyleSheet, useWindowDimensions } from "react-native";
import { X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Watchlist from "./Watchlist";


const SidebarModal = ({ sidebarOpen, setSidebarOpen }) => {

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
              <X size={24} color="#787B86" />
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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    flexDirection: "row",
  },

  modalBackdrop: {
    flex: 1,
  },

  mobileSidebar: {
    backgroundColor: '#1E222D',
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
    borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#2A2E39',
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D1D4DC',
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
