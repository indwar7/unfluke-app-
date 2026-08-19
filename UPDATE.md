# 2026-08-19 Release Update — v2.1.10

## Background

Play Vitals was showing a 3.2% crash rate flagged as high. Investigation traced every
crash entry to versionCode 44 (2.1.7) — an app version that predates the picker crash
fix already shipped in versionCode 46/47 (2.1.9, commit `0e1238b`, 2026-08-13). This
confirmed the 86%-of-crashes picker bug (`@react-native-picker/picker` 2.11.1 on RN
0.81 + new arch, see memory `unfluke-picker-crash-root-cause`) is fixed and live; the
elevated dashboard number was adoption lag (staged rollout % ≠ device install %), not
a regression.

Given the release was already due, this cycle bundled: a pre-flight audit of crash
risks / deprecated APIs / malware-policy items, a versionCode bump, and a fix for an
advertising ID permission gap surfaced by Play Console during upload.

## What changed

### 1. Pre-release audit (no code changes required, confirmed clean)
- Picker fix (`2.11.4`) still pinned in `package.json` / `yarn.lock`, no stray
  overrides.
- No deprecated RN/Android APIs in use (`ProgressBarAndroid`, legacy lifecycle
  methods, misrouted `AsyncStorage` imports — all clear).
- `usesCleartextTraffic="false"` still set, no `t.me` intent filters reintroduced,
  Telegram link still points at the live bot (`UnflukeAI_bot`), `expo-dev-client`
  still excluded from autolinking.
- R8/proguard keep rules (Nitro/IAP, async-storage) still present and look complete —
  **still not verified by an actual device install**, carried over as an open item.

### 2. Dead code removed
- `components/fundamentals/DataTabs 2.tsx` and `FinancialTabs 2.tsx` deleted — macOS
  "keep both" duplicate files, unreferenced by any import, contained a stale
  module-scope `Dimensions.get("window")` call (the same rotation-crash pattern
  already fixed in the real, imported components via `useWindowDimensions()`).

### 3. Advertising ID permission fix
Play Console blocked the release upload with:
> Your advertising ID declaration says your app uses advertising ID. A manifest file
> in one of your active artifacts doesn't include the
> `com.google.android.gms.permission.AD_ID` permission.

Root cause: `app/_layout.tsx` unconditionally starts Facebook SDK advertiser-ID
collection on Android (`Settings.setAdvertiserIDCollectionEnabled(advertiserIdAllowed)`,
called with `true` on Android, gated by ATT consent only on iOS) — so the app
genuinely does read the advertising ID for Meta ad-attribution/App Events. The
manifest never declared the permission needed to actually do that, meaning Android
was silently zeroing out the ID even though the SDK call succeeded. Not a policy
scanner false-positive — a real broken-attribution bug.

Fix: added `<uses-permission android:name="com.google.android.gms.permission.AD_ID"/>`
to `android/app/src/main/AndroidManifest.xml`. Verified present in the built
`.aab`'s compiled manifest directly (extracted `base/manifest/AndroidManifest.xml`
from the bundle and confirmed the permission string is embedded).

Play Console's advertising ID declaration form was set to: **Yes**, used for
**Advertising or marketing** + **Analytics** only (the only real use in the code —
Meta SDK app-events/attribution). Release-blocking errors left **on**.

Note: this permission gap is unrelated to the separate Google Ads account malware
suspension (see memory `google-ads-malware-suspension`) — a missing `AD_ID`
permission means *less* data is collected, not more, so it doesn't fit a malware
scanner's trigger profile. That investigation still points at `unfluke.in` (the
website), not the app binary.

## Version history this cycle

| versionCode | versionName | Change |
|---|---|---|
| 47 | 2.1.9 | Prior release — picker fix (2.11.1→2.11.4), R8 enabled, expo-dev-client excluded, orientation lock removed, Telegram link fix. Already live in production, fully rolled out. |
| 50 | 2.1.10 | This cycle's first build — dead file cleanup only, no functional change. Superseded before upload due to AD_ID gap. |
| 51 | 2.1.10 | **Current build** — adds `AD_ID` permission fix. This is the artifact intended for the production release. |

## Still open / not yet verified

- **R8/minification** has never been confirmed via an actual device install. Before
  rollout: test a real purchase (`react-native-iap` v15 on Nitro, JNI name-based
  binding — silent failure mode if a keep rule is wrong), both chart screens, the
  backtester, and rotation on chart/table screens.
- **Orientation unlock** (removed `android:screenOrientation="portrait"` from
  `MainActivity`) — also unverified on a device.
- Recommend a staged rollout (20-50%) rather than 100% immediately, given both of the
  above are shipping to production for the first time.
