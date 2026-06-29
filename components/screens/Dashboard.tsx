import React, { useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronRight,
  Bot,
  BarChart3,
  LineChart,
  Layers,
  Timer,
  Search,
  Target,
  Activity,
  Crown,
  Sparkles,
  ArrowUpRight,
} from "lucide-react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import NiftyChart from "@/components/ui/NiftyChart";
import Reveal from "@/components/ui/Reveal";

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

// Big swipeable feature cards (the "ek ke baad ek swipe" carousel).
const FEATURES = [
  {
    id: 1, title: "AI-Bot", tag: "ASK ANYTHING",
    desc: "Ask the markets assistant about any stock, ratio or strategy.",
    Icon: Bot, nav: "chatbot",
    grad: ["#1E6F5C", "#10403B"] as const,
  },
  {
    id: 2, title: "Scanner", tag: "FIND SETUPS",
    desc: "Scan the market for technical & fundamental patterns instantly.",
    Icon: Search, nav: "scannermain",
    grad: ["#2C2A12", "#171712"] as const,
  },
  {
    id: 3, title: "Backtester", tag: "TEST STRATEGIES",
    desc: "Validate option strategies over years of historical data.",
    Icon: Timer, nav: "basic-backtester-main",
    grad: ["#1B3A5B", "#0E1F33"] as const,
  },
  {
    id: 4, title: "Option Simulator", tag: "BUILD & SIMULATE",
    desc: "Build multi-leg option strategies and see live payoff.",
    Icon: Layers, nav: "simulator",
    grad: ["#3A2456", "#1C1230"] as const,
  },
];

const TOOLS = [
  { id: 1, title: "Fundamentals", subtitle: "Company ratios & analysis", Icon: BarChart3, nav: "fundamental", tint: "gold" },
  { id: 2, title: "Historical Charts", subtitle: "Price & volume history", Icon: LineChart, nav: "historical", tint: "info" },
  { id: 3, title: "Strategy Charts", subtitle: "Visualize your strategies", Icon: Target, nav: "strategy-charts", tint: "violet" },
  { id: 4, title: "Indicator Backtest", subtitle: "Backtest with indicators", Icon: Activity, nav: "basic-backtester-home", tint: "profit" },
];

const UnDashboard = () => {
  const { colors: c, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const s = makeStyles(c, isDark);
  const user = useSelector(authSelector);
  const firstName = user?.name?.split(" ")[0] || "Trader";
  const plan = planName(user?.tier);
  const isPaid = Number(user?.tier) > 0;

  const cardW = width - 32;
  const scrollX = useRef(new Animated.Value(0)).current;
  const [page, setPage] = useState(0);

  const tintColor = (t: string) => {
    switch (t) {
      case "profit": return c.profit;
      case "info": return c.info;
      case "violet": return isDark ? "#A78BFA" : "#7C5CFC";
      default: return c.gold;
    }
  };
  const tintBg = (t: string) => tintColor(t) + (isDark ? "22" : "1A");

  const handleNavigation = (nav: string) => {
    if (nav === "strategy-charts") {
      router.push("/strategy-charts?strategyId=123" as any);
      return;
    }
    router.push(`/${nav}` as any);
  };

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
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

      {/* Real NIFTY 50 interactive chart */}
      <Reveal index={1} style={{ paddingHorizontal: 16 }}>
        <NiftyChart />
      </Reveal>

      {/* Swipeable feature carousel */}
      <Reveal index={2}>
        <View style={s.carouselHeader}>
          <Text style={s.sectionTitle}>Quick Start</Text>
          <Text style={s.swipeHint}>Swipe →</Text>
        </View>
      </Reveal>
      <Animated.FlatList
        data={FEATURES}
        keyExtractor={(it) => String(it.id)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardW + 12}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 4 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          {
            useNativeDriver: true,
            listener: (e: any) => {
              const i = Math.round(e.nativeEvent.contentOffset.x / (cardW + 12));
              if (i !== page) setPage(i);
            },
          }
        )}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => handleNavigation(item.nav)}
            style={{ width: cardW, marginRight: 12 }}
          >
            <LinearGradient
              colors={item.grad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.featureCard}
            >
              <View style={s.featureTop}>
                <View style={s.featureIcon}>
                  <item.Icon size={22} color="#FFFFFF" />
                </View>
                <View style={s.featureArrow}>
                  <ArrowUpRight size={18} color="#FFFFFF" />
                </View>
              </View>
              <Text style={s.featureTag}>{item.tag}</Text>
              <Text style={s.featureTitle}>{item.title}</Text>
              <Text style={s.featureDesc}>{item.desc}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      />
      {/* Dots */}
      <View style={s.dotsRow}>
        {FEATURES.map((_, i) => {
          const w = scrollX.interpolate({
            inputRange: [(i - 1) * (cardW + 12), i * (cardW + 12), (i + 1) * (cardW + 12)],
            outputRange: [6, 20, 6],
            extrapolate: "clamp",
          });
          const op = scrollX.interpolate({
            inputRange: [(i - 1) * (cardW + 12), i * (cardW + 12), (i + 1) * (cardW + 12)],
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });
          return <Animated.View key={i} style={[s.dot, { width: w, opacity: op }]} />;
        })}
      </View>

      {/* Upgrade banner — free users only */}
      {!isPaid && (
        <Reveal index={3}>
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

      {/* Tools — merged list card */}
      <Reveal index={isPaid ? 3 : 4}>
        <Text style={[s.sectionTitle, { marginHorizontal: 16, marginTop: 4 }]}>More Tools</Text>
        <View style={s.toolsCard}>
          {TOOLS.map((t, i) => (
            <TouchableOpacity
              key={t.id}
              style={[s.row, i < TOOLS.length - 1 && s.rowDivider]}
              onPress={() => handleNavigation(t.nav)}
              activeOpacity={0.7}
            >
              <View style={[s.rowIcon, { backgroundColor: tintBg(t.tint) }]}>
                <t.Icon size={18} color={tintColor(t.tint)} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>{t.title}</Text>
                <Text style={s.rowSub} numberOfLines={1}>{t.subtitle}</Text>
              </View>
              <ChevronRight size={18} color={c.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </Reveal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { paddingTop: 14, paddingBottom: 28 },
});

const makeStyles = (c: AppColors, isDark: boolean) =>
  StyleSheet.create({
    greetRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18, paddingHorizontal: 16 },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.gold, alignItems: "center", justifyContent: "center" },
    avatarText: { color: c.onGold, fontSize: 16, fontWeight: "800" },
    greetHi: { fontSize: 21, fontWeight: "800", color: c.text, letterSpacing: -0.4 },
    greetSub: { fontSize: 12.5, color: c.textSecondary, marginTop: 2 },
    planPill: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 },
    planPillGold: { backgroundColor: c.gold },
    planPillMuted: { backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.border },
    planPillText: { fontSize: 11, fontWeight: "800", color: c.onGold, letterSpacing: 0.6 },

    // NiftyChart wrapper already has its own horizontal margin via container padding:
    // we add the padding here for chart + sections that aren't full-bleed.
    sectionTitle: { fontSize: 17, fontWeight: "800", color: c.text, letterSpacing: -0.3 },
    carouselHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, marginBottom: 12, marginTop: 2 },
    swipeHint: { fontSize: 11.5, color: c.gold, fontWeight: "700" },

    // Feature card (swipeable)
    featureCard: { borderRadius: 22, padding: 20, height: 172, justifyContent: "space-between", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" },
    featureTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    featureIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center" },
    featureArrow: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
    featureTag: { fontSize: 10, fontWeight: "800", color: "rgba(255,255,255,0.6)", letterSpacing: 1.4, marginTop: 8 },
    featureTitle: { fontSize: 22, fontWeight: "800", color: "#FFFFFF", letterSpacing: -0.5, marginTop: 2 },
    featureDesc: { fontSize: 12.5, color: "rgba(255,255,255,0.72)", lineHeight: 17, marginTop: 4 },

    // Dots
    dotsRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 12, marginBottom: 20 },
    dot: { height: 6, borderRadius: 3, backgroundColor: c.gold },

    // Upgrade
    upgradeCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.goldLight, borderWidth: 1, borderColor: isDark ? c.goldMuted + "55" : c.gold + "44", borderRadius: 18, padding: 14, marginHorizontal: 16, marginBottom: 20 },
    upgradeIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: c.gold, alignItems: "center", justifyContent: "center" },
    upgradeTitle: { fontSize: 14.5, fontWeight: "800", color: c.text },
    upgradeSub: { fontSize: 11.5, color: c.textSecondary, marginTop: 2 },
    upgradeBtn: { backgroundColor: c.gold, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
    upgradeBtnText: { fontSize: 12.5, fontWeight: "800", color: c.onGold },

    // Tools list
    toolsCard: { backgroundColor: c.card, borderRadius: 20, borderWidth: 1, borderColor: c.border, overflow: "hidden", marginHorizontal: 16, marginTop: 12 },
    row: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 14, paddingVertical: 14 },
    rowDivider: { borderBottomWidth: 1, borderBottomColor: c.borderLight },
    rowIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    rowTitle: { fontSize: 14.5, fontWeight: "700", color: c.text },
    rowSub: { fontSize: 12, color: c.textSecondary, marginTop: 2 },
  });

export default UnDashboard;
