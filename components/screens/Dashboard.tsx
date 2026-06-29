import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
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

// Real plan name from user.tier — defaults to FREE.
const planName = (tier: any) => {
  switch (Number(tier)) {
    case 1: return "Basic";
    case 2: return "Advanced";
    case 3: return "Pro";
    default: return "Free";
  }
};

// Letter-avatar tints (like the scanner reference rows).
const TOOLS = [
  { id: 1, code: "AI", title: "AI-Bot", subtitle: "Ask the markets assistant", Icon: Bot, nav: "chatbot", tint: "profit" },
  { id: 2, code: "FN", title: "Fundamentals", subtitle: "Company ratios & analysis", Icon: BarChart3, nav: "fundamental", tint: "gold" },
  { id: 3, code: "HC", title: "Historical Charts", subtitle: "Price & volume history", Icon: LineChart, nav: "historical", tint: "info" },
  { id: 4, code: "OS", title: "Option Simulator", subtitle: "Build & test option strategies", Icon: Layers, nav: "simulator", tint: "violet" },
  { id: 5, code: "TB", title: "Time Backtest", subtitle: "Test strategies over time", Icon: Timer, nav: "basic-backtester-main", tint: "gold" },
  { id: 6, code: "SC", title: "Scanner", subtitle: "Find stocks by pattern", Icon: Search, nav: "scannermain", tint: "profit" },
  { id: 7, code: "ST", title: "Strategy Charts", subtitle: "Visualize your strategies", Icon: Target, nav: "strategy-charts", tint: "info" },
  { id: 8, code: "IB", title: "Indicator Backtest", subtitle: "Backtest with indicators", Icon: Activity, nav: "basic-backtester-home", tint: "violet" },
];

const UnDashboard = () => {
  const { colors: c, isDark } = useTheme();
  const s = makeStyles(c, isDark);
  const user = useSelector(authSelector);
  const firstName = user?.name?.split(" ")[0] || "Trader";
  const plan = planName(user?.tier);
  const isPaid = Number(user?.tier) > 0;

  const tintColor = (t: string) => {
    switch (t) {
      case "profit": return c.profit;
      case "info": return c.info;
      case "violet": return isDark ? "#A78BFA" : "#7C5CFC";
      default: return c.gold;
    }
  };
  const tintBg = (t: string) => {
    const base = tintColor(t);
    return base + (isDark ? "22" : "1A");
  };

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
            {isPaid ? (
              <Crown size={11} color={c.onGold} />
            ) : (
              <Sparkles size={11} color={c.textSecondary} />
            )}
            <Text style={[s.planPillText, !isPaid && { color: c.textSecondary }]}>
              {plan.toUpperCase()}
            </Text>
          </View>
        </View>
      </Reveal>

      {/* Real NIFTY 50 interactive chart */}
      <Reveal index={1}>
        <NiftyChart />
      </Reveal>

      {/* Upgrade banner — only for free users */}
      {!isPaid && (
        <Reveal index={2}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/pricing" as any)}
            style={s.upgradeCard}
          >
            <View style={s.upgradeIcon}>
              <Crown size={18} color={c.onGold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.upgradeTitle}>Unlock Unfluke Pro</Text>
              <Text style={s.upgradeSub}>Unlimited backtests, scans & AI insights</Text>
            </View>
            <View style={s.upgradeBtn}>
              <Text style={s.upgradeBtnText}>Upgrade</Text>
            </View>
          </TouchableOpacity>
        </Reveal>
      )}

      {/* Tools — merged list card (scanner-style rows) */}
      <Reveal index={isPaid ? 2 : 3}>
        <Text style={s.sectionTitle}>Explore Tools</Text>
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
  container: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
});

const makeStyles = (c: AppColors, isDark: boolean) =>
  StyleSheet.create({
    // Greeting
    greetRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
    avatar: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: c.gold, alignItems: "center", justifyContent: "center",
    },
    avatarText: { color: c.onGold, fontSize: 16, fontWeight: "800" },
    greetHi: { fontSize: 21, fontWeight: "800", color: c.text, letterSpacing: -0.4 },
    greetSub: { fontSize: 12.5, color: c.textSecondary, marginTop: 2 },
    planPill: {
      flexDirection: "row", alignItems: "center", gap: 4,
      borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5,
    },
    planPillGold: { backgroundColor: c.gold },
    planPillMuted: { backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.border },
    planPillText: { fontSize: 11, fontWeight: "800", color: c.onGold, letterSpacing: 0.6 },

    // Upgrade banner
    upgradeCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: c.goldLight,
      borderWidth: 1,
      borderColor: isDark ? c.goldMuted + "55" : c.gold + "44",
      borderRadius: 18,
      padding: 14,
      marginBottom: 18,
    },
    upgradeIcon: {
      width: 40, height: 40, borderRadius: 12,
      backgroundColor: c.gold, alignItems: "center", justifyContent: "center",
    },
    upgradeTitle: { fontSize: 14.5, fontWeight: "800", color: c.text },
    upgradeSub: { fontSize: 11.5, color: c.textSecondary, marginTop: 2 },
    upgradeBtn: { backgroundColor: c.gold, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
    upgradeBtnText: { fontSize: 12.5, fontWeight: "800", color: c.onGold },

    // Section
    sectionTitle: { fontSize: 17, fontWeight: "800", color: c.text, letterSpacing: -0.3, marginBottom: 12 },

    // Tools merged card
    toolsCard: {
      backgroundColor: c.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    rowDivider: { borderBottomWidth: 1, borderBottomColor: c.borderLight },
    rowIcon: {
      width: 42, height: 42, borderRadius: 12,
      alignItems: "center", justifyContent: "center",
    },
    rowTitle: { fontSize: 14.5, fontWeight: "700", color: c.text },
    rowSub: { fontSize: 12, color: c.textSecondary, marginTop: 2 },
  });

export default UnDashboard;
