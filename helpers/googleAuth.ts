// Native Google Sign-In wrapper.
//
// The only thing the backend wants is the Google **ID token** (a JWT starting
// with "eyJ"), posted as `credential` to /api/user/google-login. We never send
// the OAuth access token (ya29.…) or the serverAuthCode — both are rejected —
// and we never send the email/name ourselves, because the backend reads those
// out of the signed token so a client cannot forge them.
//
// Audience rules, which decide whether a token is accepted at all:
//   Android — we pass webClientId, so the token's `aud` is the WEB client ID,
//             which the backend already allowlists. Works with no backend change.
//   iOS     — the token's `aud` is the iOS client ID, which must be appended to
//             the backend's GOOGLE_CLIENT_IDS env var first. Until that is done
//             (and until GOOGLE_IOS_CLIENT_ID is filled in here) iOS reports as
//             unconfigured, so we hide the button rather than ship one that
//             always 401s.
import { Platform } from 'react-native';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { Config } from './config';

const WEB_CLIENT_ID = Config.GOOGLE_WEB_CLIENT_ID;
const IOS_CLIENT_ID = Config.GOOGLE_IOS_CLIENT_ID;

/**
 * Whether Google Sign-In can work on this platform with the current config.
 * Android only needs the Web client ID; iOS additionally needs its own.
 */
export const isGoogleSignInConfigured = (): boolean => {
  if (!WEB_CLIENT_ID) return false;
  if (Platform.OS === 'ios') return Boolean(IOS_CLIENT_ID);
  return true;
};

let configured = false;

const ensureConfigured = () => {
  if (configured) return;
  GoogleSignin.configure({
    // Makes the Android ID token's `aud` the Web client ID (the allowlisted one).
    webClientId: WEB_CLIENT_ID,
    // Only meaningful on iOS; harmless when empty on Android.
    ...(IOS_CLIENT_ID ? { iosClientId: IOS_CLIENT_ID } : {}),
    // We only need identity, not offline API access, so no serverAuthCode.
    offlineAccess: false,
  });
  configured = true;
};

export type GoogleSignInResult =
  /** User completed the Google sheet — `idToken` is ready to POST as `credential`. */
  | { status: 'success'; idToken: string }
  /** User dismissed the account chooser. Not an error: show nothing, just reset the button. */
  | { status: 'cancelled' }
  /** Something genuinely failed. `message` is safe to show. */
  | { status: 'error'; message: string };

/**
 * Opens the native Google account sheet and returns an ID token.
 *
 * Never throws — the caller is a login screen, and an unhandled rejection there
 * leaves the user staring at a spinner. Cancellation is reported as its own
 * status so the UI can stay silent instead of flashing an error toast.
 */
export const signInWithGoogle = async (): Promise<GoogleSignInResult> => {
  if (!isGoogleSignInConfigured()) {
    return {
      status: 'error',
      message: 'Google Sign-In is not available on this build.',
    };
  }

  try {
    ensureConfigured();

    // Android-only check; resolves immediately elsewhere.
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }

    // Always start from a clean slate so the account chooser actually appears
    // and a user can switch accounts, instead of silently reusing the last one.
    try {
      await GoogleSignin.signOut();
    } catch {
      // No previous session to clear — not a failure.
    }

    const response = await GoogleSignin.signIn();

    if (!isSuccessResponse(response)) {
      return { status: 'cancelled' };
    }

    const idToken = response.data?.idToken;
    if (!idToken) {
      return {
        status: 'error',
        message: 'Google did not return a sign-in token. Please try again.',
      };
    }

    return { status: 'success', idToken };
  } catch (error: any) {
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          return { status: 'cancelled' };
        case statusCodes.IN_PROGRESS:
          // A sheet is already open; treat as a no-op rather than an error.
          return { status: 'cancelled' };
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          return {
            status: 'error',
            message:
              'Google Play Services is unavailable. Please sign in with your mobile number and password.',
          };
        default:
          break;
      }
    }

    // Surface the real reason in logs. The generic message below is right for
    // users, but hides the actual cause from developers. The common one here is
    // Android DEVELOPER_ERROR — the APK's signing SHA-1 is not registered in a
    // Google Cloud OAuth 2.0 "Android" client for this package. Check logcat.
    console.warn(
      '[googleAuth] Google sign-in failed:',
      error?.code,
      error?.message,
    );

    return {
      status: 'error',
      message: 'Could not sign in with Google. Please try again.',
    };
  }
};

/**
 * Clears the native Google session. Call on app logout so the next tap shows
 * the account chooser instead of silently reusing the previous account.
 */
export const signOutFromGoogle = async (): Promise<void> => {
  try {
    if (!isGoogleSignInConfigured()) return;
    ensureConfigured();
    await GoogleSignin.signOut();
  } catch {
    // Logout must never fail because of Google — local tokens are cleared anyway.
  }
};
