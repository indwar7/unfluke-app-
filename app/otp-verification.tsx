import React, { useEffect, useState } from "react";
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
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import * as Yup from "yup";
import { useFormik } from "formik";
import { createSelector } from "reselect";
import { useNavigation, useRoute } from "@react-navigation/native";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

// Redux actions
import {
  verifyOtp,
  resetOtpVerificationFlag,
  resendOtp,
} from "../redux/Unfluke_slices/thunks";
import { useWindowDimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import images
const logoLight = require("../assets/images/unfluke/UNFLUKE -05-NEW.png");
const backgroundImage = require("../assets/images/user-illustarator-2.png");

const OtpVerification = () => {
  const { width, height } = useWindowDimensions();

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

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
            token: validation.values.otp,
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
    // onSubmit: (values) => {
    //   // Get stored forgot password response from AsyncStorage if needed
    //   // For now, creating the payload directly
    //   const res = JSON.parse(AsyncStorage.getItem("forgotPasswordResponse"))
    //   res["otp"] = values.otp
    //   // const payload = {
    //   //   phone: phoneNumber,
    //   //   otp: values.otp,
    //   // };

    //   console.log("otp valyes", res)
    //   dispatch(verifyOtp(res));
    // },
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
      return phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    }
    return phone;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.headerContainer, { height: height * 0.32 }]}>
          <ImageBackground
            source={backgroundImage}
            style={styles.background}
            resizeMode="cover"
          >
            <View style={styles.overlay} />
            <View style={[styles.logoContainer, { marginTop: height * 0.07 }]}>
              <Image
                source={logoLight}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </ImageBackground>
          <View
            style={[
              styles.cutout,
              styles.cutoutLeft,
              { borderRightWidth: width / 2 },
            ]}
          />
          <View
            style={[
              styles.cutout,
              styles.cutoutRight,
              { borderLeftWidth: width / 2 },
            ]}
          />
        </View>

        {/* OTP Verification Card */}
        <View style={styles.card}>
          <View style={styles.cardBody}>
            {/* Title and Description */}
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>OTP Verification</Text>
              <Text style={styles.welcomeSubtitle}>
                Please enter the 6-digit OTP sent to{" "}
                {formatPhoneNumber(phoneNumber)}
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* OTP Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Enter OTP</Text>
                <TextInput
                  style={[
                    styles.input,
                    validation.touched.otp && validation.errors.otp
                      ? styles.inputError
                      : null,
                  ]}
                  placeholder="Enter 6-digit OTP"
                  keyboardType="numeric"
                  maxLength={6}
                  value={validation.values.otp}
                  onChangeText={(text) => {
                    const digitsOnly = text.replace(/\D+/g, "");
                    validation.setFieldValue("otp", digitsOnly);
                  }}
                  onBlur={() => validation.setFieldTouched("otp")}
                />
                {validation.touched.otp && validation.errors.otp ? (
                  <Text style={styles.errorText}>{validation.errors.otp}</Text>
                ) : null}
              </View>

              {/* Verify OTP Button */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={validation.handleSubmit}
                disabled={loading}
              >
                <View style={styles.buttonContent}>
                  {loading && (
                    <ActivityIndicator
                      size="small"
                      color="#fff"
                      style={styles.spinner}
                    />
                  )}
                  <Text style={styles.buttonText}>Verify OTP</Text>
                </View>
              </TouchableOpacity>

              {/* Resend OTP Button */}
              <TouchableOpacity
                style={[
                  styles.resendButton,
                  (!canResend || resendLoading) && styles.resendButtonDisabled,
                ]}
                onPress={handleResendOtp}
                disabled={!canResend || resendLoading}
              >
                <View style={styles.buttonContent}>
                  {resendLoading && (
                    <ActivityIndicator
                      size="small"
                      color="#007bff"
                      style={styles.spinner}
                    />
                  )}
                  <Text
                    style={[
                      styles.resendButtonText,
                      (!canResend || resendLoading) &&
                        styles.resendButtonTextDisabled,
                    ]}
                  >
                    {resendLoading
                      ? "Sending..."
                      : !canResend
                      ? `Resend OTP in ${countdown}s`
                      : "Resend OTP"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Back to Forgot Password Link */}
          <View style={styles.signupContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate("forgot-password")}
            >
              <Text style={styles.signupLink}>Back to Forgot Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const TRAPEZOID_ANGLE_HEIGHT = 40;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerContainer: {
    backgroundColor: "#f8f9fa",
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(69, 81, 121, 0.94)",
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 80,
  },
  cutout: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    position: "absolute",
    bottom: 0,
    borderBottomWidth: TRAPEZOID_ANGLE_HEIGHT,
    borderBottomColor: "white",
  },
  cutoutLeft: {
    left: 0,
    borderRightColor: "transparent",
  },
  cutoutRight: {
    right: 0,
    borderLeftColor: "transparent",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 15,
    marginTop: -75,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  cardBody: {
    padding: 24,
  },
  welcomeContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    lineHeight: 20,
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#495057",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    // textAlign: "center",
    letterSpacing: 2,
    color: "#212529",
  },
  inputError: {
    borderColor: "#dc3545",
  },
  button: {
    backgroundColor: "#4A9782",
    borderRadius: 4,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  spinner: {
    marginRight: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resendButton: {
    backgroundColor: "transparent",
    borderRadius: 4,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: "#007bff",
    fontSize: 14,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  resendButtonTextDisabled: {
    color: "#6c757d",
    textDecorationLine: "none",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 12,
    marginTop: 5,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
    paddingTop: 10,
  },
  signupLink: {
    fontSize: 14,
    color: "#007bff",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default OtpVerification;
