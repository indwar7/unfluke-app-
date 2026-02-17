import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    _id: "",
    name: "",
    description: "",
    publicChecked: false,
    owner: "",
    alerts: false,
    date: "",
    time: "",
    timeframe: "1-min",
    duplicate: true,
    starttime: "09:15",
    endtime: "15:15",
    segment: 0,
    segment1a: "Nifty 50",
    segment2a: ["X"],
    satisfy: true,
    expression: [],
    user: {},
    showLatestRes: true,
    categories: [],
}

const scannerSlice = createSlice({
    name: 'scannerDefault',
    initialState,
    reducers: {
        handleChange: (state, action) => {
            state[action.payload.name] = action.payload.value
        },
        handleSetState: (state, {payload}) => {
            console.log("setting edit scanner...", payload)
            return { ...state, ...payload };
        },
        resetState: (state) => {
            return {...initialState}
        }
    },
});

export const {
    handleChange,
    handleSetState,
    resetState
} = scannerSlice.actions;
  
  
export default scannerSlice.reducer;