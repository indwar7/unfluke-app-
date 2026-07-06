import { setChartForm, setInstrumentNames, setLoading,setOptionForm,setSelectedSymbol,setStradleForm } from "./reducer";
import { getInstrumentNames } from "../../../Unfluke_helpers/backend_helper";

// `market` ("in" | "crypto") comes from Layout.appType. In crypto mode the
// dropdown must list crypto pairs, not NSE option names.
export const StrategyChartInstruments = (market)=>async(dispatch)=>{
    try {
        let list = await getInstrumentNames(market)
        dispatch(setInstrumentNames(list))
    } catch (error) {
        dispatch(setInstrumentNames([]))
    }
}

export const StrategyChartSelectedSymbol = (payload)=>async(dispatch)=>{
    try {
        dispatch(setSelectedSymbol(payload))
    } catch (error) {
        dispatch(setSelectedSymbol(""))
    }
}

export const StrategyChartLoading = (payload)=>async(dispatch)=>{
    try {
        dispatch(setLoading(payload))
    } catch (error) {
        dispatch(setLoading(error))
    }
}

export const StrategyChartOptionForm = (payload)=>async(dispatch)=>{
    try {
        dispatch(setOptionForm(payload))
    } catch (error) {
        dispatch(setOptionForm(error))
    }
}

export const StrategyChartStradleForm = (payload)=>async(dispatch)=>{
    try {
        dispatch(setStradleForm(payload))
    } catch (error) {
        dispatch(setStradleForm(error))
    }
}

export const StrategyChartForm = (payload)=>async(dispatch)=>{
    try {
        dispatch(setChartForm(payload))
    } catch (error) {
        dispatch(setChartForm(error))
    }
}