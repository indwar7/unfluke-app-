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
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const isLast = index === SLIDES.length - 1;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(next);
  };

  const goTo = (i: number) => {
    scrollRef.current?.scrollTo({ x: width * i, animated: true });
    setIndex(i);
  };

  const handleNext = () => {
    if (isLast) {
      finishOnboarding();
      return;
    }
    goTo(index + 1);
  };

  // Controls sit above the artwork, so reserve room for them: the slides are
  // full-bleed 9:16 graphics with their content baked in, and `contain` keeps
  // the whole frame visible instead of cropping edges off on taller/wider
  // devices the way `cover` did.
  const footerHeight = 132 + insets.bottom;

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
          <View key={i} style={{ width, height }}>
            <Image
              source={src}
              style={{ width, height: height - footerHeight }}
              resizeMode="contain"
            />
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.skipButton, { top: insets.top + 12 }]}
        onPress={finishOnboarding}
        activeOpacity={0.85}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => goTo(i)}
              hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
            >
              <View style={[styles.dot, i === index && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>
            {isLast ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Onboarding always renders on the dark artwork regardless of device theme,
// so it pins the dark-theme tokens from constants/Colors.ts rather than
// reading useTheme() — the gold accent and near-black canvas are the app's
// documented dark identity.
const GOLD = "#E9C46A";
const ON_GOLD = "#15110A";
const CANVAS = "#0A0B0E";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Matches the app's dark canvas so the letterboxed bands `contain` leaves
    // on differently-proportioned screens blend in.
    backgroundColor: CANVAS,
  },
  skipButton: {
    position: "absolute",
    right: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: GOLD,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  skipText: {
    color: ON_GOLD,
    fontSize: 14.5,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    marginBottom: 18,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.32)",
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: GOLD,
    width: 22,
  },
  nextButton: {
    backgroundColor: GOLD,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 14,
    width: 280,
    alignItems: "center",
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  nextButtonText: {
    color: ON_GOLD,
    fontSize: 16.5,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
