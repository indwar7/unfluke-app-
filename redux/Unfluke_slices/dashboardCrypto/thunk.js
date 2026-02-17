import { createAsyncThunk } from "@reduxjs/toolkit";
//Include Both Helper File with needed methods
import {
  getBtcPortfolioData as getBtcPortfolioDataApi,
  getUsdPortfolioData as getUsdPortfolioDataApi,
  getEuroPortfolioData as getEuroPortfolioDataApi,
  getAllMarketData as getAllMarketDataApi,
  getYearMarketData as getYearMarketDataApi,
  getMonthMarketData as getMonthMarketDataApi,
  getWeekMarketData as getWeekMarketDataApi,
  getHourMarketData as getHourMarketDataApi,
  getSampleChartData as getSampleChartDataApi
} from "../../../Unfluke_helpers/backend_helper";

export const getPortfolioChartsData = createAsyncThunk("dashboardCrypto/getPortfolioChartsData", async (data) => {
  try {
    var response;
    if (data === "btc") {
      response = getBtcPortfolioDataApi(data);
    }
    if (data === "usd") {
      response = getUsdPortfolioDataApi(data);
    }
    if (data === "euro") {
      response = getEuroPortfolioDataApi(data);
    }
    return response;
  } catch (error) {
    return error;
  }
});

export const getMarketChartsData = createAsyncThunk("dashboardCrypto/getMarketChartsData", async (data) => {
  try {
    var response;

    if (data === "all") {
      response = getAllMarketDataApi(data);
    }
    if (data === "year") {
      response = getYearMarketDataApi(data);
    }
    if (data === "month") {
      response = getMonthMarketDataApi(data);
    }
    if (data === "week") {
      response = getWeekMarketDataApi(data);
    }
    if (data === "hour") {
      response = getHourMarketDataApi(data);
    }
    return response;
  } catch (error) {
    return error;
  }
});

export const getSampleChartData = createAsyncThunk("dashboardCrypto/getMarketChartsData",async (data)=>{
  try {
    let res = await getSampleChartDataApi(data)
    res = res.map(candle=>{
      return {"x":candle.a,"y":[candle.d,candle.c,candle.b,candle.e]}
    })
    return [{data:res.slice((res.length - 375),(res.length))}]
  } catch (error) {
    return [error];
  }

})