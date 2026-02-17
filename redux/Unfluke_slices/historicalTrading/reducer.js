import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
    historicalDateTime: "",
    selectedSymbol: "NSE:NIFTY",
    historicalWatchlist: [],
    historicalTrades: [],
    historicalOrders: [],
    historicalPosition: [],
    historicalHoldings: [],
}

const HistoricalTradingSlice = createSlice({
    name: "Historical",
    initialState,
    reducers: {
        setHistoricalTrades(state, action) {
            state.historicalTrades = action.payload;
        },
        setHistoricalOrders(state, action) {
            state.historicalOrders = action.payload;
        },
        setHistoricalHoldings(state, action) {
            state.historicalHoldings = action.payload;
        },
        setHistoricalPositions(state, action) {
            state.historicalPosition = action.payload;
        },
        setHistoricalWatchlist(state, action) {
            state.historicalWatchlist = action.payload;
        },
        setHistoricalDateTime(state, action) {
            state.historicalDateTime = action.payload;
        },
        setHistoricalSelectedSymbol(state, action) {
            state.selectedSymbol = action.payload;
        },

    }
})

export const {
    setHistoricalHoldings,
    setHistoricalPositions,
    setHistoricalOrders,
    setHistoricalTrades,
    setHistoricalDateTime,
    setHistoricalWatchlist,
    setHistoricalSelectedSymbol
} = HistoricalTradingSlice.actions

export default HistoricalTradingSlice.reducer;