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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useOnboarding } from "@/redux/contextHelper";
import { Colors } from "@/constants/Colors";

// Redux actions
import {
  loginUser,
  socialLogin,
  resetLoginFlag,
} from "../redux/Unfluke_slices/thunks";
import Toast from "react-native-toast-message";

const logoLight = require("../assets/images/unfluke/UNFLUKE -05-NEW.png");

const c = Colors.light;

interface LoginState {
  user: any;
  error: string | null;
  loading: boolean;
  errorMsg: string | null;
  loginSuccess: boolean;
  errorCount: number;
}

const UnflukeLogin = () => {
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
              {/* Welcome */}
              <Text style={styles.welcomeTitle}>Welcome back</Text>
              <Text style={styles.welcomeSubtitle}>
                Sign in to continue to Unfluke
              </Text>

              {/* Phone Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mobile number</Text>
                <View style={[
                  styles.inputRow,
                  validation.touched.phone && validation.errors.phone && styles.inputError,
                ]}>
                  <Text style={styles.countryCode}>+91</Text>
                  <View style={styles.inputDivider} />
                  <TextInput
                    style={styles.input}
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
                  <Text style={styles.errorText}>
                    {validation.errors.phone}
                  </Text>
                ) : null}
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={[
                  styles.inputRow,
                  validation.touched.password && validation.errors.password && styles.inputError,
                ]}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Enter Password"
                    placeholderTextColor={c.textMuted}
                    secureTextEntry={!passwordShow}
                    value={validation.values.password}
                    onChangeText={validation.handleChange("password")}
                    onBlur={() => validation.setFieldTouched("password")}
                  />
                  <TouchableOpacity
                    onPress={() => setPasswordShow(!passwordShow)}
                    style={styles.eyeBtn}
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
                  <Text style={styles.errorText}>
                    {validation.errors.password}
                  </Text>
                ) : null}
              </View>

              {/* Forgot Password */}
              <TouchableOpacity
                onPress={() => router.push("/forgot-password" as any)}
                style={styles.forgotBtn}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              {/* Sign In Button */}
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={() => {
                  setIsLoading(true);
                  validation.handleSubmit();
                }}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>New to Unfluke?</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Signup Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push("/registerpage" as any)}
              >
                <Text style={styles.signupLink}>Sign up</Text>
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
  },

  // Form
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: c.textSecondary,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.inputBorder,
    paddingHorizontal: 14,
    height: 52,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: "600",
    color: c.textSecondary,
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
    marginTop: -6,
  },
  forgotText: {
    color: c.loss,
    fontSize: 13,
    fontWeight: "600",
  },

  // Button
  button: {
    backgroundColor: c.primary,
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
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
  errorText: {
    color: c.error,
    fontSize: 12,
    marginTop: 6,
    fontWeight: "500",
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: c.border,
  },
  dividerText: {
    fontSize: 12,
    color: c.textMuted,
    paddingHorizontal: 12,
  },

  // Signup
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 32,
  },
  signupText: {
    fontSize: 14,
    color: c.textSecondary,
  },
  signupLink: {
    fontSize: 14,
    color: c.profit,
    fontWeight: "700",
  },
});

export default UnflukeLogin;
