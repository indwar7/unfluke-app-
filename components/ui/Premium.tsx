// Unfluke Pro — Premium UI primitives
// Theme-aware building blocks shared across every redesigned screen.
// Pure presentation — no business logic, no data fetching.

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Polyline, Defs, LinearGradient as SvgGrad, Stop, Path } from "react-native-svg";
import { useTheme } from "@/constants/ThemeContext";
import { Radius, Space, Shadow } from "@/constants/Theme";

/* ─────────────────────────────────────────────────────────
   Surface — the standard premium card
───────────────────────────────────────────────────────── */
export const Surface: React.FC<{
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  padded?: boolean;
}> = ({ children, style, elevated, padded = true }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: Radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: padded ? Space.lg : 0,
        },
        elevated ? Shadow.md : Shadow.sm,
        style,
      ]}
    >
      {children}
    </View>
  );
};

/* ─────────────────────────────────────────────────────────
   SectionLabel — small caps label with optional trailing node
───────────────────────────────────────────────────────── */
export const SectionLabel: React.FC<{
  children: React.ReactNode;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}> = ({ children, right, style }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.sectionRow, style]}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 1.4,
          textTransform: "uppercase",
          color: colors.textMuted,
        }}
      >
        {children}
      </Text>
      {right}
    </View>
  );
};

/* ─────────────────────────────────────────────────────────
   GoldButton — signature gradient CTA
───────────────────────────────────────────────────────── */
export const GoldButton: React.FC<{
  label: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}> = ({ label, onPress, icon, loading, disabled, style, textStyle }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[{ borderRadius: Radius.md }, Shadow.gold, style]}
    >
      <LinearGradient
        colors={[colors.goldBright, colors.gold, colors.goldDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.goldBtn, disabled && { opacity: 0.55 }]}
      >
        {loading ? (
          <ActivityIndicator color={colors.onGold} />
        ) : (
          <View style={styles.btnInner}>
            {icon}
            <Text style={[styles.goldBtnText, { color: colors.onGold }, textStyle]}>
              {label}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

/* ─────────────────────────────────────────────────────────
   GhostButton — outlined secondary action
───────────────────────────────────────────────────────── */
export const GhostButton: React.FC<{
  label: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}> = ({ label, onPress, icon, style }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.ghostBtn,
        { borderColor: colors.border, backgroundColor: colors.surface },
        style,
      ]}
    >
      <View style={styles.btnInner}>
        {icon}
        <Text style={[styles.ghostBtnText, { color: colors.text }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

/* ─────────────────────────────────────────────────────────
   ProBadge — gold "PRO" pill
───────────────────────────────────────────────────────── */
export const ProBadge: React.FC<{ label?: string; style?: StyleProp<ViewStyle> }> = ({
  label = "PRO",
  style,
}) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          paddingHorizontal: 9,
          paddingVertical: 3,
          borderRadius: Radius.full,
          backgroundColor: colors.gold,
          flexDirection: "row",
          alignItems: "center",
          gap: 3,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: 10, fontWeight: "800", letterSpacing: 0.6, color: colors.onGold }}>
        {label}
      </Text>
    </View>
  );
};

/* ─────────────────────────────────────────────────────────
   Chip — neutral rounded tag
───────────────────────────────────────────────────────── */
export const Chip: React.FC<{
  children: React.ReactNode;
  active?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}> = ({ children, active, onPress, style }) => {
  const { colors } = useTheme();
  const Wrap: any = onPress ? TouchableOpacity : View;
  return (
    <Wrap
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        {
          paddingHorizontal: 14,
          paddingVertical: 7,
          borderRadius: Radius.full,
          backgroundColor: active ? colors.gold : colors.surfaceElevated,
          borderWidth: 1,
          borderColor: active ? colors.gold : colors.border,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: active ? colors.onGold : colors.textSecondary,
        }}
      >
        {children}
      </Text>
    </Wrap>
  );
};

/* ─────────────────────────────────────────────────────────
   DeltaText — colored +/- change value
───────────────────────────────────────────────────────── */
export const DeltaText: React.FC<{
  value: number | string;
  suffix?: string;
  size?: number;
  weight?: TextStyle["fontWeight"];
  style?: StyleProp<TextStyle>;
}> = ({ value, suffix = "", size = 13, weight = "700", style }) => {
  const { colors } = useTheme();
  const num = typeof value === "number" ? value : parseFloat(String(value));
  const positive = !isNaN(num) ? num >= 0 : String(value).trim().startsWith("+");
  const sign = !isNaN(num) ? (num >= 0 ? "+" : "") : "";
  return (
    <Text
      style={[
        {
          fontSize: size,
          fontWeight: weight,
          fontVariant: ["tabular-nums"],
          color: positive ? colors.profit : colors.loss,
        },
        style,
      ]}
    >
      {sign}
      {value}
      {suffix}
    </Text>
  );
};

/* ─────────────────────────────────────────────────────────
   Sparkline — lightweight smooth line for trend rows/cards
───────────────────────────────────────────────────────── */
export const Sparkline: React.FC<{
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}> = ({ data, width = 80, height = 28, color, fill = false, strokeWidth = 2, style }) => {
  const { colors } = useTheme();
  const stroke = color || colors.gold;
  if (!data || data.length < 2) {
    return <View style={[{ width, height }, style]} />;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const areaId = `spark-${width}-${height}-${data.length}`;
  const areaPath =
    `M0,${height} L` +
    pts.join(" L") +
    ` L${width},${height} Z`;
  return (
    <Svg width={width} height={height} style={style}>
      {fill && (
        <>
          <Defs>
            <SvgGrad id={areaId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={stroke} stopOpacity={0.28} />
              <Stop offset="1" stopColor={stroke} stopOpacity={0} />
            </SvgGrad>
          </Defs>
          <Path d={areaPath} fill={`url(#${areaId})`} />
        </>
      )}
      <Polyline
        points={pts.join(" ")}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
};

/* ─────────────────────────────────────────────────────────
   StatBlock — label + big value + optional delta (3-up rows)
───────────────────────────────────────────────────────── */
export const StatBlock: React.FC<{
  label: string;
  value: string;
  delta?: string;
  valueColor?: string;
  align?: "left" | "center";
  style?: StyleProp<ViewStyle>;
}> = ({ label, value, delta, valueColor, align = "left", style }) => {
  const { colors } = useTheme();
  return (
    <View style={[{ alignItems: align === "center" ? "center" : "flex-start" }, style]}>
      <Text
        style={{
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 1,
          textTransform: "uppercase",
          color: colors.textMuted,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "800",
          fontVariant: ["tabular-nums"],
          color: valueColor || colors.text,
        }}
      >
        {value}
      </Text>
      {delta != null && <DeltaText value={delta} size={11} style={{ marginTop: 2 }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Space.md,
  },
  goldBtn: {
    borderRadius: Radius.md,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  goldBtnText: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  ghostBtn: {
    borderRadius: Radius.md,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
  btnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

export default {
  Surface,
  SectionLabel,
  GoldButton,
  GhostButton,
  ProBadge,
  Chip,
  DeltaText,
  Sparkline,
  StatBlock,
};
