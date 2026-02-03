import { setAdvBacktestLeader,setBasicBacktestLeader } from "./reducer";
import { getBacktestLeaders } from "../../../Unfluke_helpers/backend_helper";

export const LeaderBoard = (id)=>async(dispatch)=>{
    try {
        let orders = await getBacktestLeaders({
            id: id})
        dispatch(setBasicBacktestLeader(orders))
    } catch (error) {
        dispatch(setBasicBacktestLeader([]))
    }
}
