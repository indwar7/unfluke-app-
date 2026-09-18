// Sign in with Apple wrapper.
//
// Required by App Store Review Guideline 4.8: an app that offers a third-party
// social login (we offer Google) must also offer an equivalent privacy-focused
// option. This is that option, and it is iOS-only by design — Apple's SDK does
// not exist on Android, where the Google button already satisfies users.
//
// Contract with the backend mirrors googleAuth.ts exactly: we post the Apple
// **identity token** (a JWT, same "eyJ…" shape as Google's) as `credential` to
// /api/user/apple-login. The server verifies it against Apple's JWKS and reads
// the identity out of the signed token, so a client can never forge who it is.
//
// The one real difference from Google — and the source of most Sign in with
// Apple bugs — is that Apple returns the user's NAME exactly once, on the very
// first authorization. Every sign-in after that has fullName === null, even
// though the same person is signing in. Apple does this deliberately: the app
// is expected to store the name the first time. The email is friendlier — it
// stays inside the identity token on every sign-in (as either the real address
// or a private-relay one), which is why the backend reads it from there rather
// than trusting anything we send.
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

/**
 * Whether the Sign in with Apple button should be shown at all.
 *
 * Deliberately synchronous so the login screen can call it during render, the
 * same way it calls isGoogleSignInConfigured(). Apple's own availability check
 * is async, so it runs inside signInWithApple() as a safety net instead — on
 * any iOS version this app supports it is always true, so gating the button on
 * a promise would only add a flicker.
 *
 * Unlike Google there is nothing to configure: no client ID, no console entry.
 * Enabling the "Sign in with Apple" capability on the App ID is what makes it
 * work, and that is a build-time concern, not a runtime one.
 */
export const isAppleSignInConfigured = (): boolean => Platform.OS === 'ios';

/**
 * Builds the display name we hand to the backend alongside the credential.
 *
 * Apple gives `fullName` ONLY on a user's first authorization for this app.
 * On every later sign-in both givenName and familyName are null — including
 * the very common case where someone authorizes, abandons the phone-number
 * step, and comes back a minute later.
 */
const buildDisplayName = (
  fullName: AppleAuthentication.AppleAuthenticationFullName | null,
): string | undefined => {
  const parts = [fullName?.givenName, fullName?.familyName]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  // Nothing usable — return undefined so the caller omits `name` from the
  // payload entirely and the backend keeps whatever it stored on the first
  // authorization.
  //
  // We deliberately do NOT fall back to deriving a name from the email. The
  // backend stores whatever name it receives, so a derived value would
  // permanently replace a real one: a user who signed up as "Rahul Sharma"
  // would silently become "rahul.sharma" on their second sign-in, and anyone
  // using Apple's private relay would become something like "xyz123". A
  // missing name is recoverable; an overwritten one is not.
  return parts.length ? parts.join(' ') : undefined;
};

export type AppleSignInResult =
  /** User completed the Apple sheet — `identityToken` is ready to POST as `credential`. */
  | { status: 'success'; identityToken: string; name?: string; email?: string }
  /** User dismissed the sheet. Not an error: show nothing, just reset the button. */
  | { status: 'cancelled' }
  /** Something genuinely failed. `message` is safe to show. */
  | { status: 'error'; message: string };

/**
 * Opens the native Apple sheet and returns an identity token.
 *
 * Never throws — the caller is a login screen, and an unhandled rejection there
 * leaves the user staring at a spinner. Cancellation is reported as its own
 * status so the UI can stay silent instead of flashing an error toast.
 */
export const signInWithApple = async (): Promise<AppleSignInResult> => {
  if (!isAppleSignInConfigured()) {
    return {
      status: 'error',
      message: 'Sign in with Apple is only available on iOS.',
    };
  }

  try {
    // Safety net for the theoretical old-iOS case the sync check above skips.
    const available = await AppleAuthentication.isAvailableAsync();
    if (!available) {
      return {
        status: 'error',
        message: 'Sign in with Apple is not available on this device.',
      };
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Without this the backend has no verifiable identity to work with.
    if (!credential.identityToken) {
      return {
        status: 'error',
        message: 'Apple did not return a sign-in token. Please try again.',
      };
    }

    const name = buildDisplayName(credential.fullName);

    return {
      status: 'success',
      identityToken: credential.identityToken,
      ...(name ? { name } : {}),
      ...(credential.email ? { email: credential.email } : {}),
    };
  } catch (error: any) {
    // Apple reports a user-dismissed sheet as a thrown ERR_REQUEST_CANCELED
    // rather than a result, so this branch is the normal "user tapped Cancel"
    // path, not a failure.
    if (
      error?.code === 'ERR_REQUEST_CANCELED' ||
      error?.code === 'ERR_CANCELED'
    ) {
      return { status: 'cancelled' };
    }

    // Surface the real reason in logs. The generic message below is right for
    // users but hides the cause from developers. The usual culprit is a build
    // whose App ID lacks the "Sign in with Apple" capability — that fails at
    // runtime with an opaque authorization error, not at build time.
    console.warn('[appleAuth] Apple sign-in failed:', error?.code, error?.message);

    return {
      status: 'error',
      message: 'Could not sign in with Apple. Please try again.',
    };
  }
};
