// Sign in with Apple button.
//
// Unlike GoogleSignInButton, this deliberately does NOT hand-draw the mark.
// Apple's Human Interface Guidelines govern the logo, wording, corner radius
// and colour of this button, and a custom one is a documented review-rejection
// risk. AppleAuthenticationButton is Apple's own native control, so it is
// compliant by construction and localises its label automatically.
//
// What we do control: height and corner radius, matched to the Google button
// so the two sit together without looking bolted on.
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

import { useTheme } from '@/constants/ThemeContext';
import type { AppColors } from '@/constants/Colors';

const HEIGHT = 54;
const CORNER_RADIUS = 16;

interface AppleSignInButtonProps {
  onPress: () => void;
  /** Shows a spinner and blocks taps while the Apple flow is in progress. */
  loading?: boolean;
  /** Disabled while another login is busy, so the two can't race. */
  disabled?: boolean;
}

const AppleSignInButton: React.FC<AppleSignInButtonProps> = ({
  onPress,
  loading = false,
  disabled = false,
}) => {
  const { colors: c, isDark } = useTheme();
  const s = makeStyles(c);
  const isBlocked = loading || disabled;

  // The native button has no busy state and ignores pointer-event overrides on
  // some iOS versions, so while we're working we swap it for a placeholder of
  // identical size. That keeps the layout from jumping and makes a double-tap
  // impossible rather than merely unlikely.
  if (isBlocked) {
    return (
      <View style={[s.placeholder, loading ? null : s.placeholderDisabled]}>
        {loading ? <ActivityIndicator size="small" color={c.text} /> : null}
      </View>
    );
  }

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={
        AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
      }
      // Apple's guidance: the button must contrast with the surface it sits on.
      buttonStyle={
        isDark
          ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
          : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
      }
      cornerRadius={CORNER_RADIUS}
      style={s.button}
      onPress={onPress}
    />
  );
};

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    button: {
      width: '100%',
      height: HEIGHT,
    },
    placeholder: {
      width: '100%',
      height: HEIGHT,
      borderRadius: CORNER_RADIUS,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    placeholderDisabled: {
      opacity: 0.6,
    },
  });

export default AppleSignInButton;
