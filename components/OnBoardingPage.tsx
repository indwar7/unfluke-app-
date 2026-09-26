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

// The eight dashboard research tools in dashboard order, then five Market
// Terminal screens. `bg` is the
// slide's average pastel (fills letterbox bands on wide screens); `deep` is
// its ink colour, used for Skip / dots / Next so the controls match each slide.
const SLIDES = [
  { src: require("../assets/onboarding/01.jpg"), bg: "#7595C3", deep: "#182656" }, // AI-Bot
  { src: require("../assets/onboarding/02.jpg"), bg: "#5EA292", deep: "#123636" }, // Scanner
  { src: require("../assets/onboarding/03.jpg"), bg: "#BE9667", deep: "#3A2016" }, // Time Based Backtest
  { src: require("../assets/onboarding/04.jpg"), bg: "#8AA86A", deep: "#203416" }, // Indicator Backtest
  { src: require("../assets/onboarding/05.jpg"), bg: "#7E72B7", deep: "#201A48" }, // Option Simulator
  { src: require("../assets/onboarding/06.jpg"), bg: "#B9806D", deep: "#261C40" }, // Historical Charts
  { src: require("../assets/onboarding/07.jpg"), bg: "#6EA2B7", deep: "#142E42" }, // Strategy Charts
  { src: require("../assets/onboarding/08.jpg"), bg: "#B07387", deep: "#341636" }, // Fundamentals
  { src: require("../assets/onboarding/09.jpg"), bg: "#A86C81", deep: "#331834" }, // Market Movers
  { src: require("../assets/onboarding/10.jpg"), bg: "#689BB1", deep: "#112B3B" }, // Open Interest
  { src: require("../assets/onboarding/11.jpg"), bg: "#BC7A62", deep: "#251736" }, // Most Active
  { src: require("../assets/onboarding/12.jpg"), bg: "#8373B9", deep: "#271C4B" }, // Derivatives + Reference
  { src: require("../assets/onboarding/13.jpg"), bg: "#89AA67", deep: "#203916" }, // Index History
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
// slides decodes on demand and flashes blank behind the controls.
function usePreloadedSlides() {
  useEffect(() => {
    SLIDES.forEach(({ src }) => {
      const uri = Image.resolveAssetSource(src)?.uri;
      if (uri) Image.prefetch(uri).catch(() => {});
    });
  }, []);
}

// Every slide is 1300x2900 with its content inside rows ART_TOP..ART_BOTTOM
// and plain pastel margin around it.
const ART_W = 1300;
const ART_H = 2900;
const ART_TOP = 524;
const ART_BOTTOM = 2044;

// Place the artwork so it fills the screen like `cover` does, then check the
// content band actually lands in the gap between Skip and the footer. On a
// short phone (e.g. 360x640 with a 3-button nav bar) cover alone would push
// the content under the dots, so the art is scaled down just enough to fit;
// on a tablet the same rule keeps it readable instead of cropping it. Any
// area the image no longer reaches shows the slide's own pastel `bg`.
function slideLayout(width: number, height: number, safeTop: number, safeBottom: number) {
  const cover = Math.max(width / ART_W, height / ART_H);
  const fit = (safeBottom - safeTop) / (ART_BOTTOM - ART_TOP);
  const s = Math.min(cover, fit);
  const w = ART_W * s;
  const h = ART_H * s;
  const centred = (safeTop + safeBottom) / 2 - ((ART_TOP + ART_BOTTOM) / 2) * s;
  // Prefer an edge-to-edge fill: pull the art back until it covers the top and
  // bottom of the screen, as long as the content still clears the controls.
  let top = centred;
  if (h >= height) {
    const clamped = Math.min(0, Math.max(height - h, centred));
    const contentTop = clamped + ART_TOP * s;
    const contentBottom = clamped + ART_BOTTOM * s;
    if (contentTop >= safeTop && contentBottom <= safeBottom) top = clamped;
  }
  return { width: w, height: h, left: (width - w) / 2, top };
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
  // Measured rather than assumed, so large system font sizes and different
  // nav-bar heights still leave the content clear of the controls.
  const [skipH, setSkipH] = useState(40);
  const [footerH, setFooterH] = useState(132 + insets.bottom);
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

  const safeTop = insets.top + 12 + skipH + 12;
  const safeBottom = height - footerH - 8;
  const art = slideLayout(width, height, safeTop, safeBottom);

  const theme = SLIDES[index];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
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
        {SLIDES.map(({ src, bg }, i) => (
          <View key={i} style={{ width, height, backgroundColor: bg, overflow: "hidden" }}>
            <Image
              source={src}
              style={{ position: "absolute", ...art }}
              resizeMode="stretch"
              fadeDuration={0}
            />
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.skipButton, { top: insets.top + 12, backgroundColor: theme.deep }]}
        onLayout={(e) => setSkipH(e.nativeEvent.layout.height)}
        onPress={finishOnce}
        activeOpacity={0.85}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="button"
        accessibilityLabel="Skip onboarding"
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}
        onLayout={(e) => setFooterH(e.nativeEvent.layout.height)}
      >
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
              <View style={[styles.dot, i === index && [styles.dotActive, { backgroundColor: theme.deep }]]} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: theme.deep }]}
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

// Background, Skip, active dot and Next take each slide's own colours (set
// inline from SLIDES), so only shape and type live here.
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: "absolute",
    minHeight: 40,
    justifyContent: "center",
    right: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  skipText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    // Fixed height keeps the row from reflowing as the active dot widens.
    height: 16,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.6)",
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
  },
  nextButton: {
    alignSelf: "stretch",
    paddingVertical: 17,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
