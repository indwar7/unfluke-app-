import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
    basicBacktestLeaders: [],
    advanceBacktestLeaders: [],

}

const LeaderboardSlice = createSlice({
    name: "Leaderboard",
    initialState,
    reducers: {
        setBasicBacktestLeader(state, action) {
            state.basicBacktestLeaders = action.payload;
        },
        setAdvBacktestLeader(state, action) {
            state.advanceBacktestLeaders = action.payload;
        },


    }
})

export const {
    setBasicBacktestLeader,
    setAdvBacktestLeader,

} = LeaderboardSlice.actions

export default LeaderboardSlice.reducer;