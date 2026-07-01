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
  StatusBar,
} from 'react-native';
import { useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Eye, EyeOff } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Formik Validation
import * as Yup from 'yup';
import { useFormik } from 'formik';

import Toast from 'react-native-toast-message';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

// Theme
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

// Actions
import { registerUser, apiError, resetRegisterFlag } from '../redux/Unfluke_slices/thunks';
import { clearVerificationOtpSent } from '../redux/Unfluke_slices/auth/register/reducer';

// Import images
import { createSelector } from 'reselect';

import { postVerifyPhoneOtp } from '../Unfluke_helpers/backend_helper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OTPVerificationModal from '@/components/UnflukeMain/Authentication/OtpVerification';

const logoLight = require("../assets/images/unfluke/UNFLUKE -05-NEW.png");

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
  error: any;
  registrationError: any;
}

const UnflukeRegister = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const { colors: c, isDark } = useTheme();
  const s = makeStyles(c, isDark);
  const insets = useSafeAreaInsets();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passwordShow, setPasswordShow] = useState(false);
  const [confirmPasswordShow, setConfirmPasswordShow] = useState(false);

  const { width, height } = useWindowDimensions();

  const toggleModal = () => {
    setIsModalOpen((prev) => {
      const next = !prev;
      if (!next) dispatch(clearVerificationOtpSent());
      return next;
    });
  };

  const handleVerify = async (otpValue: string) => {
    try {
      const otpResponseString = await AsyncStorage.getItem('response');
      if (!otpResponseString) throw new Error('could not get OTP');

      const otpResponse = JSON.parse(otpResponseString)
      const verificationData = {
        phone: otpResponse.phone,
        hash: otpResponse.hash,
        otp: otpValue,
        activation_token: otpResponse.activation_token,
      };

      const response: any = await postVerifyPhoneOtp(verificationData);

      const successMsg =
        response?.msg ||
        response?.message ||
        response?.data?.msg ||
        response?.data?.message;

      if (!successMsg) throw new Error('Invalid OTP');

      await AsyncStorage.removeItem('response');

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: successMsg,
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
        .required('Please Enter Your Email')
        .matches(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "Invalid email."),
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
    registrationError: account.registrationError,
  }));

  const { error, success, mailSent, otpSent, registrationError } = useSelector(registerdatatype);

  useEffect(() => {
    dispatch(apiError());
  }, [dispatch]);

  useEffect(() => {
    if (otpSent && !isModalOpen) setIsModalOpen(true);
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
    if (error || registrationError) {
      const raw = registrationError ?? error;
      let message = 'Registration failed. Please try again.';
      if (typeof raw === 'string' && raw.trim()) {
        message = raw;
      } else if (raw && typeof raw === 'object') {
        message =
          raw.message ||
          raw.msg ||
          raw.error ||
          raw.data?.message ||
          message;
      }
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
    }
  };

  useEffect(() => {
    showSuccessAlert();
  }, [mailSent]);

  useEffect(() => {
    showErrorAlert();
  }, [error, registrationError]);


  return (
    <>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={s.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Dark Header */}
          <View style={[s.darkHeader, { paddingTop: insets.top + 36 }]}>
            <Image source={logoLight} style={s.logo} resizeMode="contain" />
            <Text style={s.tagline}>
              Backtest &middot; Analyse &middot; Trade smarter
            </Text>
          </View>

          {/* Form Card */}
          <View style={s.card}>
            <View style={s.cardBody}>
              <View style={s.header}>
                <Text style={s.title}>Create new account</Text>
                <Text style={s.subtitle}>Get your free Unfluke account now</Text>
              </View>

              <View style={s.form}>
                <View style={s.inputContainer}>
                  <Text style={s.label}>
                    Name <Text style={s.required}>*</Text>
                  </Text>
                  <View style={[
                    s.inputRow,
                    validation.touched.name && validation.errors.name && s.inputError,
                  ]}>
                    <TextInput
                      style={s.input}
                      placeholder="Enter name"
                      placeholderTextColor={c.textMuted}
                      value={validation.values.name}
                      onChangeText={validation.handleChange('name')}
                      onBlur={validation.handleBlur('name')}
                    />
                  </View>
                  {validation.touched.name && validation.errors.name && (
                    <Text style={s.errorText}>{validation.errors.name}</Text>
                  )}
                </View>

                <View style={s.inputContainer}>
                  <Text style={s.label}>
                    Phone number <Text style={s.required}>*</Text>
                  </Text>
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
                      value={validation.values.phone}
                      onChangeText={handlePhoneChange}
                      onBlur={validation.handleBlur('phone')}
                      keyboardType="numeric"
                      maxLength={10}
                    />
                  </View>
                  {validation.touched.phone && validation.errors.phone && (
                    <Text style={s.errorText}>{validation.errors.phone}</Text>
                  )}
                </View>

                <View style={s.inputContainer}>
                  <Text style={s.label}>Email</Text>
                  <View style={[
                    s.inputRow,
                    validation.touched.email && validation.errors.email && s.inputError,
                  ]}>
                    <TextInput
                      style={s.input}
                      placeholder="Enter email address"
                      placeholderTextColor={c.textMuted}
                      value={validation.values.email}
                      onChangeText={validation.handleChange('email')}
                      onBlur={validation.handleBlur('email')}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {validation.touched.email && validation.errors.email && (
                    <Text style={s.errorText}>{validation.errors.email}</Text>
                  )}
                </View>

                <View style={s.inputContainer}>
                  <Text style={s.label}>
                    Password <Text style={s.required}>*</Text>
                  </Text>
                  <View style={[
                    s.inputRow,
                    validation.touched.password && validation.errors.password && s.inputError,
                  ]}>
                    <TextInput
                      style={[s.input, { flex: 1 }]}
                      placeholder="Enter Password"
                      placeholderTextColor={c.textMuted}
                      value={validation.values.password}
                      onChangeText={validation.handleChange('password')}
                      onBlur={validation.handleBlur('password')}
                      secureTextEntry={!passwordShow}
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
                  {validation.touched.password && validation.errors.password && (
                    <Text style={s.errorText}>{validation.errors.password}</Text>
                  )}
                </View>

                <View style={s.inputContainer}>
                  <Text style={s.label}>
                    Confirm password <Text style={s.required}>*</Text>
                  </Text>
                  <View style={[
                    s.inputRow,
                    validation.touched.confirm_password &&
                    validation.errors.confirm_password &&
                    s.inputError,
                  ]}>
                    <TextInput
                      style={[s.input, { flex: 1 }]}
                      placeholder="Confirm Password"
                      placeholderTextColor={c.textMuted}
                      value={validation.values.confirm_password}
                      onChangeText={validation.handleChange('confirm_password')}
                      onBlur={validation.handleBlur('confirm_password')}
                      secureTextEntry={!confirmPasswordShow}
                    />
                    <TouchableOpacity
                      onPress={() => setConfirmPasswordShow(!confirmPasswordShow)}
                      style={s.eyeBtn}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      {confirmPasswordShow ? (
                        <Eye size={18} color={c.textMuted} />
                      ) : (
                        <EyeOff size={18} color={c.textMuted} />
                      )}
                    </TouchableOpacity>
                  </View>
                  {validation.touched.confirm_password && validation.errors.confirm_password && (
                    <Text style={s.errorText}>{validation.errors.confirm_password}</Text>
                  )}
                </View>

                <View style={s.inputContainer}>
                  <Text style={s.label}>
                    Referral code <Text style={s.optional}>(Optional)</Text>
                  </Text>
                  <View style={[
                    s.inputRow,
                    validation.touched.referral && validation.errors.referral && s.inputError,
                  ]}>
                    <TextInput
                      style={s.input}
                      placeholder="Enter referral code"
                      placeholderTextColor={c.textMuted}
                      value={validation.values.referral}
                      onChangeText={validation.handleChange('referral')}
                      onBlur={validation.handleBlur('referral')}
                    />
                  </View>
                  {validation.touched.referral && validation.errors.referral && (
                    <Text style={s.errorText}>{validation.errors.referral}</Text>
                  )}
                </View>

                <View style={s.termsContainer}>
                  <Text style={s.termsText}>
                    By registering you agree to the Unfluke{' '}
                    <Text
                      style={s.termsLink}
                      onPress={() => navigation.navigate('terms')}
                    >
                      Terms of Use
                    </Text>
                  </Text>
                </View>

                <TouchableOpacity
                  style={s.submitButton}
                  onPress={() => validation.handleSubmit()}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[c.goldBright, c.gold, c.goldDeep]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={s.submitGradient}
                  >
                    <Text style={s.submitButtonText}>Sign Up</Text>
                  </LinearGradient>
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

            {/* Divider */}
            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>Already a member?</Text>
              <View style={s.dividerLine} />
            </View>

            <View style={s.footer}>
              <Text style={s.footerText}>
                Already have an account?{' '}
                <Text
                  style={s.footerLink}
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
    </>
  );
};

const makeStyles = (c: AppColors, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.headerBg,
  },
  scrollContainer: {
    flexGrow: 1,
  },

  // Dark header
  darkHeader: {
    backgroundColor: c.headerBg,
    paddingBottom: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 190,
    height: 64,
    tintColor: c.gold,
  },
  tagline: {
    fontSize: 13,
    color: c.textMuted,
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
    borderWidth: isDark ? 1 : 0,
    borderColor: c.border,
  },
  cardBody: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: 22,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: c.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: c.textSecondary,
  },
  form: {
    marginTop: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    color: c.textSecondary,
  },
  required: {
    color: c.error,
  },
  optional: {
    color: c.textMuted,
    fontSize: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.inputBorder,
    paddingHorizontal: 14,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: c.text,
    fontWeight: '500',
    padding: 0,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '600',
    color: c.textSecondary,
    marginRight: 10,
  },
  inputDivider: {
    width: 1,
    height: 24,
    backgroundColor: c.border,
    marginRight: 12,
  },
  eyeBtn: {
    padding: 6,
    marginLeft: 4,
  },
  inputError: {
    borderColor: c.error,
    borderWidth: 1.5,
  },
  errorText: {
    color: c.error,
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  termsContainer: {
    marginBottom: 20,
  },
  termsText: {
    fontSize: 12,
    color: c.textSecondary,
  },
  termsLink: {
    color: c.gold,
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
  submitButton: {
    borderRadius: 14,
  },
  submitGradient: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: c.onGold,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 8,
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

  footer: {
    paddingBottom: 32,
    paddingTop: 4,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: c.textSecondary,
  },
  footerLink: {
    color: c.gold,
    fontWeight: '700',
  },
});

export default UnflukeRegister;
