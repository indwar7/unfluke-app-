import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function IndexScreen() {
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Prevent multiple navigations
    if (isNavigating) return;

    const checkAndRedirect = async () => {
      try {
        setIsNavigating(true);
        const hasCompleted = await AsyncStorage.getItem("hasCompletedOnboarding");

        // Small delay to ensure navigation is ready in production builds
        await new Promise(resolve => setTimeout(resolve, 100));

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

  // Show a loading indicator instead of null to prevent "Custom Layout View"
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4A9782" />
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
});