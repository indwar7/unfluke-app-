# App Store Screenshots — Unfluke (iOS) · Premium set

Premium marketing screenshots rendered from HTML via headless Chrome. Style: "Onyx & Gold" —
warm gold aurora on near-black, gold eyebrow pill, big rounded headline + muted subhead, the real
in-app UI inside a gradient-lit device card with an iOS status bar + Dynamic Island, a faint
candlestick watermark, and an `unfluke` footer wordmark.

## What's here
- `premium-6_9/` — **1290 × 2796** (iPhone 6.9" slot) · 7 images, numbered 01–07
- `premium-6_5/` — **1242 × 2688** (iPhone 6.5" slot) · downscaled from 6.9" (aspect差 ≈ 0.15%, invisible)

Same set is on the Desktop in **"Unfluke App Store Screenshots"** (two subfolders).

## Upload order (App Store Connect uses the first 3 on the install sheet)
1. 01-fundamentals — Real fundamentals, at a glance
2. 02-charts       — Charts that just work
3. 03-scanner      — Scan for winning setups
4. 04-ai-analyst   — Your AI market analyst
5. 05-appearance   — Light or dark, your call
6. 06-light-mode   — Stunning in light mode too
7. 07-all-tools    — All your tools, one place

Upload the **6.9"** set (Apple auto-scales it down to fill 6.5"); the 6.5" set is a fallback.

## Privacy
The account name & email in shots 01 and 05 are masked (INVESTOR / "Unfluke Trader" /
trader@unfluke.in) — the personal values are not published.

## Regenerate
Requires headless Google Chrome + ImageMagick 7. Scripts live one level up in `appstore-assets/`:
- `premium-template.html` — parametric template (reads ?n= ?w= ?h=); edit captions/design here.
- `premium-render.sh` — hang-proof single render (old headless + kill-guard).
- `premium-render_all.sh` — renders all 7 at 6.9" and downscales each to 6.5".
Captures are cropped from `../playstore-assets/generated/screenshots/screenshot_N.png`
(crop `1080x1362+0+500` to drop the status bar), with cap_1/cap_5 privacy-masked before render.
