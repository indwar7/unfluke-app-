import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import * as Yup from "yup";
import { useFormik } from "formik";
import { createSelector } from "reselect";
import { useNavigation, useRoute } from "@react-navigation/native";
import { router, Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Redux actions
import {
  verifyOtp,
  resetOtpVerificationFlag,
  resendOtp,
} from "../redux/Unfluke_slices/thunks";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Colors } from "@/constants/Colors";

// Import images
const logoLight = require("../assets/images/unfluke/UNFLUKE -05-NEW.png");

const c = Colors.light;

const OTP_LENGTH = 6;

const OtpVerification = () => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Refs for individual OTP inputs
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Get phone number from route params
  const phoneNumber = route.params?.phone;

  console.log("PHONE NUMBER", phoneNumber, 433);

  // Redirect if no phone number is provided
  useEffect(() => {
    if (!phoneNumber) {
      navigation.navigate("forgot-password");
    }
  }, [phoneNumber, navigation]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const selectLayoutState = (state) => state;
  const otpVerificationSelector = createSelector(
    selectLayoutState,
    (state) => ({
      loading: state.OtpVerification?.loading || false,
      error: state.OtpVerification?.error || null,
      message: state.OtpVerification?.message || null,
      token: state.OtpVerification?.token || null,
      success: state.OtpVerification?.success || false,
      resendLoading: state.OtpVerification?.resendLoading || false,
      resendSuccess: state.OtpVerification?.resendSuccess || false,
      resendError: state.OtpVerification?.resendError || null,
    })
  );

  const {
    loading,
    error,
    message,
    token: verifiedToken,
    success,
    resendLoading,
    resendSuccess,
    resendError,
  } = useSelector(otpVerificationSelector);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (success && !isNavigating) {
      setIsNavigating(true);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: message || "OTP verified successfully!",
        position: "top",
        visibilityTime: 2000,
      });

      timers.push(
        setTimeout(() => {
          navigation.navigate("reset-password", {
            phone: phoneNumber,
            // Prefer the server-issued verification token; fall back to
            // the user-entered OTP only if the backend does not return one
            // (older API contract).
            token: verifiedToken || validation.values.otp,
          });
          dispatch(resetOtpVerificationFlag());
          setIsNavigating(false);
        }, 2000)
      );
    }

    if (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error,
        position: "top",
        visibilityTime: 3000,
      });
      timers.push(
        setTimeout(() => {
          dispatch(resetOtpVerificationFlag());
        }, 3000)
      );
    }

    if (resendSuccess) {
      setCountdown(60);
      setCanResend(false);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "OTP resent successfully!",
        position: "top",
        visibilityTime: 3000,
      });
      timers.push(
        setTimeout(() => {
          dispatch(resetOtpVerificationFlag());
        }, 3000)
      );
    }

    if (resendError) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: resendError,
        position: "top",
        visibilityTime: 3000,
      });
    }

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [
    success,
    error,
    resendSuccess,
    resendError,
    dispatch,
    navigation,
    phoneNumber,
    message,
  ]);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      phone: phoneNumber || "",
      otp: "",
    },
    validationSchema: Yup.object({
      otp: Yup.string()
        .matches(/^[0-9]{6}$/, "OTP must be 6 digits")
        .required("Please Enter OTP"),
    }),
    onSubmit: async (values) => {
      try {
        const storedData = await AsyncStorage.getItem("forgotPasswordResponse");
        if (!storedData) {
          Toast.show({
            type: "error",
            text1: "Session expired",
            text2: "Please request a new OTP from the forgot password screen",
            position: "top",
            visibilityTime: 3000,
          });
          return;
        }

        let parsed;
        try {
          parsed = JSON.parse(storedData);
        } catch (parseErr) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Stored session is corrupted. Please request a new OTP.",
            position: "top",
            visibilityTime: 3000,
          });
          await AsyncStorage.removeItem("forgotPasswordResponse");
          return;
        }

        parsed["otp"] = values.otp;
        dispatch(verifyOtp(parsed));
      } catch (error) {
        console.error("Error reading from AsyncStorage", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Could not verify OTP. Please try again.",
          position: "top",
          visibilityTime: 3000,
        });
      }
    },
  });

  const handleResendOtp = () => {
    if (canResend) {
      dispatch(resendOtp({ phone: phoneNumber }));
    }
  };

  const formatPhoneNumber = (phone) => {
    if (phone && phone.length === 10) {
      return phone.replace(/(\d{5})(\d{5})/, "$1 $2");
    }
    return phone;
  };

  // Handle individual OTP box input
  const handleOtpChange = (text: string, index: number) => {
    const digit = text.replace(/\D+/g, "");
    const currentOtp = validation.values.otp;
    const otpArray = currentOtp.split("");

    // Pad array to OTP_LENGTH
    while (otpArray.length < OTP_LENGTH) {
      otpArray.push("");
    }

    if (digit.length === 1) {
      otpArray[index] = digit;
      const newOtp = otpArray.join("");
      validation.setFieldValue("otp", newOtp);

      // Auto-advance to next input
      if (index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (digit.length === 0) {
      otpArray[index] = "";
      const newOtp = otpArray.join("");
      validation.setFieldValue("otp", newOtp);
    } else if (digit.length > 1) {
      // Handle paste: fill from current index
      const digits = digit.split("");
      for (let i = 0; i < digits.length && index + i < OTP_LENGTH; i++) {
        otpArray[index + i] = digits[i];
      }
      const newOtp = otpArray.join("");
      validation.setFieldValue("otp", newOtp);
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      const currentOtp = validation.values.otp;
      if (!currentOtp[index] && index > 0) {
        // If current box is empty, go back and clear previous
        const otpArray = currentOtp.split("");
        while (otpArray.length < OTP_LENGTH) {
          otpArray.push("");
        }
        otpArray[index - 1] = "";
        validation.setFieldValue("otp", otpArray.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: "" }} />
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Dark Header */}
          <View style={[styles.darkHeader, { paddingTop: insets.top + 40 }]}>
            <Image
              source={logoLight}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>
              Backtest &middot; Analyse &middot; Trade smarter
            </Text>
          </View>

          {/* White Form Card */}
          <View style={styles.card}>
            <View style={styles.cardBody}>
              {/* Title */}
              <Text style={styles.welcomeTitle}>Verify your number</Text>
              <Text style={styles.welcomeSubtitle}>
                Enter the 6-digit OTP sent to{" "}
                <Text style={styles.phoneHighlight}>
                  +91 {formatPhoneNumber(phoneNumber)}
                </Text>
              </Text>

              {/* OTP Input Boxes */}
              <View style={styles.otpRow}>
                {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpBox,
                      validation.values.otp[index]
                        ? styles.otpBoxFilled
                        : null,
                      validation.touched.otp && validation.errors.otp
                        ? styles.otpBoxError
                        : null,
                    ]}
                    keyboardType="numeric"
                    maxLength={1}
                    value={validation.values.otp[index] || ""}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleOtpKeyPress(e, index)}
                    onBlur={() => validation.setFieldTouched("otp")}
                    selectTextOnFocus
                  />
                ))}
              </View>
              {validation.touched.otp && validation.errors.otp ? (
                <Text style={styles.errorText}>{validation.errors.otp}</Text>
              ) : null}

              {/* Verify OTP Button */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={() => validation.handleSubmit()}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>

              {/* Resend OTP */}
              <TouchableOpacity
                style={styles.resendBtn}
                onPress={handleResendOtp}
                disabled={!canResend || resendLoading}
              >
                {resendLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={c.textSecondary}
                    style={{ marginRight: 8 }}
                  />
                ) : null}
                <Text style={styles.resendText}>
                  {resendLoading
                    ? "Sending..."
                    : !canResend
                    ? `Resend OTP in ${countdown}s`
                    : "Resend OTP"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Back to Forgot Password */}
            <View style={styles.backContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate("forgot-password")}
              >
                <Text style={styles.backLink}>Back to Forgot Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.primary,
  },
  scrollContainer: {
    flexGrow: 1,
  },

  // Dark header
  darkHeader: {
    backgroundColor: c.primary,
    paddingBottom: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 180,
    height: 60,
    tintColor: "#fff",
  },
  tagline: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    marginTop: 6,
    letterSpacing: 0.5,
  },

  // White card
  card: {
    flex: 1,
    backgroundColor: c.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingTop: 8,
  },
  cardBody: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: c.text,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: c.textSecondary,
    marginBottom: 28,
    lineHeight: 20,
  },
  phoneHighlight: {
    fontWeight: "600",
    color: c.text,
  },

  // OTP boxes
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 8,
  },
  otpBox: {
    width: 52,
    height: 52,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold" as any,
    color: c.text,
  },
  otpBoxFilled: {
    borderColor: c.primary,
    backgroundColor: c.surface,
  },
  otpBoxError: {
    borderColor: c.error,
    borderWidth: 1.5,
  },

  // Button
  button: {
    backgroundColor: c.primary,
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Resend
  resendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
    color: c.textSecondary,
    fontWeight: "500",
  },

  // Error
  errorText: {
    color: c.error,
    fontSize: 12,
    marginTop: 6,
    fontWeight: "500",
    textAlign: "center",
  },

  // Back link
  backContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 32,
  },
  backLink: {
    fontSize: 14,
    color: c.profit,
    fontWeight: "700",
  },
});

export default OtpVerification;
