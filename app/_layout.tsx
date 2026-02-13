import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { store, persistor } from "../redux/store";
import { useColorScheme } from "@/hooks/useColorScheme";
import { NavbarLayout } from "@/components/NavbarLayout";
import { Animated, View, Text, ActivityIndicator, useWindowDimensions } from "react-native";
import { useEffect, useRef, useState, useCallback } from "react";
import SideBar from "@/components/ui/SideBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { PersistGate } from "redux-persist/integration/react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { OnboardingContext } from "@/redux/contextHelper";

export default function RootLayout() {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const slideAnim = useRef(new Animated.Value(-width * 0.3)).current;
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  // Default to true = show login first, then switch after checking
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check onboarding status in background (does NOT block rendering)
  useEffect(() => {
    (async () => {
      try {
        const hasCompleted = await AsyncStorage.getItem("hasCompletedOnboarding");
        if (hasCompleted === "true") {
          setShowOnboarding(false);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    })();
  }, []);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("hasCompletedOnboarding", "true");
      setShowOnboarding(false);
      console.log("Onboarding completed");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  const completeLogout = async () => {
    try {
      await AsyncStorage.setItem("hasCompletedOnboarding", "false");
      setShowOnboarding(true);
      setIsLoggingOut(false);
      console.log("Logout completed, onboarding reset");
    } catch (error) {
      console.error("Error saving logout status:", error);
    }
  };

  // sidebar animation
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: menuVisible ? 0 : -width * 0.3,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [menuVisible, slideAnim, width]);

  // NO loading gate — always render the Stack immediately
  // This prevents the "custom layout view" error

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Provider store={store}>
          <PersistGate loading={<ActivityIndicator size="large" color="#4A9782" />} persistor={persistor}>
            <OnboardingContext.Provider
              value={{
                onBoarding: showOnboarding,
                onFinish: completeOnboarding,
                restart: completeLogout,
                isLoggingOut,
                setIsLoggingOut,
              }}
            >
              <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                {showOnboarding ? (
                  // Onboarding/Login flow — just a plain Stack (index.tsx will redirect to /login)
                  <Stack screenOptions={{ headerShown: false }} />
                ) : (
                  // Main app with navbar and sidebar
                  <View style={{ flex: 1 }}>
                    <View style={{ zIndex: 1000 }}>
                      <NavbarLayout setMenuVisible={setMenuVisible} />
                    </View>
                    <Stack screenOptions={{ headerShown: false, headerTitle: "" }}>
                      <Stack.Screen name="index" options={{ headerShown: false }} />
                      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
                      <Stack.Screen name="fundamental" options={{ headerShown: false }} />
                      <Stack.Screen name="strategy-charts" options={{ headerShown: false }} />
                      <Stack.Screen name="historical" options={{ headerShown: false }} />
                      <Stack.Screen name="login" options={{ headerShown: false }} />
                      <Stack.Screen name="basic-backtester" options={{ headerShown: false }} />
                      <Stack.Screen name="basic-backtester-home" options={{ headerShown: false }} />
                      <Stack.Screen name="basic-backtester-main" options={{ headerShown: false }} />
                      <Stack.Screen name="basic-backtester-view" options={{ headerShown: false }} />
                      <Stack.Screen name="advanced-backtester" options={{ headerShown: false }} />
                      <Stack.Screen name="advanced-backtester-home" options={{ headerShown: false }} />
                      <Stack.Screen name="advanced-backtester-main" options={{ headerShown: false }} />
                      <Stack.Screen name="scanner" options={{ headerShown: false }} />
                      <Stack.Screen name="scannerhome" options={{ headerShown: false }} />
                      <Stack.Screen name="scannermain" options={{ headerShown: false }} />
                      <Stack.Screen name="scannerfundamental" options={{ headerShown: false }} />
                      <Stack.Screen name="scannerlist" options={{ headerShown: false }} />
                      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                      <Stack.Screen name="+not-found" options={{ headerShown: false }} />
                    </Stack>
                    {menuVisible && (
                      <SideBar
                        setExpandedMenu={setExpandedMenu}
                        setMenuVisible={setMenuVisible}
                        slideAnim={slideAnim}
                        expandedMenu={expandedMenu}
                      />
                    )}
                  </View>
                )}
                <StatusBar style="auto" />

                {/* Global logout overlay */}
                {isLoggingOut && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 99999,
                      elevation: 1000,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "#fff",
                        padding: 40,
                        borderRadius: 15,
                        alignItems: "center",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 6,
                        elevation: 10,
                        minWidth: 200,
                      }}
                    >
                      <ActivityIndicator size="large" color="#4A9782" />
                      <Text
                        style={{
                          marginTop: 20,
                          fontSize: 18,
                          color: "#495057",
                          fontWeight: "600",
                          textAlign: "center",
                        }}
                      >
                        Logging out...
                      </Text>
                      <Text
                        style={{
                          marginTop: 8,
                          fontSize: 14,
                          color: "#6c757d",
                          textAlign: "center",
                        }}
                      >
                        Please wait
                      </Text>
                    </View>
                  </View>
                )}

                {/* Toast notifications */}
                <View
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 100000,
                    elevation: 1100,
                    pointerEvents: "box-none",
                  }}
                >
                  <Toast />
                </View>
              </ThemeProvider>
            </OnboardingContext.Provider>
          </PersistGate>
        </Provider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
