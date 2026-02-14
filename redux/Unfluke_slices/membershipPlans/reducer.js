import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
    tiers: [],

}

const MembershipPlansSlice = createSlice({
    name: "MembershipPlans",
    initialState,
    reducers: {
        setTiers(state, action) {
            state.tiers = action.payload;
        },
    }
})

export const {
    setTiers,
} = MembershipPlansSlice.actions

export default MembershipPlansSlice.reducer;