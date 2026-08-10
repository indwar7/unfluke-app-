// Telegram bot links, one place instead of scattered string literals.
//
// IMPORTANT: these are two DIFFERENT handles, and that is how the app has always
// behaved — activation opens `UnflukeAI_bot`, the profile screen's "open" button
// opens `unflukebotbot`. Almost certainly one of them is stale, and the website
// uses a third (`unflukeAI`), but which one is live is a product question, not a
// code question. Both are preserved exactly as-is so this refactor changes no
// behaviour; unify them once you have confirmed which bot is the real one.
//
// To unify: point both constants at the surviving handle. Nothing else changes.

/** Opened after a user submits their Telegram username on the activation screen. */
export const TELEGRAM_ACTIVATION_BOT_URL = "https://t.me/UnflukeAI_bot";

/** Opened by the "open in Telegram" button on the profile screen. */
export const TELEGRAM_PROFILE_BOT_URL = "https://t.me/unflukebotbot";
