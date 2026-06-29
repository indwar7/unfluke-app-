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

import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { ShieldCheck, ArrowLeft, RotateCw } from "lucide-react-native";

// Import images
const logoLight = require("../assets/images/unfluke/UNFLUKE -05-NEW.png");

const OTP_LENGTH = 6;

const OtpVerification = () => {
  const { colors: c, isDark } = useTheme();
  const s = makeStyles(c, isDark);
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
        style={s.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={s.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Dark Header */}
          <View style={[s.darkHeader, { paddingTop: insets.top + 40 }]}>
            <Image
              source={logoLight}
              style={s.logo}
              resizeMode="contain"
            />
            <Text style={s.tagline}>
              Backtest &middot; Analyse &middot; Trade smarter
            </Text>
          </View>

          {/* Form Card */}
          <View style={s.card}>
            <View style={s.cardBody}>
              {/* Gold shield badge */}
              <View style={s.badge}>
                <ShieldCheck size={26} color={c.gold} strokeWidth={2.2} />
              </View>

              {/* Title */}
              <Text style={s.welcomeTitle}>Verify your number</Text>
              <Text style={s.welcomeSubtitle}>
                Enter the 6-digit OTP sent to{" "}
                <Text style={s.phoneHighlight}>
                  +91 {formatPhoneNumber(phoneNumber)}
                </Text>
              </Text>

              {/* OTP Input Boxes */}
              <View style={s.otpRow}>
                {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[
                      s.otpBox,
                      validation.values.otp[index]
                        ? s.otpBoxFilled
                        : null,
                      validation.touched.otp && validation.errors.otp
                        ? s.otpBoxError
                        : null,
                    ]}
                    placeholderTextColor={c.textMuted}
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
                <Text style={s.errorText}>{validation.errors.otp}</Text>
              ) : null}

              {/* Verify OTP Button — gold gradient CTA */}
              <TouchableOpacity
                style={[s.button, loading && s.buttonDisabled]}
                onPress={() => validation.handleSubmit()}
                disabled={loading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[c.goldBright, c.gold, c.goldDeep]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.buttonGradient}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={c.onGold} />
                  ) : (
                    <Text style={s.buttonText}>Verify OTP</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Resend OTP */}
              <TouchableOpacity
                style={s.resendBtn}
                onPress={handleResendOtp}
                disabled={!canResend || resendLoading}
              >
                {resendLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={c.gold}
                    style={{ marginRight: 8 }}
                  />
                ) : canResend ? (
                  <RotateCw
                    size={15}
                    color={c.gold}
                    strokeWidth={2.2}
                    style={{ marginRight: 7 }}
                  />
                ) : null}
                <Text style={[s.resendText, canResend && s.resendTextActive]}>
                  {resendLoading
                    ? "Sending..."
                    : !canResend
                    ? `Resend OTP in ${countdown}s`
                    : "Resend OTP"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Back to Forgot Password */}
            <View style={s.backContainer}>
              <TouchableOpacity
                style={s.backRow}
                onPress={() => navigation.navigate("forgot-password")}
                activeOpacity={0.7}
              >
                <ArrowLeft size={16} color={c.gold} strokeWidth={2.4} />
                <Text style={s.backLink}>Back to Forgot Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </>
  );
};

const makeStyles = (c: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? c.background : c.primary,
    },
    scrollContainer: {
      flexGrow: 1,
    },

    // Dark hero header
    darkHeader: {
      backgroundColor: isDark ? c.background : c.primary,
      paddingBottom: 64,
      alignItems: "center",
      justifyContent: "center",
    },
    logo: {
      width: 180,
      height: 60,
      tintColor: "#fff",
    },
    tagline: {
      fontSize: 12.5,
      color: "rgba(255,255,255,0.55)",
      marginTop: 8,
      letterSpacing: 0.6,
    },

    // Form card
    card: {
      flex: 1,
      backgroundColor: c.surface,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      borderWidth: 1,
      borderBottomWidth: 0,
      borderColor: c.border,
      marginTop: -26,
      paddingTop: 8,
    },
    cardBody: {
      paddingHorizontal: 24,
      paddingTop: 30,
    },

    // Gold shield badge
    badge: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: c.goldLight,
      borderWidth: 1,
      borderColor: c.gold,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 18,
    },

    welcomeTitle: {
      fontSize: 25,
      fontWeight: "800",
      color: c.text,
      marginBottom: 6,
      letterSpacing: 0.2,
    },
    welcomeSubtitle: {
      fontSize: 14,
      color: c.textSecondary,
      marginBottom: 30,
      lineHeight: 21,
    },
    phoneHighlight: {
      fontWeight: "700",
      color: c.gold,
    },

    // OTP boxes
    otpRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 11,
      marginBottom: 8,
    },
    otpBox: {
      width: 50,
      height: 58,
      backgroundColor: c.inputBg,
      borderWidth: 1.5,
      borderColor: c.inputBorder,
      borderRadius: 14,
      textAlign: "center",
      fontSize: 22,
      fontWeight: "800",
      color: c.text,
    },
    otpBoxFilled: {
      borderColor: c.gold,
      backgroundColor: c.goldLight,
      color: c.text,
    },
    otpBoxError: {
      borderColor: c.error,
      borderWidth: 1.5,
    },

    // Verify CTA
    button: {
      borderRadius: 16,
      height: 54,
      marginTop: 26,
      overflow: "hidden",
      shadowColor: c.gold,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.32,
      shadowRadius: 14,
      elevation: 6,
    },
    buttonGradient: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: c.onGold,
      fontSize: 16,
      fontWeight: "800",
      letterSpacing: 0.4,
    },

    // Resend
    resendBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 22,
    },
    resendText: {
      fontSize: 14,
      color: c.textSecondary,
      fontWeight: "600",
    },
    resendTextActive: {
      color: c.gold,
      fontWeight: "700",
    },

    // Error
    errorText: {
      color: c.error,
      fontSize: 12,
      marginTop: 8,
      fontWeight: "600",
      textAlign: "center",
    },

    // Back link
    backContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 26,
      paddingBottom: 34,
    },
    backRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    backLink: {
      fontSize: 14,
      color: c.gold,
      fontWeight: "700",
    },
  });

export default OtpVerification;
