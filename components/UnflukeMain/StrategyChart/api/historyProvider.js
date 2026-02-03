
import { fetchStrategyChartData } from "../../../../Unfluke_helpers/backend_helper"
import store from "../../../../redux/store";
import { StrategyChartLoading } from "../../../../Unfluke_slices/thunks";

// Optimized global state variables
let fullName = "";
let bars = [];
let prevLots = "1,1";
let prevName = ""

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

function getChartTypeLots(chartType,strategyChartForm) {
  switch (chartType) {
    case "Straddle Chart":
      return `${strategyChartForm.formData.putLots},${strategyChartForm.formData.callLots}`;
    case "Spread Chart":
      return `${strategyChartForm.formData.shortLots},${strategyChartForm.formData.longLots}`;
    case "Butterfly Chart":
      return `${strategyChartForm.formData.lotOne},${strategyChartForm.formData.lotTwo},${strategyChartForm.formData.lotThree}`;
    case "Iron Fly Chart":
      return `${strategyChartForm.formData.callLotOne},${strategyChartForm.formData.callLotTwo},${strategyChartForm.formData.putLotOne},${strategyChartForm.formData.putLotTwo}`;
    case "Double Calendar Chart":
      return `${strategyChartForm.formData.longCallLot},${strategyChartForm.formData.shortCallLot},${strategyChartForm.formData.longPutLot},${strategyChartForm.formData.shortPutLot}`;
    default:
      return "0";
  }
}

async function fetchChartData(symbolInfo, id, resolution, chartType, strategyChartForm) {
  const commonParams = {
    i: id,
    name: chartType == "Options Chart" ? strategyChartForm.formData.selectedSymbol : strategyChartForm.formData.selectedSymbol.join(),
    resolution,
    nxt: false,
  };


  let url = `/api/historicData/data/`;
  let specificParams = {};

  switch (chartType) {
    case "Options Chart":
      specificParams = { ...commonParams, type: symbolInfo.type, name: symbolInfo.name };
      url += "historicalChartMinute";
      break;
    case "Straddle Chart":
    case "Spread Chart":
      const [putLots, callLots] = getChartTypeLots(chartType,strategyChartForm).split(",");
      specificParams = { ...commonParams, putLots, callLots };
      url += "stradleChartMinute";
      console.log("commonParams",specificParams,url);
      break;
    case "Butterfly Chart":
    case "Iron Fly Chart":
    case "Double Calendar Chart":
      const [l1, l2, l3, l4] = getChartTypeLots(chartType,strategyChartForm).split(",");
      specificParams = { ...commonParams, l1, l2, l3, l4 };
      url += chartType === "Butterfly Chart" ? "butterFlyChartMinute" : chartType === "Iron Fly Chart" ? "ironFlyChartMinute" : "dCalChartMinute";
      break;
    case "Straddle Combo Chart":
      specificParams = { ...commonParams };
      url += "comboChartMinute";
      break;
    default:
      return { Error: true, data: [] };
  }

  return fetchStrategyChartData(url, specificParams);
}

async function getBars(symbolInfo, resolution, first) {
  const auth = store.getState().Login;
  const strategyChartForm = store.getState().StrategyCharts;
  store.dispatch(StrategyChartLoading(true))
  console.log("Fetching bars for:", symbolInfo, auth.user._id, strategyChartForm);

  const id = auth.user._id
  const chartType = strategyChartForm.formData.chartType;
  const lots = getChartTypeLots(chartType,strategyChartForm);
  if ((fullName === symbolInfo.full_name || fullName === strategyChartForm.formData.selectedSymbol) && lots === prevLots) {
    store.dispatch(StrategyChartLoading(false))
    return bars;
  }
  fullName = symbolInfo.full_name;

  prevLots = lots;

  let data = { data: [] };

  if (symbolInfo.full_name === "NSE:NIFTY 50" && symbolInfo.type === "index") {
    console.log("      L   O   T   S  =========>   ", id)
    data = await fetchStrategyChartData(
      `api/historicData/data/historicalChartIndexMinute`,
      {
        i: id,
        e: symbolInfo.instrument_token,
        currentDateTime: formatDateToCustomFormat(new Date()),
        type: symbolInfo.type,
        name: symbolInfo.name,
        resolution,
        nxt: prevName === fullName,
      }
    );
    if (prevName == symbolInfo.full_name) {
      const data2 = data.map((el) => {
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
      store.dispatch(StrategyChartLoading(false))
      return (data2.concat(bars))
    }
    prevName = fullName
  } else if (symbolInfo.type === "option") {
    console.log("H  E  L  L  O");
    data = await fetchChartData(symbolInfo, id, resolution, chartType, strategyChartForm);
  }

  if (data.Error || data.length === 0) {
    alert("No Data Found!");
    store.dispatch(StrategyChartLoading(false))
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

  if (chartType !== "Options Chart") {
    const multiSymbol = strategyChartForm.formData.selectedSymbol.join()
    symbolInfo.description = multiSymbol;
  }
  store.dispatch(StrategyChartLoading(false))
  return bars;
}

export default {
  history,
  getBars,
};
