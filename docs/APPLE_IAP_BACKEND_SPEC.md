# Apple In-App Purchase — Backend Verification Spec

This documents the server work required to support Apple IAP subscriptions on iOS.
The mobile app (iOS) now purchases subscriptions through Apple. Apple — not our
backend — is the source of truth for whether a payment happened. The backend's job
is to **verify** the purchase with Apple and **grant the tier**.

> Android is unchanged and still uses the existing HDFC gateway. Everything here is iOS-only.

---

## 1. Endpoint the app calls

```
POST {BACKEND_URL}/api/payment/verifyApplePurchase
Authorization: <same auth/JWT the app already sends on api/* routes>
Content-Type: application/json
```

### Request body (sent by the app)

| Field           | Type   | Notes                                                        |
| --------------- | ------ | ----------------------------------------------------------- |
| `purchaseToken` | string | Unified StoreKit 2 **JWS** representation. Verify this.      |
| `productId`     | string | e.g. `in.unfluke.app.pro.monthly`                           |
| `transactionId` | string | Apple transaction id — use as the idempotency key.          |
| `userId`        | string | Our user `_id` to grant the entitlement to.                 |
| `platform`      | string | `"ios"`                                                     |

### Response body (expected by the app)

```jsonc
{
  "success": true,          // true only if verified AND entitlement granted
  "tier": 3,                // backend tier index now active (1/2/3)
  "expiresAt": "2026-08-24T00:00:00Z"
}
```

On failure return `success: false` with an HTTP 200 or 4xx and a `message`.
The app will NOT finalize (finishTransaction) a purchase it couldn't verify, so
Apple will replay it on next launch until the backend succeeds — make failures safe to retry.

---

## 2. What the backend must do

1. **Verify the JWS** (`purchaseToken`) with Apple's **App Store Server API**
   (`Get Transaction Info` / decode the signed transaction) — confirm the signature
   chains to Apple's root cert, `bundleId === in.unfluke.app`, and the environment
   (Production vs Sandbox) matches. Do **not** trust `productId` from the request
   alone — read it from the verified payload.
2. **Map product → tier** (see table below) and grant that tier to `userId`,
   setting an expiry from the transaction's `expiresDate`.
3. **Idempotency:** key on `transactionId`. The same purchase may be POSTed more
   than once (restore, replay, retries) — grant once, return success every time.
4. **Return** the active tier + expiry.

---

## 3. Product ID → tier map

Must stay in sync with the app's `constants/iap/products.ts` and with the
Product IDs created in App Store Connect.

| Product ID                       | Tier index | Plan     |
| -------------------------------- | ---------- | -------- |
| `in.unfluke.app.basic.monthly`   | 1          | Basic    |
| `in.unfluke.app.advanced.monthly`| 2          | Advanced |
| `in.unfluke.app.pro.monthly`     | 3          | Pro      |

---

## 4. Renewals & cancellations — App Store Server Notifications V2

A subscription auto-renews monthly **without** the app calling us. To keep tier
expiry correct, add a second endpoint and register it in App Store Connect
(App Information → App Store Server Notifications, V2):

```
POST {BACKEND_URL}/api/payment/appleServerNotifications
```

Handle at least: `DID_RENEW` (extend expiry), `EXPIRED` / `DID_FAIL_TO_RENEW`
(downgrade to Free), `REFUND` (revoke tier). Payloads are signed JWS — verify the
same way as above.

---

## 5. Config / secrets the backend needs

- **App Store Server API key** (`.p8`), Key ID, and Issuer ID — from App Store
  Connect → Users and Access → Integrations → App Store Connect API.
- Bundle ID: `in.unfluke.app`
- Handle **both** Sandbox and Production (TestFlight purchases are Sandbox).

---

## 6. Notes for the app side

- The app sends the payload from `hooks/useSubscriptionIAP.ts` → `verifyAndUnlock`
  (calls `postVerifyApplePurchase` in `Unfluke_helpers/backend_helper.js`,
  route `POST_VERIFY_APPLE_PURCHASE`).
- On `success: true`, the app calls `finishTransaction()` and refreshes the user's
  tier so features unlock immediately.
