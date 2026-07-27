// Apple In-App Purchase product catalog.
//
// This is the ONLY place that maps our backend tier indexes (0..3) to the
// Apple subscription product IDs. Every product ID below MUST match — exactly,
// character for character — the Product ID you create in App Store Connect
// (App Store Connect → your app → Subscriptions). A mismatch makes
// `fetchProducts` return an empty list and the paywall renders blank.
//
// Bundle ID for reference: in.unfluke.app
// Convention used: <bundleId>.<plan>.<period>
//
// Tier indexes come from the backend `tier` field on each membership plan:
//   0 = Free (no purchase), 1 = Basic, 2 = Advanced, 3 = Pro
//
// NOTE: iOS uses Apple's fixed price tiers, so coupons/points do NOT apply to
// these purchases (that discount flow stays Android/HDFC only).

export type TierIndex = 0 | 1 | 2 | 3;

/** Maps a backend tier index → Apple subscription product ID. */
export const TIER_TO_IOS_SKU: Record<number, string> = {
  1: "in.unfluke.app.basic.monthly",
  2: "in.unfluke.app.advanced.monthly",
  3: "in.unfluke.app.pro.monthly",
};

/** All SKUs we fetch from the store on connect (drives what the paywall can sell). */
export const IOS_SUBSCRIPTION_SKUS: string[] = Object.values(TIER_TO_IOS_SKU);

/** tier index → product ID, or null for tiers with no purchasable product (Free). */
export function skuForTier(tierIndex: number | undefined | null): string | null {
  if (tierIndex == null) return null;
  return TIER_TO_IOS_SKU[tierIndex] ?? null;
}

/** product ID → backend tier index, or null if unknown. Used after a purchase
 * (and on restore) to know which tier a StoreKit product unlocks. */
export function tierForSku(sku: string | undefined | null): number | null {
  if (!sku) return null;
  const entry = Object.entries(TIER_TO_IOS_SKU).find(([, value]) => value === sku);
  return entry ? Number(entry[0]) : null;
}
