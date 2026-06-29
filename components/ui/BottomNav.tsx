// Unfluke Pro — Premium animated bottom navigation.
// Tabs: Home · Scanner · AI Bot · Charts · Profile.
// Active tab shows a gold pill that animates in; press gives a spring bounce.

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
  const pill = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(pill, {
      toValue: active ? 1 : 0,
      useNativeDriver: false,
      friction: 7,
      tension: 90,
    }).start();
  }, [active]);

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.86, useNativeDriver: true, friction: 6 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 140 }).start();

  const pillBg = pill.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(0,0,0,0)", c.goldLight],
  });
  const pillWidth = pill.interpolate({ inputRange: [0, 1], outputRange: [44, 78] });
  const color = active ? c.gold : c.tabBarInactive;

  return (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View style={{ transform: [{ scale }], alignItems: "center" }}>
        <Animated.View
          style={[
            styles.pill,
            { backgroundColor: pillBg, width: pillWidth },
          ]}
        >
          <tab.Icon size={21} color={color} strokeWidth={active ? 2.5 : 2} />
        </Animated.View>
        <Text
          style={[
            styles.label,
            { color, fontWeight: active ? "800" : "600" },
          ]}
        >
          {tab.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const BottomNav: React.FC = () => {
  const { colors: c } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname() || "";
  const s = makeStyles(c);

  const isActive = (tab: Tab) =>
    tab.match.some((m) => pathname === m || pathname.startsWith(m + "/"));

  const go = (tab: Tab) => {
    if (isActive(tab)) return;
    router.push(tab.route as any);
  };

  return (
    <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
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
  pill: {
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  label: { fontSize: 10.5, letterSpacing: 0.2 },
});

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    bar: {
      backgroundColor: c.tabBarBg,
      borderTopWidth: 1,
      borderTopColor: c.border,
      paddingTop: 8,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        android: { elevation: 16 },
      }),
    },
    inner: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
    },
  });

export default BottomNav;
