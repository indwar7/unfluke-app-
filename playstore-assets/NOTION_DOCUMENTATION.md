# Unfluke App — Play Store Publication Progress

> **Status:** Production review in progress (vc12) — awaiting Google approval (3-7 days)
> **Last updated:** 15 May 2026

---

## Project Overview

**App Name:** Unfluke
**Package Name:** `in.unfluke.app`
**Platform:** Android (iOS pending)
**Category:** Finance / Trading
**Version:** 2.0.0
**Tech Stack:** React Native + Expo (SDK 54), Expo Router, TypeScript

**Developer Account:** Unfluke Organization (ID: 6357035038822422790)
**EAS Account:** `abhay1234578s-organization`

**App Description:** Algorithmic trading platform with strategy builder, backtesting (basic + advanced), live deployment, market simulator, and AI-powered chatbot for traders in Indian markets.

---

## Publication Timeline

### ✅ Phase 1: Account Setup (Pre-May 2026)
- Play Console organization account created
- DUNS number obtained
- Identity verifications completed:
  - Organization website verification (`unfluke.in`)
  - Phone number OTP verification

### ✅ Phase 2: Pre-Production Builds (13-14 May 2026)
- **vc6** — Initial test build, deployed to:
  - Internal Testing track
  - Closed Testing (Alpha) track
- Used for internal QA and tester feedback

### ✅ Phase 3: Production Submission Journey (15 May 2026)

#### Attempt 1 — vc7/vc8 (Failed)
- Attempted production build but `app.json` versionCode wasn't picked up
- Native `android/app/build.gradle` had hardcoded `versionCode 6`
- **Lesson learned:** Prebuilt Android folder overrides Expo managed config

#### Attempt 2 — vc9 (Build successful, withdrawn)
- Fixed versionCode sync between `app.json` and `build.gradle`
- AAB uploaded to Production track
- Discovered critical bug after upload → withdrawn from review

#### Attempt 3 — vc10 (Bug fix build, deployed to Internal Testing)
- **Critical bug identified:** "Custom Layout View" white screen on startup
- **Root cause:** Malicious/boilerplate `expo-web-view` package (v0.1.1)
- Package removed, replaced with `react-native-webview`
- Splash screen handoff improvement
- AAB tested locally — working
- Deployed to Internal Testing track (still active)

#### Attempt 4 — vc12 (Production submission — CURRENT) 🟡
- Final clean build with all fixes
- Submitted to Production track for Google review
- **Status:** In review (3-7 day window)
- Managed publishing ON (manual rollout after approval)

#### vc13/vc14 (Test builds, parallel)
- **vc13:** Built but couldn't deploy (EAS free plan monthly quota exhausted)
- **vc14:** Built locally via Gradle for manager-side direct APK testing
  - 127 MB APK saved at `~/Desktop/unfluke-v2.0.0-vc14.apk`
  - Debug-signed (cannot upload to Play Store)

---

## Critical Bugs Found & Fixed

### 🐛 Bug 1: "Custom Layout View" white screen on app launch

**Severity:** Critical — app was unusable, white screen with "Custom Layout View" text appeared right after splash.

**Investigation:**
1. Initially suspected `expo-dev-client` (dev launcher leak in production)
2. Source code grep found no matches for "Custom Layout View" in app code
3. `grep -rn "Custom Layout View" node_modules` revealed the source:
   - `node_modules/expo-web-view/android/src/main/res/layout/activity_new_sample.xml`
4. Examined the package:
   - Version: `0.1.1`
   - Description: `"My new module"` — clearly boilerplate template
   - Contained random files: `ScaleImageView.java`, `VimmUtils.java`
   - Native module code launched the Activity **on module load**:
     ```kotlin
     val intent = Intent(appContext.reactContext, ExpoWebView::class.java)
     intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
     appContext.reactContext?.startActivity(intent)
     ```
5. Only one usage in source: `components/BasicBacktester/MessageModal.tsx`

**Fix:**
- Removed `expo-web-view` from `package.json`
- Replaced import in `MessageModal.tsx` with the legitimate `react-native-webview` (already a dependency)
- Cleaned `node_modules/expo-web-view`
- Verified `package-lock.json` and Android autolinking generated files no longer reference the package

**Files changed:**
- `package.json`
- `package-lock.json`
- `components/BasicBacktester/MessageModal.tsx`

### 🐛 Bug 2: Splash screen disappearing too quickly

**Severity:** Minor — abrupt UX, splash flicker during native → JS handoff.

**Fix:**
- Added `expo-splash-screen` lifecycle control in `app/_layout.tsx`:
  ```tsx
  SplashScreen.preventAutoHideAsync().catch(() => {});
  ```
- Hide native splash only after JS splash mounts in `app/index.tsx`:
  ```tsx
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);
  ```
- Bumped JS splash duration from 2s to 2.5s

**Files changed:**
- `app/_layout.tsx`
- `app/index.tsx`

### 🐛 Other fixes (already in vc6, retained in vc12)

- Password field visibility on dark themes
- App icon and adaptive icon sizing
- AI chatbot connectivity (migrated to `https://edbot.unfluke.in`)
- Login persistence (no re-login on app restart)
- Top-level ErrorBoundary for crash recovery
- Global error handlers for unhandled promise rejections
- Removed development test credentials
- Centralized auth guard in `ScreenWithHeader`
- Refresh advanced backtester home on focus
- Sidebar nav: removed hardcoded `strategyId=123`

---

## Build & Release Tracks

### Production Track 🟡 (In Review)

| Field | Value |
|-------|-------|
| Version | `12 (2.0.0)` |
| Status | Changes in review |
| Submission date | 15 May 2026 |
| Expected approval | 18-22 May 2026 |
| Countries | 1 (India) |
| Managed publishing | ON (manual rollout after approval) |

**Release notes submitted:**
```
Bug fixes and improvements:
- Removed faulty webview module that caused stray "Custom Layout View" screen on startup
- Smoother app launch with refined splash screen handoff
- Fixed password field visibility on dark themes
- Fixed app icon and adaptive icon
- Fixed AI chatbot connectivity
- Fixed login persistence
- Improved error handling with top-level error boundary
- Security: removed development test credentials
```

### Internal Testing Track ✅ (Active)

| Field | Value |
|-------|-------|
| Version | `10 (2.0.0)` |
| Status | Available to internal testers |
| Released | 15 May 2026 17:04 |
| Max testers | 100 |
| Tester opt-in link | `https://play.google.com/apps/internaltest/4701599053344866967` |

### Closed Testing (Alpha) Track ✅ (Active)

| Field | Value |
|-------|-------|
| Version | `6 (2.0.0)` |
| Status | Available to alpha testers |
| Released | 13 May 2026 |

⚠️ **Note:** Alpha track is on the OLD vc6 build (has the Custom Layout View bug). Should be updated post-production launch.

### Local APK (Manager Testing)

| Field | Value |
|-------|-------|
| Version | `14 (2.0.0)` |
| File | `~/Desktop/unfluke-v2.0.0-vc14.apk` |
| Size | 127 MB |
| Signing | Debug-signed (NOT for Play Store) |
| Purpose | Direct sideload for manager review |

---

## Tech Decisions Log

### versionCode synchronization
- **Problem:** `app.json` versionCode was ignored because project has a native `android/` folder (prebuilt project pattern)
- **Solution:** Bump versionCode in **both** files:
  - `app.json` (`expo.android.versionCode`)
  - `android/app/build.gradle` (`defaultConfig.versionCode`)
- **Verification:** EAS build manifest shows `appBuildVersion` matching git commit

### Why EAS Cloud builds?
- Project uses native `android/` folder — local builds need full Android SDK, NDK, Java 17
- EAS handles signing keystore via `abhay1234578s-organization` account
- Free plan: 15 Android builds/month (exhausted by May 15)
- Production plan: $19/month — unlimited builds (recommended for future)

### Why direct APK fallback?
- Manager wanted to test latest fixes before Play Store approval (3-7 days)
- EAS free quota exhausted
- Local Gradle build chosen as $0 alternative (took 57 min on first build due to NDK compilation of react-native-reanimated)

---

## Play Console Setup Completed

- ✅ App access (test credentials provided for Google review)
- ✅ Ads declaration
- ✅ Content rating questionnaire
- ✅ Target audience (18+)
- ✅ News app: No
- ✅ COVID-19 contact tracing: No
- ✅ Data safety form
- ✅ Government app: No
- ✅ Financial features declaration (trading app)
- ✅ App icon (512×512)
- ✅ Feature graphic
- ✅ Phone screenshots
- ✅ Category: Finance
- ✅ Privacy policy hosted

---

## Outstanding Items

### Before Production Launch

- [ ] Wait for Google review approval (3-7 days from 15 May)
- [ ] Click "Start full rollout" on Production track when approved
- [ ] Verify Play Store listing appears correctly
- [ ] Monitor crash reports (first 48 hours critical)

### Post-Launch Improvements

- [ ] Update Closed Testing (Alpha) track from vc6 → latest (so testers stop hitting Custom Layout View bug)
- [ ] iOS submission via App Store Connect
- [ ] Address pre-existing TypeScript errors in codebase (~20+ in `app/login.tsx`, `app/otp-verification.tsx`, etc.)
- [ ] Audit other potentially suspicious packages (similar to expo-web-view)
- [ ] Set up Crashlytics or Sentry for production crash monitoring

### Monitoring Plan

- Check Play Console Vitals daily for first week
- Monitor crash-free user rate (target: >99%)
- Watch for negative reviews / 1-star reviews citing specific bugs
- ANR (App Not Responding) rate

---

## Key Files & Paths

| Item | Path |
|------|------|
| App config | `app.json` |
| Native Android config | `android/app/build.gradle` |
| EAS config | `eas.json` |
| Production AAB (vc12) | Uploaded to Play Console |
| Test APK (vc14) | `~/Desktop/unfluke-v2.0.0-vc14.apk` |
| Play Store assets | `playstore-assets/` |
| Icon archives | `.archive/icon-originals/` |
| Privacy policy | `playstore-assets/PRIVACY_POLICY.md` |
| Terms of service | `playstore-assets/TERMS_OF_SERVICE.md` |
| Store listing copy | `playstore-assets/STORE_LISTING.md` |
| Data handling policy | `playstore-assets/DATA_HANDLING_POLICY.md` |
| Screenshots guide | `playstore-assets/SCREENSHOTS_GUIDE.md` |
| Publish checklist | `playstore-assets/PUBLISH_CHECKLIST.md` |

---

## Git History (Relevant Commits)

```
fdb8751 - bump versionCode 13 → 14 for local APK test build
3da9b26 - bump versionCode 12 → 13 for closed testing build
a369738 - bump versionCode 11 → 12 for final production submission
f809eeb - bump versionCode 10 → 11
391f989 - remove malicious expo-web-view, polish splash, bump to vc10
9a861f9 - bump versionCode to 9 and add play store assets
78a5e8b - add top-level error boundary and global error handlers
47870e6 - drop hardcoded strategyId=123 from sidebar nav
407d565 - refresh advanced backtester home on focus
288ce1e - centralize auth guard in ScreenWithHeader
ec739f7 - forward backend-issued verification token to reset-password
```

**Branch:** `newtest`
**Repo:** https://github.com/indwar7/unfluke-app-

---

## Lessons Learned

1. **Always inspect node_modules for suspicious packages.** `expo-web-view` v0.1.1 was a boilerplate template that shipped a stray Android Activity launching on module load. Description "My new module" should have raised flags. Likely added via `npx create-expo-module` and accidentally committed.

2. **Prebuilt Android projects need manual versionCode sync.** When the project has an `android/` folder, Expo's `app.json` is decorative — the native `build.gradle` is the source of truth.

3. **versionCode is global per app on Play Console.** Once a versionCode is uploaded to ANY track (Internal/Alpha/Beta/Production), it can never be reused. Always bump generously.

4. **"Managed publishing" gives you a final manual gate.** Strongly recommended for first production releases — even after Google approves, you control when the app goes live.

5. **EAS free plan = 15 Android builds/month.** Budget for upgrade ($19/month) during active development phases to avoid blockers.

6. **Local builds are slow but free.** First-time local Gradle build of an Expo project: ~57 minutes (most spent on NDK compilation of react-native-reanimated). Subsequent builds: ~5-10 min.

---

## Next Session Action Items

1. **Today/Tomorrow:** Manager tests app via Internal Testing link or direct APK (~/Desktop/unfluke-v2.0.0-vc14.apk)
2. **Within 7 days:** Google approves vc12 Production submission
3. **On approval:** Click "Start full rollout" in Play Console
4. **Day 1 post-launch:** Monitor Play Console Vitals dashboard
5. **Week 1:** Address any user-reported issues, prepare vc15 if hotfixes needed

---

*Documentation maintained alongside `playstore-assets/PUBLISH_CHECKLIST.md` and updated per major milestone.*
