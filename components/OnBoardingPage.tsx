import { useRef, useState } from "react";
import {
  Image,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { logCompleteTutorial } from "../helpers/facebookEvents";

// Ascending order per source filenames in ~/Downloads (1,2,3,5,8,9,11,12 — the
// batch skips some numbers, but "ascending" means sorted by that number, not
// that every integer is present).
const SLIDES = [
  require("../assets/onboarding/01.png"),
  require("../assets/onboarding/02.png"),
  require("../assets/onboarding/03.png"),
  require("../assets/onboarding/04.png"),
  require("../assets/onboarding/05.png"),
  require("../assets/onboarding/06.png"),
  require("../assets/onboarding/07.png"),
  require("../assets/onboarding/08.png"),
];

export const ONBOARDING_VERSION_KEY = "onboardingSeenForVersion";

export async function markOnboardingSeen() {
  try {
    const version = Constants.expoConfig?.version ?? "unknown";
    await AsyncStorage.setItem(ONBOARDING_VERSION_KEY, version);
  } catch {}
}

async function finishOnboarding() {
  logCompleteTutorial(true, "onboarding");
  await markOnboardingSeen();
  const [accessToken, authUser] = await Promise.all([
    AsyncStorage.getItem("access"),
    AsyncStorage.getItem("authUser"),
  ]);
  router.replace(accessToken && authUser ? "/dashboard" : "/login");
}

export const OnBoardingPage = () => {
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const isLast = index === SLIDES.length - 1;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(next);
  };

  const handleNext = () => {
    if (isLast) {
      finishOnboarding();
      return;
    }
    scrollRef.current?.scrollTo({ x: width * (index + 1), animated: true });
    setIndex(index + 1);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {SLIDES.map((src, i) => (
          <Image
            key={i}
            source={src}
            style={{ width, height }}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={finishOnboarding}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {isLast ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  skipButton: {
    position: "absolute",
    top: 56,
    right: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  skipText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    marginBottom: 20,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: "#fff",
    width: 20,
  },
  nextButton: {
    backgroundColor: "#3F5189",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: 280,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
