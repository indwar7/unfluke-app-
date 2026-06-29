import { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUserFromStorage } from '../redux/Unfluke_slices/auth/login/reducer';
import { useTheme } from '../constants/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function IndexScreen() {
  const [isNavigating, setIsNavigating] = useState(false);
  const dispatch = useDispatch();
  const { colors: c } = useTheme();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (isNavigating) return;

    const checkAndRedirect = async () => {
      try {
        setIsNavigating(true);
        const accessToken = await AsyncStorage.getItem("access");
        const authUser = await AsyncStorage.getItem("authUser");

        await new Promise(resolve => setTimeout(resolve, 2500));

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
        style={styles.splashImage}
        resizeMode="contain"
      />
      <ActivityIndicator
        size="small"
        color={c.gold}
        style={styles.spinner}
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
  splashImage: {
    width: width * 0.7,
    height: height * 0.4,
  },
  spinner: {
    position: 'absolute',
    bottom: height * 0.12,
  },
});