import { Config } from "../../../helpers/config";


// `market` ("in" | "crypto") is sent as a query param exactly like the
// website (getAllEquities/getAllFutures ?scanner=&market=). In crypto mode the
// backend returns crypto pairs, and we drop the hardcoded NSE index prefixes.
const getEquityStocks = async (axios, type, market = "in") => {
    const results = await axios.get(`${Config.BACKEND_URL}/api/getAllEquities`, {
        params: { scanner: type === "scanner", market },
    })

    if (type === "scanner" && market !== "crypto") {
        return [
            "Nifty 50",
            "Nifty 100",
            "Nifty 200",
            ...results,
        ]
    } else {
        return [...results];
    }
}

const getIndexStocks = (market = "in") => {
    // Crypto has no index-spot equivalents; keep the picker empty there so a
    // crypto scanner never offers "Nifty Spot".
    if (market === "crypto") return [];
    return [
        "Nifty Spot",
        "Banknifty Spot",
        "Finnifty Spot",
        "Midcpnifty Spot"
    ];
}

const getFutureStocks = async (axios, type, market = "in") => {
    const results = await axios.get(`${Config.BACKEND_URL}/api/getAllFutures`, {
        params: { scanner: type === "scanner", market },
    })

    if (type === "scanner" && market !== "crypto") {
        return [
            "Nifty 50",
            "Nifty 100",
            "Nifty 200",
            ...results,
        ]
    } else {
        return [...results];
    }
}

const getOptionsStocks = async (axios, type, market = "in") => {
    const results = await axios.get(`${Config.BACKEND_URL}/api/getAllOptions`, {
        params: { scanner: type === "scanner", market },
    })

    return [
        ...results,
    ]
}

export {
    getEquityStocks,
    getIndexStocks,
    getFutureStocks,
    getOptionsStocks    
}