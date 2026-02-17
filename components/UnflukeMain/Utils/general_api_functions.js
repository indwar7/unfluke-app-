import { Config } from "../../../helpers/config";


const getEquityStocks = async (axios, type) => {
    const results = await axios.get(`${Config.BACKEND_URL}/api/getAllEquities`, {
        params: { scanner: type === "scanner" },
    })
   
    if (type === "scanner") {
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

const getIndexStocks = () => {
    return [
        "Nifty Spot",
        "Banknifty Spot",
        "Finnifty Spot",
        "Midcpnifty Spot"
    ];
}

const getFutureStocks = async (axios, type) => {
    const results = await axios.get(`${Config.BACKEND_URL}/api/getAllFutures`, {
        params: { scanner: type === "scanner" },
    })
   
    if (type === "scanner") {
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

const getOptionsStocks = async (axios, type) => {
    const results = await axios.get(`${Config.BACKEND_URL}/api/getAllOptions`, {
        params: { scanner: type === "scanner" },
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