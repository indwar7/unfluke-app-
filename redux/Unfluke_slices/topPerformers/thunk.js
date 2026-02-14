import { setTopPerformers } from "./reducer";
import { getTopPerformers } from "../../../Unfluke_helpers/backend_helper";

export const TopPerformersList = ()=>async(dispatch)=>{
    try {
        const topPerformersList = await getTopPerformers()
        dispatch(setTopPerformers(topPerformersList))
    } catch (error) {
        dispatch(setTopPerformers([]))
    }
}