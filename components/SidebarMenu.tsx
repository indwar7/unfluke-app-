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
import {
    X,
    LayoutGrid,
    Bot,
    BarChart3,
    LineChart,
    Target,
    Search,
    FlaskConical,
    Timer,
    Activity,
    Zap,
    User,
    Gem,
    Wallet,
    ChevronRight,
} from "lucide-react-native";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

// Per-market route overrides. When the market is crypto, the "Fundamental" menu
// item opens the dedicated crypto fundamentals screen instead of the Indian one
// (mirrors the website, which routes fundamentals to /crypto/crypto-fundamentals).
// Every other route stays exactly the same for both markets.
const CRYPTO_ROUTE_OVERRIDES: Record<string, string> = {
  "/fundamental": "/crypto-fundamental",
};

interface SidebarMenuProps {
    visible: boolean;
    onClose: () => void;
}

const STATUS_BAR_HEIGHT = Platform.OS === "android" ? (StatusBar.currentHeight || 24) : 44;

const MENU_ITEMS = [
    { label: "Dashboard", Icon: LayoutGrid, route: "/dashboard" },
    { label: "AI-Bot", Icon: Bot, route: "/chatbot" },
    { label: "Fundamental", Icon: BarChart3, route: "/fundamental" },
    { label: "Historical Charts", Icon: LineChart, route: "/historical" },
    { label: "Strategy Charts", Icon: Target, route: "/strategy-charts" },
    { label: "Technical Scanner", Icon: Search, route: "/scannermain" },
    // Crypto has no fundamentals data (P/E, ROE, debt/equity, ...) to scan on —
    // the website drops this nav item entirely for non-IND markets.
    { label: "Fundamental Scanner", Icon: FlaskConical, route: "/scannerfundamental", hideForCrypto: true },
    { label: "Simple Backtest", Icon: Timer, route: "/basic-backtester-main" },
    { label: "Advanced Backtest", Icon: Activity, route: "/advanced-backtester-main" },
    { label: "Option Simulator", Icon: Zap, route: "/simulator" },
];

const BOTTOM_ITEMS = [
    { label: "Profile", Icon: User, route: "/profile" },
    { label: "Pricing", Icon: Gem, route: "/pricing" },
    { label: "My Earnings", Icon: Wallet, route: "/leads" },
];

const SidebarMenu = ({ visible, onClose }: SidebarMenuProps) => {
    const { width } = useWindowDimensions();
    const { colors: c, isDark } = useTheme();
    const styles = makeStyles(c);
    const sidebarWidth = Math.min(300, width * 0.78);
    // Current market ("in" | "crypto"). Used to remap market-specific routes.
    const appType = useSelector((state: any) => state?.Layout?.appType ?? "in");
    const isCrypto = appType === "crypto";
    const resolveRoute = (route: string) =>
        isCrypto ? (CRYPTO_ROUTE_OVERRIDES[route] ?? route) : route;
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
                    <View style={[styles.sidebarHeader, { paddingTop: STATUS_BAR_HEIGHT + 12 }]}>
                        <Image
                            source={
                                isDark
                                    ? require("../assets/images/unfluke/UNFLUKE -05-NEW.png")
                                    : require("../assets/images/unfluke/UNFLUKE -01-NEW.png")
                            }
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <X size={18} color={c.textSecondary} />
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
                        {MENU_ITEMS.filter((item) => !(isCrypto && item.hideForCrypto)).map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.menuItem}
                                onPress={() => handleNavigation(resolveRoute(item.route))}
                                activeOpacity={0.7}
                            >
                                <View style={styles.menuIconWrap}>
                                    <item.Icon size={18} color={c.gold} />
                                </View>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                                <ChevronRight size={16} color={c.textMuted} />
                            </TouchableOpacity>
                        ))}

                        <View style={styles.divider} />

                        {/* Account Section */}
                        <Text style={styles.sectionLabel}>ACCOUNT</Text>
                        {BOTTOM_ITEMS.map((item, index) => (
                            <TouchableOpacity
                                key={`bottom-${index}`}
                                style={styles.menuItem}
                                onPress={() => handleNavigation(resolveRoute(item.route))}
                                activeOpacity={0.7}
                            >
                                <View style={styles.menuIconWrap}>
                                    <item.Icon size={18} color={c.gold} />
                                </View>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                                <ChevronRight size={16} color={c.textMuted} />
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

const makeStyles = (c: AppColors) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: c.overlay,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    sidebar: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        backgroundColor: c.surface,
        borderRightWidth: 1,
        borderRightColor: c.border,
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 20,
    },
    sidebarHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 18,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: c.borderLight,
        backgroundColor: c.headerBg,
    },
    logo: {
        width: 104,
        height: 30,
    },
    closeButton: {
        padding: 8,
        borderRadius: 10,
        backgroundColor: c.inputBg,
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
        fontWeight: "800",
        color: c.textMuted,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
        letterSpacing: 1.4,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 11,
        paddingHorizontal: 14,
        marginHorizontal: 8,
        marginVertical: 1,
        borderRadius: 12,
        gap: 12,
    },
    menuIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: c.goldLight,
        alignItems: "center",
        justifyContent: "center",
    },
    menuLabel: {
        flex: 1,
        fontSize: 14.5,
        fontWeight: "600",
        color: c.text,
    },
    divider: {
        height: 1,
        backgroundColor: c.borderLight,
        marginHorizontal: 20,
        marginVertical: 12,
    },
    sidebarFooter: {
        borderTopWidth: 1,
        borderTopColor: c.borderLight,
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: c.headerBg,
    },
    footerText: {
        fontSize: 12,
        color: c.textMuted,
        textAlign: "center",
        letterSpacing: 0.3,
    },
});

export default SidebarMenu;
