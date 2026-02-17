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

// Import images - same as login
const logoLight = require("../assets/images/unfluke/UNFLUKE -05.png");
const backgroundImage = require("../assets/images/user-illustarator-2.png");

const TRAPEZOID_ANGLE_HEIGHT = 40;

const ForgetPasswordPage = () => {
  const { width, height } = useWindowDimensions();
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Same as Login */}
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

        {/* Forgot Password Card */}
        <View style={styles.card}>
          <View style={styles.cardBody}>
            {/* Header Section */}
            <View style={styles.header}>
              <Text style={styles.title}>Forgot Password?</Text>

              {/* Lock Icon */}
              {/* <View style={styles.iconContainer}>
                <Text style={styles.iconPlaceholder}>🔒</Text>
              </View> */}
              {/* <LottieView
                source={require("../assets/lord-icon.json")}
                autoPlay
                loop
                style={{ width: 120, height: 120 }}
                colorFilters={[
                  {
                    keypath: "primary",
                    color: "#0ab39c",
                  },
                ]}
              /> */}
            </View>

            {/* Alert Message */}
            <View style={styles.alertContainer}>
              <Text style={styles.alertText}>
                Enter your registered mobile number and OTP will be sent to you!
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mobile Number</Text>
                <TextInput
                  style={[
                    styles.input,
                    validation.touched.phone && validation.errors.phone
                      ? styles.inputError
                      : null,
                  ]}
                  placeholder="Enter Mobile Number"
                  keyboardType="numeric"
                  maxLength={10}
                  value={validation.values.phone}
                  onChangeText={handlePhoneChange}
                  onBlur={() => validation.setFieldTouched("phone")}
                />
                {validation.touched.phone && validation.errors.phone && (
                  <Text style={styles.errorText}>
                    {validation.errors.phone}
                  </Text>
                )}
              </View>
              {/* <TouchableOpacity
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
              </TouchableOpacity> */}
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
                  <Text style={styles.buttonText}>Send OTP</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Wait, I remember my password...{" "}
              <Text
                style={styles.linkText}
                onPress={() => navigation.navigate("login")}
              >
                Click here
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  // Header styles - Same as Login
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
  // Card styles - Similar to Login but adapted for forgot password
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 15,
    marginTop: -75, // Pulls the card up into the header space
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
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#007bff", // Matching login theme color
    marginBottom: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  iconPlaceholder: {
    fontSize: 35,
  },
  alertContainer: {
    backgroundColor: "#fff3cd",
    borderColor: "#ffeaa7",
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    marginBottom: 20,
  },
  alertText: {
    color: "#856404",
    textAlign: "center",
    fontSize: 14,
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 20,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  spinner: {
    marginRight: 8,
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#dc3545",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 12,
    marginTop: 5,
  },
  button: {
    backgroundColor: "#4A9782", // Matching login button color
    borderRadius: 4,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
    buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 20,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: "#6c757d",
  },
  linkText: {
    color: "#007bff",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default ForgetPasswordPage;
