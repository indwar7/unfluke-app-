import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Linking,
} from "react-native";
import { WebView } from "react-native-webview";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { isAllowedPaymentAppLink } from "@/helpers/externalLinks";

// When the gateway finishes, the backend redirects the hosted page to
// {PUBLIC_URL}/payment-result (or /custom-payment-result). We use that ONLY as a
// "checkout finished, go poll" signal — the `status` query param is never trusted
// (see PAYMENT_DOCS.md §5). Matching on the path keeps us robust to query changes.
const RETURN_PATHS = ["/payment-result", "/custom-payment-result"];

const isReturnUrl = (u?: string | null) =>
  !!u && RETURN_PATHS.some((p) => u.includes(p));

type Props = {
  visible: boolean;
  paymentUrl?: string | null;
  /** Fired once when the WebView reaches the return URL (payment flow finished). */
  onReturn: () => void;
  /** Fired when the user backs out via the Cancel button / hardware back. */
  onCancel: () => void;
};

export default function HdfcPaymentWebView({
  visible,
  paymentUrl,
  onReturn,
  onCancel,
}: Props) {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const [loading, setLoading] = useState(true);
  // Guard so the return handler fires exactly once even across multi-hop redirects.
  const handledRef = useRef(false);

  useEffect(() => {
    if (visible) {
      handledRef.current = false;
      setLoading(true);
    }
  }, [visible, paymentUrl]);

  const maybeHandleReturn = (candidateUrl?: string | null) => {
    if (!handledRef.current && isReturnUrl(candidateUrl)) {
      handledRef.current = true;
      onReturn();
      return true;
    }
    return false;
  };

  // Decide whether the WebView should load a URL. Returns false to BLOCK the
  // WebView from loading it (either because we handled it, or because it's a
  // deep link the OS must handle).
  const onShouldStartLoadWithRequest = (req: { url: string }) => {
    const url = req?.url || "";

    // Payment finished → intercept and go poll; don't load the web result page.
    if (maybeHandleReturn(url)) return false;

    // Non-http(s) schemes are UPI / bank-app deep links (upi://, phonepe://,
    // tez://, paytmmp://, intent://, gpay://, credpay://, etc.). A WebView can't
    // render these — it fails with ERR_UNKNOWN_URL_SCHEME and the UPI payment
    // dies. Hand them to the OS so the actual UPI app opens, and block the load.
    //
    // Only for schemes on the payment allowlist, though: this URL comes from the
    // gateway's page, not from us, so an unrestricted openURL here would let
    // anything that page navigates to launch any installed app without the user
    // choosing it. That is the "forced redirect" pattern Google's malware policy
    // names. Anything else is simply blocked — the user stays on checkout.
    if (url && !/^(https?|about|data|blob):/i.test(url)) {
      if (isAllowedPaymentAppLink(url)) {
        Linking.openURL(url).catch(() => {
          // App not installed / can't handle — nothing to do; user can pick
          // another method on the hosted page.
        });
      } else if (__DEV__) {
        console.warn("[payment] blocked non-payment scheme from gateway:", url);
      }
      return false;
    }

    return true;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onCancel}
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Secure Payment</Text>
          {/* Spacer to keep the title centered against the Cancel button. */}
          <View style={styles.headerSpacer} />
        </View>

        {visible && paymentUrl ? (
          <WebView
            source={{ uri: paymentUrl }}
            // Counter-intuitive but deliberate: this WIDENS originWhitelist in
            // order to TIGHTEN the policy. react-native-webview checks the
            // whitelist BEFORE onShouldStartLoadWithRequest, and when a URL
            // fails it runs its own fallback — Linking.canOpenURL().then(openURL)
            // — without ever consulting the guard. Under the default whitelist
            // (http/https only) every UPI and bank scheme took that path, so
            // isAllowedPaymentAppLink below was unreachable and the gateway page
            // could open ANY installed app, denylist and all. Deferring every URL
            // to the guard is what actually enforces the policy.
            originWhitelist={["*"]}
            // Handle return-URL interception AND UPI/bank-app deep-link hand-off.
            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
            // Safety net for redirects that don't trigger the guard above.
            onNavigationStateChange={(nav) => maybeHandleReturn(nav.url)}
            onLoadEnd={() => setLoading(false)}
            startInLoadingState
            javaScriptEnabled
            domStorageEnabled
            // UPI intent / bank-app deep links open outside the WebView on Android.
            setSupportMultipleWindows={false}
          />
        ) : null}

        {loading && (
          <View style={styles.loaderOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color={c.gold} />
            <Text style={styles.loaderText}>Loading secure checkout…</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingTop: Platform.OS === "ios" ? 52 : 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
      backgroundColor: c.card,
    },
    cancelButton: {
      minWidth: 64,
    },
    cancelText: {
      color: c.gold,
      fontSize: 16,
      fontWeight: "600",
    },
    title: {
      color: c.text,
      fontSize: 16,
      fontWeight: "700",
    },
    headerSpacer: {
      minWidth: 64,
    },
    loaderOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.background,
    },
    loaderText: {
      marginTop: 12,
      color: c.textMuted,
      fontSize: 14,
    },
  });
