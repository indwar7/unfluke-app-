// Import necessary modules
import { getFirebaseBackend } from "../../../../helpers/firebase_helper";
import {
  postFakeLogin,
  postJwtLogin,
  postSocialLogin,
  postLoginRefeshToken,
  getUserInfo,
} from "../../../../Unfluke_helpers/backend_helper";
import { appTypes } from "../../../../components/UnflukeMain/constants/layout";
import {
  loginSuccess,
  logoutUserSuccess,
  apiError,
  reset_login_flag,
} from "./reducer";

import AsyncStorage from "@react-native-async-storage/async-storage";

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
    dispatch(apiError("Mobile Number or Password does not exist"));
  }
};


export const logoutUser = () => async (dispatch) => {
  try {
    await AsyncStorage.removeItem("authUser");
    await AsyncStorage.removeItem("access");
    await AsyncStorage.removeItem("firstLogin");
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
      await AsyncStorage.setItem("authUser", JSON.stringify(response));
      dispatch(loginSuccess(response));
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
