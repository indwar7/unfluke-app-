// Telegram bot links, one place instead of scattered string literals.
//
// Unified 2026-08-11 onto the one handle that resolves to a real bot.
//
// The app previously used two different handles: `UnflukeAI_bot` on the
// activation screen and `unflukebotbot` on the profile screen. Checking both:
// t.me/UnflukeAI_bot renders as "Launch @UnflukeAI_bot" with the display name
// "UnflukeAIBot" and a Start Bot action — a registered bot. t.me/unflukebotbot
// renders only as "Contact @unflukebotbot" with no display name and a plain
// Send Message action, which is what Telegram shows for a handle that is not a
// live bot.
//
// Why this matters beyond a dead button: linking out to an unverified messaging
// handle is the "redirects users to an unverified communication domain" pattern
// that malware scanners weight, and it is the kind of signal that is hard to
// explain away during an appeal. A link that goes nowhere is pure downside.
//
// The website uses a third handle (`unflukeAI`). Confirm which bot is really
// live in production and point everything — app and site — at that one.

/** The single Unfluke Telegram bot. Verified to resolve to a registered bot. */
export const TELEGRAM_ACTIVATION_BOT_URL = "https://t.me/UnflukeAI_bot";

/** Profile screen's "open in Telegram" button — same bot as activation. */
export const TELEGRAM_PROFILE_BOT_URL = TELEGRAM_ACTIVATION_BOT_URL;
