//BASIC BACKTESTER

import { weekdays } from "moment/moment";
import { range } from "../BasicBacktester/StrategyLegs/utils";

const legSLUnitTypes = [
  {
    value: "SL: %",
    string: "SL: %",
  },
  {
    value: "SL: pt",
    string: "SL: pt",
  },
  {
    value: "Underlying: pt",
    string: "Underlying pts",
  },
  {
    value: "Underlying: %",
    string: "Underlying %",
  },
];

const legTPUnitTypes = [
  {
    value: "TP: %",
    string: "TP: %",
  },
  {
    value: "TP: pt",
    string: "TP: pt",
  },
  {
    value: "Underlying: pt",
    string: "Underlying pts",
  },
  {
    value: "Underlying: %",
    string: "Underlying %",
  },
];

const TSLUnitTypes = [
  { value: "TS: %", string: "TS: %" },
  { value: "TS: pt", string: "TS: pt" },
];

const legWaitTimeTypes = [
  {
    value: "pts_underlying_up",
    string: "Underlying pts &uarr;",
  },
  {
    value: "pts_underlying_down",
    string: "Underlying pts &darr;",
  },
  {
    value: "%_underlying_up",
    string: "Underlying % &uarr;",
  },
  {
    value: "%_underlying_down",
    string: "Underlying % &darr;",
  },
  {
    value: "pts_up",
    string: "Pts &uarr;",
  },
  {
    value: "pts_down",
    string: "Pts &darr;",
  },
  {
    value: "%_up",
    string: "% &uarr;",
  },
  {
    value: "%_down",
    string: "% &darr;",
  },
  {
    value: "immediate",
    string: "Immediate",
  },
];

const legReentryTypes = [
  {
    value: "asap",
    string: "ASAP",
  },
  {
    value: "asap_reverse",
    string: "ASAP &#8617;",
  },
  {
    value: "cost",
    string: "Cost",
  },
  {
    value: "cost_reverse",
    string: "Cost &#8617;",
  },
];

const advBacktestLegs = [...Array.from({ length: 10 }, (_, i) => i + 1)];

const reEntriesGlobal = [...Array.from({ length: 10 }, (_, i) => i)];

const initialLegPositions = {
  instrument: { option: "NIFTY", multiple: 50 },
  segment: "options",
  options: "CE",
  buysell: "buy",
  strike: "based_on_atm",
  strikeDetails: "ATM_0",
  quantity: 1,
  tradeType: "MIS",
  target: {
    type: "TP: pt",
    value: 0,
  },
  stopLoss: {
    type: "SL: pt",
    value: 0,
  },
  trailingStopLoss: {
    type: "TS: pt",
    value: {
      x: 0,
      y: 0,
    },
  },
  waitTime: {
    type: "immediate",
    value: 0,
  },
  legOptions: {
    waitAndTrade: false,
    moveSlToCost: false,
  },
  reEntryCondition: {
    target: false,
    targetType: "asap",
    targetReentries: 0,
    sl: false,
    slType: "asap",
    slReentries: 0,
  },
};

const backtesterTooltipTexts = {
  instrument: "Select the instrument for this leg.",
  strike: "Choose the strike type for this leg.",
  strikeDetails: "Specify the strike details based on the selected type.",
  quantity: "Enter the quantity for this leg.",
  options: "Select the option type (CE/PE) for this leg.",
  buysell: "Choose whether to buy or sell this leg.",
  target: "Set the target for this leg.",
  stopLoss: "Define the stop loss for this leg.",
  trailingStopLoss: "Set the trailing stop loss for this leg.",
  waitTime: "Specify the wait time for this leg.",
  reEntryCondition: "Configure re-entry conditions for this leg.",
  reEntryConditionSl: "Enable re-entry on stop loss exit.",
  reEntryConditionTarget: "Enable re-entry on target exit.",
  reEntryConditionSlReentries: "Set the number of re-entries on stop loss.",
  reEntryConditionTargetReentries: "Set the number of re-entries on target.",
  segment: "Select the segment for this leg.",
  squareOff: "Choose the square-off strategy for this leg.",
  waitAndTrade: "Enable wait and trade option for this leg.",
  moveSlToCost: "Enable moving stop loss to cost for this leg.",
  noReEntryAfter: "Set the time after which no re-entry is allowed.",
  underlying: "Select the underlying asset for the strategy.",
  weekdays: "Choose the weekdays for trading.",
  mtmTarget: "Set the MTM target in rupees.",
  mtmStopLoss: "Set the MTM stop loss in rupees.",
  mtmTrailingSL: "Set the MTM trailing stop loss in rupees.",
}

//SCANNER

const niftys = ["NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY"];

const niftysWithWeeklyExpiry = ["NIFTY", "FINNIFTY", "MIDCPNIFTY"];

const indicators = [
  {
    indicatorName: "SMA",
  },
  {
    indicatorName: "EMA",
  },
  {
    indicatorName: "WMA",
  },
  {
    indicatorName: "VWAP",
  },
  {
    indicatorName: "BBANDS UPPERBAND",
  },
  {
    indicatorName: "BBANDS LOWERBAND",
  },
  {
    indicatorName: "BOP",
  },
  {
    indicatorName: "RSI",
  },
];

const segments = [
  { value: 0, name: "Equity" },
  { value: 1, name: "Indices" },
  { value: 2, name: "Options" },
  { value: 3, name: "Futures" },
];

const advancedExecutions = [
  {
    name: "Underlying",
    value: "underlying",
  },
  {
    name: "Options",
    value: "options",
  },
];

const strikeOptions = [
  ...range(1, 5, 1)
    .map((item) => {
      return { name: `ITM (-${item} Strike}`, value: `ITM_${item}` };
    })
    .reverse(),
  { name: "ATM (+0 Strike)", value: "ATM_0" },
  ...range(1, 25, 1).map((item) => {
    return { name: `OTM (+${item} Strike)`, value: `OTM_${item}` };
  }),
];
const segment1aList = ["RELIANCE", "NIFTY"];

const equitySegment2a = ["X"];

const futureSegment2a = ["1 (Current)"];

const indexSegment2a = ["X"];

const scannerGlobalTimeframes = [
  "1-min",
  "2-min",
  "3-min",
  "5-min",
  "10-min",
  "15-min",
];

const conditionalOperators = [">", "<", ">=", "<="];

const mathOperators = ["+", "-", "/", "*"];
function createAdvancedOptionExecutionLeg(legIndex) {
  return {
    legIndex: legIndex,
    strikeType: "based_on_atm",
    strikeAtm: "ATM_0",
    strikePremium: 0,
    strikeValue: "ATM_0",
    direction: "CE",
    buysell: "Buy",
    target: 0,
    targetUnit: "pt",
    sl: 0,
    slUnit: "pt",
    trailingUnit: "pt",
    trailing: {
      x: 0,
      y: 0
    }
  }
}
const advOperators = ["cfab", "cfba"];

const advOperatorTitles = [
  "cross from above to below",
  "cross from below to above",
];

const binaryOperators = ["or", "and"];

const fundaBinaryOperators = ["and"];

const ohlc = ["Open", "High", "Low", "Close"];

const numericalOperands = [
  {
    indicatorName: "number",
    value: 0,
  },
];

const numericalOperandsFunda = [
  {
    indicatorName: "number",
    value: 0,
  },
  {
    indicatorName: "ltp",
    source: "Close",
  },
];

const brackets = ["(", ")"];

const indicatorTimeframes = [
  {
    value: "1-min",
    label: "1 min",
  },
  {
    value: "2-min",
    label: "2 min",
  },
  {
    value: "3-min",
    label: "3 min",
  },
  {
    value: "4-min",
    label: "4 min",
  },
  {
    value: "5-min",
    label: "5 min",
  },
  {
    value: "10-min",
    label: "10 min",
  },
  {
    value: "15-min",
    label: "15 min",
  },
  {
    value: "30-min",
    label: "30 min",
  },
  {
    value: "45-min",
    label: "45 min",
  },
  {
    value: "60-min",
    label: "60 min",
  },
  {
    value: "75-min",
    label: "75 min",
  },
  {
    value: "90-min",
    label: "90 min",
  },
  {
    value: "daily",
    label: "Daily",
  },
  {
    value: "weekly",
    label: "Weekly",
  },
  {
    value: "monthly",
    label: "Monthly",
  },
  {
    value: "quarterly",
    label: "Quarterly",
  },
];

const offset1s = [
  {
    value: "latest-candle",
    label: "Latest Candle",
  },
  {
    value: "1-candle",
    label: "1 candle ago",
  },
  {
    value: "2-candle",
    label: "2 candle/s ago",
  },
  {
    value: "3-candle",
    label: "3 candle/s ago",
  },
  {
    value: "4-candle",
    label: "4 candle/s ago",
  },
  {
    value: "5-candle",
    label: "5 candle/s ago",
  },
];

const offset2s = {
  todays: [
    {
      value: "all-candles",
      label: "All candles",
    },
    {
      value: "1-candle",
      label: "Todays 1st Candle",
    },
    {
      value: "2-candle",
      label: "Todays 2nd Candle",
    },
    {
      value: "3-candle",
      label: "Todays 3rd Candle",
    },
    {
      value: "4-candle",
      label: "Todays 4th Candle",
    },
    {
      value: "5-candle",
      label: "Todays 5th Candle",
    },
  ],

  yesterdays: [
    {
      value: "1-yester-candle",
      label: "Yesterdays 1st Candle",
    },
    {
      value: "2-yester-candle",
      label: "Yesterdays 2nd Candle",
    },
    {
      value: "3-yester-candle",
      label: "Yesterdays 3rd Candle",
    },
  ],
};

const advancedTPSLUnits = ["%", "pt"];

const moreElements = [
  {
    indicatorName: "offset",
    value: "daily",
    displayName: "ltp",
  },
  {
    indicatorName: "min",
    value: "",
  },
  {
    indicatorName: "max",
    value: "",
  },
];

const moreElementsFunda = [
  {
    indicatorName: "min",
    value: "",
  },
  {
    indicatorName: "max",
    value: "",
  },
];

const elemsWithNoDialog = ["min", "max"];

// Chatbot guide content — mirrored 1:1 from the unfluke.in web app so the
// phone shows exactly what the website shows, per market.
const chatbotInfo = {
  "Company Fundamentals":
    'Unfluke\'s "Company Fundamentals" bot helps you with information on various financial data and annual reports. You can ask questions like:',
  Scanner:
    'Unfluke\'s "Scanner" bot helps you filter stocks based on price and technical indicators. You can ask questions like:',
  "Fundamental Screener":
    'Unfluke\'s "Fundamental Screener" bot helps you filter stocks based on fundamental analysis. You can ask questions like:',
  "Basic Backtest":
    'Unfluke\'s "Basic Backtest" bot lets you create backtesters. You can ask questions like:',
  "Advanced Backtest":
    'Unfluke\'s "Advanced Backtest" bot lets you create complex backtesters with multiple legs and conditions. You can ask questions like:',
  "Youtube Bot":
    'Unfluke\'s "Youtube Bot" lets you enter Youtube links and create strategies based on the content in the video. You can ask questions like:',
};

// Which bots the guide advertises per market ("in" = NSE, "crypto").
const chatbotGuideTabs = {
  in: [
    "Company Fundamentals",
    "Fundamental Screener",
    "Scanner",
    "Basic Backtest",
    "Advanced Backtest",
    "Youtube Bot",
  ],
  crypto: ["Scanner", "Basic Backtest", "Advanced Backtest", "Youtube Bot"],
};

const chatbotQuestions = {
  "Company Fundamentals": [
    "What was Reliance Industries' net profit in the last financial year?",
    "Summarize the management discussion and analysis section from TCS's latest annual report.",
    "How has Tata Steel’s debt-to-equity ratio changed over the last 3 years, and what does the management say about their debt strategy?",
    "Compare the EV/EBITDA of HDFC Bank and ICICI Bank for the last 5 years.",
  ],
  "Fundamental Screener": [
    "Give me stocks with Net Profit > 10% and Debt to Equity < 1.",
    "Show me stocks with Dividend Per Share < 15 and ROE > 20%.",
  ],
  Scanner: ["Tell me stocks where price is more than 1000."],
  "Basic Backtest": [
    "Create a backtest with 1% target and 0.5% stop loss.",
    "I want to backtest a strategy with 2 legs. Both should have 2% target and 1% stop loss.",
  ],
  "Advanced Backtest": [
    "Test a SMA 50 on stocks with exit condition of 20% profit or 10% stop loss",
  ],
  "Youtube Bot": [
    "I want to create a strategy from this video: https://www.youtube.com/shorts/YV-gwsg2Ekc",
    "https://www.youtube.com/shorts/SoVD74zm_bw",
    "Test strategy from this video: https://www.youtube.com/shorts/vD0CEdl3g1M",
  ],
};

// Crypto-market variants of the sample questions (web parity).
const chatbotQuestionsCrypto = {
  Scanner: ["I want to know where BTC is true for daily EMA > SMA."],
  "Basic Backtest": [
    "Create a backtest with 1% target and 0.5% stop loss.",
    "I want to backtest a strategy with 2 legs. Both should have 2% target and 1% stop loss.",
  ],
  "Advanced Backtest": [
    "When does ETH spot MACDFIX cross signal line upwards? Use 1 min chart 00:00 to 23:59.",
  ],
  "Youtube Bot": [
    "I want to create a strategy from this video: https://www.youtube.com/shorts/YV-gwsg2Ekc",
    "https://www.youtube.com/shorts/SoVD74zm_bw",
    "Test strategy from this video: https://www.youtube.com/shorts/vD0CEdl3g1M",
  ],
};

const question_tab_mapping = {
  "How has Tata Steel’s debt-to-equity ratio changed over the last 3 years, and what does the management say about their debt strategy?":
    "Company Fundamentals",
  "I want to backtest a strategy with 2 legs. Both should have 2% target and 1% stop loss.":
    "Basic Backtest",
  "What was Reliance Industries' net profit in the last financial year?":
    "Company Fundamentals",
  "Summarize the management discussion and analysis section from TCS's latest annual report.":
    "Company Fundamentals",
  "Compare the EV/EBITDA of HDFC Bank and ICICI Bank for the last 5 years.":
    "Company Fundamentals",
  "Give me stocks with Net Profit > 10% and Debt to Equity < 1.":
    "Fundamental Screener",
  "Show me stocks with Dividend Per Share < 15 and ROE > 20%.":
    "Fundamental Screener",
  "Create a backtest with 1% target and 0.5% stop loss.": "Basic Backtest",
  "I want to backtest a strategy with 2 legs. Both should have 2% target and 1% stop loss.":
    "Basic Backtest",
  "Tell me stocks where price is more than 1000.": "Scanner",
  "Test a SMA 50 on stocks with exit condition of 20% profit or 10% stop loss":
    "Advanced Backtest",
  "I want to know where BTC is true for daily EMA > SMA.": "Scanner",
  "When does ETH spot MACDFIX cross signal line upwards? Use 1 min chart 00:00 to 23:59.":
    "Advanced Backtest",
};

function createAdvancedBacktestLeg(index, entryexit, market) {
  let exitParams = {};

  if (entryexit === "exit") {
    exitParams = {
      tp: 0,
      sl: 0,
      trailX: 0,
      trailY: 0,
      tpUnit: "pt",
      slUnit: "pt",
      trailXUnit: "pt",
      trailYUnit: "pt",
    };
  }

  // Crypto trades 24x7 with no NSE-style instrument — mirror the website's
  // per-market default instead of seeding every leg with an NSE stock and
  // NSE trading hours (a crypto strategy would otherwise start out invalid
  // until the user manually re-picks every leg's instrument and time range).
  const isCrypto = market === "crypto";

  return {
    index: index,
    type: entryexit,
    buysell: entryexit === "entry" ? "Buy" : "Sell",
    noOfLots: 1,
    scannerExpr: [],
    scannerSegment: 0,
    scannerSegment1a: isCrypto ? "BTCUSDT" : "360ONE",
    scannerSegment2a: ["X"],
    startTime: isCrypto ? "00:00" : "09:30",
    endTime: isCrypto ? "23:59" : "15:30",
    satisfy: true,
    duplicate: true,
    timeframe: "1-min",
    ...exitParams,
  };
}

//GENERAL

const darkErrorToastOps = {
  position: "top-center",
  hideProgressBar: true,
  theme: "dark",
};

const successToastOps = {
  position: "top-center",
  hideProgressBar: true,
  theme: "colored",
};

function formatTime(time) {
  const h = time.hour.toString();
  const m = time.minute.toString();

  return h.padStart(2, "0") + ":" + m.padStart(2, "0");
}

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function addSuffixToNumber(num) {
  let suffix = "th";

  if (num.toString().endsWith("3")) {
    suffix = "rd";
  } else if (num.toString().endsWith("2")) {
    suffix = "nd";
  } else if (num.toString().endsWith("1")) {
    suffix = "st";
  }

  return num + suffix;
}

const fundamentalYears = [
  { value: "1", label: "1 Year" },
  { value: "3", label: "3 Years" },
  { value: "5", label: "5 Years" },
  { value: "10", label: "10 Years" },
];

export {
  fundamentalYears,
  legTPUnitTypes,
  legSLUnitTypes,
  TSLUnitTypes,
  legWaitTimeTypes,
  legReentryTypes,
  advBacktestLegs,
  reEntriesGlobal,
  initialLegPositions,
  indicators,
  niftys,
  advancedExecutions,
  niftysWithWeeklyExpiry,
  segments,
  segment1aList,
  equitySegment2a,
  futureSegment2a,
  indexSegment2a,
  scannerGlobalTimeframes,
  conditionalOperators,
  mathOperators,
  advOperators,
  advOperatorTitles,
  binaryOperators,
  fundaBinaryOperators,
  ohlc,
  strikeOptions,
  numericalOperands,
  numericalOperandsFunda,
  brackets,
  indicatorTimeframes,
  offset1s,
  offset2s,
  darkErrorToastOps,
  successToastOps,
  advancedTPSLUnits,
  moreElements,
  moreElementsFunda,
  elemsWithNoDialog,
  chatbotQuestions,
  chatbotQuestionsCrypto,
  chatbotGuideTabs,
  chatbotInfo,
  formatTime,
  deepCopy,
  addSuffixToNumber,
  createAdvancedBacktestLeg,
  createAdvancedOptionExecutionLeg,
  question_tab_mapping,
  backtesterTooltipTexts
};

