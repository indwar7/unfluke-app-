// Unfluke Pro — Shared Design Tokens
// Typography, spacing, shadows, and reusable style patterns.
// Tokens are produced by makeTokens(colors) so they can bind to either theme.
// Static exports (Font, Card, …) remain for back-compat and resolve to LIGHT.

import { Platform, TextStyle, ViewStyle } from "react-native";
import { Colors, AppColors } from "./Colors";

// ─── Spacing ───────────────────────────────────────
export const Space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

// ─── Radius ────────────────────────────────────────
export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
} as const;

// ─── Shadows ───────────────────────────────────────
// Light shadows are soft + neutral; dark "shadows" lean on glow/elevation.
export const Shadow = {
  sm: {
    shadowColor: "#0B0D12",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  } as ViewStyle,
  md: {
    shadowColor: "#0B0D12",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  } as ViewStyle,
  lg: {
    shadowColor: "#0B0D12",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  } as ViewStyle,
  gold: {
    shadowColor: "#C99A2E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  } as ViewStyle,
};

export interface ThemeTokens {
  c: AppColors;
  Font: ReturnType<typeof makeFont>;
  Space: typeof Space;
  Radius: typeof Radius;
  Shadow: typeof Shadow;
  Card: ViewStyle;
  CardElevated: ViewStyle;
  HeroCard: ViewStyle;
  PrimaryButton: ViewStyle;
  GoldButton: ViewStyle;
  OutlineButton: ViewStyle;
  Input: TextStyle;
  Pill: ViewStyle;
  ProBadge: ViewStyle;
}

// ─── Typography factory ────────────────────────────
function makeFont(c: AppColors) {
  return {
    displayXl: {
      fontSize: 34,
      fontWeight: "800",
      letterSpacing: -0.8,
      color: c.text,
    } as TextStyle,
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

    label: {
      fontSize: 13,
      fontWeight: "600",
      color: c.textSecondary,
      letterSpacing: 0.2,
    } as TextStyle,
    labelCaps: {
      fontSize: 11,
      fontWeight: "700",
      color: c.textMuted,
      letterSpacing: 1.4,
      textTransform: "uppercase",
    } as TextStyle,

    // Financial numbers — tabular for alignment
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
      fontSize: 30,
      fontWeight: "800",
      fontVariant: ["tabular-nums"],
      letterSpacing: -0.6,
      color: c.text,
    } as TextStyle,

    button: {
      fontSize: 15,
      fontWeight: "700",
      letterSpacing: 0.3,
    } as TextStyle,
    buttonSm: {
      fontSize: 13,
      fontWeight: "600",
    } as TextStyle,
  };
}

// ─── Token factory ─────────────────────────────────
export function makeTokens(c: AppColors): ThemeTokens {
  const Card: ViewStyle = {
    backgroundColor: c.card,
    borderRadius: Radius.lg,
    padding: Space.lg,
    borderWidth: 1,
    borderColor: c.border,
    ...Shadow.sm,
  };

  const CardElevated: ViewStyle = {
    ...Card,
    ...Shadow.md,
  };

  const HeroCard: ViewStyle = {
    backgroundColor: c.surface,
    borderRadius: Radius.xl,
    padding: Space.xl,
    borderWidth: 1,
    borderColor: c.border,
    ...Shadow.md,
  };

  const PrimaryButton: ViewStyle = {
    backgroundColor: c.primary,
    borderRadius: Radius.md,
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  };

  const GoldButton: ViewStyle = {
    backgroundColor: c.gold,
    borderRadius: Radius.md,
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  };

  const OutlineButton: ViewStyle = {
    backgroundColor: c.transparent,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: c.border,
    paddingVertical: 13.5,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  };

  const Input: TextStyle = {
    backgroundColor: c.inputBg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: c.inputBorder,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: c.text,
  };

  const Pill: ViewStyle = {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: c.borderLight,
  };

  const ProBadge: ViewStyle = {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: c.gold,
  };

  return {
    c,
    Font: makeFont(c),
    Space,
    Radius,
    Shadow,
    Card,
    CardElevated,
    HeroCard,
    PrimaryButton,
    GoldButton,
    OutlineButton,
    Input,
    Pill,
    ProBadge,
  };
}

// ─── Static (light) exports — back-compat ──────────
const lightTokens = makeTokens(Colors.light);
export const Font = lightTokens.Font;
export const Card = lightTokens.Card;
export const CardElevated = lightTokens.CardElevated;
export const HeroCard = lightTokens.HeroCard;
export const DarkCard = makeTokens(Colors.dark).Card;
export const PrimaryButton = lightTokens.PrimaryButton;
export const GoldButton = lightTokens.GoldButton;
export const OutlineButton = lightTokens.OutlineButton;
export const Input = lightTokens.Input;
export const Pill = lightTokens.Pill;
export const ProBadge = lightTokens.ProBadge;

export default {
  Font,
  Space,
  Radius,
  Shadow,
  Card,
  CardElevated,
  HeroCard,
  DarkCard,
  PrimaryButton,
  GoldButton,
  OutlineButton,
  Input,
  Pill,
  ProBadge,
  makeTokens,
};
