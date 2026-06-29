// Unfluke Pro — Premium animated bottom navigation.
// Tabs: Home · Scanner · AI Bot · Charts · Profile.
// Round icon chips, active gold halo, spring press. Device-safe: respects the
// Android system gesture/back bar via safe-area insets so nothing overlaps.

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Search, Bot, LineChart, User } from "lucide-react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

type Tab = {
  key: string;
  label: string;
  Icon: any;
  route: string;
  match: string[];
};

const TABS: Tab[] = [
  { key: "home", label: "Home", Icon: Home, route: "/dashboard", match: ["/dashboard"] },
  { key: "scanner", label: "Scanner", Icon: Search, route: "/scannermain", match: ["/scannermain", "/scanner", "/scannerhome", "/scannerlist", "/scannerfundamental"] },
  { key: "ai", label: "AI Bot", Icon: Bot, route: "/chatbot", match: ["/chatbot"] },
  { key: "charts", label: "Charts", Icon: LineChart, route: "/historical", match: ["/historical"] },
  { key: "profile", label: "Profile", Icon: User, route: "/profile", match: ["/profile"] },
];

const NavItem: React.FC<{
  tab: Tab;
  active: boolean;
  c: AppColors;
  onPress: () => void;
}> = ({ tab, active, c, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const lift = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(lift, {
      toValue: active ? 1 : 0,
      useNativeDriver: true,
      friction: 7,
      tension: 80,
    }).start();
  }, [active]);

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.84, useNativeDriver: true, friction: 6 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 160 }).start();

  const translateY = lift.interpolate({ inputRange: [0, 1], outputRange: [0, -3] });
  const color = active ? c.onGold : c.tabBarInactive;

  return (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View style={{ transform: [{ scale }, { translateY }], alignItems: "center" }}>
        <View
          style={[
            styles.chip,
            active
              ? { backgroundColor: c.gold }
              : { backgroundColor: "transparent" },
          ]}
        >
          <tab.Icon size={20} color={color} strokeWidth={active ? 2.6 : 2} />
        </View>
        <Text
          style={[
            styles.label,
            { color: active ? c.gold : c.tabBarInactive, fontWeight: active ? "800" : "600" },
          ]}
        >
          {tab.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const BottomNav: React.FC = () => {
  const { colors: c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname() || "";
  const s = makeStyles(c, isDark);

  const isActive = (tab: Tab) =>
    tab.match.some((m) => pathname === m || pathname.startsWith(m + "/"));

  const go = (tab: Tab) => {
    if (isActive(tab)) return;
    router.push(tab.route as any);
  };

  // Device-safe: add the system gesture/back-bar inset so the tab row never
  // sits under Android's navigation bar. Minimum keeps it comfortable on
  // gesture-nav phones (insets.bottom can be 0 there).
  const bottomPad = Math.max(insets.bottom, Platform.OS === "android" ? 12 : 8);

  return (
    <View style={[s.bar, { paddingBottom: bottomPad }]}>
      <View style={s.inner}>
        {TABS.map((tab) => (
          <NavItem
            key={tab.key}
            tab={tab}
            active={isActive(tab)}
            c={c}
            onPress={() => go(tab)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: { flex: 1, alignItems: "center", justifyContent: "center" },
  chip: {
    width: 44,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  label: { fontSize: 10.5, letterSpacing: 0.2 },
});

const makeStyles = (c: AppColors, isDark: boolean) =>
  StyleSheet.create({
    bar: {
      backgroundColor: c.tabBarBg,
      borderTopWidth: 1,
      borderTopColor: c.border,
      paddingTop: 10,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: isDark ? 0.4 : 0.1,
          shadowRadius: 16,
        },
        android: { elevation: 20 },
      }),
    },
    inner: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 6,
    },
  });

export default BottomNav;
