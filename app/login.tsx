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
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import * as Yup from "yup";
import { useFormik } from "formik";
import { createSelector } from "reselect";
import { useNavigation } from "@react-navigation/native";
import { router, Stack } from "expo-router";

import { useOnboarding } from "@/redux/contextHelper";

// Redux actions
import {
  loginUser,
  socialLogin,
  resetLoginFlag,
} from "../redux/Unfluke_slices/thunks";
import Toast from "react-native-toast-message";

// Import images
const logoLight = require("../assets/images/unfluke/UNFLUKE -05-NEW.png");
const backgroundImage = require("../assets/images/user-illustarator-2.png");

interface LoginState {
  user: User | null;
  error: string | null;
  loading: boolean;
  errorMsg: string | null;
  loginSuccess: boolean;
  errorCount: number;
}

interface LoginFormValues {
  email: string;
  password: string;
}

const UnflukeLogin = () => {
  const { width, height } = useWindowDimensions();
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();
  const { restart, onFinish, onBoarding } = useOnboarding();

  // ... other state and selectors

  const selectLayoutState = (state: any) => state;

  const loginpageData = createSelector(selectLayoutState, (state: any): LoginState => ({
    user: state.Login.user, // Make sure this path is correct
    error: state.Login.error,
    loading: state.Login.loading,
    errorMsg: state.Login.errorMsg,
    loginSuccess: state.Login.loginSuccess, // Add this
    errorCount: state.Login.errorCount, // Add this
  }));

  const { user, error, loading, errorMsg, loginSuccess, errorCount } =
    useSelector(loginpageData);
  const [lastShownErrorCount, setLastShownErrorCount] = useState(errorCount);

  const [isNavigating, setIsNavigating] = useState(false); // Add this to prevent double navigation
  const [userLogin, setUserLogin] = useState({});
  const [passwordShow, setPasswordShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle successful login — wait until user is hydrated in Redux,
  // then navigate. Avoids the arbitrary 100ms race where router.replace
  // could fire before Login.user is set on dashboard mount.
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

  // useEffect(() => {
  //   if (user && user) {
  //     const updatedUserData =
  //         Constants.expoConfig?.extra?.DEFAULT_AUTH === "firebase"
  //         ? user.multiFactor.user.phone
  //         : user.phone;
  //     const updatedUserPassword =
  //         Constants.expoConfig?.extra?.DEFAULT_AUTH === "firebase"
  //         ? ""
  //         : user.confirm_password;

  //     setUserLogin({
  //       phone: updatedUserData,
  //       password: updatedUserPassword,
  //     });

  //     console.log("This is user",user);
  //   }
  // }, [user]);

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
      setLastShownErrorCount(errorCount); // Update before new request
      dispatch(loginUser(values));
    },
  });

  const signIn = (type) => {
    dispatch(socialLogin(type, router));
  };

  const socialResponse = (type) => {
    signIn(type);
  };

  // useEffect(() => {
  //   if (errorMsg) {
  //     Alert.alert('Error', errorMsg);
  //     setTimeout(() => {
  //       dispatch(resetLoginFlag());
  //     }, 3000);
  //   }
  // }, [dispatch, errorMsg]);

  useEffect(() => {
    // Only show toast if errorCount increased (new error occurred)
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
      setLastShownErrorCount(errorCount); // Update the last shown count
      console.log(errorCount);
    }
  }, [errorCount, error]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: '' }} />
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
            <View style={[styles.cutout, styles.cutoutLeft, { borderRightWidth: width / 2 }]} />
            <View style={[styles.cutout, styles.cutoutRight, { borderLeftWidth: width / 2 }]} />
          </View>

          {/* Welcome Card */}
          <View style={styles.card}>
            <View style={styles.cardBody}>
              {/* Welcome Text */}
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeTitle}>Welcome Back!</Text>
                <Text style={styles.welcomeSubtitle}>
                  Sign in to continue to Unfluke.
                </Text>
              </View>

              {/* Form */}
              <View style={styles.formContainer}>
                {/* Phone Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mobile Number</Text>
                  <TextInput
                    style={[
                      styles.input,
                      validation.touched.phone && validation.errors.phone
                        ? styles.inputError
                        : null,
                    ]}
                    placeholder="Enter phone"
                    keyboardType="numeric"
                    maxLength={10}
                    value={validation.values.phone}
                    onChangeText={(text) => {
                      const digitsOnly = text.replace(/\D+/g, "");
                      validation.setFieldValue("phone", digitsOnly);
                    }}
                    onBlur={() => validation.setFieldTouched("phone")}
                  />
                  {validation.touched.phone && validation.errors.phone ? (
                    <Text style={styles.errorText}>
                      {validation.errors.phone}
                    </Text>
                  ) : null}
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.passwordHeader}>
                    <Text style={styles.label}>Password</Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate("forgot-password")}
                    >
                      <Text style={styles.forgotText}>Forgot password?</Text>
                    </TouchableOpacity>
                  </View>

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
                </View>

                {/* Remember Me Checkbox */}
                {/* <View style={styles.checkboxContainer}>
                <TouchableOpacity style={styles.checkbox}>
                  <Text style={styles.checkboxText}>☐ Remember me</Text>
                </TouchableOpacity>
              </View> */}

                {/* Sign In Button */}
                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={() => {
                    setIsLoading(true);
                    validation.handleSubmit();
                  }}
                  disabled={isLoading}
                >
                  <View style={styles.buttonContent}>
                    {isLoading && (
                      <ActivityIndicator
                        size="small"
                        color="#fff"
                        style={styles.spinner}
                      />
                    )}
                    <Text style={styles.buttonText}>Sign In</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            {/* Signup Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("registerpage")}
              >
                <Text style={styles.signupLink}>Signup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </>
  );
};

const TRAPEZOID_ANGLE_HEIGHT = 40; // Controls the height of the trapezoid slant

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  // NEW: Styles for the header, copied from Register screen
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
  // UPDATED: Card style to work with the new header
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
  welcomeContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff", // Using a consistent theme color
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 15,
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
    color: "#212529",
  },
  inputError: {
    borderColor: "#dc3545",
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  forgotText: {
    color: "#007bff",
    fontSize: 12,
    fontWeight: "500",
  },
  passwordInputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: "#fff",
    paddingRight: 40,
    color: "#212529",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
  },
  eyeText: {
    fontSize: 18,
    color: "#6c757d",
  },
  checkboxContainer: {
    marginBottom: 20,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxText: {
    fontSize: 13,
    color: "#495057",
  },
  button: {
    backgroundColor: "#4A9782", // Matching register button color
    borderRadius: 4,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
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
    paddingBottom: 20, // Moved padding here
    paddingTop: 10,
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

export default UnflukeLogin;
