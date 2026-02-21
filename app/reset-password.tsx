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
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import * as Yup from "yup";
import { useFormik } from "formik";
import { createSelector } from "reselect";
import { useNavigation, useRoute } from "@react-navigation/native";
import { router } from "expo-router";

import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Redux actions
import {
  resetPassword,
  resetPasswordFlag,
} from "../redux/Unfluke_slices/thunks";
import { useWindowDimensions } from "react-native";

// Import images
const logoLight = require("../assets/images/unfluke/UNFLUKE -05.png");
const backgroundImage = require("../assets/images/user-illustarator-2.png");

const ResetPassword = () => {
  const { width, height } = useWindowDimensions();

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

        {/* Reset Password Card */}
        <View style={styles.card}>
          <View style={styles.cardBody}>
            {/* Title and Description */}
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>Create New Password</Text>
              <Text style={styles.welcomeSubtitle}>
                Your new password must be different from previous used
                passwords.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    style={[
                      styles.passwordInput,
                      validation.touched.password && validation.errors.password
                        ? styles.inputError
                        : null,
                    ]}
                    placeholder="Enter Password"
                    secureTextEntry={!passwordShow}
                    value={validation.values.password}
                    onChangeText={validation.handleChange("password")}
                    onBlur={() => validation.setFieldTouched("password")}
                  />
                  <TouchableOpacity
                    onPress={() => setPasswordShow(!passwordShow)}
                    style={styles.eyeIcon}
                  >
                    <Text style={styles.eyeText}>
                      {passwordShow ? "👁️" : "👁️‍🗨️"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {validation.touched.password && validation.errors.password ? (
                  <Text style={styles.errorText}>
                    {validation.errors.password}
                  </Text>
                ) : null}
                <Text style={styles.helpText}>
                  Must be at least 8 characters with uppercase, lowercase,
                  number and special character.
                </Text>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    style={[
                      styles.passwordInput,
                      validation.touched.confirm_password &&
                      validation.errors.confirm_password
                        ? styles.inputError
                        : null,
                    ]}
                    placeholder="Confirm Password"
                    secureTextEntry={!confirmPasswordShow}
                    value={validation.values.confirm_password}
                    onChangeText={validation.handleChange("confirm_password")}
                    onBlur={() =>
                      validation.setFieldTouched("confirm_password")
                    }
                  />
                  <TouchableOpacity
                    onPress={() => setConfirmPasswordShow(!confirmPasswordShow)}
                    style={styles.eyeIcon}
                  >
                    <Text style={styles.eyeText}>
                      {confirmPasswordShow ? "👁️" : "👁️‍🗨️"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {validation.touched.confirm_password &&
                validation.errors.confirm_password ? (
                  <Text style={styles.errorText}>
                    {validation.errors.confirm_password}
                  </Text>
                ) : null}
              </View>

              {/* Reset Password Button */}
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
                  <Text style={styles.buttonText}>Reset Password</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Back to Login Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>
              Wait, I remember my password...{" "}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("login")}>
              <Text style={styles.signupLink}>Click here</Text>
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
  passwordInputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: "#fff",
    paddingRight: 40,
  },
  inputError: {
    borderColor: "#dc3545",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
  },
  eyeText: {
    fontSize: 18,
    color: "#6c757d",
  },
  helpText: {
    fontSize: 12,
    color: "#6c757d",
    marginTop: 5,
    lineHeight: 16,
  },
  button: {
    backgroundColor: "#4A9782",
    borderRadius: 4,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
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
    flexWrap: "wrap",
  },
  signupText: {
    fontSize: 14,
    color: "#6c757d",
  },
  signupLink: {
    fontSize: 14,
    color: "#007bff",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default ResetPassword;
