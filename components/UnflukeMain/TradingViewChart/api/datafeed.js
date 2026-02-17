
import historyProvider from "./historyProvider";
import {getHistoricalInstruments} from '../../../../Unfluke_helpers/backend_helper'

const supportedResolutions = [
  "1",
  "3",
  "5",
  "15",
  "30",
  "60",
  "120",
  "240",
  "1440",
  // "1D",
];

const config = {
  supported_resolutions: supportedResolutions,
};

export default {
  onReady: async (cb) => {
    console.log("=====onReady running");
    setTimeout(() => cb(config), 0);
  },
  searchSymbols: async (
    userInput,
    exchange,
    symbolType,
    onResultReadyCallback
  ) => {
    console.log("====Search Symbols running");

  },
  resolveSymbol: async (
    symbolName,
    onSymbolResolvedCallback
    // onResolveErrorCallback
  ) => {

    const data = await getHistoricalInstruments( {
      params: {
        instrument: symbolName,
      },
    });

    const item = data
    let name, ticker, type, exchange;

    if (item.Error) return alert("No Data Found")

    console.log("<<<<<<<<<-------SYMBOL NAME------>>>>>>>>>>>>>", symbolName, item)
    if (item.type === "EQ") {
      name = item.equity
      type = "equity"
      exchange = "NSE"
      ticker = item.equity
    } else if (item.type === "IN") {
      name = item.index
      type = "index"
      exchange = "NSE"
      ticker = item.index
    } else if (item.type === "OPT") {
      name = item.option
      type = "option"
      exchange = "NFO"
      ticker = item.option
    } else {
      name = item.future
      type = "future"
      exchange = "NFO"
      ticker = item.future
    }

    var symbol_stub = {
      name: name.split(":")[1],
      description: ticker,
      type: type,
      session: "0915-1530",
      timezone: "Asia/Kolkata",
      instrument_token: item.instrument_token,
      ticker: ticker,
      exchange: exchange,
      minmov: 1,
      pricescale: 100,
      has_intraday: true,
      has_daily: false,
      intraday_multipliers: ['1', '60'],
      has_no_volume: true,
      supported_resolution: supportedResolutions,
      data_status: "endofday",
    };

    setTimeout(function () {
      onSymbolResolvedCallback(symbol_stub);
    }, 0);

    // onResolveErrorCallback('Not feeling it today')
  },
  getBars: function (
    symbolInfo,
    resolution,
    periodParams,
    onHistoryCallback,
    onErrorCallback
  ) {
    console.log("=====getBars running", resolution);
    let { from, to, firstDataRequest } = periodParams;

    let currentDate = window.sessionStorage.getItem("currentDate");
    let currDate = Math.floor(new Date(currentDate)) / 1000
    let someMonthsPrevDate = currDate - 8919000

    if (symbolInfo.type == "option") {

      if (!(from <= someMonthsPrevDate || to <= someMonthsPrevDate)) {

        historyProvider
          .getBars(symbolInfo, resolution, firstDataRequest, periodParams)
          .then((bars) => {
            if (bars.length < 1) {
              onHistoryCallback([], { noData: true });
            } else {
              onHistoryCallback(bars, { noData: false });
            }
          })
          .catch((err) => {
            onErrorCallback(err);
          });
      } else {
        onHistoryCallback([], { noData: true });
      }
    } else {

      if (!(from <= 1220085397 || to <= 1220085397)) {

        historyProvider
          .getBars(symbolInfo, resolution, firstDataRequest, periodParams)
          .then((bars) => {
            if (bars.length < 1) {
              onHistoryCallback([], { noData: true });
            } else {
              onHistoryCallback(bars, { noData: false });
            }
          })
          .catch((err) => {
            onErrorCallback(err);
          });
      } else {
        console.log("running else")
        onHistoryCallback([], { noData: true });
      }
    }
  },
  subscribeBars: (
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscribeUID,
    onResetCacheNeededCallback
  ) => {
    // console.log('=====subscribeBars runnning')
    onResetCacheNeededCallback();
    // stream.subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback)
  },
  unsubscribeBars: (subscriberUID) => {
    // console.log('=====unsubscribeBars running')
    // stream.unsubscribeBars(subscriberUID)
  },
  calculateHistoryDepth: (resolution, resolutionBack, intervalBack) => {
    //optional
    // console.log('=====calculateHistoryDepth running',intervalBack)
    // while optional, this makes sure we request 24 hours of minute data at a time
    // CryptoCompare's minute data endpoint will throw an error if we request data beyond 7 days in the past, and return no data
    // return resolution < 60 ? { resolutionBack: 'D', intervalBack: '1' } : { resolutionBack: 'D', intervalBack: '360' }
  },
  getMarks: (symbolInfo, startDate, endDate, onDataCallback, resolution) => {
    //optional
    console.log('=====getMarks running')
  },
  getTimeScaleMarks: (
    symbolInfo,
    startDate,
    endDate,
    onDataCallback,
    resolution
  ) => {
    //optional
    console.log('=====getTimeScaleMarks running')
  },
  getServerTime: (cb) => {
    console.log('=====getServerTime running')
  },
};
