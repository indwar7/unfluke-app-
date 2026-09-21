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
      {/* No backgroundColor: with edgeToEdgeEnabled the prop is ignored by
          expo-status-bar (it only logs a warning) and routes into the
          Window.setStatusBarColor API deprecated in Android 15. To tint the
          area behind the status bar, render a view under it instead. */}
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboardingpage" />
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

// The FB SDK no longer self-starts: AutoInitEnabled, AutoLogAppEventsEnabled and
// AdvertiserIDCollectionEnabled are all false in the manifest / Info.plist (see
// app.json). Auto-init made the SDK read the advertising identifier at process
// start — before the user saw any disclosure — which reads to policy scanners as
// undisclosed tracking. We now start it explicitly, after consent is resolved.
//
// iOS: the IDFA requires App Tracking Transparency. iOS silently skips the
// dialog if it is requested before the app reaches the "active" state, hence the
// AppState wait. Event logging is enabled either way; only the identifier is
// gated on the grant.
//
// Android: there is no ATT equivalent, so we init once the app is running.
// Advertising-ID use is covered by the Play Data Safety declaration and the
// privacy policy — keep both in sync if these flags change.
function useFacebookSdk() {
  useEffect(() => {
    const startSdk = async (advertiserIdAllowed: boolean) => {
      try {
        Settings.setAutoLogAppEventsEnabled(true);
        Settings.setAdvertiserIDCollectionEnabled(advertiserIdAllowed);
        if (Platform.OS === "ios") {
          await Settings.setAdvertiserTrackingEnabled(advertiserIdAllowed);
        }
        Settings.initializeSDK();
      } catch {}
    };

    if (Platform.OS !== "ios") {
      startSdk(true);
      return;
    }

    const syncTrackingPermission = async () => {
      let granted = false;
      try {
        let { status } = await getTrackingPermissionsAsync();
        if (status === "undetermined") {
          ({ status } = await requestTrackingPermissionsAsync());
        }
        granted = status === "granted";
      } catch {}
      // Start the SDK regardless — without the IDFA when consent was refused.
      await startSdk(granted);
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
  useFacebookSdk();

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
