import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { store } from "../redux/store";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { ThemeProvider, useTheme } from "../constants/ThemeContext";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import {
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
} from "expo-tracking-transparency";
import { Settings } from "react-native-fbsdk-next";
import "../helpers/globalErrorHandlers";

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function ThemedStack() {
  const { scheme, colors } = useTheme();
  return (
    <>
      <StatusBar
        style={scheme === "dark" ? "light" : "dark"}
        backgroundColor={colors.headerBg}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="fundamental" />
        <Stack.Screen name="crypto-fundamental" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="strategy-charts" />
        <Stack.Screen name="chatbot" />
        <Stack.Screen name="historical" />
        <Stack.Screen name="simulator" />
        <Stack.Screen name="scannermain" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="activate-telegram" />
        <Stack.Screen name="pricing" />
        <Stack.Screen name="leads" />
        <Stack.Screen name="advanced-backtester-main" />
        <Stack.Screen name="advanced-backtester-home" />
        <Stack.Screen name="advanced-backtester" />
        <Stack.Screen name="basic-backtester-view" />
        <Stack.Screen name="basic-backtester-home" />
        <Stack.Screen name="basic-backtester-main" />
        <Stack.Screen name="basic-backtester" />
      </Stack>
    </>
  );
}

// iOS App Tracking Transparency: the FB SDK collects the IDFA
// (advertiserIDCollectionEnabled), which Apple only allows after the user
// grants the tracking prompt. iOS silently skips the dialog if it is
// requested before the app reaches the "active" state, hence the AppState wait.
function useTrackingPermission() {
  useEffect(() => {
    if (Platform.OS !== "ios") return;

    const syncTrackingPermission = async () => {
      try {
        let { status } = await getTrackingPermissionsAsync();
        if (status === "undetermined") {
          ({ status } = await requestTrackingPermissionsAsync());
        }
        await Settings.setAdvertiserTrackingEnabled(status === "granted");
      } catch {}
    };

    if (AppState.currentState === "active") {
      syncTrackingPermission();
      return;
    }
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        sub.remove();
        syncTrackingPermission();
      }
    });
    return () => sub.remove();
  }, []);
}

export default function RootLayout() {
  useTrackingPermission();

  // Safety net: index.tsx hides the splash on the normal path; if any launch
  // path ever bypasses it, don't leave the user stuck on the splash forever.
  useEffect(() => {
    const t = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 8000);
    return () => clearTimeout(t);
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <KeyboardProvider>
          <Provider store={store}>
            <QueryClientProvider client={queryClient}>
              <ThemeProvider>
                <ThemedStack />
              </ThemeProvider>
            </QueryClientProvider>
          </Provider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
