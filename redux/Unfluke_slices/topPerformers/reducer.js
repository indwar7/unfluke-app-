import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
    performers: [],

}

const TopPerformerSlice = createSlice({
    name: "TopPerformers",
    initialState,
    reducers: {
        setTopPerformers(state, action) {
            state.performers = action.payload;
        },
       
    }
})

export const {
    setTopPerformers
} = TopPerformerSlice.actions

export default TopPerformerSlice.reducer;