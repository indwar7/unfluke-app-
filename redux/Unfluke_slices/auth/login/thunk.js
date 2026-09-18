// Import necessary modules
import { getFirebaseBackend } from "../../../../helpers/firebase_helper";
import {
  postFakeLogin,
  postJwtLogin,
  postSocialLogin,
  postLoginRefeshToken,
  getUserInfo,
  postGoogleLogin,
  postAppleLogin,
} from "../../../../Unfluke_helpers/backend_helper";
import { appTypes } from "../../../../components/UnflukeMain/constants/layout";
import {
  loginSuccess,
  logoutUserSuccess,
  apiError,
  reset_login_flag,
} from "./reducer";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOutFromGoogle } from "../../../../helpers/googleAuth";

export const loginUser = (user) => async (dispatch) => {
  
  // dispatch(loginStart());

  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);

  try {
    let response = postJwtLogin({
      phone: user.phone,
      password: user.password,
    });

    var data = await response;

    if (data) {
      const rf_token = data.refresh_token;
      const temp = await postLoginRefeshToken({ rf_token });
      const client = await getUserInfo({
        headers: { Authorization: temp.access_token },
      });

      await AsyncStorage.setItem("access", temp.access_token);
      await AsyncStorage.setItem("firstLogin", "true");
      await AsyncStorage.setItem("authUser", JSON.stringify(client));

      console.log("ahsdfhsdf ash dfkjhk akhdhf kh asdf ",client.name);

      // Only dispatch success - let component handle navigation
      dispatch(loginSuccess(client));

    } else {
      dispatch(apiError(data, "Invalid response from server"));
    }
  } catch (error) {
    console.log("error", error);
    if (error?.toString().includes("Network Error")) {
      // You might need to handle this differently since we removed navigation param
      dispatch(apiError("Network Error - Please check your connection"));
    }

    // An account created through Google has no password at all, and the backend
    // says so explicitly ("This account uses Google Sign-In. Please continue
    // with Google."). That message tells the user exactly what to do, so it has
    // to survive instead of being flattened into the generic string below.
    const serverMsg = typeof error === "string" ? error : error?.message;
    if (serverMsg && /google sign-?in/i.test(serverMsg)) {
      dispatch(apiError(serverMsg));
      return;
    }

    dispatch(apiError("Mobile Number or Password does not exist"));
  }
};


/**
 * Turns a refresh_token into a logged-in session: exchange it for an access
 * token, fetch the profile, persist both, then dispatch loginSuccess so the
 * screen's existing navigation effect takes over.
 *
 * This is the same sequence loginUser runs after a password login — the Google
 * endpoint returns the identical { refresh_token } shape on purpose so both
 * paths converge here.
 *
 * One difference from loginUser: we clear any stale stored `access` first. The
 * axios request interceptor overwrites Authorization with `Bearer <stored
 * token>` whenever one exists, which would otherwise clobber the raw header we
 * pass below and make getUserInfo fail for a user who signs in again without
 * having logged out.
 */
const finalizeLogin = async (refresh_token, dispatch) => {
  await AsyncStorage.removeItem("access");

  const temp = await postLoginRefeshToken({ rf_token: refresh_token });
  const access_token = temp?.access_token;
  if (!access_token) throw new Error("Could not start your session");

  // NOTE: the API takes the raw token — no "Bearer " prefix.
  const client = await getUserInfo({
    headers: { Authorization: access_token },
  });

  await AsyncStorage.setItem("access", access_token);
  await AsyncStorage.setItem("firstLogin", "true");
  await AsyncStorage.setItem("authUser", JSON.stringify(client));

  dispatch(loginSuccess(client));
};

/**
 * Google Sign-In, step 1. Send the Google ID token to the backend and branch on
 * what comes back. BOTH outcomes are HTTP 200, so we branch on the body, never
 * on the status code.
 *
 * Resolves to one of:
 *   { status: "success" }                       -> already logged in, screen navigates
 *   { status: "needsSignup", signupData: {...} } -> brand-new user, show the phone screen
 *   { status: "error", message }                 -> show message, password login still works
 *
 * Never throws, so a Google failure can never block the phone + password login.
 */
export const googleLogin = (idToken) => async (dispatch) => {
  try {
    const data = await postGoogleLogin({ credential: idToken });

    // Brand-new user: the backend deliberately did NOT create an account,
    // because an Unfluke account is keyed on a phone-OTP-verified number.
    if (data?.needsSignup) {
      return {
        status: "needsSignup",
        signupData: {
          signup_token: data.signup_token,
          name: data.name,
          email: data.email,
          avatarUrl: data.avatarUrl,
        },
      };
    }

    if (data?.refresh_token) {
      await finalizeLogin(data.refresh_token, dispatch);
      return { status: "success" };
    }

    // Forward-compatibility guard: the backend may later add a new 200 shape
    // (e.g. a needsLink confirmation step). Treat anything unrecognised as
    // "cannot proceed" and send the user to password login rather than crash.
    const message =
      "Could not complete Google sign-in. Please sign in with your mobile number and password.";
    dispatch(apiError(message));
    return { status: "error", message };
  } catch (error) {
    // The axios interceptor rejects with the backend's `msg` string, which is
    // written to be user-facing, so show it as-is.
    const message =
      typeof error === "string"
        ? error
        : error?.message || "Google sign-in failed. Please try again.";
    dispatch(apiError(message));
    return { status: "error", message };
  }
};

/**
 * Sign in with Apple. Deliberately a near-copy of googleLogin above rather than
 * a shared generic: the two backends are separate endpoints with separate
 * verification, and collapsing them would hide which provider failed when one
 * of them changes shape.
 *
 * The name field is `fullName` here and `name` on apple-register — the two
 * endpoints genuinely differ, so don't "fix" this to match. It is sent only
 * when Apple actually gave us one (first authorization only); the backend falls
 * back to the email local part when it is absent, and a missing name is never
 * an error.
 *
 * `credential` is the backend's documented alias for `identityToken`, kept so
 * this call site stays shaped like googleLogin above.
 */
export const appleLogin = (identityToken, name) => async (dispatch) => {
  try {
    const payload = { credential: identityToken };
    if (name) payload.fullName = name;

    const data = await postAppleLogin(payload);

    // Brand-new user: the backend deliberately did NOT create an account,
    // because an Unfluke account is keyed on a phone-OTP-verified number.
    if (data?.needsSignup) {
      return {
        status: "needsSignup",
        signupData: {
          signup_token: data.signup_token,
          // Prefer the server's echo, but fall back to the name Apple just gave
          // us — on a first authorization the server may not have stored it yet.
          name: data.name || name,
          email: data.email,
        },
      };
    }

    if (data?.refresh_token) {
      await finalizeLogin(data.refresh_token, dispatch);
      return { status: "success" };
    }

    const message =
      "Could not complete Apple sign-in. Please sign in with your mobile number and password.";
    dispatch(apiError(message));
    return { status: "error", message };
  } catch (error) {
    const message =
      typeof error === "string"
        ? error
        : error?.message || "Apple sign-in failed. Please try again.";
    dispatch(apiError(message));
    return { status: "error", message };
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    // Clear the native Google session too, otherwise the next tap silently
    // reuses the last account and the user can never switch. Never throws.
    await signOutFromGoogle();

    await AsyncStorage.multiRemove([
      "authUser",
      "access",
      "firstLogin",
      "forgotPasswordResponse",
      "response",
    ]);
    dispatch(logoutUserSuccess(true));
  } catch (error) {
    dispatch(apiError(error?.message || "Logout failed"));
  }
};

export const socialLogin = (type, router) => async (dispatch) => {
  try {
    let response;

    if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
      const fireBaseBackend = getFirebaseBackend();
      response = fireBaseBackend.socialLoginUser(type);
    }

    const socialdata = await response;
    if (socialdata) {
      // Firebase wraps the token under several possible paths; try the
      // common ones so app/index.tsx (which requires both access and
      // authUser to auto-login) does not silently log the user out on
      // every restart.
      const accessToken =
        socialdata?.access_token ||
        socialdata?.accessToken ||
        socialdata?.stsTokenManager?.accessToken ||
        socialdata?.user?.stsTokenManager?.accessToken;
      if (accessToken) {
        await AsyncStorage.setItem("access", accessToken);
      }
      await AsyncStorage.setItem("firstLogin", "true");
      await AsyncStorage.setItem("authUser", JSON.stringify(socialdata));
      dispatch(loginSuccess(socialdata));
      router.replace(`dashboard`);
    }
  } catch (error) {
    dispatch(apiError(error));
  }
};

export const resetLoginFlag = () => async (dispatch) => {
  try {
    const response = dispatch(reset_login_flag());
    return response;
  } catch (error) {
    dispatch(apiError(error));
  }
};
