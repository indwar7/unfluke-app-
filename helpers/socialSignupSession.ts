// In-memory hand-off between the login screen and the "one last step" screen.
//
// Shared by BOTH social providers. Google and Apple differ in how you obtain a
// credential, but not in what happens next: an Unfluke account is keyed on a
// phone-OTP-verified number, so a brand-new user from either provider lands on
// the same screen to supply that number. `provider` is the only thing the
// completion screen needs in order to hit the right register endpoint and
// replay the right login.
//
// Everything here is deliberately NOT persisted. The signup_token lives 15
// minutes and the credential ~1 hour, and both are bearer-ish secrets, so
// writing them to AsyncStorage would leave a stale credential on disk with
// nothing useful to do. If the process is killed mid-signup the cleanest
// recovery is to start over from the provider button — both login endpoints are
// idempotent, so the user just gets a fresh signup_token.
//
// This also keeps the ~1000-character ID token out of expo-router's params.

export type SignupProvider = 'google' | 'apple';

export type PendingSocialSignup = {
  /** Which button started this signup — decides the register + replay endpoints. */
  provider: SignupProvider;
  /** Short-lived JWT carrying the provider-verified identity. 15 minute life. */
  signup_token: string;
  name?: string;
  email?: string;
  /** Google only — Apple never returns a photo. */
  avatarUrl?: string;
  /**
   * The original provider ID token. Kept so that once activation succeeds we
   * can replay it to the login endpoint and drop the user straight on the
   * dashboard instead of bouncing them back to the login screen.
   */
  credential: string;
};

let pending: PendingSocialSignup | null = null;

export const setPendingSocialSignup = (value: PendingSocialSignup) => {
  pending = value;
};

export const getPendingSocialSignup = (): PendingSocialSignup | null => pending;

export const clearPendingSocialSignup = () => {
  pending = null;
};
