import React, { useEffect, useState } from "react";
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
import { router, Stack } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useOnboarding } from "@/redux/contextHelper";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

// Redux actions
import {
  loginUser,
  socialLogin,
  resetLoginFlag,
  googleLogin,
  appleLogin,
} from "../redux/Unfluke_slices/thunks";
import Toast from "react-native-toast-message";

import GoogleSignInButton from "@/components/UnflukeMain/Common/GoogleSignInButton";
import AppleSignInButton from "@/components/UnflukeMain/Common/AppleSignInButton";
import {
  isGoogleSignInConfigured,
  signInWithGoogle,
} from "../helpers/googleAuth";
import {
  isAppleSignInConfigured,
  signInWithApple,
} from "../helpers/appleAuth";
import { setPendingSocialSignup } from "../helpers/socialSignupSession";

const logoLight = require("../assets/images/unfluke/UNFLUKE -05-NEW.png");

// Fixed near-black header tone so the brand panel stays dark in both themes
// (in dark mode c.primary is gold, so we use a dedicated dark value here).
const HEADER_BG = "#0A0B0E";

interface LoginState {
  user: any;
  error: string | null;
  loading: boolean;
  errorMsg: string | null;
  loginSuccess: boolean;
  errorCount: number;
}

const UnflukeLogin = () => {
  const { colors: c, isDark } = useTheme();
  const s = makeStyles(c, isDark);

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<any>();
  const { restart, onFinish, onBoarding } = useOnboarding();

  const selectLayoutState = (state: any) => state;

  const loginpageData = createSelector(selectLayoutState, (state: any): LoginState => ({
    user: state.Login.user,
    error: state.Login.error,
    loading: state.Login.loading,
    errorMsg: state.Login.errorMsg,
    loginSuccess: state.Login.loginSuccess,
    errorCount: state.Login.errorCount,
  }));

  const { user, error, loading, errorMsg, loginSuccess, errorCount } =
    useSelector(loginpageData);
  const [lastShownErrorCount, setLastShownErrorCount] = useState(errorCount);

  const [isNavigating, setIsNavigating] = useState(false);
  const [userLogin, setUserLogin] = useState({});
  const [passwordShow, setPasswordShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Tracked separately from isLoading so the two login methods stay fully
  // independent — a stuck or failing Google flow must never disable the phone +
  // password form, which is the primary way into the app.
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleAvailable = isGoogleSignInConfigured();
  // Same isolation for Apple: its own busy flag, so neither social button can
  // wedge the other or the password form.
  const [appleLoading, setAppleLoading] = useState(false);
  const appleAvailable = isAppleSignInConfigured();
  const socialBusy = googleLoading || appleLoading;

  // Handle successful login
  useEffect(() => {
    if (loginSuccess && user?._id && !isNavigating) {
      setIsNavigating(true);

      const navigateToDashboard = async () => {
        try {
          await onFinish();
          dispatch(resetLoginFlag());
          setIsLoading(false);
          router.replace("/dashboard");
        } catch (error) {
          console.error("Navigation error:", error);
          setIsNavigating(false);
        }
      };

      navigateToDashboard();
    }
  }, [loginSuccess, user?._id]);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      phone: "",
      password: "",
    },
    validationSchema: Yup.object({
      phone: Yup.string()
        .matches(/^\d{10}$/, "Please enter a 10-digit phone number")
        .required("Please Enter Your Mobile Number"),
      password: Yup.string().required("Please Enter Your Password"),
    }),
    onSubmit: (values) => {
      console.log("YES LOGGING", values);
      setIsNavigating(false);
      setLastShownErrorCount(errorCount);
      dispatch(loginUser(values));
    },
  });

  /**
   * Google Sign-In entry point.
   *
   * Wrapped so that nothing here can leave the screen stuck: the button always
   * returns to idle, and every failure path is a toast rather than a throw.
   * On success the existing loginSuccess effect above handles navigation, so
   * both login methods converge on the same code.
   */
  const handleGoogleSignIn = async () => {
    if (socialBusy || isLoading) return;

    setGoogleLoading(true);
    setIsNavigating(false);

    try {
      const result = await signInWithGoogle();

      // User dismissed the account chooser — stay silent, just reset the button.
      if (result.status === "cancelled") return;

      if (result.status === "error") {
        Toast.show({
          type: "error",
          text1: "Google Sign-In",
          text2: result.message,
          position: "top",
          visibilityTime: 3000,
        });
        return;
      }

      const outcome: any = await dispatch(googleLogin(result.idToken));

      // Brand-new user: no account exists yet because Unfluke accounts are keyed
      // on a phone-OTP-verified number. Carry the identity in memory and collect
      // the phone number on the next screen.
      if (outcome?.status === "needsSignup") {
        setPendingSocialSignup({
          provider: "google",
          ...outcome.signupData,
          credential: result.idToken,
        });
        router.push("/complete-google-signup" as any);
        return;
      }

      // "success" needs no work here — the loginSuccess effect navigates.
      // "error" already dispatched apiError, which the error toast effect shows.
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Google Sign-In",
        text2:
          error?.message ||
          "Could not sign in with Google. Please use your mobile number and password.",
        position: "top",
        visibilityTime: 3000,
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  /**
   * Sign in with Apple entry point.
   *
   * Structured identically to handleGoogleSignIn so the two stay easy to read
   * side by side, and so both converge on the same loginSuccess effect for
   * navigation.
   */
  const handleAppleSignIn = async () => {
    if (socialBusy || isLoading) return;

    setAppleLoading(true);
    setIsNavigating(false);

    try {
      const result = await signInWithApple();

      // User dismissed the Apple sheet — stay silent, just reset the button.
      if (result.status === "cancelled") return;

      if (result.status === "error") {
        Toast.show({
          type: "error",
          text1: "Sign in with Apple",
          text2: result.message,
          position: "top",
          visibilityTime: 3000,
        });
        return;
      }

      const outcome: any = await dispatch(
        appleLogin(result.identityToken, result.name),
      );

      if (outcome?.status === "needsSignup") {
        setPendingSocialSignup({
          provider: "apple",
          ...outcome.signupData,
          // Apple never returns an avatar, so the completion screen falls back
          // to its initial-letter placeholder.
          credential: result.identityToken,
        });
        router.push("/complete-google-signup" as any);
        return;
      }

      // "success" needs no work here — the loginSuccess effect navigates.
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Sign in with Apple",
        text2:
          error?.message ||
          "Could not sign in with Apple. Please use your mobile number and password.",
        position: "top",
        visibilityTime: 3000,
      });
    } finally {
      setAppleLoading(false);
    }
  };

  const signIn = (type: any) => {
    dispatch(socialLogin(type, router));
  };

  const socialResponse = (type: any) => {
    signIn(type);
  };

  useEffect(() => {
    if (error && errorCount > lastShownErrorCount) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error,
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
      });
      setIsLoading(false);
      setLastShownErrorCount(errorCount);
    }
  }, [errorCount, error]);

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
            <View style={s.headerGlow} />
            <Image
              source={logoLight}
              style={[s.logo, !isDark && { tintColor: "#fff" }]}
              resizeMode="contain"
            />
            <Text style={s.tagline}>
              Backtest &middot; Analyse &middot; Trade smarter
            </Text>
          </View>

          {/* Form Card */}
          <View style={s.card}>
            <View style={s.cardHandle} />
            <View style={s.cardBody}>
              {/* Welcome */}
              <Text style={s.welcomeTitle}>Welcome back</Text>
              <Text style={s.welcomeSubtitle}>
                Sign in to continue to Unfluke
              </Text>

              {/* Phone Input */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Mobile number</Text>
                <View style={[
                  s.inputRow,
                  validation.touched.phone && validation.errors.phone && s.inputError,
                ]}>
                  <Text style={s.countryCode}>+91</Text>
                  <View style={s.inputDivider} />
                  <TextInput
                    style={s.input}
                    placeholder="98765 43210"
                    placeholderTextColor={c.textMuted}
                    keyboardType="numeric"
                    maxLength={10}
                    value={validation.values.phone}
                    onChangeText={(text) => {
                      const digitsOnly = text.replace(/\D+/g, "");
                      validation.setFieldValue("phone", digitsOnly);
                    }}
                    onBlur={() => validation.setFieldTouched("phone")}
                  />
                </View>
                {validation.touched.phone && validation.errors.phone ? (
                  <Text style={s.errorText}>
                    {validation.errors.phone}
                  </Text>
                ) : null}
              </View>

              {/* Password Input */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Password</Text>
                <View style={[
                  s.inputRow,
                  validation.touched.password && validation.errors.password && s.inputError,
                ]}>
                  <TextInput
                    style={[s.input, { flex: 1 }]}
                    placeholder="Enter Password"
                    placeholderTextColor={c.textMuted}
                    secureTextEntry={!passwordShow}
                    value={validation.values.password}
                    onChangeText={validation.handleChange("password")}
                    onBlur={() => validation.setFieldTouched("password")}
                  />
                  <TouchableOpacity
                    onPress={() => setPasswordShow(!passwordShow)}
                    style={s.eyeBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {passwordShow ? (
                      <Eye size={18} color={c.textMuted} />
                    ) : (
                      <EyeOff size={18} color={c.textMuted} />
                    )}
                  </TouchableOpacity>
                </View>
                {validation.touched.password && validation.errors.password ? (
                  <Text style={s.errorText}>
                    {validation.errors.password}
                  </Text>
                ) : null}
              </View>

              {/* Forgot Password */}
              <TouchableOpacity
                onPress={() => router.push("/forgot-password" as any)}
                style={s.forgotBtn}
              >
                <Text style={s.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              {/* Sign In Button */}
              <TouchableOpacity
                style={[s.button, isLoading && s.buttonDisabled]}
                onPress={() => {
                  setIsLoading(true);
                  validation.handleSubmit();
                }}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[c.goldBright, c.gold, c.goldDeep]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.buttonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={c.onGold} />
                  ) : (
                    <Text style={s.buttonText}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Social sign-in. Each button is hidden when unusable on this
                  build/platform rather than shown and always failing, so the
                  "or" divider only appears when at least one survives.

                  Apple sits first on iOS: Guideline 4.8 wants it presented as
                  an equivalent option to the other social logins, and putting
                  it below Google reads as the lesser choice. */}
              {appleAvailable || googleAvailable ? (
                <>
                  <View style={s.orRow}>
                    <View style={s.dividerLine} />
                    <Text style={s.orText}>or</Text>
                    <View style={s.dividerLine} />
                  </View>

                  {appleAvailable ? (
                    <AppleSignInButton
                      onPress={handleAppleSignIn}
                      loading={appleLoading}
                      disabled={isLoading || googleLoading}
                    />
                  ) : null}

                  {googleAvailable ? (
                    <View style={appleAvailable ? s.socialGap : null}>
                      <GoogleSignInButton
                        onPress={handleGoogleSignIn}
                        loading={googleLoading}
                        disabled={isLoading || appleLoading}
                      />
                    </View>
                  ) : null}
                </>
              ) : null}
            </View>

            {/* Divider */}
            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>New to Unfluke?</Text>
              <View style={s.dividerLine} />
            </View>

            {/* Signup Link */}
            <View style={s.signupContainer}>
              <Text style={s.signupText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push("/registerpage" as any)}
              >
                <Text style={s.signupLink}>Sign up</Text>
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
      backgroundColor: HEADER_BG,
    },
    scrollContainer: {
      flexGrow: 1,
    },

    // Dark header
    darkHeader: {
      backgroundColor: HEADER_BG,
      paddingBottom: 64,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    headerGlow: {
      position: "absolute",
      top: -120,
      width: 320,
      height: 320,
      borderRadius: 160,
      backgroundColor: c.gold,
      opacity: 0.1,
    },
    logo: {
      width: 180,
      height: 60,
    },
    tagline: {
      fontSize: 13,
      color: "rgba(255,255,255,0.55)",
      marginTop: 8,
      letterSpacing: 0.5,
    },

    // Form card
    card: {
      flex: 1,
      backgroundColor: c.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      marginTop: -24,
      paddingTop: 8,
      borderTopWidth: isDark ? 1 : 0,
      borderColor: c.border,
    },
    cardHandle: {
      alignSelf: "center",
      width: 44,
      height: 5,
      borderRadius: 3,
      backgroundColor: c.border,
      marginTop: 12,
      marginBottom: 4,
    },
    cardBody: {
      paddingHorizontal: 24,
      paddingTop: 22,
    },
    welcomeTitle: {
      fontSize: 26,
      fontWeight: "800",
      color: c.text,
      letterSpacing: -0.4,
      marginBottom: 6,
    },
    welcomeSubtitle: {
      fontSize: 14,
      color: c.textSecondary,
      marginBottom: 28,
    },

    // Form
    inputGroup: {
      marginBottom: 18,
    },
    label: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.2,
      textTransform: "uppercase",
      color: c.textMuted,
      marginBottom: 8,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.inputBg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.inputBorder,
      paddingHorizontal: 16,
      height: 54,
    },
    countryCode: {
      fontSize: 15,
      fontWeight: "700",
      color: c.text,
      marginRight: 10,
    },
    inputDivider: {
      width: 1,
      height: 24,
      backgroundColor: c.border,
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: c.text,
      fontWeight: "500",
      padding: 0,
    },
    inputError: {
      borderColor: c.error,
      borderWidth: 1.5,
    },
    eyeBtn: {
      padding: 6,
    },
    forgotBtn: {
      alignSelf: "flex-end",
      marginBottom: 24,
      marginTop: -4,
    },
    forgotText: {
      color: c.gold,
      fontSize: 13,
      fontWeight: "700",
    },

    // Button
    button: {
      borderRadius: 16,
      overflow: "hidden",
    },
    buttonGradient: {
      height: 54,
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
    errorText: {
      color: c.error,
      fontSize: 12,
      marginTop: 6,
      fontWeight: "600",
    },

    // "or" separator between password login and Google
    orRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 20,
      marginBottom: 20,
    },
    // Only applied when both social buttons render, so a lone button keeps the
    // spacing it had before Apple was added.
    socialGap: {
      marginTop: 12,
    },
    orText: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      color: c.textMuted,
      paddingHorizontal: 12,
    },

    // Divider
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 24,
      marginTop: 28,
      marginBottom: 16,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: c.border,
    },
    dividerText: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      color: c.textMuted,
      paddingHorizontal: 12,
    },

    // Signup
    signupContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: 36,
    },
    signupText: {
      fontSize: 14,
      color: c.textSecondary,
    },
    signupLink: {
      fontSize: 14,
      color: c.gold,
      fontWeight: "800",
    },
  });

export default UnflukeLogin;
