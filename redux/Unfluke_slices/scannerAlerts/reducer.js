import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
    userScannerList: [],
    userAlertList: [],
    adminScannerList: [],
}

const ScannerAlertSlice = createSlice({
    name: "Scanner",
    initialState,
    reducers: {
        setUserScannerList(state, action) {
            state.userScannerList = action.payload;
        },
        setUserAlertList(state, action) {
            state.userAlertList = action.payload;
        },
        addUserScannerList(state, action) {
            state.userScannerList.push(action.payload);
        },
        addUserAlertList(state, action) {
            state.userAlertList.push(action.payload);
        },
        deleteUserScannerList(state, action) {
            state.userScannerList = state.userScannerList.filter(item => item._id !== action.payload._id);
        },
        deleteUserAlertList(state, action) {
            state.userAlertList = state.userAlertList.filter(item => item._id !== action.payload._id);
        },
        setadminScannerList(state, action) {
            state.adminScannerList = action.payload;
        },
    }
})

export const {
    setUserScannerList,
    setadminScannerList,
    setUserAlertList,
    addUserScannerList,
    addUserAlertList,
    deleteUserAlertList,
    deleteUserScannerList
} = ScannerAlertSlice.actions

export default ScannerAlertSlice.reducer;