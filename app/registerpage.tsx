import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { useWindowDimensions } from "react-native";

// Formik Validation
import * as Yup from 'yup';
import { useFormik } from 'formik';

import Toast from 'react-native-toast-message';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

// Actions
import { registerUser, apiError, resetRegisterFlag } from '../redux/Unfluke_slices/thunks';

// Import images
import { createSelector } from 'reselect';

import { postVerifyPhoneOtp } from '../Unfluke_helpers/backend_helper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OTPVerificationModal from '@/components/UnflukeMain/Authentication/OtpVerification';

const logoLight = require("../assets/images/unfluke/UNFLUKE -05.png");
const backgroundImage = require("../assets/images/user-illustarator-2.png");

interface FormValues {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirm_password: string;
  referral: string;
}

interface AccountState {
  verificationMailSent: boolean;
  verificationOtpSent: boolean;
  success: boolean;
  error: string | null;
}

const UnflukeRegister = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { width, height } = useWindowDimensions();

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleVerify = async (otpValue: string) => {
    try {
      console.log('Verifying OTP:', otpValue);
      const otpResponseString = await AsyncStorage.getItem('response');
      if (!otpResponseString) throw new Error('could not get OTP');

      const otpResponse = JSON.parse(otpResponseString)
      // Create clean verification data
      const verificationData = {
        phone: otpResponse.phone,
        hash: otpResponse.hash,
        otp: otpValue,
        activation_token: otpResponse.activation_token,
      };

      console.log('Sending for verification:', verificationData);

      const response = await postVerifyPhoneOtp(verificationData);

      if (!response.data?.msg) throw new Error('Invalid OTP');

      await AsyncStorage.removeItem('response');

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: response.data.msg,
      });

      // Navigate to login after successful verification
      setTimeout(() => navigation.navigate('login' as never), 2000);
    } catch (error: any) {
      console.error('Verification error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Invalid OTP',
      });
    }
  };

  const validation = useFormik<FormValues>({
    enableReinitialize: true,
    initialValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
      confirm_password: '',
      referral: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Please Enter Your Name'),
      phone: Yup.string()
        .matches(/^\d{10}$/, 'Please enter 10 digit phone number')
        .required('Please Enter Your Phone number'),
      email: Yup.string()
        .optional()
        .matches(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "Invalid emails."),
      referral: Yup.string(),
      password: Yup.string()
        .required('Please enter your password')
        .min(7, 'Password must be more than 6 characters'),
      confirm_password: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords do not match')
        .required('Please confirm your password'),
    }),
    onSubmit: (values: FormValues) => {
      values.email = values.email.toLowerCase();
      dispatch(registerUser(values));
    },
  });

  const selectLayoutState = (state: any) => state.Account;
  const registerdatatype = createSelector(selectLayoutState, (account: AccountState) => ({
    mailSent: account.verificationMailSent,
    otpSent: account.verificationOtpSent,
    success: account.success,
    error: account.error,
  }));

  const { error, success, mailSent, otpSent } = useSelector(registerdatatype);

  useEffect(() => {
    dispatch(apiError(''));
  }, [dispatch]);

  useEffect(() => {
    otpSent && toggleModal();
  }, [otpSent]);

  useEffect(() => {
    if (success) {
      setTimeout(() => navigation.navigate('login'), 3000);
    }

    setTimeout(() => {
      dispatch(resetRegisterFlag());
    }, 3000);
  }, [dispatch, success, error, navigation]);

  const handlePhoneChange = (text: string) => {
    const digitsOnly = text.replace(/\D+/g, '');
    validation.setFieldValue('phone', digitsOnly);
  };

  const showSuccessAlert = () => {
    if (mailSent) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Please verify your email...',
      });
    }
  };

  const showErrorAlert = () => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Mobile Number has been registered before, Please use another mobile number',
      });
    }
  };

  useEffect(() => {
    showSuccessAlert();
  }, [mailSent]);

  useEffect(() => {
    showErrorAlert();
  }, [error]);

  console.log("ajsdfkahsdf ", isModalOpen)
  console.log("fausfdgsdf", otpSent)

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        {/* NEW: Wrapper for the header to contain the shape */}
        <View style={[styles.headerContainer, { height: height * 0.32 }]}>
          <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
            <View style={styles.overlay} />
            <View style={[styles.logoContainer, { marginTop: height * 0.07 }]}>
              <Image source={logoLight} style={styles.logo} resizeMode="contain" />
            </View>
          </ImageBackground>
          {/* NEW: These two views create the trapezoid cutouts */}
          <View style={[styles.cutout, styles.cutoutLeft, { borderRightWidth: width / 4 }]} />
          <View style={[styles.cutout, styles.cutoutRight, { borderLeftWidth: width / 4 }]} />
        </View>

        <View style={styles.card}>
          <View style={styles.cardBody}>
            <View style={styles.header}>
              <Text style={styles.title}>Create New Account</Text>
              <Text style={styles.subtitle}>Get your free Unfluke account now</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    validation.touched.name && validation.errors.name && styles.inputError,
                  ]}
                  placeholder="Enter name"
                  value={validation.values.name}
                  onChangeText={validation.handleChange('name')}
                  onBlur={validation.handleBlur('name')}
                />
                {validation.touched.name && validation.errors.name && (
                  <Text style={styles.errorText}>{validation.errors.name}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Phone Number <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    validation.touched.phone && validation.errors.phone && styles.inputError,
                  ]}
                  placeholder="Enter phone number"
                  value={validation.values.phone}
                  onChangeText={handlePhoneChange}
                  onBlur={validation.handleBlur('phone')}
                  keyboardType="numeric"
                  maxLength={10}
                />
                {validation.touched.phone && validation.errors.phone && (
                  <Text style={styles.errorText}>{validation.errors.phone}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    validation.touched.email && validation.errors.email && styles.inputError,
                  ]}
                  placeholder="Enter email address"
                  value={validation.values.email}
                  onChangeText={validation.handleChange('email')}
                  onBlur={validation.handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {validation.touched.email && validation.errors.email && (
                  <Text style={styles.errorText}>{validation.errors.email}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Password <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    validation.touched.password && validation.errors.password && styles.inputError,
                  ]}
                  placeholder="Enter Password"
                  value={validation.values.password}
                  onChangeText={validation.handleChange('password')}
                  onBlur={validation.handleBlur('password')}
                  secureTextEntry
                />
                {validation.touched.password && validation.errors.password && (
                  <Text style={styles.errorText}>{validation.errors.password}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Confirm Password <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    validation.touched.confirm_password &&
                    validation.errors.confirm_password &&
                    styles.inputError,
                  ]}
                  placeholder="Confirm Password"
                  value={validation.values.confirm_password}
                  onChangeText={validation.handleChange('confirm_password')}
                  onBlur={validation.handleBlur('confirm_password')}
                  secureTextEntry
                />
                {validation.touched.confirm_password && validation.errors.confirm_password && (
                  <Text style={styles.errorText}>{validation.errors.confirm_password}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Referral Code <Text style={styles.optional}>(Optional)</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    validation.touched.referral && validation.errors.referral && styles.inputError,
                  ]}
                  placeholder="Enter referral code"
                  value={validation.values.referral}
                  onChangeText={validation.handleChange('referral')}
                  onBlur={validation.handleBlur('referral')}
                />
                {validation.touched.referral && validation.errors.referral && (
                  <Text style={styles.errorText}>{validation.errors.referral}</Text>
                )}
              </View>

              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By registering you agree to the Unfluke{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={() => navigation.navigate('terms')}
                  >
                    Terms of Use
                  </Text>
                </Text>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => validation.handleSubmit()}
              >
                <Text style={styles.submitButtonText}>Sign Up</Text>
              </TouchableOpacity>

              <OTPVerificationModal
                isOpen={isModalOpen}
                toggle={toggleModal}
                onVerify={handleVerify}
                digits={6}
                title="Verify Your Account"
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text
                style={styles.footerLink}
                onPress={() => navigation.navigate('login')}
              >
                Signin
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      <Toast />
    </KeyboardAvoidingView>
  );
};

const TRAPEZOID_ANGLE_HEIGHT = 40; // NEW: Controls the height of the trapezoid slant

const styles = StyleSheet.create({
  container: {
    flex: 1, // Changed to flex: 1 for KeyboardAvoidingView
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 10
  },
  // NEW: Container for the header image and the cutout shapes
  headerContainer: {
    backgroundColor: '#f8f9fa', // Match the main container background
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(69, 81, 121, 0.94)",
  },
  // NEW: Base style for the cutout triangles
  cutout: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    position: 'absolute',
    bottom: 0,
    borderBottomWidth: TRAPEZOID_ANGLE_HEIGHT,
    // The color MUST match the background of the element below (the card)
    borderBottomColor: 'white',
  },
  // NEW: Left side cutout
  cutoutLeft: {
    left: 0,
    borderRightColor: 'transparent',
  },
  // NEW: Right side cutout
  cutoutRight: {
    right: 0,
    borderLeftColor: 'transparent',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 80,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 15,
    // Adjusted marginTop to account for the angle height
    marginTop: -75,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10, // Ensure card is on top
  },
  cardBody: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  form: {
    marginTop: 1,
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  required: {
    color: '#dc3545',
  },
  optional: {
    color: '#6c757d',
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    paddingVertical: 9,
    paddingHorizontal: 10,
    fontSize: 13,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 5,
  },
  termsContainer: {
    marginBottom: 20,
  },
  termsText: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  termsLink: {
    color: '#007bff',
    textDecorationLine: 'underline',
    fontWeight: '500',
    fontStyle: 'normal',
  },
  submitButton: {
    backgroundColor: '#4A9782',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#6c757d',
  },
  footerLink: {
    color: '#007bff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default UnflukeRegister;