// Unfluke Pro — Appearance / Theme toggle
// Self-contained: reads & writes the app theme via ThemeContext.
// Drop it anywhere (Profile/Settings). No other wiring needed.

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Sun, Moon, Smartphone } from "lucide-react-native";
import { useTheme, ThemeMode } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

export const ThemeToggle: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ style }) => {
  const { colors: c, mode, setMode } = useTheme();
  const s = makeStyles(c);

  const options: { key: ThemeMode; label: string; Icon: any }[] = [
    { key: "light", label: "Light", Icon: Sun },
    { key: "dark", label: "Dark", Icon: Moon },
    { key: "system", label: "System", Icon: Smartphone },
  ];

  return (
    <View style={[s.wrap, style]}>
      <Text style={s.title}>APPEARANCE</Text>
      <View style={s.segment}>
        {options.map((o) => {
          const active = mode === o.key;
          return (
            <TouchableOpacity
              key={o.key}
              activeOpacity={0.85}
              onPress={() => setMode(o.key)}
              style={[s.seg, active && s.segActive]}
            >
              <o.Icon size={16} color={active ? c.onGold : c.textSecondary} />
              <Text style={[s.segText, { color: active ? c.onGold : c.textSecondary }]}>
                {o.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    wrap: {
      backgroundColor: c.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
    },
    title: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.2,
      textTransform: "uppercase",
      color: c.textMuted,
      marginBottom: 12,
    },
    segment: {
      flexDirection: "row",
      backgroundColor: c.inputBg,
      borderRadius: 12,
      padding: 4,
      gap: 4,
    },
    seg: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      borderRadius: 9,
    },
    segActive: {
      backgroundColor: c.gold,
    },
    segText: {
      fontSize: 13,
      fontWeight: "700",
    },
  });

export default ThemeToggle;
