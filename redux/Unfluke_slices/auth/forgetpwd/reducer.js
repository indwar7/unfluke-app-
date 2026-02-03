import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  error: null,
  message: null,
  success: false,
};

const forgotPasswordSlice = createSlice({
  name: "ForgotPassword",
  initialState,
  reducers: {
    resetPasswordRequestStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    resetPasswordRequestSuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      state.message = action.payload.message;
    },
    resetPasswordRequestFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetForgotPasswordState: (state) => {
      state.error = null;
      state.success = false;
      state.message = null;
    },
  },
});

// OTP Verification Slice
const otpVerificationInitialState = {
  loading: false,
  error: null,
  message: null,
  success: false,
  resendLoading: false,
  resendSuccess: false,
  resendError: null,
};

const otpVerificationSlice = createSlice({
  name: "OtpVerification",
  initialState: otpVerificationInitialState,
  reducers: {
    verifyOtpStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    verifyOtpSuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      state.message = action.payload.message;
    },
    verifyOtpFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    resendOtpStart: (state) => {
      state.resendLoading = true;
      state.resendError = null;
    },
    resendOtpSuccess: (state) => {
      state.resendLoading = false;
      state.resendSuccess = true;
    },
    resendOtpFail: (state, action) => {
      state.resendLoading = false;
      state.resendError = action.payload;
    },
    resetOtpVerificationState: (state) => {
      state.error = null;
      state.success = false;
      state.message = null;
      state.resendError = null;
      state.resendSuccess = false;
    },
  },
});

// Reset Password Slice
const resetPasswordInitialState = {
  loading: false,
  error: null,
  message: null,
  success: false,
};

const resetPasswordSlice = createSlice({
  name: "ResetPassword",
  initialState: resetPasswordInitialState,
  reducers: {
    resetPasswordStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    resetPasswordSuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      state.message = action.payload.message;
    },
    resetPasswordFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetPasswordState: (state) => {
      state.error = null;
      state.success = false;
      state.message = null;
    },
  },
});

export const {
  resetPasswordRequestStart,
  resetPasswordRequestSuccess,
  resetPasswordRequestFail,
  resetForgotPasswordState,
} = forgotPasswordSlice.actions;

export const {
  verifyOtpStart,
  verifyOtpSuccess,
  verifyOtpFail,
  resendOtpStart,
  resendOtpSuccess,
  resendOtpFail,
  resetOtpVerificationState,
} = otpVerificationSlice.actions;

export const {
  resetPasswordStart,
  resetPasswordSuccess,
  resetPasswordFail,
  resetPasswordState,
} = resetPasswordSlice.actions;

export const forgotPasswordReducer = forgotPasswordSlice.reducer;
export const otpVerificationReducer = otpVerificationSlice.reducer;
export const resetPasswordReducer = resetPasswordSlice.reducer;
