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
            dispatch(setHistoricalWatchlist(data.watchlist))
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
