
import { getHistoricalChartData } from "../../../../Unfluke_helpers/backend_helper"
import store from "../../../../redux/store";

const user = store.getState().Login;
console.log("Redux Login State:", user);

const history = {};
let data;
let fullName;
var bars;
let data2;
let timeframe = '1';
let prevDateTime;

let description = "NSE";

const reformatDate = (dateString) => {
  const [datePart, timePart] = dateString.split(', ');
  const [day, month, year] = datePart.split('/');
  return `${year}-${month}-${day} ${timePart}`;
};

export default {
  history: history,
  getBars: async function (symbolInfo, resolution, first, periodParams) {
    console.log("counterBaCK>>", symbolInfo)
    const auth = store.getState().Login;
    const historical = store.getState().Historical;
    console.log("symbolInfo", symbolInfo)
    var date = fullName !== symbolInfo.full_name || prevDateTime === currentDateTime ? new Date() : new Date(historical.historicalDateTime)
    const options = {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };


    var currentDateTime = reformatDate(new Intl.DateTimeFormat('en-GB', options).format(date))
    if (timeframe != resolution || description != symbolInfo.description || prevDateTime != currentDateTime) {
      timeframe = resolution;
      description = symbolInfo.description
      data = false;
      fullName = undefined;
      data2 = undefined;
      prevDateTime = currentDateTime
    }

    const qs = {
      i: auth.user._id,
      e: symbolInfo.instrument_token,
      currentDateTime,
      type: symbolInfo.type,
      name: symbolInfo.name,
      resolution,
      nxt: false,
    };

    if (!(data && (fullName === symbolInfo.full_name))) {
      fullName = symbolInfo.full_name;
      data = await getHistoricalChartData(qs);
    } else {
      if (symbolInfo.type !== "option") {
        data2 = await getHistoricalChartData(
          {
            i: auth.user._id,
            e: symbolInfo.instrument_token,
            currentDateTime,
            type: symbolInfo.type,
            name: symbolInfo.name,
            resolution,
            nxt: true,
          })

        data = data2.concat(data)
        if (data2.length < 1) {
          return bars
        }
      }
      else {
        return bars
      }
    }

    if (data.Response && data.Response === "Error") {
      return [];
    }
    if (data.length !== 0) {
      bars = data.map((el) => {
        var date = new Date(el.a).getTime();
        return {
          time: date,
          low: Number(el.b),
          high: Number(el.c),
          open: Number(el.d),
          close: Number(el.e),
          volume: Number(el.f),
        };
      });
      if (first) {
        var lastBar = bars[bars.length - 1];
        history[symbolInfo.full_name] = lastBar;
      }
      return bars;
    } else {
      return [];
    }
  },
};
