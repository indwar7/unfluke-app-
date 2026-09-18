// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Modal,
//   Alert,
//   Linking,
//   } from 'react-native';
// import { useSelector } from "react-redux";
// import { postBuyMembership, postCheckCoupon } from '../../Unfluke_helpers/backend_helper';
// import { useWindowDimensions } from "react-native";

// function Billing({ tier, email, name, user, isOpenModal, toggleModal }) {
//   const { width, height } = useWindowDimensions()

//   const [message, setMessage] = useState({ status: 0, message: "" });
//   const [value, setValue] = useState("");
//   const [values, setValues] = useState({
//     amount: 0,
//     orderID: "",
//     error: "",
//     success: false,
//     accessCode: "",
//     encRequest: "",
//   });

//   const tierCost = parseInt(tier.cost);
//   const [totalPoints, setTotalPoints] = useState(parseInt(user.points));
//   const [open, setOpen] = useState(true);
//   const [usePoints, setUsePoints] = useState(0);
//   const [couponCode, setCouponCode] = useState("");
//   const [amountToBePaid, setAmountToBePaid] = useState(tierCost);
//   const [coupon, setCoupon] = useState(0);

//   const errornotify = (msg) => Alert.alert("Error", msg);
//   const successnotify = (msg) => Alert.alert("Success", msg);

//   useEffect(() => {
//     if (message.status !== 0) {
//       if (message.status !== 200) {
//         errornotify(message.message);
//       } else {
//         successnotify(message.message);
//       }
//     }
//   }, [message]);

//   const couponChecker = async () => {
//     try {
//       const res = await postCheckCoupon({ couponCode });
//       setCoupon(res[0].discount);
//       successnotify("Coupon applied successfully!");
//     } catch (err) {
//       errornotify("Invalid Coupon");
//     }
//   };

//   const pointsChecker = () => {
//     const inputValue = parseInt(usePoints);
//     if (inputValue > totalPoints) {
//       errornotify("You cannot use more points than you have.");
//       return;
//     }
//     if (tierCost - inputValue < 1) {
//       errornotify("The subscription amount must be at least ₹1.");
//       return;
//     }
//     setAmountToBePaid(tierCost - inputValue - coupon);
//     setTotalPoints(totalPoints - inputValue);
//   };

//   useEffect(() => {
//     setAmountToBePaid(tierCost - usePoints - coupon);
//   }, [coupon]);

//   useEffect(() => {
//     setAmountToBePaid(tier.cost);
//   }, [tier]);

//   const createOrder = async () => {
//     setMessage({ status: 0, message: "" });

//     try {
//       const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/hdfc-payment/createOrder`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           amount: amountToBePaid,
//           currency: "INR",
//           customerId: user._id,
//           returnUrl: `https://dfe12f024a91.ngrok-free.app/api/hdfc-payment/callback`
//         }),
//       });

//       const data = await res.json();

//       if (data.payment_links && data.payment_links.web) {
//         // Open payment URL in browser
//         Linking.openURL(data.payment_links.web);
//       } else {
//         errornotify("Failed to initiate payment. Please try again.");
//         console.error("Payment initiation error:", data);
//       }
//     } catch (err) {
//       console.error("Error creating HDFC order:", err);
//       errornotify("Something went wrong while creating order");
//     }
//   };

//   const plan = ["Free", "Basic", "Advanced", "Pro"];

//   return (
//     <Modal
//       visible={isOpenModal}
//       animationType="slide"
//       transparent={true}
//       onRequestClose={toggleModal}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={[styles.modalContainer,{ width: width * 0.95,
//     maxHeight: height * 0.9}]}>
//           <ScrollView showsVerticalScrollIndicator={false}>
//             {/* Header */}
//             <View style={styles.header}>
//               <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
//                 <Text style={styles.closeButtonText}>×</Text>
//               </TouchableOpacity>
//               <Text style={styles.headerTitle}>
//                 Thank you for choosing the {plan[tier.tier]} plan. This subscription gives you access to more features and data.
//               </Text>
//             </View>

//             {/* Content */}
//             <View style={styles.content}>
//               {/* Features Card */}
//               <View style={styles.featuresCard}>
//                 <View style={styles.featuresList}>
//                   <View style={styles.featureItem}>
//                     <Text style={styles.checkmark}>✓</Text>
//                     <Text style={styles.featureText}> Historical Scans</Text>
//                   </View>
//                   <View style={styles.subFeature}>
//                     <Text style={styles.subFeatureText}>- Results from {tier.scans_start_year}</Text>
//                   </View>
//                   <View style={styles.subFeature}>
//                     <Text style={styles.subFeatureText}>- Max {tier.scans_max_results} results</Text>
//                   </View>
//                   <View style={[styles.subFeature, styles.marginBottom]}>
//                     <Text style={styles.subFeatureText}>- Unlimited number of scans</Text>
//                   </View>

//                   <View style={[styles.featureItem, styles.marginBottom]}>
//                     <Text style={styles.checkmark}>✓</Text>
//                     <Text style={styles.featureText}> {tier.live_scanner_telegrams} Alerts</Text>
//                   </View>

//                   <View style={[styles.featureItem, styles.marginBottom]}>
//                     <Text style={styles.checkmark}>✓</Text>
//                     <Text style={styles.featureText}> Historical Charts Onwards {tier.charts_fno}</Text>
//                   </View>

//                   <View style={[styles.featureItem, styles.marginBottom]}>
//                     <Text style={styles.checkmark}>✓</Text>
//                     <Text style={styles.featureText}> Unlimited Virtual Trading</Text>
//                   </View>

//                   <View style={styles.featureItem}>
//                     <Text style={styles.checkmark}>✓</Text>
//                     <Text style={styles.featureText}> Backtests</Text>
//                   </View>
//                   <View style={styles.subFeature}>
//                     <Text style={styles.subFeatureText}>- Unlimited basic backtests</Text>
//                   </View>
//                   <View style={styles.subFeature}>
//                     <Text style={styles.subFeatureText}>- {tier.backtests} advanced backtests</Text>
//                   </View>
//                 </View>
//               </View>

//               {/* Billing Card */}
//               <View style={styles.billingCard}>
//                 <Text style={styles.billingTitle}>Subscription Bill</Text>
//                 <View style={styles.dashedLine} />

//                 {/* Wallet Info */}
//                 <View style={styles.walletInfo}>
//                   <View style={styles.walletRow}>
//                     <Text style={styles.walletLabel}>
//                       <Text style={styles.walletText}>Wallet </Text>
//                       <Text style={styles.walletBalance}>Balance</Text>
//                     </Text>
//                     <Text style={styles.walletAmount}>₹{user.walletBalance}</Text>
//                   </View>
//                   <View style={styles.walletRow}>
//                     <Text style={styles.walletLabel}>
//                       <Text style={styles.walletText}>Points </Text>
//                       <Text style={styles.walletBalance}>Available</Text>
//                     </Text>
//                     <Text style={styles.walletAmount}>{user.points}</Text>
//                   </View>
//                 </View>

//                 <View style={styles.dashedLine} />

//                 {/* Coupon Section */}
//                 {open && (
//                   <>
//                     <View style={styles.inputGroup}>
//                       <TextInput
//                         style={styles.textInput}
//                         placeholder="Enter Coupon Code"
//                         value={couponCode}
//                         onChangeText={setCouponCode}
//                       />
//                       <TouchableOpacity style={styles.applyButton} onPress={couponChecker}>
//                         <Text style={styles.applyButtonText}>Apply Coupon</Text>
//                       </TouchableOpacity>
//                     </View>
//                     {coupon !== 0 && (
//                       <View style={styles.couponApplied}>
//                         <Text style={styles.couponAppliedText}>Coupon Applied</Text>
//                         <TouchableOpacity onPress={() => setCoupon(0)}>
//                           <Text style={styles.removeText}>Remove</Text>
//                         </TouchableOpacity>
//                       </View>
//                     )}
//                   </>
//                 )}

//                 <View style={styles.dashedLine} />

//                 {/* Points Section */}
//                 <View style={styles.inputGroup}>
//                   <TextInput
//                     style={styles.textInput}
//                     placeholder="Points to use"
//                     value={usePoints.toString()}
//                     onChangeText={(text) => setUsePoints(parseInt(text) || 0)}
//                     keyboardType="numeric"
//                   />
//                   <TouchableOpacity style={styles.applyButtonPrimary} onPress={pointsChecker}>
//                     <Text style={styles.applyButtonText}>Apply Points</Text>
//                   </TouchableOpacity>
//                 </View>

//                 <View style={styles.dashedLine} />

//                 {/* Bill Summary */}
//                 <View style={styles.billSummary}>
//                   <View style={styles.billRow}>
//                     <Text style={styles.billLabel}>Total:</Text>
//                     <Text style={styles.billAmount}>₹ {tierCost}</Text>
//                   </View>
//                   <View style={styles.billRow}>
//                     <Text style={styles.billLabel}>Coupon Discount:</Text>
//                     <Text style={styles.billAmount}>- ₹ {coupon}</Text>
//                   </View>
//                   <View style={styles.billRow}>
//                     <Text style={styles.billLabel}>Points Applied:</Text>
//                     <Text style={styles.billAmount}>- ₹ {usePoints}</Text>
//                   </View>
//                   <View style={styles.billRow}>
//                     <Text style={styles.billLabel}>Amount to be Paid:</Text>
//                     <Text style={styles.billAmount}>₹ {amountToBePaid}</Text>
//                   </View>
//                 </View>

//                 {/* Pay Button */}
//                 <TouchableOpacity style={styles.payButton} onPress={createOrder}>
//                   <Text style={styles.payButtonText}>Pay Rs {amountToBePaid}</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </ScrollView>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     overflow: 'hidden',
//   },
//   header: {
//     // background: 'linear-gradient(135deg, #d667cd, #6b97f5)',
//     backgroundColor: '#d667cd',
//     padding: 20,
//     position: 'relative',
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 10,
//     right: 15,
//     zIndex: 1,
//   },
//   closeButtonText: {
//     fontSize: 30,
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#251f57',
//     textAlign: 'center',
//     marginTop: 10,
//   },
//   content: {
//     padding: 20,
//   },
//   featuresCard: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 10,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 8,
//   },
//   featuresList: {
//     paddingLeft: 0,
//   },
//   featureItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 5,
//   },
//   checkmark: {
//     color: '#22c55e',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   featureText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   subFeature: {
//     paddingLeft: 20,
//     marginBottom: 5,
//   },
//   subFeatureText: {
//     color: '#e2749a',
//     fontSize: 14,
//   },
//   marginBottom: {
//     marginBottom: 10,
//   },
//   billingCard: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 8,
//   },
//   billingTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 20,
//     color: '#4a5568',
//   },
//   dashedLine: {
//     borderBottomWidth: 3,
//     borderBottomColor: '#aaa',
//     borderStyle: 'dashed',
//     marginVertical: 15,
//   },
//   walletInfo: {
//     marginBottom: 20,
//   },
//   walletRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   walletLabel: {
//     fontSize: 16,
//   },
//   walletText: {
//     fontWeight: '600',
//     color: '#4a5568',
//   },
//   walletBalance: {
//     fontWeight: '600',
//     color: '#9f7aea',
//   },
//   walletAmount: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#4a5568',
//   },
//   inputGroup: {
//     flexDirection: 'row',
//     marginBottom: 10,
//   },
//   textInput: {
//     flex: 1,
//     padding: 10,
//     borderWidth: 1,
//     borderColor: '#d1d5db',
//     borderRadius: 5,
//     marginRight: 10,
//   },
//   applyButton: {
//     backgroundColor: '#6c757d',
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     borderRadius: 5,
//     justifyContent: 'center',
//   },
//     applyButtonPrimary: {
//     backgroundColor: '#007bff',
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     borderRadius: 5,
//     justifyContent: 'center',
//   },
//   applyButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   couponApplied: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   couponAppliedText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   removeText: {
//     color: 'red',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   billSummary: {
//     marginBottom: 20,
//   },
//   billRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   billLabel: {
//     fontSize: 16,
//     color: '#333',
//   },
//   billAmount: {
//     fontSize: 16,
//     color: '#333',
//     fontWeight: '500',
//   },
//   payButton: {
//     backgroundColor: '#28a745',
//     padding: 15,
//     borderRadius: 5,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   payButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });

// export default Billing;

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  postBuyMembership,
  postCheckCoupon,
  getUserInfo,
} from "../../Unfluke_helpers/backend_helper";
import {
  createHdfcOrder,
  getHdfcPaymentStatus,
} from "../../Unfluke_helpers/hdfcPayment";
import { loginSuccess } from "../../redux/Unfluke_slices/auth/login/reducer";
import { Config } from "../../helpers/config";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useSubscriptionIAP } from "@/hooks/useSubscriptionIAP";
import HdfcPaymentWebView from "./HdfcPaymentWebView";

function Billing({ tier, email, name, user, isOpenModal, toggleModal }) {
  // All hooks must run unconditionally (Rules of Hooks) — the early bail-out
  // for missing tier/user happens AFTER every hook below.
  const { colors: c, isDark } = useTheme();
  const styles = makeStyles(c, isDark);
  const dispatch = useDispatch();
  const [message, setMessage] = useState({ status: 0, message: "" });

  // Android/HDFC in-app checkout state. The hosted page loads in an in-app
  // WebView; on return we poll /status/{orderId} for the authoritative result.
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [webviewVisible, setWebviewVisible] = useState(false);
  // Guards against overlapping polls (return + cancel both trying to resolve) and
  // against setState after the screen goes away.
  const pollingRef = useRef(false);
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  const [values, setValues] = useState({
    amount: 0,
    orderID: "",
    error: "",
    success: false,
    accessCode: "",
    encRequest: "",
  });

const {  height } = useWindowDimensions()

  const tierCost = parseInt(tier?.cost) || 0;
  const [totalPoints, setTotalPoints] = useState(parseInt(user?.points) || 0);
  const [usePoints, setUsePoints] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [amountToBePaid, setAmountToBePaid] = useState(tierCost);
  const [coupon, setCoupon] = useState(0);
  const [loading, setLoading] = useState(false);

  const plan = ["Free", "Basic", "Advanced", "Pro"];

  const showToast = (msg, type = "error") => {
    Alert.alert(type === "error" ? "Error" : "Success", msg, [{ text: "OK" }]);
  };

  // Pull the fresh profile after a successful purchase and push it into
  // AsyncStorage + Redux (same pattern as activate-telegram.tsx). This is what
  // makes the new tier's features load app-wide — every feature gate and the
  // pricing screen read `user.tier` from Redux, so without this the purchase
  // succeeds server-side but the UI keeps showing the old plan. Shared by BOTH
  // the iOS Apple path (onUnlocked below) and the Android HDFC path (poll).
  const refreshUserSession = async () => {
    try {
      const res: any = await getUserInfo();
      const fresh = res?.user || res;
      if (fresh && typeof fresh === "object") {
        const merged = { ...user, ...fresh };
        await AsyncStorage.setItem("authUser", JSON.stringify(merged));
        dispatch(loginSuccess(merged));
      }
    } catch (err) {
      // Entitlement is already applied on the server — a refresh miss is not
      // fatal; the tier will surface on the next natural profile load.
      console.warn("Post-payment profile refresh failed:", err);
    }
  };

  // iOS must use Apple In-App Purchase (App Store rule 3.1.1). Android keeps the
  // existing HDFC gateway untouched. Coupons/points don't apply to Apple's fixed
  // price tiers, so that UI is hidden on iOS below.
  const isIOS = Platform.OS === "ios";

  const iap = useSubscriptionIAP({
    user,
    onUnlocked: async (tierIndex) => {
      // Refresh FIRST so the tier's features are live before we tell the user.
      await refreshUserSession();
      showToast(
        `Subscription active! ${plan[tierIndex] || "Your plan"} unlocked.`,
        "success",
      );
      toggleModal();
    },
    onError: (err: any) => {
      showToast(err?.message || "Purchase could not be completed. Please try again.");
    },
  });

  // Whether the Pay button should show a spinner (HDFC order OR Apple purchase in flight).
  const payBusy = loading || (isIOS && iap.processing);

  useEffect(() => {
    if (message.status !== 0) {
      showToast(message.message, message.status === 200 ? "success" : "error");
    }
  }, [message]);

  const couponChecker = async () => {
    if (!couponCode.trim()) {
      showToast("Please enter a coupon code");
      return;
    }

    setLoading(true);
    try {
      const res = await postCheckCoupon({ couponCode });
      const discount =
        Array.isArray(res) && res.length > 0 ? res[0]?.discount : null;
      if (discount == null) {
        showToast("Invalid Coupon");
        return;
      }
      setCoupon(discount);
      showToast("Coupon applied successfully!", "success");
    } catch (err) {
      showToast("Invalid Coupon");
    } finally {
      setLoading(false);
    }
  };

  const pointsChecker = () => {
    const inputValue = Number(usePoints);

    if (isNaN(inputValue) || inputValue < 0) {
      showToast("Please enter a valid points value");
      return;
    }

    if (inputValue > totalPoints) {
      showToast("You cannot use more points than you have.");
      return;
    }

    if (tierCost - inputValue < 1) {
      showToast("The subscription amount must be at least ₹1.");
      return;
    }

    setAmountToBePaid(tierCost - inputValue - coupon);
    setTotalPoints(totalPoints - inputValue);
    showToast("Points applied successfully!", "success");
  };

  useEffect(() => {
    setAmountToBePaid(tierCost - usePoints - coupon);
  }, [coupon]);

  useEffect(() => {
    setAmountToBePaid(tier?.cost || 0);
  }, [tier]);

  // Map a /status/{orderId} response to a checkout outcome — the one decision
  // where money meets entitlement (PAYMENT_DOCS.md §4 Step 6, §10).
  // Return EXACTLY one of: "success" | "failed" | "review" | "pending".
  const resolvePaymentOutcome = (
    statusRes: any,
  ): "success" | "failed" | "review" | "pending" => {
    const status = statusRes?.status;

    // Check mismatch FIRST — a paid-but-wrong-amount order is held for review and
    // must never unlock, even if another field looks successful.
    if (statusRes?.mismatch === true || status === "AMOUNT_MISMATCH") {
      return "review";
    }
    // Only unlock when the server both reports success AND confirms the tier was
    // actually granted (entitlementApplied). Belt-and-suspenders against a
    // "Payment Successful" that hasn't settled the entitlement yet.
    if (status === "Payment Successful" && statusRes?.entitlementApplied === true) {
      return "success";
    }
    if (status === "Payment Failed") {
      return "failed";
    }
    // Null response, unexpected status, or "Payment Successful" without the
    // entitlement flag yet → keep polling. Safest default: never grants access.
    return "pending";
  };

  // Step 6 — poll every 3s, up to ~10 attempts, until a terminal outcome.
  // (refreshUserSession is defined above so both the iOS and Android success
  // paths share it — Step 7 of the flow.)
  const pollPaymentStatus = async (oid: string) => {
    if (pollingRef.current) return; // never run two polls for the same order
    pollingRef.current = true;
    setLoading(true);
    try {
      for (let attempt = 0; attempt < 10; attempt++) {
        let outcome: "success" | "failed" | "review" | "pending" = "pending";
        try {
          const statusRes = await getHdfcPaymentStatus(oid);
          outcome = resolvePaymentOutcome(statusRes);
        } catch (err) {
          // Transient network/gateway hiccup — treat as pending and retry.
          console.warn("Status poll error:", err);
        }

        if (outcome === "success") {
          await refreshUserSession();
          showToast(
            `Payment successful! ${plan[tier?.tier] || "Your plan"} unlocked.`,
            "success",
          );
          toggleModal();
          return;
        }
        if (outcome === "failed") {
          showToast("Payment failed. Please try again.");
          return;
        }
        if (outcome === "review") {
          showToast(
            "Your payment is under review. If money was debited, please contact support.",
          );
          return;
        }

        // Still pending — wait before the next attempt (skip after the last one
        // so we don't leave the spinner dead for 3s before the timeout toast).
        if (attempt < 9) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
      showToast(
        "We're still confirming your payment. It will reflect shortly once processed.",
      );
    } finally {
      pollingRef.current = false;
      if (isMountedRef.current) setLoading(false);
    }
  };

  const createOrder = async () => {
    if (loading) return; // prevent double-tap duplicate orders

    setMessage({ status: 0, message: "" });
    setLoading(true);

    try {
      // Server is the amount authority — we send planId (the tier), never a price.
      const data = await createHdfcOrder({
        planId: tier?.tier,
        customerId: user?._id,
        // Only forward a coupon the user actually applied (coupon > 0) so the
        // order matches the total shown in the modal. The server still
        // re-validates and re-prices — it is the amount authority.
        couponCode: coupon > 0 && couponCode?.trim() ? couponCode.trim() : undefined,
        usePoints: usePoints > 0,
      });

      const link = data?.payment_links?.mobile || data?.payment_links?.web;
      if (data?.order_id && link) {
        setOrderId(data.order_id);
        setPaymentUrl(link);
        setWebviewVisible(true);
      } else {
        showToast("Failed to initiate payment. Please try again.");
        console.error("Payment initiation error:", data);
      }
    } catch (err: any) {
      console.error("Error creating HDFC order:", err);
      showToast(err?.message || "Something went wrong while creating order");
    } finally {
      setLoading(false);
    }
  };

  // WebView reached {PUBLIC_URL}/payment-result — the flow finished; poll for the
  // authoritative result (never trust the redirect's status=pending param).
  const onWebViewReturn = () => {
    setWebviewVisible(false);
    if (orderId) {
      pollPaymentStatus(orderId).catch((e) =>
        console.warn("Payment status poll failed:", e),
      );
    }
  };

  // User backed out. They may still have paid right before cancelling, so do a
  // single quiet check that only reacts to a genuine success/review.
  const onWebViewCancel = async () => {
    setWebviewVisible(false);
    if (!orderId) return;
    try {
      const statusRes = await getHdfcPaymentStatus(orderId);
      const outcome = resolvePaymentOutcome(statusRes);
      if (outcome === "success") {
        await refreshUserSession();
        showToast(
          `Payment successful! ${plan[tier?.tier] || "Your plan"} unlocked.`,
          "success",
        );
        toggleModal();
      } else if (outcome === "review") {
        showToast(
          "Your payment is under review. If money was debited, please contact support.",
        );
      }
    } catch (err) {
      // Silent — a deliberate cancel with no payment shouldn't nag the user.
    }
  };

  const removeCoupon = () => {
    setCoupon(0);
    setCouponCode("");
    showToast("Coupon removed", "success");
  };

  // Safe to bail out here — every hook above has already run unconditionally.
  if (!tier || Object.keys(tier).length === 0 || !user) {
    return null;
  }

  return (
    <>
    <Modal
      visible={isOpenModal}
      animationType="slide"
      transparent={true}
      onRequestClose={toggleModal}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer,{    height:height*0.8 ,
}]}>
          <LinearGradient
            colors={[c.goldBright, c.gold, c.goldDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={toggleModal}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                Thank you for choosing the {plan[tier.tier] || "selected"} plan.
                This subscription gives you access to more features and data.
              </Text>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
  persistentScrollbar={true}
            >
              {/* Features Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Plan Features</Text>
                <View style={styles.featuresList}>
                  <View >
                    <View style={styles.featureItem}>
                      <Text style={styles.checkIcon}>✓</Text>
                      <Text style={styles.featureText}>Historical Scans</Text>
                    </View>
                    <Text style={styles.featureDetail}>
                      - Results from {tier.scans_start_year || "N/A"}
                    </Text>
                    <Text style={styles.featureDetail}>
                      - Max {tier.scans_max_results || "N/A"} results
                    </Text>
                    <Text style={styles.featureDetail}>
                      - Unlimited number of scans
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Text style={styles.checkIcon}>✓</Text>
                    <Text style={styles.featureText}>
                      {tier.live_scanner_telegrams || 0} Alerts
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Text style={styles.checkIcon}>✓</Text>
                    <Text style={styles.featureText}>
                      Historical Charts Onwards {tier.charts_fno || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Text style={styles.checkIcon}>✓</Text>
                    <Text style={styles.featureText}>
                      Unlimited Virtual Trading
                    </Text>
                  </View>
                  <View >
                    <View style={styles.featureItem}>
                      <Text style={styles.checkIcon}>✓</Text>
                      <Text style={styles.featureText}>Backtests</Text>
                    </View>
                    <Text style={styles.featureDetail}>
                      - Unlimited basic backtests
                    </Text>
                    <Text style={styles.featureDetail}>
                      - {tier.backtests || 0} advanced backtests
                    </Text>
                  </View>
                </View>
              </View>

              {/* Billing Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Subscription Bill</Text>
                <View style={styles.dashedDivider} />

                {/* Wallet and Points Info */}
                <View>
                  <View style={styles.infoRow}>
                    <View style={styles.infoLabelContainer}>
                      <Text style={styles.infoLabel}>Wallet </Text>
                      <Text style={styles.infoLabelHighlight}>Balance</Text>
                    </View>
                    <Text style={styles.infoValue}>₹{user.walletBalance}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoLabelContainer}>
                      <Text style={styles.infoLabel}>Points </Text>
                      <Text style={styles.infoLabelHighlight}>Available</Text>
                    </View>
                    <Text style={styles.infoValue}>{user.points}</Text>
                  </View>
                </View>

                {/* Coupons & points don't apply to Apple's fixed price tiers — Android/HDFC only. */}
                {!isIOS && (
                <>
                <View style={styles.dashedDivider} />

                {/* Coupon Code Input */}
                <View style={styles.inputSection}>
                  <View style={styles.inputGroup}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Coupon Code"
                      value={couponCode}
                      onChangeText={setCouponCode}
                      editable={!loading}
                    />
                    <TouchableOpacity
                      style={styles.applyButton}
                      onPress={couponChecker}
                      disabled={loading}
                    >
                      
                        <Text style={styles.applyButtonText}>Apply</Text>
                    </TouchableOpacity>
                  </View>

                  {coupon !== 0 && (
                    <View style={styles.couponApplied}>
                      <Text style={styles.couponAppliedText}>
                        Coupon Applied (₹{coupon} off)
                      </Text>
                      <TouchableOpacity onPress={removeCoupon}>
                        <Text style={styles.removeText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <View style={styles.dashedDivider} />

                {/* Points Input */}
                <View style={styles.inputSection}>
                  <View style={styles.inputGroup}>
                    <TextInput
                      style={styles.input}
                      placeholder="Points to use"
                      value={usePoints.toString()}
                      onChangeText={(text) => setUsePoints(parseInt(text) || 0)}
                      keyboardType="numeric"
                      editable={!loading}
                    />
                    <TouchableOpacity
                      style={[styles.applyButton, styles.applyPointsButton]}
                      onPress={pointsChecker}
                      disabled={loading}
                    >
                      <Text style={styles.applyButtonText}>Apply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                </>
                )}

                <View style={styles.dashedDivider} />

                {/* Bill Summary */}
                <View style={styles.billSummary}>
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Total:</Text>
                    <Text style={styles.billValue}>
                      {isIOS
                        ? iap.priceForTier(tier?.tier) || `₹ ${tierCost}`
                        : `₹ ${tierCost}`}
                    </Text>
                  </View>

                  {/* Coupon/points only affect the HDFC (Android) total. */}
                  {!isIOS && (
                    <>
                      <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Coupon Discount:</Text>
                        <Text style={styles.billValue}>- ₹ {coupon}</Text>
                      </View>

                      <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Points Applied:</Text>
                        <Text style={styles.billValue}>- ₹ {usePoints}</Text>
                      </View>
                    </>
                  )}

                  <View style={[styles.billRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Amount to be Paid:</Text>
                    <Text style={styles.totalValue}>
                      {isIOS
                        ? iap.priceForTier(tier?.tier) || `₹ ${tierCost}`
                        : `₹ ${amountToBePaid}`}
                    </Text>
                  </View>
                </View>

                {/* Pay Button — Apple IAP on iOS, HDFC gateway on Android */}
                <TouchableOpacity
                  style={[
                    styles.payButton,
                    payBusy && styles.payButtonDisabled,
                  ]}
                  onPress={() => (isIOS ? iap.buy(tier?.tier) : createOrder())}
                  disabled={payBusy}
                >
                  {payBusy ? (
                    <ActivityIndicator size="small" color={c.onGold} />
                  ) : (
                    <Text style={styles.payButtonText}>
                      {isIOS
                        ? `Subscribe ${iap.priceForTier(tier?.tier) || ""}`.trim()
                        : `Pay ₹ ${amountToBePaid}`}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Restore Purchases — Apple requires a way to recover an
                    existing subscription (e.g. after reinstall / new device). */}
                {isIOS && (
                  <TouchableOpacity
                    style={styles.restoreButton}
                    onPress={iap.restore}
                    disabled={payBusy}
                  >
                    <Text style={styles.restoreButtonText}>
                      Restore Purchases
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Auto-renewable subscription disclosure — App Store Review
                    Guideline 3.1.2 requires ALL of this to be visible on the
                    purchase screen BEFORE buying: the subscription title, its
                    length, the price, that it renews automatically, how to
                    cancel, and separate working links to the Terms of Use and
                    the Privacy Policy. A missing link here is one of the most
                    common subscription rejections.

                    iOS-only: Android buys through HDFC as a one-time payment,
                    so Apple's renewal terms would be actively wrong there. */}
                {isIOS && (
                  <View style={styles.iapDisclosure}>
                    <Text style={styles.iapDisclosureText}>
                      {plan[tier?.tier] || "This plan"} is a 1-month
                      auto-renewing subscription at{" "}
                      {iap.priceForTier(tier?.tier) || `₹ ${tierCost}`}/month.
                      Payment is charged to your Apple Account at confirmation
                      of purchase. It renews automatically unless auto-renew is
                      turned off at least 24 hours before the end of the current
                      period. You can manage or cancel it any time in your Apple
                      Account settings.
                    </Text>

                    <View style={styles.iapLinksRow}>
                      <Text
                        style={styles.iapLink}
                        onPress={() => {
                          // Close the modal first — the terms screen would
                          // otherwise render behind it and look like a no-op.
                          toggleModal();
                          router.push("/terms" as any);
                        }}
                      >
                        Terms of Use
                      </Text>
                      <Text style={styles.iapLinkSeparator}>•</Text>
                      <Text
                        style={styles.iapLink}
                        onPress={() => {
                          toggleModal();
                          router.push("/terms?tab=privacy" as any);
                        }}
                      >
                        Privacy Policy
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>

    {/* Android/HDFC in-app checkout. iOS uses Apple IAP and never opens this. */}
    {!isIOS && (
      <HdfcPaymentWebView
        visible={webviewVisible}
        paymentUrl={paymentUrl}
        onReturn={onWebViewReturn}
        onCancel={onWebViewCancel}
      />
    )}
    </>
  );
}

const makeStyles = (c: AppColors, isDark: boolean) =>
  StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: c.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "95%",
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: c.onGold,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: c.onGold,
    textAlign: "center",
    lineHeight: 28,
    marginTop:8
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: c.card,
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.5 : 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: c.text,
    textAlign: "center",
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 1,
  },
  checkIcon: {
    color: c.success,
    fontSize: 13,
    fontWeight: "700",
    marginRight: 6,
  },
  featureText: {
    fontSize: 15,
    color: c.text,
    flex: 1,
  },
  featureDetail: {
    fontSize: 13,
    color: c.textSecondary,
    fontWeight: "500",
    paddingLeft: 24,
    marginTop: 2,
  },
  dashedDivider: {
    borderBottomWidth: 2,
    borderBottomColor: c.border,
    borderStyle: "dashed",
    marginVertical: 16,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabelContainer: {
    flexDirection: "row",
  },
  infoLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: c.text,
  },
  infoLabelHighlight: {
    fontSize: 17,
    fontWeight: "600",
    color: c.gold,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "700",
    color: c.text,
  },
  inputSection: {
    marginBottom: 8,
  },
  inputGroup: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: c.inputBorder,
    borderRadius: 6,
    padding: 12,
    fontSize: 15,
    color: c.text,
    backgroundColor: c.inputBg,
  },
  applyButton: {
    backgroundColor: c.gold,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
  },
  applyPointsButton: {
    backgroundColor: c.goldDeep,
  },
  applyButtonText: {
    color: c.onGold,
    fontSize: 14,
    fontWeight: "600",
  },
  couponApplied: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: c.borderLight,
  },
  couponAppliedText: {
    fontSize: 14,
    color: c.success,
    fontWeight: "500",
  },
  removeText: {
    fontSize: 14,
    color: c.error,
    fontWeight: "600",
  },
  billSummary: {
    marginBottom: 8,
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 15,
    color: c.text,
  },
  billValue: {
    fontSize: 15,
    color: c.text,
    fontWeight: "500",
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: c.border,
  },
  totalLabel: {
    fontSize: 16,
    color: c.text,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 16,
    color: c.text,
    fontWeight: "700",
  },
  payButton: {
    backgroundColor: c.success,
    paddingVertical:11,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.4 : 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  payButtonDisabled: {
    backgroundColor: c.textMuted,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  restoreButton: {
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 10,
  },
  restoreButtonText: {
    color: c.onGold,
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  iapDisclosure: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  iapDisclosureText: {
    fontSize: 11,
    lineHeight: 16,
    color: c.textSecondary,
    textAlign: "center",
  },
  iapLinksRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    gap: 8,
  },
  iapLink: {
    fontSize: 12,
    fontWeight: "700",
    color: c.gold,
    textDecorationLine: "underline",
  },
  iapLinkSeparator: {
    fontSize: 12,
    color: c.textMuted,
  },
});

export default Billing;
