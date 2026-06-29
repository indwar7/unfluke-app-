// Unfluke Pro — Premium Design System
// Refined financial aesthetic: clean light + deep-black/gold dark.
// Light  : white surfaces, subtle shadows, amber/gold accents on key metrics.
// Dark   : near-black canvas, GOLD accent throughout (NOT blue), green/red sentiment.

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

  // Premium accents (gold)
  gold: string;        // primary accent / fill
  goldBright: string;  // highlights, large numbers
  goldDeep: string;    // gradient end / pressed
  goldLight: string;   // tinted backgrounds / badges
  goldMuted: string;   // secondary gold / icons
  onGold: string;      // text/icon color that sits ON a gold fill

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
    primary: "#0E0E12",
    primaryMuted: "#3A3A44",
    secondary: "#6B7280",
    background: "#F4F4F6",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    card: "#FFFFFF",

    // Text
    text: "#0E0F14",
    textSecondary: "#5B6472",
    textMuted: "#9AA2B1",

    // Borders
    border: "#E6E8EC",
    borderLight: "#F0F1F4",

    // Semantic
    error: "#DC2626",
    errorLight: "#FEECEC",
    warning: "#C8881A",
    warningLight: "#FBF1DC",
    success: "#0E9E6E",
    successLight: "#E3F7EE",
    info: "#2563EB",

    // Financial
    profit: "#0E9E6E",
    profitBg: "#E6F7EF",
    loss: "#E0483B",
    lossBg: "#FCECEA",

    // Premium accents — warm amber/gold for light surfaces
    gold: "#C99A2E",
    goldBright: "#B8860B",
    goldDeep: "#A87A12",
    goldLight: "#FBF1D8",
    goldMuted: "#D9B450",
    onGold: "#1A1404",

    // Utility
    black: "#000000",
    white: "#FFFFFF",
    transparent: "transparent",
    overlay: "rgba(8,10,16,0.45)",

    // Component-specific
    headerBg: "#FFFFFF",
    tabBarBg: "#FFFFFF",
    tabBarActive: "#0E0E12",
    tabBarInactive: "#9AA2B1",
    inputBg: "#F6F7F9",
    inputBorder: "#E6E8EC",
    badgeBg: "#0E0E12",
    badgeText: "#FFFFFF",
  },
  dark: {
    // Core — deep near-black canvas, layered charcoal surfaces
    primary: "#E9C46A",
    primaryMuted: "#8A7A4E",
    secondary: "#9BA0AA",
    background: "#0A0B0E",
    surface: "#14161B",
    surfaceElevated: "#1C1F26",
    card: "#14161B",

    // Text
    text: "#F4F5F7",
    textSecondary: "#A6ABB5",
    textMuted: "#6C727E",

    // Borders
    border: "#262A33",
    borderLight: "#1E222A",

    // Semantic
    error: "#F26157",
    errorLight: "#2A1614",
    warning: "#E9C46A",
    warningLight: "#2A2410",
    success: "#2DD4A0",
    successLight: "#0F2A22",
    info: "#5FA3FF",

    // Financial
    profit: "#2DD4A0",
    profitBg: "#0F2A22",
    loss: "#F26157",
    lossBg: "#2A1614",

    // Premium accents — bright gold, the signature of the dark theme
    gold: "#E9C46A",
    goldBright: "#F4D27A",
    goldDeep: "#C99A2E",
    goldLight: "#211B0C",
    goldMuted: "#B8973F",
    onGold: "#15110A",

    // Utility
    black: "#000000",
    white: "#FFFFFF",
    transparent: "transparent",
    overlay: "rgba(0,0,0,0.66)",

    // Component-specific
    headerBg: "#0C0D11",
    tabBarBg: "#101217",
    tabBarActive: "#E9C46A",
    tabBarInactive: "#6C727E",
    inputBg: "#181B21",
    inputBorder: "#2A2F39",
    badgeBg: "#E9C46A",
    badgeText: "#15110A",
  },
};

export default Colors;
