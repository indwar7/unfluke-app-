import { useEffect, useState } from 'react';
import { View, Image, StyleSheet, useWindowDimensions, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { setUserFromStorage } from '../redux/Unfluke_slices/auth/login/reducer';
import { useTheme } from '../constants/ThemeContext';
import { ONBOARDING_VERSION_KEY } from '../components/OnBoardingPage';

export default function IndexScreen() {
  const [isNavigating, setIsNavigating] = useState(false);
  const dispatch = useDispatch();
  const { colors: c } = useTheme();
  // Read per-render: a module-scope Dimensions.get() is captured once and would
  // leave the splash art sized for the wrong orientation after a rotation.
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (isNavigating) return;

    const checkAndRedirect = async () => {
      try {
        setIsNavigating(true);

        // Ensure the market header key ("mkt") always exists so the axios
        // interceptor sends a `mrkt` header from the very first request. The
        // selected market (appType) is persisted in redux (Layout slice), but
        // the interceptor reads AsyncStorage, so keep the two in sync: if the
        // persisted Layout has a market, mirror it into "mkt"; otherwise default
        // to India ("in", = appTypes.IND). Switching later via changeAppType()
        // updates "mkt" itself.
        try {
          const existingMkt = await AsyncStorage.getItem("mkt");
          if (!existingMkt) {
            let persistedMkt: string | null = null;
            const persistedRoot = await AsyncStorage.getItem("persist:root");
            if (persistedRoot) {
              const root = JSON.parse(persistedRoot);
              if (root?.Layout) {
                const layout = JSON.parse(root.Layout);
                if (layout?.appType) persistedMkt = layout.appType;
              }
            }
            await AsyncStorage.setItem("mkt", persistedMkt || "in");
          }
        } catch (mktErr) {
          console.error("Failed to hydrate market header:", mktErr);
        }

        const accessToken = await AsyncStorage.getItem("access");
        const authUser = await AsyncStorage.getItem("authUser");

        await new Promise(resolve => setTimeout(resolve, 2500));

        // First install (nothing stored yet) or after an update (stored value
        // doesn't match the running app's version) both show onboarding once.
        const currentVersion = Constants.expoConfig?.version ?? "unknown";
        const seenForVersion = await AsyncStorage.getItem(ONBOARDING_VERSION_KEY);
        if (seenForVersion !== currentVersion) {
          router.replace("/onboardingpage");
          return;
        }

        if (accessToken && authUser) {
          try {
            const parsedUser = JSON.parse(authUser);
            dispatch(setUserFromStorage(parsedUser));
          } catch (parseErr) {
            console.error("Failed to parse stored authUser:", parseErr);
            await AsyncStorage.removeItem("authUser");
            await AsyncStorage.removeItem("access");
            router.replace("/login");
            return;
          }
          router.replace("/dashboard");
        } else {
          router.replace("/login");
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        router.replace("/login");
      }
    };

    checkAndRedirect();
  }, [isNavigating]);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Image
        source={require('../assets/splash.png')}
        style={[styles.splashImage, { width: width * 0.7, height: height * 0.4 }]}
        resizeMode="contain"
      />
      <ActivityIndicator
        size="small"
        color={c.gold}
        style={[styles.spinner, { bottom: height * 0.12 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Width/height and the spinner offset are applied inline at the call site —
  // they depend on the live window size, which a module-scope StyleSheet cannot see.
  splashImage: {},
  spinner: {
    position: 'absolute',
  },
});