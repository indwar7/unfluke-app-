import React, { useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { ChevronRight, Crown, Sparkles } from "lucide-react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import FundamentalsCard from "@/components/ui/FundamentalsCard";
import Reveal from "@/components/ui/Reveal";

/* Real feature images (old DashboardImages assets) */
import aiBot from "../../assets/images/DashboardImages/AIBot_new.png";
import fundamental from "../../assets/images/DashboardImages/fundamental_new.png";
import historical from "../../assets/images/DashboardImages/historical.png";
import option from "../../assets/images/DashboardImages/option.png";
import indictor from "../../assets/images/DashboardImages/indicator_new.png";
import stcharts from "../../assets/images/DashboardImages/strategy_charts_new.png";
import scanner from "../../assets/images/DashboardImages/Scanner_new.png";
import timebacktest from "../../assets/images/DashboardImages/time_based_backtesting_new.png";

const authSelector = createSelector(
  (state: any) => state.Login,
  (auth: any) => auth.user
);

const initials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "U";
};

const planName = (tier: any) => {
  switch (Number(tier)) {
    case 1: return "Basic";
    case 2: return "Advanced";
    case 3: return "Pro";
    default: return "Free";
  }
};

const FEATURES = [
  { id: 1, title: "AI-Bot", subtitle: "Chat with our markets assistant", img: aiBot, nav: "chatbot" },
  { id: 2, title: "Scanner", subtitle: "Find stocks by technical patterns", img: scanner, nav: "scannermain" },
  { id: 3, title: "Time Based Backtest", subtitle: "Test strategies over years of data", img: timebacktest, nav: "basic-backtester-main" },
  { id: 4, title: "Option Simulator", subtitle: "Build & simulate option strategies", img: option, nav: "simulator" },
  { id: 5, title: "Historical Charts", subtitle: "Price & volume history", img: historical, nav: "historical" },
  { id: 6, title: "Strategy Charts", subtitle: "Visualize your strategies", img: stcharts, nav: "strategy-charts" },
  { id: 7, title: "Indicator Backtest", subtitle: "Backtest with indicators", img: indictor, nav: "basic-backtester-home" },
  { id: 8, title: "Fundamentals", subtitle: "Company analysis & ratios", img: fundamental, nav: "fundamental" },
];

const CARD_HEIGHT = 116;
const CARD_GAP = 14;

const UnDashboard = () => {
  const { colors: c, isDark } = useTheme();
  const { height } = useWindowDimensions();
  const s = makeStyles(c, isDark);
  const user = useSelector(authSelector);
  const firstName = user?.name?.split(" ")[0] || "Trader";
  const plan = planName(user?.tier);
  const isPaid = Number(user?.tier) > 0;

  const scrollY = useRef(new Animated.Value(0)).current;

  const handleNavigation = (nav: string) => {
    if (nav === "strategy-charts") {
      router.push("/strategy-charts?strategyId=123" as any);
      return;
    }
    router.push(`/${nav}` as any);
  };

  // Each feature card "wipes up & out" as it scrolls past the top.
  const renderFeature = (item: typeof FEATURES[number], index: number) => {
    // Approximate card's vertical position within the scroll content.
    const cardTop = index * (CARD_HEIGHT + CARD_GAP);
    const inputRange = [
      cardTop - height,
      cardTop - height * 0.55,
      cardTop - 40,
    ];
    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 0],
      extrapolate: "clamp",
    });
    const translateY = scrollY.interpolate({
      inputRange,
      outputRange: [0, 0, -28],
      extrapolate: "clamp",
    });
    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 0.94],
      extrapolate: "clamp",
    });

    return (
      <Animated.View key={item.id} style={{ opacity, transform: [{ translateY }, { scale }] }}>
        <TouchableOpacity
          style={s.featureCard}
          onPress={() => handleNavigation(item.nav)}
          activeOpacity={0.85}
        >
          <View style={s.featureImgWrap}>
            <Image source={item.img} style={s.featureImg} resizeMode="contain" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.featureTitle}>{item.title}</Text>
            <Text style={s.featureSub} numberOfLines={2}>{item.subtitle}</Text>
          </View>
          <View style={s.featureArrow}>
            <ChevronRight size={18} color={c.gold} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Animated.ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
    >
      {/* Greeting */}
      <Reveal index={0}>
        <View style={s.greetRow}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials(user?.name)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.greetHi}>Hello {firstName}</Text>
            <Text style={s.greetSub}>What would you like to explore?</Text>
          </View>
          <View style={[s.planPill, isPaid ? s.planPillGold : s.planPillMuted]}>
            {isPaid ? <Crown size={11} color={c.onGold} /> : <Sparkles size={11} color={c.textSecondary} />}
            <Text style={[s.planPillText, !isPaid && { color: c.textSecondary }]}>{plan.toUpperCase()}</Text>
          </View>
        </View>
      </Reveal>

      {/* Fundamentals snapshot + search (real data) */}
      <Reveal index={1}>
        <FundamentalsCard />
      </Reveal>

      {/* Upgrade banner — free users */}
      {!isPaid && (
        <Reveal index={2}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => router.push("/pricing" as any)} style={s.upgradeCard}>
            <View style={s.upgradeIcon}><Crown size={18} color={c.onGold} /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.upgradeTitle}>Unlock Unfluke Pro</Text>
              <Text style={s.upgradeSub}>Unlimited backtests, scans & AI insights</Text>
            </View>
            <View style={s.upgradeBtn}><Text style={s.upgradeBtnText}>Upgrade</Text></View>
          </TouchableOpacity>
        </Reveal>
      )}

      {/* Features — vertical cards with images, wipe-up on scroll */}
      <Reveal index={isPaid ? 2 : 3}>
        <Text style={s.sectionTitle}>Explore Tools</Text>
      </Reveal>
      <View>
        {FEATURES.map((f, i) => renderFeature(f, i))}
      </View>
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 },
});

const makeStyles = (c: AppColors, isDark: boolean) =>
  StyleSheet.create({
    greetRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.gold, alignItems: "center", justifyContent: "center" },
    avatarText: { color: c.onGold, fontSize: 16, fontWeight: "800" },
    greetHi: { fontSize: 21, fontWeight: "800", color: c.text, letterSpacing: -0.4 },
    greetSub: { fontSize: 12.5, color: c.textSecondary, marginTop: 2 },
    planPill: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 },
    planPillGold: { backgroundColor: c.gold },
    planPillMuted: { backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.border },
    planPillText: { fontSize: 11, fontWeight: "800", color: c.onGold, letterSpacing: 0.6 },

    upgradeCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.goldLight, borderWidth: 1, borderColor: isDark ? c.goldMuted + "55" : c.gold + "44", borderRadius: 18, padding: 14, marginBottom: 18 },
    upgradeIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: c.gold, alignItems: "center", justifyContent: "center" },
    upgradeTitle: { fontSize: 14.5, fontWeight: "800", color: c.text },
    upgradeSub: { fontSize: 11.5, color: c.textSecondary, marginTop: 2 },
    upgradeBtn: { backgroundColor: c.gold, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
    upgradeBtnText: { fontSize: 12.5, fontWeight: "800", color: c.onGold },

    sectionTitle: { fontSize: 17, fontWeight: "800", color: c.text, letterSpacing: -0.3, marginBottom: 14 },

    // Feature card (vertical, image)
    featureCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: c.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.border,
      padding: 12,
      height: CARD_HEIGHT,
      marginBottom: CARD_GAP,
    },
    featureImgWrap: {
      width: 92, height: 92, borderRadius: 14,
      backgroundColor: isDark ? c.surfaceElevated : c.background,
      alignItems: "center", justifyContent: "center", overflow: "hidden",
    },
    featureImg: { width: "100%", height: "100%" },
    featureTitle: { fontSize: 16, fontWeight: "800", color: c.text, letterSpacing: -0.3 },
    featureSub: { fontSize: 12.5, color: c.textSecondary, marginTop: 3, lineHeight: 17 },
    featureArrow: { width: 32, height: 32, borderRadius: 10, backgroundColor: c.goldLight, alignItems: "center", justifyContent: "center" },
  });

export default UnDashboard;
