# Screenshots Guide — Unfluke Play Store

## Requirements
- **Minimum**: 2 screenshots
- **Maximum**: 8 screenshots
- **Phone aspect ratio**: 16:9 to 9:16 (portrait recommended)
- **Min dimension**: 320px shortest side
- **Max dimension**: 3840px longest side
- **Format**: PNG or JPEG

## Recommended screens to capture (in order)

1. **Dashboard / Home** — first impression, shows overall product
2. **Option Simulator** — flagship feature, with strategy chart and results visible
3. **Advanced Backtester** — strategy list / saved strategies
4. **Strategy Charts** — payoff diagram with Greeks
5. **Scanner** — stock screener with filters
6. **Fundamental Analysis** — DuPont / financial ratios
7. **Notifications / Alerts** — telegram alerts setup
8. **Login / Signup screen** — only if visually distinctive

## How to capture

### On Android phone (running the app):
1. Hold **Power + Volume Down** simultaneously
2. Screenshots saved to Photos / Gallery

### Alternative: from Mac with USB
```
adb exec-out screencap -p > screenshot.png
```

## After capturing
1. Save to: `/Users/abhayindwar/Documents/unfluke-app-/playstore-assets/screenshots/`
2. Name them: `01-dashboard.png`, `02-simulator.png`, etc.
3. Crop to remove status bar if it shows debugging info or low battery

## Optional: device frame
For a more polished look, you can frame screenshots in a phone mockup using:
- https://mockup.photos/ (free, browser)
- https://screenshot.rocks/
- Figma / Photoshop

Not required by Google but improves listing CTR.

## Feature graphic (1024 × 500)
Required separately. Create a banner showing:
- App name "Unfluke"
- Tagline: "Backtest. Simulate. Trade Smart."
- Background: dark gradient with chart/candlestick visual
- Logo

Tools: Canva (free templates), Figma, Photoshop.
Save as: `/playstore-assets/feature-graphic.png`
