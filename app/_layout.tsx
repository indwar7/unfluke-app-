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
import * as SplashScreen from "expo-splash-screen";

// Prevent the splash screen from auto-hiding before app is ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const slideAnim = useRef(new Animated.Value(-width * 0.3)).current;
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check if user has completed onboarding on app start
  const checkOnboardingStatus = async () => {
    try {
      const hasCompleted = await AsyncStorage.getItem("hasCompletedOnboarding");
      setShowOnboarding(hasCompleted !== "true");
      console.log("Onboarding status:", hasCompleted !== "true");
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setShowOnboarding(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Hide splash screen when app is ready
  const onLayoutRootView = useCallback(async () => {
    if (!isLoading) {
      // This tells the splash screen to hide immediately
      await SplashScreen.hideAsync();
    }
  }, [isLoading]);

  useEffect(() => {
    checkOnboardingStatus();
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

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#ffffff" }}>
        <ActivityIndicator size="large" color="#4A9782" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} onLayout={onLayoutRootView}>
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
                  // Onboarding stack with expo router
                  <Stack screenOptions={{ headerShown: false }} />
                ) : (
                  // Main app stack with navbar and sidebar
                  <View style={{ flex: 1 }}>
                    <View style={{ zIndex: 1000 }}>
                      <NavbarLayout setMenuVisible={setMenuVisible} />
                    </View>
                    <Stack screenOptions={{ headerShown: false }} />
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
