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
    // Website parity: crypto's "Indices" segment offers BTC/ETH, not an
    // empty list (verified against the live bundle) — it's not literally an
    // index, but it's the closest crypto equivalent to "the benchmark pair".
    if (market === "crypto") return ["BTC", "ETH"];
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