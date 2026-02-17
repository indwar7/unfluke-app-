// Import your API service
import { APIClient } from "../../../../Unfluke_helpers/api_helper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  resetPasswordRequestStart,
  resetPasswordRequestSuccess,
  resetPasswordRequestFail,
  resetForgotPasswordState,
  verifyOtpStart,
  verifyOtpSuccess,
  verifyOtpFail,
  resetOtpVerificationState,
  resendOtpStart,
  resendOtpSuccess,
  resendOtpFail,
  resetPasswordStart,
  resetPasswordSuccess,
  resetPasswordFail,
  resetPasswordState,
} from "./reducer";

const api = new APIClient();

// Reset Password Request Thunk
export const resetPasswordRequest = (data) => async (dispatch) => {
  try {
    dispatch(resetPasswordRequestStart());
    const response = await api.create("/api/user/forgot-password", data);
    console.log("fp response", response);

    // Use AsyncStorage instead of localStorage
    await AsyncStorage.setItem(
      "forgotPasswordResponse",
      JSON.stringify(response)
    );

    dispatch(resetPasswordRequestSuccess(response));
    return response.data;
  } catch (error) {
    dispatch(
      resetPasswordRequestFail(
        error.response?.data?.message || "Failed to send OTP"
      )
    );
    return null;
  }
};

// Reset the forgot password flag
export const resetForgotPasswordFlag = () => async (dispatch) => {
  dispatch(resetForgotPasswordState());
};

// Verify OTP Thunk
export const verifyOtp = (data) => async (dispatch) => {
  try {
    dispatch(verifyOtpStart());
    console.log(data)
    
    const response = await api.create("/api/user/verify-otp", data);
    console.log("response",response)
    dispatch(verifyOtpSuccess(response));
    return response.data;
  } catch (error) {
    console.log("asdfsdf sadf  a",error)
    dispatch(verifyOtpFail(error.response?.data?.message || "Invalid OTP"));
    return null;
  }
};

// Resend OTP Thunk
export const resendOtp = (data) => async (dispatch) => {
  try {
    dispatch(resendOtpStart());
    const response = await api.create("/api/user/resend-otp", data);
    dispatch(resendOtpSuccess(response.data));
    return response.data;
  } catch (error) {
    dispatch(
      resendOtpFail(error.response?.data?.message || "Failed to resend OTP")
    );
    return null;
  }
};

// Reset OTP verification flag
export const resetOtpVerificationFlag = () => async (dispatch) => {
  dispatch(resetOtpVerificationState());
};

// Reset Password Thunk
export const resetPassword = (data) => async (dispatch) => {
  try {
    dispatch(resetPasswordStart());
    const response = await api.create("/api/user/reset-password", data);
    dispatch(resetPasswordSuccess(response));
    return response.data;
  } catch (error) {
    dispatch(
      resetPasswordFail(error.response?.data?.message || "Failed to reset password")
    );
    return null;
  }
};

// Reset the password flag
export const resetPasswordFlag = () => async (dispatch) => {
  dispatch(resetPasswordState());
};
