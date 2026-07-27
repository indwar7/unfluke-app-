import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

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
            // Block the load of the return page and hand control back to the app.
            onShouldStartLoadWithRequest={(req) => !maybeHandleReturn(req.url)}
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
