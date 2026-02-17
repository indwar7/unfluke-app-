import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
    instrumentNames: [],
    selectedSymbol:"NSE:NIFTY 50",
    loading:true,
    formData:{
        chartType:"Options Chart",
        selectedSymbol:"NSE:Nifty 50",
    },
    stradleForm:{  
        selectedSymbol:"NSE:Nifty 50",
        putLots:1,
        callLots:1,
        putStrike:"",
        callStrike:"",
        expiry:"",

    },
    optionsForm:{
        selectedSymbol:"NSE:Nifty 50",
        expiry:"",
        strike:"",
        ce_pe:"",
    }
}

const StrategyChartSlice = createSlice({
    name: "StrategyChart",
    initialState,
    reducers: {
        setInstrumentNames(state, action) {
            state.instrumentNames = action.payload;
        },
        setSelectedSymbol:(state,action)=>{
            state.selectedSymbol=action.payload
        },
        setLoading:(state,action)=>{
            state.loading=action.payload
        },
        setStradleForm:(state,action)=>{
            state.stradleForm = action.payload
        },
        setChartForm:(state,action)=>{
            state.formData = action.payload
        },
        setOptionForm:(state,action)=>{
            state.optionsForm = action.payload
        }

    }
})

export const {
    setInstrumentNames,
    setSelectedSymbol,
    setLoading,
    setStradleForm,
    setOptionForm,
    setChartForm
} = StrategyChartSlice.actions

export default StrategyChartSlice.reducer;