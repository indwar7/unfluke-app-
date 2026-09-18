// Guards for handing a URL to the OS.
//
// Policy context: Google classifies "redirecting users to an unknown site
// without the user actually clicking" as malicious behaviour. Anywhere the app
// calls Linking.openURL with a URL it did not construct itself — a payment
// gateway's redirect, a link in backend-supplied content — is a place where a
// third party chooses where the user's device navigates. These helpers narrow
// that to what each call site actually needs.

/**
 * Schemes the checkout page must never be able to launch.
 *
 * This is a DENYLIST on purpose. An allowlist of UPI schemes would be tighter,
 * but India has a long tail of bank and PSP apps (every bank ships its own UPI
 * handle scheme), and a scheme missing from the list would silently kill a real
 * payment. Failing open protects revenue; the policy concern is specifically
 * being redirected into a messaging app or store page without asking, and that
 * is exactly what this blocks.
 */
const BLOCKED_HANDOFF_SCHEMES = new Set([
  "tg",
  "telegram",
  "whatsapp",
  "fb",
  "fb-messenger",
  "messenger",
  "instagram",
  "twitter",
  "snapchat",
  "market", // Play Store listing
  "amzn",
  "sms",
  "mms",
]);

/** Leading scheme of a URL, lowercased. "" when there isn't one. */
export function schemeOf(url: string): string {
  const match = /^([a-z][a-z0-9+.\-]*):/i.exec(url || "");
  return match ? match[1].toLowerCase() : "";
}

/** http / https only — safe to hand to a browser. */
export function isWebUrl(url: string): boolean {
  const scheme = schemeOf(url);
  return scheme === "http" || scheme === "https";
}

/**
 * `originWhitelist` for the chart WebViews.
 *
 * `blob:` is NOT optional. The TradingView standalone library renders the chart
 * in an iframe whose src is a blob URL (it builds the frame's HTML in JS, wraps
 * it in a Blob and calls URL.createObjectURL). On iOS every frame — including
 * that one — goes through WKWebView's decidePolicyForNavigationAction, so the
 * whitelist sees it; on Android blob iframes never reach shouldOverrideUrlLoading.
 * That is why a whitelist of just ["https://*"] renders fine on Android and
 * hangs on a permanent spinner on iPhone.
 *
 * Note the shape: react-native-webview's extractOrigin() reduces
 * "blob:https://unfluke.in/<uuid>" to the literal string "blob:https:", so the
 * entry has to be scheme-only — "blob://*" would never match.
 *
 * Still deliberately not ["*"]: that wildcard is the pattern security scanners
 * flag, and the whitelist runs BEFORE isAllowedChartNavigation and
 * short-circuits it, so anything missing here is blocked before the real guard
 * below ever gets a say.
 */
export const CHART_ORIGIN_WHITELIST = ["https://*", "blob:*", "about:*"];

/**
 * Navigation guard for the chart WebViews.
 *
 * Deliberately permissive: ALL web navigation is allowed, because the charting
 * library legitimately talks to several hosts (unfluke.in, saveload and s3 on
 * tradingview.com) and a host allowlist risks blanking the chart if it ever
 * reaches for one nobody listed. What it does block is a custom app scheme —
 * the only way a script inside the widget could yank the user out of the app
 * into another one. That is the redirect behaviour the policy names; loading a
 * web page inside the chart view is not.
 *
 * Only main-frame navigations reach this. Scripts, XHR and other subresources
 * are never intercepted, so the library loads exactly as before.
 */
export function isAllowedChartNavigation(req: { url?: string }): boolean {
  const url = req?.url || "";

  // The inline document itself and its data/blob children.
  if (!url || url === "about:blank") return true;
  if (/^(about|data|blob|file):/i.test(url)) return true;

  return isWebUrl(url);
}

/**
 * Should this non-web URL from the checkout page be handed to the OS?
 *
 * Yes for anything that isn't a messaging / social / store scheme, so every UPI
 * and bank app keeps working, including ones nobody enumerated. Android
 * `intent://` URIs are unwrapped first, since a bare intent:// can name its
 * target app in a `scheme=` parameter.
 */
export function isAllowedPaymentAppLink(url: string): boolean {
  const scheme = schemeOf(url);
  if (!scheme) return false;
  if (BLOCKED_HANDOFF_SCHEMES.has(scheme)) return false;

  if (scheme === "intent") {
    const inner = /[;?&]scheme=([a-z0-9+.\-]+)/i.exec(url);
    if (inner && BLOCKED_HANDOFF_SCHEMES.has(inner[1].toLowerCase())) return false;
  }

  return true;
}
