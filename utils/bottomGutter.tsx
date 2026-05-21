import { Dimensions, Platform, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";

// Android edge-to-edge mode draws the app under the system nav bar. Inside an
// RN Modal, useSafeAreaInsets() returns 0 because Modal renders outside the
// SafeAreaProvider tree. We measure the nav bar by subtracting the visible
// window height from the full screen height.
//
// Use cases:
//   • Bottom-sheet style Modal: put `paddingBottom: useBottomGutter()` on the
//     overlay so the whole sheet is pushed above the nav bar.
//   • Sticky bottom buttons inside a normal screen: use this on the button
//     container (or wrap with <BottomGutter />).
//   • ScrollView content: append `paddingBottom: useBottomGutter()` so the
//     last items aren't clipped by the nav bar.
export const getAndroidBottomNavHeight = (): number => {
  if (Platform.OS !== "android") return 0;
  const screen = Dimensions.get("screen");
  const window = Dimensions.get("window");
  const statusBar = StatusBar.currentHeight || 0;
  const diff = screen.height - window.height - statusBar;
  // diff > 0 means there's a real opaque nav bar; otherwise use a sensible
  // floor for gesture-bar phones so taps near the bottom don't get clipped.
  return diff > 0 ? Math.max(diff, 24) : 48;
};

// Returns the max of the SafeAreaProvider inset and the measured nav bar
// height. Safe to call inside Modal — falls back to the measured value when
// insets are unavailable.
export const useBottomGutter = (): number => {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, getAndroidBottomNavHeight());
};

// Drop-in spacer that reserves exactly the nav-bar gutter. Useful at the end
// of a ScrollView or below a sticky button row.
export const BottomGutter: React.FC<{ extra?: number }> = ({ extra = 0 }) => {
  const gutter = useBottomGutter();
  return <View style={{ height: gutter + extra }} />;
};
