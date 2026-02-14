
import { fetchStrategyChartData } from "../../../../Unfluke_helpers/backend_helper"
import store from "../../../../redux/store";

// Optimized global state variables
let fullName = "";
let bars = [];
let prevName = ""

let prevResolution = '1';

const history = {};

function formatDateToCustomFormat(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


let url = `/api/historicData/data/liveChart`;

async function getBars(symbolInfo, resolution, first) {
  const auth = store.getState().Login;
  console.log("Fetching bars for:", fullName, prevName, fullName==prevName,symbolInfo, auth.user._id);

  const id = auth.user._id
//   if (fullName === symbolInfo.full_name ) {
//     return bars;
//   }
  fullName = symbolInfo.full_name;

  let data = { data: [] };

  if (symbolInfo.type === "index") {
    data = await fetchStrategyChartData(
      url,
      {
        i: id,
        e: "256265",
        currentDateTime: formatDateToCustomFormat(new Date()),
        type: symbolInfo.type,
        name: symbolInfo.name,
        resolution,
        nxt: prevName === fullName && prevResolution === resolution && !first,
      }
    );

    // if (prevName == fullName) {
    //   const data2 = data.map((el) => {
    //     var date = new Date(el.a).getTime();
    //     return {
    //       time: date,
    //       low: Number(el.b),
    //       high: Number(el.c),
    //       open: Number(el.d),
    //       close: Number(el.e),
    //       volume: Number(el.f),
    //     };
    //   });
    //   return (data2.concat(bars))
    // }
    prevName = fullName
    prevResolution = resolution
  }

  if (data.Error || data.length === 0) {
    // alert("No Data Found!");
    return [];
  }

  bars = data.map((el) => ({
    time: new Date(el.a).getTime(),
    low: Number(el.b),
    high: Number(el.c),
    open: Number(el.d),
    close: Number(el.e),
    volume: Number(el.f),
  }));

  console.log(bars);
  if (first && bars.length) {
    history[symbolInfo.full_name] = bars[bars.length - 1];
  }

  return bars;
}

export default {
  history,
  getBars,
};
