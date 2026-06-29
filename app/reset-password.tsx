import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import * as Yup from "yup";
import { useFormik } from "formik";
import { createSelector } from "reselect";
import { useNavigation, useRoute } from "@react-navigation/native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Eye, EyeOff, ShieldCheck } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

// Redux actions
import {
  resetPassword,
  resetPasswordFlag,
} from "../redux/Unfluke_slices/thunks";
import { useWindowDimensions } from "react-native";

// Import images
const logoLight = require("../assets/images/unfluke/UNFLUKE -05-NEW.png");
const backgroundImage = require("../assets/images/user-illustarator-2.png");

const ResetPassword = () => {
  const { width, height } = useWindowDimensions();
  const { colors: c, isDark } = useTheme();
  const s = makeStyles(c, isDark);
  const insets = useSafeAreaInsets();

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  const [passwordShow, setPasswordShow] = useState(false);
  const [confirmPasswordShow, setConfirmPasswordShow] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Get phone number and token from route params
  const phoneNumber = route.params?.phone;
  const token = route.params?.token;

  console.log("Phone Number:", phoneNumber, "Token:", token);

  // Redirect if token or phone number is not provided
  useEffect(() => {
    if (!token || !phoneNumber) {
      navigation.navigate("forgot-password");
    }
  }, [token, phoneNumber, navigation]);

  const selectLayoutState = (state) => state;
  const resetPasswordSelector = createSelector(selectLayoutState, (state) => ({
    loading: state.ResetPassword?.loading || false,
    error: state.ResetPassword?.error || null,
    message: state.ResetPassword?.message || null,
    success: state.ResetPassword?.success || false,
  }));

  const { loading, error, message, success } = useSelector(
    resetPasswordSelector
  );

  useEffect(() => {
    if (success && !isNavigating) {
      setIsNavigating(true);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: message || "Password reset successfully!",
        position: "top",
        visibilityTime: 3000,
      });

      setTimeout(async () => {
        try {
          // Remove stored forgot password response
          await AsyncStorage.removeItem("forgotPasswordResponse");
          dispatch(resetPasswordFlag());
          router.replace("/login");
        } catch (error) {
          console.error("Error clearing storage:", error);
        }
        setIsNavigating(false);
      }, 3000);
    }

    if (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error,
        position: "top",
        visibilityTime: 3000,
      });
      setTimeout(() => {
        dispatch(resetPasswordFlag());
      }, 3000);
    }
  }, [success, error, dispatch, navigation, message]);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      phone: phoneNumber || "",
      token: token || "",
      password: "",
      confirm_password: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(7, "Password must be at least 7 characters")
        .required("Please Enter New Password"),
      confirm_password: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Please Confirm New Password"),
    }),
    onSubmit: (values) => {
      dispatch(resetPassword(values));
    },
  });

  return (
    <>
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
            <Image source={logoLight} style={s.logo} resizeMode="contain" />
            <Text style={s.tagline}>Secure account recovery</Text>
          </View>

          {/* Reset Password Card */}
          <View style={s.card}>
            <View style={s.cardBody}>
              {/* Title and Description */}
              <View style={s.welcomeContainer}>
                <View style={s.iconBadge}>
                  <ShieldCheck size={22} color={c.gold} />
                </View>
                <Text style={s.welcomeTitle}>Create New Password</Text>
                <Text style={s.welcomeSubtitle}>
                  Your new password must be different from previous used
                  passwords.
                </Text>
              </View>

              {/* Form */}
              <View style={s.formContainer}>
                {/* Password Input */}
                <View style={s.inputGroup}>
                  <Text style={s.label}>Password</Text>
                  <View
                    style={[
                      s.passwordInputWrapper,
                      validation.touched.password && validation.errors.password
                        ? s.inputError
                        : null,
                    ]}
                  >
                    <TextInput
                      style={s.passwordInput}
                      placeholder="Enter Password"
                      placeholderTextColor={c.textMuted}
                      secureTextEntry={!passwordShow}
                      value={validation.values.password}
                      onChangeText={validation.handleChange("password")}
                      onBlur={() => validation.setFieldTouched("password")}
                    />
                    <TouchableOpacity
                      onPress={() => setPasswordShow(!passwordShow)}
                      style={s.eyeIcon}
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
                  <Text style={s.helpText}>
                    Must be at least 8 characters with uppercase, lowercase,
                    number and special character.
                  </Text>
                </View>

                {/* Confirm Password Input */}
                <View style={s.inputGroup}>
                  <Text style={s.label}>Confirm Password</Text>
                  <View
                    style={[
                      s.passwordInputWrapper,
                      validation.touched.confirm_password &&
                      validation.errors.confirm_password
                        ? s.inputError
                        : null,
                    ]}
                  >
                    <TextInput
                      style={s.passwordInput}
                      placeholder="Confirm Password"
                      placeholderTextColor={c.textMuted}
                      secureTextEntry={!confirmPasswordShow}
                      value={validation.values.confirm_password}
                      onChangeText={validation.handleChange("confirm_password")}
                      onBlur={() =>
                        validation.setFieldTouched("confirm_password")
                      }
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setConfirmPasswordShow(!confirmPasswordShow)
                      }
                      style={s.eyeIcon}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      {confirmPasswordShow ? (
                        <Eye size={18} color={c.textMuted} />
                      ) : (
                        <EyeOff size={18} color={c.textMuted} />
                      )}
                    </TouchableOpacity>
                  </View>
                  {validation.touched.confirm_password &&
                  validation.errors.confirm_password ? (
                    <Text style={s.errorText}>
                      {validation.errors.confirm_password}
                    </Text>
                  ) : null}
                </View>

                {/* Reset Password Button */}
                <TouchableOpacity
                  style={[s.button, loading && s.buttonDisabled]}
                  onPress={validation.handleSubmit}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[c.goldBright, c.gold, c.goldDeep]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={s.buttonGradient}
                  >
                    <View style={s.buttonContent}>
                      {loading && (
                        <ActivityIndicator
                          size="small"
                          color={c.onGold}
                          style={s.spinner}
                        />
                      )}
                      <Text style={s.buttonText}>Reset Password</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Back to Login Link */}
            <View style={s.signupContainer}>
              <Text style={s.signupText}>
                Wait, I remember my password...{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("login")}>
                <Text style={s.signupLink}>Click here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const makeStyles = (c: AppColors, isDark: boolean) =>
  StyleSheet.create({
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
      paddingBottom: 64,
      alignItems: "center",
      justifyContent: "center",
    },
    logo: {
      width: 180,
      height: 60,
      tintColor: isDark ? c.onGold : "#fff",
    },
    tagline: {
      fontSize: 13,
      color: isDark ? "rgba(21,17,10,0.65)" : "rgba(255,255,255,0.55)",
      marginTop: 6,
      letterSpacing: 0.5,
      fontWeight: "600",
    },

    // Card
    card: {
      flex: 1,
      backgroundColor: c.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      marginTop: -28,
      paddingTop: 8,
    },
    cardBody: {
      paddingHorizontal: 24,
      paddingTop: 28,
    },
    welcomeContainer: {
      alignItems: "center",
      marginBottom: 28,
    },
    iconBadge: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: c.goldLight,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    welcomeTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: c.text,
      marginBottom: 6,
      textAlign: "center",
    },
    welcomeSubtitle: {
      fontSize: 14,
      color: c.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },

    // Form
    formContainer: {
      width: "100%",
    },
    inputGroup: {
      marginBottom: 18,
    },
    label: {
      fontSize: 13,
      fontWeight: "500",
      color: c.textSecondary,
      marginBottom: 8,
    },
    passwordInputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.inputBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.inputBorder,
      paddingHorizontal: 14,
      height: 52,
    },
    passwordInput: {
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
    eyeIcon: {
      padding: 6,
      marginLeft: 6,
    },
    helpText: {
      fontSize: 12,
      color: c.textMuted,
      marginTop: 8,
      lineHeight: 16,
    },

    // Button
    button: {
      borderRadius: 14,
      marginTop: 10,
      overflow: "hidden",
    },
    buttonGradient: {
      height: 52,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    spinner: {
      marginRight: 8,
    },
    buttonText: {
      color: c.onGold,
      fontSize: 16,
      fontWeight: "800",
      letterSpacing: 0.3,
    },
    errorText: {
      color: c.error,
      fontSize: 12,
      marginTop: 6,
      fontWeight: "500",
    },

    // Back to login
    signupContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: 32,
      paddingTop: 16,
      flexWrap: "wrap",
    },
    signupText: {
      fontSize: 14,
      color: c.textSecondary,
    },
    signupLink: {
      fontSize: 14,
      color: c.gold,
      fontWeight: "700",
    },
  });

export default ResetPassword;
