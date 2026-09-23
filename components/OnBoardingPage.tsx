import { useCallback, useEffect, useRef, useState } from "react";
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

// Decode every slide up front. Without this the first swipe onto each of the
// eight ~1.5MB PNGs decodes on demand and flashes blank behind the controls.
function usePreloadedSlides() {
  useEffect(() => {
    SLIDES.forEach((src) => {
      const uri = Image.resolveAssetSource(src)?.uri;
      if (uri) Image.prefetch(uri).catch(() => {});
    });
  }, []);
}

export const OnBoardingPage = () => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  // Mirrors `index` for handlers that must read the live value synchronously:
  // two taps in the same tick both see the pre-update state otherwise, so fast
  // Next taps would target the same slide twice.
  const indexRef = useRef(0);
  const isDraggingRef = useRef(false);
  const finishingRef = useRef(false);
  const isLast = index === SLIDES.length - 1;

  usePreloadedSlides();

  const setIndexSafely = useCallback((i: number) => {
    indexRef.current = i;
    setIndex(i);
  }, []);

  // router.replace is async, so an impatient double-tap on Skip or Get Started
  // fires the whole finish path twice — duplicate analytics and a double nav.
  const finishOnce = useCallback(() => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    finishOnboarding().catch(() => {
      finishingRef.current = false;
    });
  }, []);

  const syncIndexFromOffset = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(e.nativeEvent.contentOffset.x / width);
      const clamped = Math.max(0, Math.min(SLIDES.length - 1, next));
      if (clamped !== indexRef.current) setIndexSafely(clamped);
    },
    [width, setIndexSafely],
  );

  const goTo = useCallback(
    (i: number) => {
      const target = Math.max(0, Math.min(SLIDES.length - 1, i));
      scrollRef.current?.scrollTo({ x: width * target, animated: true });
      setIndexSafely(target);
    },
    [width, setIndexSafely],
  );

  const handleNext = useCallback(() => {
    if (indexRef.current >= SLIDES.length - 1) {
      finishOnce();
      return;
    }
    goTo(indexRef.current + 1);
  }, [goTo, finishOnce]);

  // A dot tapped mid-drag would fight the user's finger; ignore it until the
  // gesture ends.
  const handleDotPress = useCallback(
    (i: number) => {
      if (isDraggingRef.current) return;
      goTo(i);
    },
    [goTo],
  );

  // On rotation the page width changes but the scroll offset doesn't, leaving
  // the list parked between two slides. Re-anchor to the current index.
  useEffect(() => {
    scrollRef.current?.scrollTo({ x: width * indexRef.current, animated: false });
  }, [width]);

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
        onScrollBeginDrag={() => {
          isDraggingRef.current = true;
        }}
        // A short flick can settle without ever firing a momentum event, so
        // sync on both — otherwise the dots silently drift out of step.
        onScrollEndDrag={(e) => {
          isDraggingRef.current = false;
          syncIndexFromOffset(e);
        }}
        onMomentumScrollEnd={syncIndexFromOffset}
        scrollEventThrottle={16}
        decelerationRate="fast"
        bounces={false}
        overScrollMode="never"
      >
        {SLIDES.map((src, i) => (
          <View key={i} style={{ width, height }}>
            <Image
              source={src}
              style={{ width, height: height - footerHeight }}
              resizeMode="contain"
              fadeDuration={0}
            />
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.skipButton, { top: insets.top + 12 }]}
        onPress={finishOnce}
        activeOpacity={0.85}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="button"
        accessibilityLabel="Skip onboarding"
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleDotPress(i)}
              // Dots are 7px wide; the slop is what makes them actually
              // tappable rather than a pixel-hunt.
              hitSlop={{ top: 14, bottom: 14, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={`Go to slide ${i + 1} of ${SLIDES.length}`}
            >
              <View style={[styles.dot, i === index && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={isLast ? "Get started" : "Next slide"}
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
    alignItems: "center",
    // Fixed height keeps the row from reflowing as the active dot widens.
    height: 16,
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
