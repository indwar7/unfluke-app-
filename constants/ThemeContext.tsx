// Unfluke Pro — App-wide theme context
// Provides an in-app Light/Dark toggle that overrides the system setting,
// persists the choice, and exposes the resolved color set + design tokens.

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useColorScheme as useSystemColorScheme, Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors, AppColors } from "./Colors";
import { makeTokens, ThemeTokens } from "./Theme";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedScheme = "light" | "dark";

const STORAGE_KEY = "@unfluke/theme-mode";

interface ThemeContextValue {
  /** User preference: light | dark | system */
  mode: ThemeMode;
  /** Actual scheme in effect after resolving "system" */
  scheme: ResolvedScheme;
  /** Resolved color palette for the active scheme */
  colors: AppColors;
  /** Design tokens (typography/cards/buttons) bound to the active scheme */
  t: ThemeTokens;
  isDark: boolean;
  setMode: (m: ThemeMode) => void;
  /** Cycle light ⇄ dark (ignores system) */
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const system = useSystemColorScheme();
  // Default to the premium dark look until the stored preference loads.
  const [mode, setModeState] = useState<ThemeMode>("dark");

  // Hydrate stored preference once on mount.
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (!active) return;
        if (saved === "light" || saved === "dark" || saved === "system") {
          setModeState(saved);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {});
  }, []);

  const scheme: ResolvedScheme =
    mode === "system" ? (system === "dark" ? "dark" : "light") : mode;

  // Drive React Native's global Appearance so that EVERY component using the
  // built-in useColorScheme() (deep sub-components, modals, tables, etc.)
  // follows the in-app theme choice — guaranteeing light=light / dark=dark
  // everywhere, not just on screens that consume this context directly.
  useEffect(() => {
    try {
      // In "system" mode we relinquish control back to the OS (null).
      Appearance.setColorScheme(mode === "system" ? null : scheme);
    } catch {}
  }, [mode, scheme]);

  const toggle = useCallback(() => {
    setMode(scheme === "dark" ? "light" : "dark");
  }, [scheme, setMode]);

  const value = useMemo<ThemeContextValue>(() => {
    const colors = Colors[scheme];
    return {
      mode,
      scheme,
      colors,
      t: makeTokens(colors),
      isDark: scheme === "dark",
      setMode,
      toggle,
    };
  }, [mode, scheme, setMode, toggle]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

/**
 * Access the active theme. Safe to call outside the provider — falls back to
 * the dark palette so isolated components / previews never crash.
 */
export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx;
  const colors = Colors.dark;
  return {
    mode: "dark",
    scheme: "dark",
    colors,
    t: makeTokens(colors),
    isDark: true,
    setMode: () => {},
    toggle: () => {},
  };
};

export default ThemeProvider;
