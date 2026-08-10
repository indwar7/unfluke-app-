// "One last step" — Flow B of social sign-in, shared by Google AND Apple.
//
// Both providers give us a verified identity but never a phone number, and an
// Unfluke account is keyed on a phone-OTP-verified number. So when the login
// endpoint answers { needsSignup: true } no account exists yet, and this screen
// collects the missing mobile number, sends the OTP, and only then does
// /api/user/activation actually create the account.
//
// Sequence: <provider>-register (sends OTP) -> activation (creates account)
//        -> replay the original credential to <provider>-login (logs the user in).
//
// The route keeps its original name so existing links stay valid; only the
// endpoints and the replayed thunk vary, chosen from pending.provider.
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/constants/ThemeContext';
import type { AppColors } from '@/constants/Colors';
import OTPVerificationModal from '@/components/UnflukeMain/Authentication/OtpVerification';

import {
  clearPendingSocialSignup,
  getPendingSocialSignup,
} from '../helpers/socialSignupSession';
import {
  postAppleRegister,
  postGoogleRegister,
  postResendOtp,
  postVerifyPhoneOtp,
} from '../Unfluke_helpers/backend_helper';
import { appleLogin, googleLogin } from '../redux/Unfluke_slices/thunks';
import { useOnboarding } from '@/redux/contextHelper';

const CompleteGoogleSignup = () => {
  const { colors: c, isDark } = useTheme();
  const s = makeStyles(c, isDark);
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<any>();
  const { onFinish } = useOnboarding();

  // Read once — the pending signup lives in memory only.
  const [pending] = useState(() => getPendingSocialSignup());
  const isApple = pending?.provider === 'apple';
  /** Human-readable provider name, for copy that has to name it. */
  const providerLabel = isApple ? 'Apple' : 'Google';

  const [phone, setPhone] = useState('');
  const [referral, setReferral] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);

  // hash is replaced on every resend; activation_token is NOT — the resend
  // endpoint does not return a new one and the original stays valid, because it
  // encodes the user data rather than the OTP.
  const [hash, setHash] = useState('');
  const [activationToken, setActivationToken] = useState('');
  const [verifiedPhone, setVerifiedPhone] = useState('');

  // If the process was killed mid-signup (or someone deep-links here) there is
  // nothing to resume — send them back to start over. google-login is
  // idempotent, so tapping Google again just issues a fresh signup_token.
  useEffect(() => {
    if (!pending?.signup_token) {
      router.replace('/login' as any);
    }
  }, [pending]);

  if (!pending?.signup_token) return null;

  const showError = (message: string) =>
    Toast.show({
      type: 'error',
      text1: 'Sign-up failed',
      text2: message,
      position: 'top',
      visibilityTime: 4000,
    });

  /** Restart Flow B from the provider button — used when the signup_token lapses. */
  const restartSignup = (message: string) => {
    clearPendingSocialSignup();
    showError(message);
    router.replace('/login' as any);
  };

  const handleSendOtp = async () => {
    const digits = phone.replace(/\D/g, '').slice(-10);

    if (digits.length !== 10) {
      setPhoneError('Please enter a 10-digit mobile number');
      return;
    }

    setPhoneError('');
    setIsSending(true);

    try {
      const payload: Record<string, string> = {
        signup_token: pending.signup_token,
        phone: digits,
      };
      // Omit the key entirely when empty rather than sending "".
      if (referral.trim()) payload.referral = referral.trim();

      // Apple hands over the name exactly once, at first authorization. We
      // already sent it to apple-login, but apple-register accepts it too and
      // takes precedence — so resend it here as a second chance in case the
      // first call's name never landed. (google-register has no such field.)
      if (isApple && pending.name) payload.name = pending.name;

      const data: any = isApple
        ? await postAppleRegister(payload)
        : await postGoogleRegister(payload);

      if (!data?.hash || !data?.activation_token) {
        throw new Error('Could not send OTP. Please try again.');
      }

      setHash(data.hash);
      setActivationToken(data.activation_token);
      setVerifiedPhone(data.phone || digits);
      setIsOtpOpen(true);
    } catch (error: any) {
      const message =
        (typeof error === 'string' ? error : error?.message) ||
        'Could not send OTP. Please try again.';

      // The 15-minute signup_token lapsed, or was rejected — only a fresh
      // sign-in can fix these, so bounce rather than let the user retry.
      // Matched for either provider, since the backend names the provider in
      // its message and this screen now serves both.
      if (
        /(Google|Apple) sign-in expired/i.test(message) ||
        /Invalid (Google|Apple) signup token/i.test(message) ||
        /Missing (Google|Apple) signup token/i.test(message)
      ) {
        restartSignup(message);
        return;
      }

      // Already registered (a race with another session): the account exists,
      // so just sign in with the credential we still hold.
      if (/already registered/i.test(message)) {
        await completeLogin();
        return;
      }

      showError(message);
    } finally {
      setIsSending(false);
    }
  };

  /** Replays the original credential so the user lands straight on the dashboard. */
  const completeLogin = async () => {
    const credential = pending.credential;
    const name = pending.name;
    clearPendingSocialSignup();

    if (!credential) {
      // No credential left to replay — the account exists, so let them sign in.
      Toast.show({
        type: 'success',
        text1: 'Account created',
        text2: `Please sign in with ${providerLabel} to continue.`,
      });
      router.replace('/login' as any);
      return;
    }

    // Apple's identity token is replayed with the name we captured on the first
    // authorization — Apple will not hand it to us a second time, so this is the
    // last chance the backend has to record it.
    const result: any = isApple
      ? await dispatch(appleLogin(credential, name))
      : await dispatch(googleLogin(credential));

    if (result?.status === 'success') {
      await onFinish();
      router.replace('/dashboard' as any);
      return;
    }

    Toast.show({
      type: 'success',
      text1: 'Account created',
      text2: 'Please sign in to continue.',
    });
    router.replace('/login' as any);
  };

  /**
   * Verifies the OTP, which is what actually creates the account. Rethrows so
   * the modal keeps itself open and shows the backend's message inline.
   */
  const handleVerify = async (otp: string) => {
    const data: any = await postVerifyPhoneOtp({
      phone: verifiedPhone,
      hash,
      otp,
      activation_token: activationToken,
    });

    const msg = data?.msg || data?.message;
    if (!msg) throw new Error('Incorrect OTP');

    setIsOtpOpen(false);
    await completeLogin();
  };

  const handleResend = async () => {
    const data: any = await postResendOtp({
      phone: verifiedPhone,
      name: pending.name,
    });

    if (!data?.hash) throw new Error('Could not resend OTP. Please try again.');

    // Replace ONLY the hash — activationToken must survive untouched.
    setHash(data.hash);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: '' }} />
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={s.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[s.darkHeader, { paddingTop: insets.top + 32 }]}>
            <View style={s.headerGlow} />
            <Text style={s.headerTitle}>One last step</Text>
            <Text style={s.headerSubtitle}>
              We just need your mobile number to finish
            </Text>
          </View>

          <View style={s.card}>
            <View style={s.cardHandle} />
            <View style={s.cardBody}>
              {/* Provider-verified identity, shown read-only */}
              <View style={s.identityRow}>
                {pending.avatarUrl ? (
                  <Image source={{ uri: pending.avatarUrl }} style={s.avatar} />
                ) : (
                  <View style={[s.avatar, s.avatarFallback]}>
                    <Text style={s.avatarInitial}>
                      {(pending.name || pending.email || '?')
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={s.identityText}>
                  {pending.name ? (
                    <Text style={s.identityName} numberOfLines={1}>
                      {pending.name}
                    </Text>
                  ) : null}
                  <Text style={s.identityEmail} numberOfLines={1}>
                    {pending.email}
                  </Text>
                </View>
              </View>

              {/* Phone */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Mobile number</Text>
                <View style={[s.inputRow, !!phoneError && s.inputError]}>
                  <Text style={s.countryCode}>+91</Text>
                  <View style={s.inputDivider} />
                  <TextInput
                    style={s.input}
                    placeholder="98765 43210"
                    placeholderTextColor={c.textMuted}
                    keyboardType="numeric"
                    maxLength={10}
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text.replace(/\D/g, ''));
                      setPhoneError('');
                    }}
                    editable={!isSending}
                  />
                </View>
                {phoneError ? <Text style={s.errorText}>{phoneError}</Text> : null}
              </View>

              {/* Referral (optional) */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Referral code (optional)</Text>
                <View style={s.inputRow}>
                  <TextInput
                    style={s.input}
                    placeholder="Enter referral code"
                    placeholderTextColor={c.textMuted}
                    autoCapitalize="characters"
                    value={referral}
                    onChangeText={setReferral}
                    editable={!isSending}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[s.button, isSending && s.buttonDisabled]}
                onPress={handleSendOtp}
                disabled={isSending}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[c.goldBright, c.gold, c.goldDeep]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.buttonGradient}
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color={c.onGold} />
                  ) : (
                    <Text style={s.buttonText}>Send OTP</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.cancelBtn}
                onPress={() => {
                  clearPendingSocialSignup();
                  router.replace('/login' as any);
                }}
                disabled={isSending}
              >
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <OTPVerificationModal
        isOpen={isOtpOpen}
        toggle={() => setIsOtpOpen((prev) => !prev)}
        onVerify={handleVerify}
        onResend={handleResend}
        title="Verify your number"
        subtitle={`We've sent a 6-digit code to +91 ${verifiedPhone}`}
      />
      <Toast />
    </>
  );
};

const HEADER_BG = '#0A0B0E';

const makeStyles = (c: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: HEADER_BG,
    },
    scrollContainer: {
      flexGrow: 1,
    },
    darkHeader: {
      backgroundColor: HEADER_BG,
      paddingBottom: 56,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    headerGlow: {
      position: 'absolute',
      top: -120,
      width: 320,
      height: 320,
      borderRadius: 160,
      backgroundColor: c.gold,
      opacity: 0.1,
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: '800',
      color: '#fff',
      letterSpacing: -0.4,
    },
    headerSubtitle: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.55)',
      marginTop: 8,
      textAlign: 'center',
    },
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
      alignSelf: 'center',
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

    identityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.inputBg,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 14,
      padding: 12,
      marginBottom: 24,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: 12,
    },
    avatarFallback: {
      backgroundColor: c.goldLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitial: {
      fontSize: 18,
      fontWeight: '800',
      color: c.gold,
    },
    identityText: {
      flex: 1,
    },
    identityName: {
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
    },
    identityEmail: {
      fontSize: 13,
      color: c.textSecondary,
      marginTop: 2,
    },

    inputGroup: {
      marginBottom: 18,
    },
    label: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: c.textMuted,
      marginBottom: 8,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.inputBg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.inputBorder,
      paddingHorizontal: 16,
      height: 54,
    },
    countryCode: {
      fontSize: 15,
      fontWeight: '700',
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
      fontWeight: '500',
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
      fontWeight: '600',
    },

    button: {
      borderRadius: 16,
      overflow: 'hidden',
      marginTop: 6,
    },
    buttonGradient: {
      height: 54,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: c.onGold,
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.4,
    },
    cancelBtn: {
      alignSelf: 'center',
      paddingVertical: 16,
      marginTop: 4,
    },
    cancelText: {
      fontSize: 14,
      color: c.textSecondary,
      fontWeight: '600',
    },
  });

export default CompleteGoogleSignup;
