// Unfluke Pro — Reveal: a fail-safe entrance animation wrapper.
// Content is ALWAYS rendered/visible; the animation only nudges opacity/offset
// as a bonus. If the animation never runs, content still shows (never blank).

import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle, StyleProp, Easing } from "react-native";

export const Reveal: React.FC<{
  children: React.ReactNode;
  index?: number;
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
}> = ({ children, index = 0, delay = 0, distance = 14, style }) => {
  // Start near-visible (0.001 -> animates to 1). Even if the animation is
  // interrupted it's effectively visible; we never gate content behind it.
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.timing(progress, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, delay + index * 70);
    return () => clearTimeout(t);
  }, []);

  const opacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 1], // never fully invisible
  });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [distance, 0],
  });

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
};

export default Reveal;
