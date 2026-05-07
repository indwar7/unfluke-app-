import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  registrationError: null,
  message: null,
  loading: false,
  user: null,
  success: false,
  verificationMailSent:false,
  verificationOtpSent:false,
  error: false
};

const registerSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    registerUserSuccessful(state, action) {
      state.user = action.payload;
      state.loading = false;
      state.success = true;
      state.registrationError = null;
    },
    registerUserFailed(state, action) {
      state.user = null;
      state.loading = false;
      state.registrationError = action.payload;
      state.error = true;
    },
    registerRegisterFlagChange(state) {
      state.success = false;
      state.error = false;
    },
    resetVerificationMailSent(state) {
      state.verificationMailSent = true;
    },
    resetVerificationOtpSent(state) {
      state.verificationOtpSent = true;
    },
    clearVerificationOtpSent(state) {
      state.verificationOtpSent = false;
    },
    apiErrorChange(state, action){
      state.error = action.payload;
      state.loading = false;
      state.isUserLogout = false;
    }
  }
});

export const {
  registerUserSuccessful,
  registerUserFailed,
  resetRegisterFlagChange,
  apiErrorChange,
  resetVerificationMailSent,
  resetVerificationOtpSent,
  clearVerificationOtpSent
} = registerSlice.actions;

export default registerSlice.reducer;
