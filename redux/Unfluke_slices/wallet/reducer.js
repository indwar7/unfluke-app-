import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
    history: [],
    strategyEarnings:0,
    myEarnings:0,
}

const WalletSlice = createSlice({
    name: "Wallet",
    initialState,
    reducers: {
        setHistory(state, action) {
            state.history = action.payload;
        },
        setStrategyEarnings(state, action) {
            state.strategyEarnings = action.payload;
        },
        setMyEarnings(state, action) {
            state.myEarnings = action.payload;
        },
    }
})

export const {
    setHistory,
    setMyEarnings,
    setStrategyEarnings,
} = WalletSlice.actions

export default WalletSlice.reducer;