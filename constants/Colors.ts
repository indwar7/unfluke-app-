// Unfluke Pro — Premium Design System
// Refined financial aesthetic: black actions, gold accents, green/red sentiment

export interface AppColors {
  // Core
  primary: string;
  primaryMuted: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  card: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;

  // Borders
  border: string;
  borderLight: string;

  // Semantic
  error: string;
  errorLight: string;
  warning: string;
  warningLight: string;
  success: string;
  successLight: string;
  info: string;

  // Financial
  profit: string;
  profitBg: string;
  loss: string;
  lossBg: string;

  // Premium accents
  gold: string;
  goldLight: string;
  goldMuted: string;

  // Utility
  black: string;
  white: string;
  transparent: string;
  overlay: string;

  // Component-specific
  headerBg: string;
  tabBarBg: string;
  tabBarActive: string;
  tabBarInactive: string;
  inputBg: string;
  inputBorder: string;
  badgeBg: string;
  badgeText: string;
}

export const Colors: {
  light: AppColors;
  dark: AppColors;
} = {
  light: {
    // Core
    primary: "#1A1A2E",
    primaryMuted: "#2D2D44",
    secondary: "#6B7280",
    background: "#F7F7F8",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    card: "#FFFFFF",

    // Text
    text: "#0F172A",
    textSecondary: "#64748B",
    textMuted: "#94A3B8",

    // Borders
    border: "#E2E8F0",
    borderLight: "#F1F5F9",

    // Semantic
    error: "#DC2626",
    errorLight: "#FEE2E2",
    warning: "#D97706",
    warningLight: "#FEF3C7",
    success: "#059669",
    successLight: "#D1FAE5",
    info: "#2563EB",

    // Financial
    profit: "#059669",
    profitBg: "#ECFDF5",
    loss: "#DC2626",
    lossBg: "#FEF2F2",

    // Premium accents
    gold: "#B8860B",
    goldLight: "#F5E6C8",
    goldMuted: "#D4A843",

    // Utility
    black: "#000000",
    white: "#FFFFFF",
    transparent: "transparent",
    overlay: "rgba(0,0,0,0.5)",

    // Component-specific
    headerBg: "#FFFFFF",
    tabBarBg: "#FFFFFF",
    tabBarActive: "#1A1A2E",
    tabBarInactive: "#94A3B8",
    inputBg: "#F8FAFC",
    inputBorder: "#E2E8F0",
    badgeBg: "#1A1A2E",
    badgeText: "#FFFFFF",
  },
  dark: {
    // Core
    primary: "#E2E8F0",
    primaryMuted: "#94A3B8",
    secondary: "#9CA3AF",
    background: "#0F172A",
    surface: "#1E293B",
    surfaceElevated: "#334155",
    card: "#1E293B",

    // Text
    text: "#F1F5F9",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",

    // Borders
    border: "#334155",
    borderLight: "#1E293B",

    // Semantic
    error: "#F87171",
    errorLight: "#7F1D1D",
    warning: "#FBBF24",
    warningLight: "#78350F",
    success: "#34D399",
    successLight: "#064E3B",
    info: "#60A5FA",

    // Financial
    profit: "#34D399",
    profitBg: "#064E3B",
    loss: "#F87171",
    lossBg: "#7F1D1D",

    // Premium accents
    gold: "#D4A843",
    goldLight: "#3D2E0A",
    goldMuted: "#B8860B",

    // Utility
    black: "#000000",
    white: "#FFFFFF",
    transparent: "transparent",
    overlay: "rgba(0,0,0,0.7)",

    // Component-specific
    headerBg: "#0F172A",
    tabBarBg: "#1E293B",
    tabBarActive: "#F1F5F9",
    tabBarInactive: "#64748B",
    inputBg: "#1E293B",
    inputBorder: "#334155",
    badgeBg: "#F1F5F9",
    badgeText: "#0F172A",
  },
};

export default Colors;
