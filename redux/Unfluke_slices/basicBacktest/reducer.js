import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
    savedStrategies: [],
    purchasedStrategies: [],
    strategyCount:[],
}

const BasicBacktestDashSlice = createSlice({
    name: "BasicBacktest",
    initialState,
    reducers: {
        setSavedStrategies(state, action) {
            state.savedStrategies = action.payload;
        },
        setStrategiesCount(state, action) {
            state.strategyCount = action.payload;
        },
        setPurchasedStrategies(state, action) {
            state.purchasedStrategies = action.payload;
        },
    
    }
})

export const {
 setPurchasedStrategies,
 setSavedStrategies,
 setStrategiesCount
} = BasicBacktestDashSlice.actions

export default BasicBacktestDashSlice.reducer;