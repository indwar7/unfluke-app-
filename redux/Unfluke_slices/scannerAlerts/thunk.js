import { setUserAlertList, setUserScannerList, setadminScannerList } from "./reducer";
import { postScannerAlertList,getAdminScannerList } from "../../../Unfluke_helpers/backend_helper";

export const UserScannerList = (id)=>async(dispatch)=>{
    try {
        let userScannerList = await postScannerAlertList({
            alerts: false,
            id: id})
        dispatch(setUserScannerList(userScannerList))
    } catch (error) {
        dispatch(setUserScannerList(error))
    }
}

export const UserAlertList = (id)=>async(dispatch)=>{
    try {
        let userAlertList = await postScannerAlertList({
            alerts: true,
            id: id})
        dispatch(setUserAlertList(userAlertList))
    } catch (error) {
        dispatch(setUserScannerList(error))
    }
}


export const AdminScannerList = (id)=>async(dispatch)=>{
    try {
        let adminScannerList = await getAdminScannerList()
        dispatch(setadminScannerList(adminScannerList))
    } catch (error) {
        dispatch(setadminScannerList(error))
    }
}