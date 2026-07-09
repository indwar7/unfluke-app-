import {
    setHistoricalHoldings,
    setHistoricalOrders,
    setHistoricalPositions,
    setHistoricalTrades,
    setHistoricalDateTime,
    setHistoricalWatchlist,
    setHistoricalSelectedSymbol,
} from "./reducer";
import {
    getHistoricalHoldings,
    getHistoricalOrders,
    getHistoricalPositions,
    getHistoricalWatchlist,
    postHistoricalWatchlist,
    updateHistoricalWatchlist,
    deleteHistoricalWatchlist
} from "../../../Unfluke_helpers/backend_helper";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserHistoricalOrders = (id) => async (dispatch) => {
    try {
        let orders = await getHistoricalOrders({
            userID: id
        })
        dispatch(setHistoricalOrders(orders))
    } catch (error) {
        dispatch(setHistoricalOrders([]))
    }
}

export const UserHistoricalPositions = (id, time) => async (dispatch) => {
    try {
        let positions = await getHistoricalPositions({
            userId: id,
            currentTime: time,
        })
        dispatch(setHistoricalPositions(positions))
    } catch (error) {
        dispatch(setHistoricalPositions([]))
    }
}


export const UserHistoricalHoldings = (id, time) => async (dispatch) => {
    try {
        let holdings = await getHistoricalHoldings({
            userId: id,
            currentTime: time,
        })
        dispatch(setHistoricalHoldings(holdings))
    } catch (error) {
        dispatch(setHistoricalHoldings([]))
    }
}

export const UserHistoricalWatchlist = (id, time) => async (dispatch) => {
    try {
        if(id){
            let data =  await getHistoricalWatchlist({
                userID: id,
                
            })
           
            dispatch(setHistoricalDateTime(new Date(data.currentTime).toISOString()))
            // Website parity: crypto rows come back in a SEPARATE
            // cryptoWatchlist array; the NSE view filters CRYPTO rows out.
            const mkt = (await AsyncStorage.getItem("mkt")) || "in";
            const list = mkt === "crypto"
                ? data.cryptoWatchlist || []
                : (data.watchlist || []).filter((item) => item.exch !== "CRYPTO");
            dispatch(setHistoricalWatchlist(list))
        }

    } catch (error) {
        dispatch(setHistoricalDateTime(""))
        dispatch(setHistoricalWatchlist([]))
    }
}

export const UserHistoricalDateTime = (datetime) => async (dispatch) => {
    try {
        dispatch(setHistoricalDateTime(datetime.toISOString()))
    } catch (error) {
        dispatch(setHistoricalDateTime(""))
    }
}

export const UserHistoricalSelectedSymbol = (symbol) => async (dispatch) => {
    try {
        dispatch(setHistoricalSelectedSymbol(symbol))
    } catch (error) {
        dispatch(setHistoricalSelectedSymbol(""))
    }
}
