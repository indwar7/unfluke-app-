import { createSlice } from "@reduxjs/toolkit";

// Helper function to get user data from AsyncStorage


// Initialize with empty user, we'll load from storage after
export const initialState = {
  user: null, // start with null (serializable!)
  error: "",
  loading: false,
  isUserLogout: false,
  errorMsg: false,
  loginSuccess: false,
  errorCount: 0, // Add this
};

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    apiError(state, action) {
      state.error = action.payload;
      state.loading = false;
      state.isUserLogout = false;
      state.errorMsg = true;
      state.errorCount = state.errorCount >= 100 ? 0 : state.errorCount + 1;
    },

    loginSuccess(state, action) {
      state.user = action.payload; // payload must be plain object/string
      state.loading = false;
      state.errorMsg = false;
      state.loginSuccess = true;
      state.isUserLogout = false;
    },
    logoutUserSuccess(state) {
      state.user = null; // ✅ clear user properly
      state.isUserLogout = true;
      state.loginSuccess = false;
    },
    reset_login_flag(state) {
      state.error = null;
      state.loading = false;
      state.errorMsg = false;
    },
    setUserFromStorage(state, action) {
      state.user = action.payload; // ✅ load from AsyncStorage here
    },
  },
});

export const {
  apiError,
  loginSuccess,
  logoutUserSuccess,
  reset_login_flag,
  setUserFromStorage,
  loginStart,
} = loginSlice.actions;

export default loginSlice.reducer;
