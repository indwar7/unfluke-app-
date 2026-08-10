import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/constants/ThemeContext';
import type { AppColors } from '@/constants/Colors';

/** Official Google "G", drawn inline so the button needs no remote asset. */
const GoogleG = ({ size = 18 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Path
      fill="#4285F4"
      d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
    />
    <Path
      fill="#34A853"
      d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
    />
    <Path
      fill="#FBBC05"
      d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
    />
    <Path
      fill="#EA4335"
      d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
    />
  </Svg>
);

interface GoogleSignInButtonProps {
  onPress: () => void;
  /** Shows a spinner and blocks taps while the Google flow is in progress. */
  loading?: boolean;
  /** Disabled while the password login is busy, so the two can't race. */
  disabled?: boolean;
  label?: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onPress,
  loading = false,
  disabled = false,
  label = 'Continue with Google',
}) => {
  const { colors: c, isDark } = useTheme();
  const s = makeStyles(c, isDark);
  const isBlocked = loading || disabled;

  return (
    <TouchableOpacity
      style={[s.button, isBlocked && s.buttonDisabled]}
      onPress={onPress}
      disabled={isBlocked}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isBlocked, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={c.text} />
      ) : (
        <View style={s.content}>
          <View style={s.iconWrap}>
            <GoogleG />
          </View>
          <Text style={s.label}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const makeStyles = (c: AppColors, isDark: boolean) =>
  StyleSheet.create({
    button: {
      height: 54,
      borderRadius: 16,
      borderWidth: 1,
      // Google's brand guidance wants the G on a neutral surface, so this
      // deliberately stays plain rather than taking the gold gradient the
      // primary "Sign In" button uses.
      borderColor: c.border,
      backgroundColor: isDark ? c.surfaceElevated : c.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWrap: {
      marginRight: 12,
    },
    label: {
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
      letterSpacing: 0.2,
    },
  });

export default GoogleSignInButton;
