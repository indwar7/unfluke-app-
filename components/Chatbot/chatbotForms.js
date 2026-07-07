// Market-aware base forms for the AI chatbot, mirrored 1:1 from the web app
// (unfluke.in main bundle). The chatbot seeds every `classify_prompt` with
// these and resets back to them after a run completes, so they must match
// what the backend expects per market ("in" = NSE, "crypto" = Binance pairs).

const baseScanForms = {
  in: {
    description: "",
    duplicate: true,
    starttime: "09:15",
    endtime: "15:30",
    expression: [],
    name: "New Form",
    publicChecked: true,
    satisfy: true,
    segment: 0,
    segment1a: "All",
    segment2a: [],
    showLatestRes: true,
    timeframe: "1-min",
  },
  crypto: {
    description: "",
    duplicate: true,
    starttime: "00:00",
    endtime: "23:59",
    offset2: "all-candles",
    expression: [],
    name: "New Form",
    publicChecked: true,
    satisfy: true,
    segment: 0,
    segment1a: "BTCUSDT",
    segment2a: [],
    showLatestRes: false,
    timeframe: "1-min",
  },
};

const backtestMTMDefaults = {
  MTMTarget: { type: "None", value: 0 },
  MTMStopLoss: { fixedStopLoss: "None", value: 0 },
  MTMTrailing: { value: "None", type: "points", values: { x: 0, y: 0 } },
};

const baseBacktestForms = {
  in: {
    name: "strategy_name",
    strategyType: "strategy_one",
    status: "active",
    isEditing: false,
    editStrategyId: "",
    strategySettings: {
      underlying: "spot",
      tradeType: "intraday",
      duration: "STBT_BTST",
      weekDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      startTime: { hour: 9, minute: 20, second: 0 },
      endTime: { hour: 15, minute: 15, second: 0 },
      nextDayEndTime: { hour: 9, minute: 15, second: 0 },
      checkConditionNextDayAfter: { hour: 9, minute: 15, second: 0 },
      daysBeforeExpiry: 4,
    },
    positions: {
      legs: [],
      legOptions: {
        waitAndTrade: false,
        moveSlToCost: false,
        squareOff: "partial",
      },
      reEntrySlTargetExit: true,
      reEntry: 0,
      legSummaries: {},
      noReentryAfter: { isEnabled: false, value: "" },
    },
    ...backtestMTMDefaults,
  },
  crypto: {
    name: "strategy_name",
    strategyType: "strategy_one",
    status: "active",
    isEditing: false,
    editStrategyId: "",
    strategySettings: {
      underlying: "spot",
      tradeType: "intraday",
      duration: "STBT_BTST",
      weekDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      startTime: { hour: 17, minute: 31, second: 0 },
      endTime: { hour: 17, minute: 30, second: 0 },
      nextDayEndTime: { hour: 17, minute: 31, second: 0 },
      checkConditionNextDayAfter: { hour: 17, minute: 31, second: 0 },
      daysBeforeExpiry: 4,
    },
    positions: {
      legs: [],
      legOptions: {
        waitAndTrade: false,
        moveSlToCost: false,
        squareOff: "partial",
      },
      reEntrySlTargetExit: true,
      reEntry: 0,
      legSummaries: {},
      noReentryAfter: { isEnabled: false, value: "" },
    },
    ...backtestMTMDefaults,
  },
};

const advancedExitDefaults = {
  tp: 0,
  sl: 0,
  trailX: 0,
  trailY: 0,
  tpUnit: "pt",
  slUnit: "pt",
  trailXUnit: "pt",
  trailYUnit: "pt",
  execution: "underlying",
  tradeLegs: 1,
  optionLegs: [
    {
      legIndex: 0,
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
      trailing: { x: 0, y: 0 },
    },
  ],
};

const makeAdvancedForm = (segment, segment1a, startTime, endTime) => ({
  strategyName: "strategy_name",
  entries: 1,
  totalLegs: 1,
  legs: {
    entry: [
      {
        index: 0,
        type: "entry",
        buysell: "Buy",
        noOfLots: 1,
        scannerExpr: [],
        scannerSegment: segment,
        scannerSegment1a: segment1a,
        scannerSegment2a: ["X"],
        startTime,
        endTime,
        satisfy: true,
        duplicate: true,
        timeframe: "1-min",
        color: "hsl(229, 45%, 85%)",
      },
    ],
    exit: [
      {
        index: 0,
        type: "exit",
        buysell: "Sell",
        noOfLots: 1,
        scannerExpr: [],
        scannerSegment: segment,
        scannerSegment1a: segment1a,
        scannerSegment2a: ["X"],
        startTime,
        endTime,
        satisfy: true,
        duplicate: true,
        timeframe: "1-min",
        color: "hsl(229, 45%, 85%)",
        ...advancedExitDefaults,
      },
    ],
  },
  mtm: { target: 0, stoploss: 0, trailX: 0, trailY: 0 },
});

const baseAdvancedForms = {
  in: makeAdvancedForm(1, "Nifty Spot", "09:15", "15:29"),
  crypto: makeAdvancedForm(0, "BTCUSDT", "17:31", "17:30"),
};

const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));
const marketKeyOf = (market) => (market === "crypto" ? "crypto" : "in");

export const getBaseScanForm = (market) =>
  deepCopy(baseScanForms[marketKeyOf(market)]);
export const getBaseBacktestForm = (market) =>
  deepCopy(baseBacktestForms[marketKeyOf(market)]);
export const getBaseAdvancedForm = (market) =>
  deepCopy(baseAdvancedForms[marketKeyOf(market)]);
