// Apple In-App Purchase hook for subscription plans (iOS only).
//
// Responsibilities handled here:
//   - Open/track the StoreKit connection (via react-native-iap's useIAP)
//   - Fetch our subscription products on connect
//   - Start a purchase for a given backend tier index
//   - Restore previous purchases (required by Apple)
//   - Route every successful purchase (new OR restored) through one
//     verify-and-unlock path, then finalize the transaction
//
// Android is intentionally untouched — it keeps the existing HDFC flow, so all
// actions here no-op when Platform.OS !== "ios".
//
// See constants/iap/products.ts for the tier→product-ID map.

import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import { useIAP } from "react-native-iap";
import type { Purchase } from "react-native-iap";
import {
  IOS_SUBSCRIPTION_SKUS,
  skuForTier,
  tierForSku,
} from "@/constants/iap/products";
import { postVerifyApplePurchase } from "@/Unfluke_helpers/backend_helper";

const IS_IOS = Platform.OS === "ios";

type UseSubscriptionIAPArgs = {
  /** The logged-in user (needs at least `_id`) so the backend can attribute the purchase. */
  user: any;
  /** Called after the backend confirms a purchase and a tier is unlocked. */
  onUnlocked?: (tierIndex: number, purchase: Purchase) => void;
  /** Called for any failure (store error, verification failure). User-cancellations are swallowed. */
  onError?: (error: unknown) => void;
};

export function useSubscriptionIAP({
  user,
  onUnlocked,
  onError,
}: UseSubscriptionIAPArgs) {
  const [processing, setProcessing] = useState(false);

  // ── The decision core ──────────────────────────────────────────────────────
  // Verify a StoreKit purchase with our backend and, if valid, unlock the tier.
  // Returns true only when the purchase is verified AND the entitlement granted,
  // because the caller uses the return value to decide whether to call
  // finishTransaction() (which permanently clears the purchase from the queue —
  // do NOT finish a purchase we failed to verify, or the user pays and gets nothing).
  const verifyAndUnlock = useCallback(
    async (purchase: Purchase): Promise<boolean> => {
      const productId = purchase.productId;
      const skuTier = tierForSku(productId);
      try {
        // Server verifies the JWS with Apple, then grants the tier. The axios
        // response interceptor returns the JSON body directly.
        const res: any = await postVerifyApplePurchase({
          purchaseToken: purchase.purchaseToken,
          productId,
          transactionId: purchase.transactionId,
          userId: user?._id,
          platform: "ios",
        });

        // Only a backend-confirmed success unlocks — never trust the client alone.
        if (res?.success === true) {
          onUnlocked?.(res.tier ?? skuTier ?? 0, purchase);
          return true;
        }
        return false;
      } catch (e) {
        // Network/verification failure: return false so we do NOT finishTransaction.
        // Apple safely replays the purchase on next launch, so the user never
        // pays and loses access.
        return false;
      }
    },
    [user, onUnlocked],
  );
  // ────────────────────────────────────────────────────────────────────────────

  const {
    connected,
    subscriptions,
    availablePurchases,
    fetchProducts,
    requestPurchase,
    finishTransaction,
    getAvailablePurchases,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      try {
        const unlocked = await verifyAndUnlock(purchase);
        if (unlocked) {
          // Finalize only after a verified unlock. iOS replays unfinished
          // transactions on every launch until this is called.
          await finishTransaction({ purchase, isConsumable: false });
        }
      } catch (e) {
        onError?.(e);
      } finally {
        setProcessing(false);
      }
    },
    onPurchaseError: (err: any) => {
      setProcessing(false);
      // Don't surface an error when the user simply cancelled the sheet.
      const code = err?.code;
      if (code !== "user-cancelled" && code !== "E_USER_CANCELLED") {
        onError?.(err);
      }
    },
  });

  // Fetch our subscription products once the store connection is up.
  useEffect(() => {
    if (IS_IOS && connected) {
      fetchProducts({ skus: IOS_SUBSCRIPTION_SKUS, type: "subs" }).catch(() => {});
    }
  }, [connected, fetchProducts]);

  // Verify + finish any purchases surfaced by a Restore action.
  useEffect(() => {
    if (!IS_IOS || !availablePurchases?.length) return;
    (async () => {
      for (const p of availablePurchases) {
        try {
          const unlocked = await verifyAndUnlock(p);
          if (unlocked) await finishTransaction({ purchase: p, isConsumable: false });
        } catch (e) {
          onError?.(e);
        }
      }
    })();
  }, [availablePurchases, verifyAndUnlock, finishTransaction, onError]);

  /** Start an Apple purchase for the given backend tier index (1/2/3). */
  const buy = useCallback(
    async (tierIndex: number) => {
      if (!IS_IOS) return;
      const sku = skuForTier(tierIndex);
      if (!sku) {
        onError?.(new Error("This plan isn't available for purchase on iOS."));
        return;
      }
      try {
        setProcessing(true);
        await requestPurchase({
          request: { apple: { sku }, google: { skus: [sku] } },
          type: "subs",
        });
      } catch (e) {
        setProcessing(false);
        onError?.(e);
      }
    },
    [requestPurchase, onError],
  );

  /** Restore previous purchases — Apple requires this to be reachable in-app. */
  const restore = useCallback(async () => {
    if (!IS_IOS) return;
    try {
      setProcessing(true);
      await getAvailablePurchases();
    } catch (e) {
      onError?.(e);
    } finally {
      setProcessing(false);
    }
  }, [getAvailablePurchases, onError]);

  /** Apple's localized display price for a tier (e.g. "₹999.00"), or null before products load. */
  const priceForTier = useCallback(
    (tierIndex: number): string | null => {
      const sku = skuForTier(tierIndex);
      const product: any = subscriptions?.find(
        (s: any) => s.id === sku || s.productId === sku,
      );
      return product?.displayPrice ?? null;
    },
    [subscriptions],
  );

  return {
    isIOS: IS_IOS,
    connected,
    processing,
    subscriptions,
    buy,
    restore,
    priceForTier,
  };
}
