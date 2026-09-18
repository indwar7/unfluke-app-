// HDFC SmartGateway (Juspay) client — Android in-app subscription checkout.
//
// These calls deliberately BYPASS the shared axios client in api_helper.js.
// That client forces `Authorization: Bearer <token>` on every request, but the
// `/api/hdfc-payment/*` endpoints expect the RAW access token with no "Bearer "
// prefix (see PAYMENT_DOCS.md §3). We also never send a price — the server is
// the amount authority and re-resolves it from `planId` (+ coupon/points).

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Config } from "../helpers/config";
import * as url from "./url_helper";

// Cheap, dependency-free idempotency key. Not security-sensitive (it only
// dedupes createOrder retries server-side), so Math.random is fine here.
const genIdempotencyKey = () =>
  `app-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * Create a checkout order.
 * @param {Object} p
 * @param {string|number} p.planId  Tier id — "1" Basic | "2" Advanced | "3" Pro | "TVTOOL".
 * @param {string} [p.couponCode]   Optional coupon; server applies the discount.
 * @param {boolean} [p.usePoints]   Apply loyalty points server-side.
 * @param {string} [p.customerId]   Optional/cosmetic — server trusts the token identity.
 * @param {string} [p.idempotencyKey] Reuse across retries of the SAME logical order.
 * @returns {Promise<{order_id:string, status:string, payment_links:{web:string,mobile?:string,iframe?:string}}>}
 */
export const createHdfcOrder = async ({
  planId,
  couponCode,
  usePoints,
  customerId,
  idempotencyKey,
} = {}) => {
  const token = await AsyncStorage.getItem("access");

  const res = await fetch(`${Config.BACKEND_URL}/${url.POST_HDFC_CREATE_ORDER}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // RAW token — no "Bearer " prefix. See PAYMENT_DOCS.md §3.
      ...(token ? { Authorization: token } : {}),
      "Idempotency-Key": idempotencyKey || genIdempotencyKey(),
    },
    body: JSON.stringify({
      planId: String(planId),
      ...(customerId ? { customerId } : {}),
      ...(couponCode ? { couponCode } : {}),
      ...(usePoints ? { usePoints: true } : {}),
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || data?.message || "Could not create order");
  }
  return data;
};

/**
 * Poll the terminal status of an order. Public endpoint — no auth.
 * The `status=pending` seen in the browser redirect is NOT authoritative; this
 * poll is the source of truth (see PAYMENT_DOCS.md §4 Step 6).
 * @param {string} orderId
 * @returns {Promise<{orderId:string, status:string, tier?:number, planId?:number, entitlementApplied?:boolean, mismatch?:boolean, amount?:number}>}
 */
export const getHdfcPaymentStatus = async (orderId) => {
  const res = await fetch(
    `${Config.BACKEND_URL}/${url.GET_HDFC_PAYMENT_STATUS}/${encodeURIComponent(
      orderId,
    )}`,
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || data?.message || "Could not fetch payment status");
  }
  return data;
};
