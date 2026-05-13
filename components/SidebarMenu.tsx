import React, { useEffect, useRef } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Animated,
    StyleSheet,
    ScrollView,
    Image,
    Platform,
    StatusBar,
    Pressable,
    useWindowDimensions,
} from "react-native";
import { X } from "lucide-react-native";
import { router } from "expo-router";

interface SidebarMenuProps {
    visible: boolean;
    onClose: () => void;
}

const STATUS_BAR_HEIGHT = Platform.OS === "android" ? (StatusBar.currentHeight || 24) : 44;

const MENU_ITEMS = [
    { label: "Dashboard", icon: "🏠", route: "/dashboard" },
    { label: "AI-Bot", icon: "🤖", route: "/chatbot" },
    { label: "Fundamental", icon: "📊", route: "/fundamental" },
    { label: "Historical Charts", icon: "📈", route: "/historical" },
    { label: "Strategy Charts", icon: "🎯", route: "/strategy-charts" },
    { label: "Technical Scanner", icon: "🔍", route: "/scannermain" },
    { label: "Fundamental Scanner", icon: "🔬", route: "/scannerfundamental" },
    { label: "Alerts", icon: "🔔", route: "/scannerhome?alertsSideBar=true" },
    { label: "Simple Backtest", icon: "⏱️", route: "/basic-backtester-main" },
    { label: "Advanced Backtest", icon: "📉", route: "/advanced-backtester-main" },
    { label: "Option Simulator", icon: "⚡", route: "/simulator" },
];

const BOTTOM_ITEMS = [
    { label: "Profile", icon: "👤", route: "/profile" },
    { label: "Pricing", icon: "💎", route: "/pricing" },
    { label: "My Earnings", icon: "💰", route: "/leads" },
];

const SidebarMenu = ({ visible, onClose }: SidebarMenuProps) => {
    const { width } = useWindowDimensions();
    const sidebarWidth = Math.min(300, width * 0.78);
    const slideAnim = useRef(new Animated.Value(-sidebarWidth)).current;

    useEffect(() => {
        if (visible) {
            slideAnim.setValue(-sidebarWidth);
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 280,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -sidebarWidth,
                duration: 220,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, sidebarWidth]);

    const handleNavigation = (route: string) => {
        onClose();
        // Wait for close animation before navigating
        setTimeout(() => {
            router.push(route as any);
        }, 250);
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                {/* Backdrop - MUST be first (behind sidebar) */}
                <Pressable style={styles.backdrop} onPress={onClose} />

                {/* Sidebar Panel - rendered AFTER backdrop so it's on top */}
                <Animated.View
                    style={[
                        styles.sidebar,
                        {
                            width: sidebarWidth,
                            transform: [{ translateX: slideAnim }],
                        },
                    ]}
                >
                    {/* Header */}
                    <View style={[styles.sidebarHeader, { paddingTop: STATUS_BAR_HEIGHT + 10 }]}>
                        <Image
                            source={require("../assets/images/unfluke/UNFLUKE -09-New.png")}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <X size={20} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Scrollable Menu */}
                    <ScrollView
                        style={styles.menuScroll}
                        contentContainerStyle={styles.menuScrollContent}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                    >
                        {/* Navigation Section */}
                        <Text style={styles.sectionLabel}>NAVIGATION</Text>
                        {MENU_ITEMS.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.menuItem}
                                onPress={() => handleNavigation(item.route)}
                                activeOpacity={0.6}
                            >
                                <Text style={styles.menuIcon}>{item.icon}</Text>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}

                        <View style={styles.divider} />

                        {/* Account Section */}
                        <Text style={styles.sectionLabel}>ACCOUNT</Text>
                        {BOTTOM_ITEMS.map((item, index) => (
                            <TouchableOpacity
                                key={`bottom-${index}`}
                                style={styles.menuItem}
                                onPress={() => handleNavigation(item.route)}
                                activeOpacity={0.6}
                            >
                                <Text style={styles.menuIcon}>{item.icon}</Text>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.sidebarFooter}>
                        <Text style={styles.footerText}>Unfluke v1.0.0</Text>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    sidebar: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        backgroundColor: "#ffffff",
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 20,
    },
    sidebarHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 18,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        backgroundColor: "#fafbfc",
    },
    logo: {
        width: 90,
        height: 30,
    },
    closeButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#f3f4f6",
    },
    menuScroll: {
        flex: 1,
    },
    menuScrollContent: {
        paddingTop: 8,
        paddingBottom: 24,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: "#9ca3af",
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 6,
        letterSpacing: 1,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 13,
        paddingHorizontal: 20,
        marginHorizontal: 8,
        marginVertical: 1,
        borderRadius: 10,
    },
    menuIcon: {
        fontSize: 17,
        marginRight: 14,
        width: 24,
        textAlign: "center",
    },
    menuLabel: {
        fontSize: 15,
        fontWeight: "500",
        color: "#1f2937",
    },
    divider: {
        height: 1,
        backgroundColor: "#e5e7eb",
        marginHorizontal: 20,
        marginVertical: 10,
    },
    sidebarFooter: {
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        paddingVertical: 14,
        paddingHorizontal: 20,
        backgroundColor: "#fafbfc",
    },
    footerText: {
        fontSize: 12,
        color: "#9ca3af",
        textAlign: "center",
    },
});

export default SidebarMenu;
