import { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function IndexScreen() {
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (isNavigating) return;

    const checkAndRedirect = async () => {
      try {
        setIsNavigating(true);
        const hasCompleted = await AsyncStorage.getItem("hasCompletedOnboarding");

        // Show splash for 2 seconds before navigating
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (hasCompleted === "true") {
          router.replace("/dashboard");
        } else {
          router.replace("/login");
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        router.replace("/login");
      }
    };

    checkAndRedirect();
  }, [isNavigating]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/splash.png')}
        style={styles.splashImage}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  splashImage: {
    width: width * 0.7,
    height: height * 0.4,
  },
});