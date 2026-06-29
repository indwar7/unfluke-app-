import { Config } from "../../helpers/config";

export const addStrategy = async (axios, strategy, navigate, randomSocketID, ID, isBacktesting, subUrl) => {
    if(isBacktesting) return;

    try {
        // Spread strategy FIRST so any embedded user/userID from a public-strategy fetch
        // gets overwritten by the current user's ID below — otherwise an edited public
        // strategy saves under the original author's account.
        const body = {
            ...strategy,
            user: ID,
            userID: ID,
            randomSocketID: randomSocketID,
            market: subUrl,
        };

        const response = await axios.post(`${Config.BACKEND_URL}/api/strategy/basicbacktest`, body);

        if(response){
            return true;
        }

        return false;
    } catch(error) {
        console.log(error)
        return false;
        // return thunkAPI.rejectWithValue(error.response.data.message);
    }
}

export const getCsvUrl = async (axios, {fileName, fileName1, fileName2, ID, advancedBacktester}) => {
    try {
        const body = {
            filename: fileName,
            fileName1: fileName1,
            fileName2: fileName2,
            user: ID,
            advancedBacktester: advancedBacktester
        };

        const response = await axios.post(`${Config.BACKEND_URL}/api/strategy/getUrl`, body);

        // axios may or may not be interceptor-unwrapped; normalize to the data
        // payload so callers always read the real object, never the AxiosResponse.
        const csvlink = response?.data ?? response;
        return csvlink;
    } catch(error) {
        console.log(error)
    }
}

export const fetchStrategies = async (axios, {ID}) => {
    try {
        const response = await axios.get(`${Config.BACKEND_URL}/api/strategy/?i=${ID}`);
        const allStrategies = response
        return allStrategies
    } catch (error) {
        //return thunkAPI.rejectWithValue(error.response.data.message);
    }
}

export const fetchAdvancedStrategyDetails = async (axios, user, id) => {
    try {
        const body = {
            user: user,
            id: id
        };
        const res = await axios.post(`${Config.BACKEND_URL}/api/stocks/getStrategyDetails`, body)
        return res
    } catch (error) {
        //return thunkAPI.rejectWithValue(error.response.data.message);
    }    
}

export async function goToAdvancedStrategyPage(axios, navigate, user, id) {
    const stratDetails = await fetchAdvancedStrategyDetails(axios, user, id)

    console.log("stratDetails", stratDetails)

    if(stratDetails){
        navigate.navigate(`/advanced-backtester`, {
            state: stratDetails
        })
    }
}

export const fetchBasicStrategyDetails = async (axios, user, id) => {
    try {
        const res = await axios.get(`${Config.BACKEND_URL}/api/strategy/getStrategyDetails?id=${id}&user=${user}`)
        return res
    } catch (error) {
        //return thunkAPI.rejectWithValue(error.response.data.message);
    }    
}

export async function goToBasicStrategyPage(axios, navigate, user, id) {
    const stratDetails = await fetchBasicStrategyDetails(axios, user, id)

    console.log("stratDetails", stratDetails)

    if(stratDetails){
        navigate.navigate(`/basic-backtester-main`, {
            state: stratDetails
        })
    }
}

export const fetchDefaultStrategies = async (axios) => {
    try {
        const res = await axios.get(`${Config.BACKEND_URL}/api/strategy/getDefaultStrategies`)
        return res
    } catch (error) {
        //return thunkAPI.rejectWithValue(error.response.data.message);
    }    
}

export const fetchAdvancedDefaultStrategies = async (axios) => {
    const res = await axios.get(`${Config.BACKEND_URL}/api/stocks/getAdminStrategies`)

    if(res){
        return res
    }      
}

export const toggleStrategyVisibility = async (axios, fileName, isAdvance) => {
    try {
        const file=fileName
        const response = await axios.put(`${Config.BACKEND_URL}/api/strategy/?toggleVisibility=${file}&isAdvance=${isAdvance}`)
        return response;
    } catch (error) {

    }
}

export const toggleStrategyMonetize = async (axios, fileName, isAdvance) => {
    try {
        const file=fileName
        const response = await axios.put(`${Config.BACKEND_URL}/api/strategy/toggle/?monetize=${file}&isAdvance=${isAdvance}`)
        console.log(response)
    
        return response;
    } catch (error) {

    }
}

export const deleteStrategies =  async (axios, fileName) => {
    try {
        const file=fileName
        const response = await axios.delete(`${Config.BACKEND_URL}/api/strategy/?d=${file}`)
        console.log(response)

        return response;
    } catch (error) {

    }
}