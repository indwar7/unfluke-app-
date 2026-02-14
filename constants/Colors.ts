// Color constants for the app

export interface AppColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
  light: string;
  dark: string;
  transparent: string;
}

export const Colors: {
  light: AppColors;
  dark: AppColors;
} = {
  light: {
    primary: "#2563EB",
    secondary: "#6B7280",
    background: "#FFFFFF",
    surface: "#F9FAFB",
    text: "#111827",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    error: "#EF4444",
    warning: "#F59E0B",
    success: "#10B981",
    info: "#3B82F6",
    light: "#F9FAFB",
    dark: "#111827",
    transparent: "transparent",
  },
  dark: {
    primary: "#3B82F6",
    secondary: "#9CA3AF",
    background: "#111827",
    surface: "#1F2937",
    text: "#F9FAFB",
    textSecondary: "#9CA3AF",
    border: "#374151",
    error: "#F87171",
    warning: "#FBBF24",
    success: "#34D399",
    info: "#60A5FA",
    light: "#F9FAFB",
    dark: "#111827",
    transparent: "transparent",
  },
};

export default Colors;
