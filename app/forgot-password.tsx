import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

// Redux actions
import {
  resetForgotPasswordFlag,
  resetPasswordRequest,
} from "../redux/Unfluke_slices/thunks";

import { createSelector } from "reselect";
// import LottieView from "lottie-react-native";
import Toast from "react-native-toast-message";
import { useWindowDimensions } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { KeyRound, Smartphone, ArrowLeft, Info } from "lucide-react-native";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

// Import images - same as login
const logoLight = require("../assets/images/unfluke/UNFLUKE -05-NEW.png");
const backgroundImage = require("../assets/images/user-illustarator-2.png");

const TRAPEZOID_ANGLE_HEIGHT = 40;

const ForgetPasswordPage = () => {
  const { width, height } = useWindowDimensions();
  const { colors: c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const s = makeStyles(c, isDark);
 const [loading,setLoading] = useState(false)
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      phone: "",
    },
    validationSchema: Yup.object({
      phone: Yup.string()
        .matches(/^\d{10}$/, "Please enter a 10-digit phone number")
        .required("Please Enter Your Registered Mobile Number"),
    }),
    onSubmit: (values) => {
          setLoading(true); // stop loading
      dispatch(resetPasswordRequest(values));
    },
  });

  const selectLayoutState = (state) => state.ForgetPassword;
  const selectLayoutProperties = createSelector(selectLayoutState, (state) => ({
    error: state.error,
    success: state.success,
  }));

  const {error, success } = useSelector(selectLayoutProperties);

  useEffect(() => {
    if (success) {
      console.log("success");
      setTimeout(() => {
                  setLoading(false); // stop loading
        navigation.navigate("otp-verification", {
          phone: validation.values.phone,
        });
        dispatch(resetForgotPasswordFlag());
      }, 2000);
    }

    if (error) {
      setTimeout(() => {
            setLoading(false); // stop loading
        dispatch(resetForgotPasswordFlag());
      }, 3000);
    }
  }, [success, error, dispatch, navigation]);

  const handlePhoneChange = (text) => {
    const digitsOnly = text.replace(/\D+/g, "");
    validation.setFieldValue("phone", digitsOnly);
  };
  const showAlert = (message, type, title) => {
    if (!message) return; // prevent empty toast
    Toast.show({
      type,
      text1: title, // dynamic title
      text2: message, // actual message
      position: "top",
      visibilityTime: 3000,
      autoHide: true,
    });
  };

  useEffect(() => {
    if (error) {
      console.log("error:", error);
      showAlert(error, "error", "Couldn't send OTP");
    }
    if (success) {
      console.log("success:", success);
      showAlert(success, "success", "OTP Sent Successfully ✅");
    }
  }, [error, success]);

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
          {/* Dark Header — same language as Login */}
          <View style={[s.darkHeader, { paddingTop: insets.top + 28 }]}>
            <TouchableOpacity
              onPress={() => navigation.navigate("login")}
              style={s.backBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ArrowLeft size={22} color="rgba(255,255,255,0.85)" />
            </TouchableOpacity>
            <Image
              source={logoLight}
              style={s.logo}
              resizeMode="contain"
            />
            <Text style={s.tagline}>
              Recover access to your account
            </Text>
          </View>

          {/* Forgot Password Card */}
          <View style={s.card}>
            <View style={s.cardBody}>
              {/* Header Section */}
              <View style={s.header}>
                <View style={s.iconBadge}>
                  <KeyRound size={26} color={c.gold} />
                </View>
                <Text style={s.title}>Forgot Password?</Text>
                <Text style={s.subtitle}>
                  No worries, we'll send you reset instructions.
                </Text>
              </View>

              {/* Alert Message */}
              <View style={s.alertContainer}>
                <Info size={16} color={c.gold} style={s.alertIcon} />
                <Text style={s.alertText}>
                  Enter your registered mobile number and an OTP will be sent to you.
                </Text>
              </View>

              {/* Form */}
              <View style={s.formContainer}>
                <View style={s.inputGroup}>
                  <Text style={s.label}>Mobile Number</Text>
                  <View
                    style={[
                      s.inputRow,
                      validation.touched.phone && validation.errors.phone
                        ? s.inputError
                        : null,
                    ]}
                  >
                    <Smartphone size={18} color={c.textMuted} style={s.inputIcon} />
                    <View style={s.inputDivider} />
                    <TextInput
                      style={s.input}
                      placeholder="Enter Mobile Number"
                      placeholderTextColor={c.textMuted}
                      keyboardType="numeric"
                      maxLength={10}
                      value={validation.values.phone}
                      onChangeText={handlePhoneChange}
                      onBlur={() => validation.setFieldTouched("phone")}
                    />
                  </View>
                  {validation.touched.phone && validation.errors.phone && (
                    <Text style={s.errorText}>
                      {validation.errors.phone}
                    </Text>
                  )}
                </View>

                {/* Send OTP — gold gradient CTA */}
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
                      <Text style={s.buttonText}>Send OTP</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer Link */}
            <View style={s.footer}>
              <Text style={s.footerText}>
                Wait, I remember my password...{" "}
                <Text
                  style={s.linkText}
                  onPress={() => navigation.navigate("login")}
                >
                  Click here
                </Text>
              </Text>
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
      backgroundColor: c.background,
    },

    // Dark header — mirrors Login
    darkHeader: {
      backgroundColor: c.primary,
      paddingBottom: 56,
      alignItems: "center",
      justifyContent: "center",
    },
    backBtn: {
      position: "absolute",
      left: 20,
      top: 0,
      paddingTop: 4,
    },
    logo: {
      width: 180,
      height: 60,
      tintColor: isDark ? c.onGold : "#fff",
    },
    tagline: {
      fontSize: 13,
      color: isDark ? "rgba(21,17,10,0.6)" : "rgba(255,255,255,0.55)",
      marginTop: 6,
      letterSpacing: 0.5,
    },

    // Card
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
    header: {
      alignItems: "center",
      marginBottom: 22,
    },
    iconBadge: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: c.goldLight,
      borderWidth: 1,
      borderColor: isDark ? c.border : c.goldMuted,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "800",
      color: c.text,
      marginBottom: 6,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 14,
      color: c.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },

    // Alert
    alertContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: c.goldLight,
      borderColor: isDark ? c.border : c.goldMuted,
      borderWidth: 1,
      borderRadius: 14,
      padding: 14,
      marginBottom: 24,
    },
    alertIcon: {
      marginRight: 10,
      marginTop: 1,
    },
    alertText: {
      flex: 1,
      color: c.textSecondary,
      fontSize: 13,
      lineHeight: 19,
    },

    // Form
    formContainer: {
      width: "100%",
    },
    inputGroup: {
      marginBottom: 22,
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
    inputIcon: {
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
    errorText: {
      color: c.error,
      fontSize: 12,
      marginTop: 6,
      fontWeight: "500",
    },

    // Button — gold gradient CTA
    button: {
      borderRadius: 14,
      marginTop: 4,
      overflow: "hidden",
    },
    buttonGradient: {
      height: 52,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
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

    // Footer
    footer: {
      alignItems: "center",
      paddingBottom: 32,
      paddingTop: 16,
    },
    footerText: {
      fontSize: 14,
      color: c.textSecondary,
    },
    linkText: {
      color: c.gold,
      fontWeight: "700",
    },
  });

export default ForgetPasswordPage;
