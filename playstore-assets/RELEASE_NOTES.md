# Release Notes — Unfluke v2.0.0 (versionCode 25)

## Play Store "What's new" (short — max 500 chars)

```
Big premium refresh:
• Brand-new dashboard with a cleaner, more premium look
• Light & Dark themes — switch anytime from Profile
• Fundamentals: search any stock, see P/E, ROE, ROCE, Debt/Equity instantly
• Backtester & Scanner reliability fixes — results now load correctly
• Fundamentals P&L / Balance Sheet / Cash Flow tabs no longer crash
• Smoother navigation with a new bottom bar
• Many stability and crash fixes
```

## Full changelog (internal)

**New**
- Premium redesign across the app (gold/dark + clean light theme)
- In-app theme toggle (Light / Dark / System) in Profile — consistent everywhere
- Redesigned dashboard: greeting, Fundamentals search card (real P/E, ROE, ROCE, Debt/Eq), vertical feature cards with images, animated bottom navigation (Home / Scanner / AI Bot / Charts / Profile)

**Fixed (stability)**
- Logout no longer crashes the app
- Backtester: default strategies now load; backtest run + results/P&L display correctly (axios data-parsing fix, awaited submit, unique run id)
- Scanner: editing a saved alert no longer crashes; navigation targets corrected
- Fundamentals: P&L / Balance Sheet / Cash Flow / Quarterly / Key Ratios tabs no longer crash (React hooks-order fix)
- Pricing / Billing: crash + null-safety fixes
- Option Simulator: P&L calculation and null-safety fixes
- AI Bot: no crash on logout; graceful error + timeout when the chat service is unreachable (chat backend availability is server-side)

**Notes**
- versionCode 25, versionName 2.0.0, package in.unfluke.app (update — same signing key)
