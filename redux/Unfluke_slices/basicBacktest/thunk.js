import { setPurchasedStrategies,setSavedStrategies,setStrategiesCount } from "./reducer";
import { getSavedBasicBacktest, getPurchasedBasicBacktest,getSavedBasicBacktestCount } from "../../../Unfluke_helpers/backend_helper";

export const UserSavedStrategies = (id)=>async(dispatch)=>{
    try {
        let orders = await getSavedBasicBacktest({
            i: id})
        dispatch(setSavedStrategies(orders))
    } catch (error) {
        dispatch(setSavedStrategies([]))
    }
}

export const UserSavedStrategiesCount = (id)=>async(dispatch)=>{
    try {
        let orders = await getSavedBasicBacktestCount({
            i: id})
        dispatch(setStrategiesCount(orders))
    } catch (error) {
        dispatch(setStrategiesCount([]))
    }
}

export const UserPurchasedStrategies = (id)=>async(dispatch)=>{
    try {
        let positions = await getPurchasedBasicBacktest({
            i: id,
        })
        dispatch(setPurchasedStrategies(positions))
    } catch (error) {
        dispatch(setPurchasedStrategies([]))
    }
}

