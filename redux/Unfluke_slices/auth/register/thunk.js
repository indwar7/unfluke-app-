//Include Both Helper File with needed methods
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirebaseBackend } from "../../../../helpers/firebase_helper";
import {
  postFakeRegister,
  postJwtRegister,
} from "../../../../Unfluke_helpers/backend_helper";
import { Config } from '../../../../helpers/config';

// Set base URL - use centralized config
// action
import {
  registerUserSuccessful,
  registerUserFailed,
  resetRegisterFlagChange,
  apiErrorChange,
  resetVerificationMailSent,
  resetVerificationOtpSent,

} from "./reducer";

// initialize relavant method of both Auth
// const fireBaseBackend = getFirebaseBackend();

// Is user register successfull then direct plot user in redux.


export const registerUser = (user) => async (dispatch) => {
  try {
          console.log(Config.BACKEND_URL)

    let response;
    if (Config.DEFAULT_AUTH === "firebase") {
      // response = fireBaseBackend.registerUser(user.email, user.password);
      // yield put(registerUserSuccessful(response));
    } else if (Config.DEFAULT_AUTH === "jwt") {
      response = await postJwtRegister('/api/user/register', user);
      console.log("registerUser response:", response);

      const otpData = response?.hash
        ? response
        : response?.data?.hash
        ? response.data
        : null;

      if (otpData) {
        await AsyncStorage.setItem("response", JSON.stringify(otpData));
        dispatch(resetVerificationOtpSent());
      } else {
        const msg =
          response?.message ||
          response?.msg ||
          response?.error ||
          response?.data?.message ||
          "Registration failed. Please try again.";
        dispatch(registerUserFailed(msg));
      }
    //   if (response=="Verify your email"){
    //       dispatch(resetVerificationMailSent())
    //   }
      // yield put(registerUserSuccessful(response));

    } else if (process.env.REACT_APP_API_URL) {
      response = postFakeRegister(user);
      const data = await response;

      if (data.message === "success") {
        dispatch(registerUserSuccessful(data));
      } else {
        dispatch(registerUserFailed(data));
      }
    }
  } catch (error) {
    dispatch(registerUserFailed(error));
  }
};

export const registerSuccess = () => async (dispatch) =>{
  dispatch(registerUserSuccessful({}))
}

export const resetRegisterFlag = ()=>() => {
  try {
    const response = resetRegisterFlagChange();
    return response;
  } catch (error) {
    return error;
  }
};

export const apiError = () => {
  try {
    const response = apiErrorChange();
    return response;
  } catch (error) {
    return error;
  }
};
