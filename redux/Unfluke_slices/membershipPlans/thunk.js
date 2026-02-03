import { setTiers } from "./reducer";
import { getMembershipPlans } from "../../../Unfluke_helpers/backend_helper";

export const MembershipPlansList = (id)=>async(dispatch)=>{
    try {
        let tiers = await getMembershipPlans()
        dispatch(setTiers(tiers))
    } catch (error) {
        dispatch(setTiers([]))
    }
}
