// Unfluke Pro — Shared Design Tokens
// Typography, spacing, shadows, and reusable style patterns

import { Platform, TextStyle, ViewStyle } from "react-native";
import { Colors } from "./Colors";

const c = Colors.light;

// ─── Typography ────────────────────────────────────
export const Font = {
  // Display — bold headlines
  displayLg: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    color: c.text,
  } as TextStyle,
  displayMd: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: c.text,
  } as TextStyle,
  displaySm: {
    fontSize: 18,
    fontWeight: "700",
    color: c.text,
  } as TextStyle,

  // Body
  bodyLg: {
    fontSize: 16,
    fontWeight: "400",
    color: c.text,
    lineHeight: 24,
  } as TextStyle,
  bodyMd: {
    fontSize: 14,
    fontWeight: "400",
    color: c.text,
    lineHeight: 20,
  } as TextStyle,
  bodySm: {
    fontSize: 12,
    fontWeight: "400",
    color: c.textSecondary,
    lineHeight: 16,
  } as TextStyle,

  // Labels
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: c.textSecondary,
    letterSpacing: 0.3,
  } as TextStyle,
  labelCaps: {
    fontSize: 11,
    fontWeight: "700",
    color: c.textMuted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  } as TextStyle,

  // Financial numbers — monospace for alignment
  mono: {
    fontSize: 14,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
    color: c.text,
  } as TextStyle,
  monoLg: {
    fontSize: 20,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
    letterSpacing: -0.3,
    color: c.text,
  } as TextStyle,
  monoXl: {
    fontSize: 28,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
    letterSpacing: -0.5,
    color: c.text,
  } as TextStyle,

  // Button
  button: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  } as TextStyle,
  buttonSm: {
    fontSize: 13,
    fontWeight: "600",
  } as TextStyle,
};

// ─── Spacing ───────────────────────────────────────
export const Space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// ─── Radius ────────────────────────────────────────
export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

// ─── Shadows ───────────────────────────────────────
export const Shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  } as ViewStyle,
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  } as ViewStyle,
};

// ─── Reusable Component Styles ─────────────────────
export const Card = {
  backgroundColor: c.card,
  borderRadius: Radius.lg,
  padding: Space.lg,
  ...Shadow.sm,
  borderWidth: 1,
  borderColor: c.borderLight,
} as ViewStyle;

export const CardElevated = {
  ...Card,
  ...Shadow.md,
  borderWidth: 0,
} as ViewStyle;

export const DarkCard = {
  backgroundColor: c.primary,
  borderRadius: Radius.lg,
  padding: Space.lg,
} as ViewStyle;

export const PrimaryButton = {
  backgroundColor: c.primary,
  borderRadius: Radius.md,
  paddingVertical: 14,
  paddingHorizontal: 24,
  alignItems: "center",
  justifyContent: "center",
} as ViewStyle;

export const OutlineButton = {
  backgroundColor: c.transparent,
  borderRadius: Radius.md,
  borderWidth: 1.5,
  borderColor: c.primary,
  paddingVertical: 13,
  paddingHorizontal: 24,
  alignItems: "center",
  justifyContent: "center",
} as ViewStyle;

export const Input = {
  backgroundColor: c.inputBg,
  borderRadius: Radius.md,
  borderWidth: 1,
  borderColor: c.inputBorder,
  paddingVertical: Platform.OS === "ios" ? 14 : 12,
  paddingHorizontal: 16,
  fontSize: 15,
  color: c.text,
} as TextStyle;

// ─── Pill / Badge ──────────────────────────────────
export const Pill = {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: Radius.full,
  backgroundColor: c.borderLight,
} as ViewStyle;

export const ProBadge = {
  paddingHorizontal: 10,
  paddingVertical: 3,
  borderRadius: Radius.full,
  backgroundColor: c.goldLight,
} as ViewStyle;

export default {
  Font,
  Space,
  Radius,
  Shadow,
  Card,
  CardElevated,
  DarkCard,
  PrimaryButton,
  OutlineButton,
  Input,
  Pill,
  ProBadge,
};
