import { createSlice } from '@reduxjs/toolkit';
import { setDeepObjProp as set } from './utils';

const buildLegSummary = (leg) => {
  if (!leg) return [];
  const chips = [];
  if (leg.instrument?.option) chips.push(leg.instrument.option);

  if (leg.buysell || leg.options) {
    chips.push(
      `${(leg.buysell || "").toUpperCase()} ${(leg.options || "").toUpperCase()}`
    );
  }

  if (leg.strike === "based_on_premium") {
    chips.push(`Premium ${leg.strikeDetails}`);
  } else if (leg.strikeDetails) {
    const d = leg.strikeDetails;
    if (d.includes("_")) {
      const [type, num] = d.split("_");
      if (type === "ATM") chips.push("ATM");
      else if (type === "ITM") chips.push(`ITM -${num}`);
      else if (type === "OTM") chips.push(`OTM +${num}`);
      else chips.push(d);
    } else chips.push(d);
  }

  if (leg.quantity !== undefined) chips.push(`Qty ${leg.quantity}`);

  if (leg.target?.type) {
    chips.push(
      leg.target?.value
        ? `Target: ${leg.target.type} - ${leg.target.value}`
        : `Target: ${leg.target.type}`
    );
  }

  if (leg.stopLoss?.type) {
    chips.push(
      leg.stopLoss?.value
        ? `Stoploss: ${leg.stopLoss.type} - ${leg.stopLoss.value}`
        : `Stoploss: ${leg.stopLoss.type}`
    );
  }

  if (leg.trailingStopLoss?.type) {
    if (leg.trailingStopLoss?.value?.x !== undefined)
      chips.push(
        `Trailing SL X: ${leg.trailingStopLoss.type} - ${leg.trailingStopLoss.value.x}`
      );
    if (leg.trailingStopLoss?.value?.y !== undefined)
      chips.push(
        `Trailing SL Y: ${leg.trailingStopLoss.type} - ${leg.trailingStopLoss.value.y}`
      );
  }

  if (leg.waitTime?.type) {
    if (leg.waitTime.type === "immediate") chips.push("Wait: immediate");
    else if (leg.waitTime?.value)
      chips.push(`Wait Time: ${leg.waitTime.type} - ${leg.waitTime.value}`);
    else chips.push(`Wait Time: ${leg.waitTime.type}`);
  }

  if (leg.reEntryCondition?.slType) {
    chips.push(
      leg.reEntryCondition?.slReentries
        ? `SL Re-entries: ${leg.reEntryCondition.slType} - ${leg.reEntryCondition.slReentries}`
        : `SL Re-entries: ${leg.reEntryCondition.slType}`
    );
  }

  if (leg.reEntryCondition?.targetType) {
    chips.push(
      leg.reEntryCondition?.targetReentries
        ? `Target Re-entries: ${leg.reEntryCondition.targetType} - ${leg.reEntryCondition.targetReentries}`
        : `Target Re-entries: ${leg.reEntryCondition.targetType}`
    );
  }

  return chips;
};

const initialState = {
  name: 'strategy_name',
  strategyType: 'strategy_one',
  status: 'active',
  isEditing: false,
  editStrategyId: '',
  strategySettings: {
    underlying: 'spot',
    tradeType: 'intraday',
    duration: 'STBT_BTST',
    weekDays: ['monday','tuesday', 'wednesday','thursday', 'friday'],
    startTime: {
      hour: 9,
      minute: 20,
      second: 0,
    },
    endTime: {
      hour: 15,
      minute: 15,
      second: 0,
    },
    nextDayEndTime: {
      hour: 9,
      minute: 15,
      second: 0,
    },
    checkConditionNextDayAfter: {
      hour: 9,
      minute: 15,
      second: 0,
    },
    daysBeforeExpiry: 4,
  },
  positions: {
    legs: [],
    legOptions: {
      waitAndTrade: false,
      moveSlToCost: false,
      squareOff: 'partial',
    },
    reEntrySlTargetExit: true,
    reEntry: 0,
    // LEG SUMMARIES
    legSummaries: {},
    noReentryAfter: {
      isEnabled: false,
      value: ""
    }
  },
  MTMTarget: {
    type: 'None',
    value: 0,
  },
  MTMStopLoss: {
    fixedStopLoss: 'None',
    value: 0,
  },
  MTMTrailing: {
    value: 'None',
    type: 'points',
    values: { x: 0, y: 0 },
  },
};

const strategyOneSlice = createSlice({
  name: 'strategyOne',
  initialState,
  reducers: {
    addLeg: (state, action) => {
      state.positions.legs.push(action.payload);
    },
    changeLegOptions: (state, action) => {
      state.positions.legOptions = {
        ...state.positions.legOptions,
        ...action.payload,
      };
    },
    changeReEntry:(state,action)=>{
      state.positions.reEntry=parseInt(action.payload)
    },
    changeLegReEntries:(state,action)=>{
      state.positions.legs.forEach((leg)=>{
        leg.reEntryCondition.targetReentries=parseInt(action.payload)
        leg.reEntryCondition.slReentries=parseInt(action.payload)
      })
    },
    changeLegReEntryConditions:(state,action)=>{
      state.positions.legs.forEach((leg)=>{
        leg.reEntryCondition.target=action.payload.target
        leg.reEntryCondition.sl=action.payload.sl
      })
    },
    toggleReentrySlTargetExit:(state)=>{
      state.positions.reEntrySlTargetExit=!state.positions.reEntrySlTargetExit
    },
    setNoreEntryAfter:(state,action)=>{
      state.positions.noReentryAfter=action.payload
    },
    onChange: (state, { payload }) => {
      set(state, payload.name.split('.'), payload.value);
    },
    onTimeChange:  (state, { payload }) => {

      const split = payload.value.split(":")
      const hour = parseInt(split[0])
      const minute = parseInt(split[1])
      set(state, payload.name.split('.'), {
        hour: hour,
        minute: minute,
        second: 0
      });
    },

    changeLegSegment: (state, { payload }) => {
      state.positions.legs.forEach((leg) => {
        leg.segment = payload;
      });
    },
    updateLeg: (state, action) => {
      //console.log("CHANGED LEG", action.payload)

      let leg = state.positions.legs.find((item) => {
        if (item.id && item.id === action.payload.id) return true;
        else if (item._id && item._id === action.payload.id) return true;
        return false;
      });
      set(leg, action.payload.name.split('.'), action.payload.value);
    },
    deleteLeg: (state, action) => {
      state.positions.legs = state.positions.legs.filter((leg) => {
        if (leg.id && leg.id === action.payload) return false;
        else if (leg._id && leg._id === action.payload) return false;
        return true;
      });

      // remove stale summary
      delete state.positions.legSummaries[action.payload];
    },
    updateMTMTarget: (state, action) => {
      set(
        state.MTMTarget,
        action.payload.name.split('.'),
        action.payload.value
      );
    },
    updateMTMStopLoss: (state, action) => {
      console.log(action);
      set(
        state.MTMStopLoss,
        action.payload.name.split('.'),
        action.payload.value
      );
    },
    updateMTMTrailing: (state, action) => {
      set(
        state.MTMTrailing,
        action.payload.name.split('.'),
        action.payload.value
      );
    },
    // setEditStrategy: (state, { payload }) => {
    //   // Preserve existing legSummaries unless payload provides it
    //   const prevLegSummaries = state.positions.legSummaries || {};
    //   const merged = {
    //     ...state,
    //     ...payload,
    //     positions: {
    //       ...state.positions,
    //       ...payload.positions,
    //       legSummaries:
    //         payload.positions?.legSummaries !== undefined
    //           ? payload.positions.legSummaries || {}
    //           : prevLegSummaries,
    //     },
    //   };
    //   merged.strategySummary = {
    //     name: merged.name,
    //     startTime: merged.strategySettings.startTime,
    //     endTime: merged.strategySettings.endTime,
    //     reEntry: merged.positions.reEntry,
    //   };
    //   return merged;
    // },
     setEditStrategy: (state, { payload }) => {
      const incomingLegs = payload.positions?.legs || [];
      let legSummaries;

      if (payload.positions?.legSummaries !== undefined) {
        // Use provided (or empty object if nullish)
        legSummaries = payload.positions.legSummaries || {};
      } else {
        // Recompute fresh summaries for ALL legs
        legSummaries = {};
        incomingLegs.forEach((leg) => {
          const legId = leg._id || leg.id;
            if (legId) legSummaries[legId] = buildLegSummary(leg);
        });
      }

      const merged = {
        ...state,
        ...payload,
        positions: {
          ...state.positions,
          ...payload.positions,
          legSummaries,
        },
      };

      merged.strategySummary = {
        name: merged.name,
        startTime: merged.strategySettings.startTime,
        endTime: merged.strategySettings.endTime,
        reEntry: merged.positions.reEntry,
      };
      return merged;
    },

    setLegSummary: (state, { payload }) => {
      const { legId, summary } = payload;

      state.positions.legSummaries[legId] = summary;
    },
    removeLegSummary: (state, { payload }) => {
      delete state.positions.legSummaries[payload];
    },

     rebuildLegSummaries: (state) => {
      const refreshed = {};
      state.positions.legs.forEach((leg) => {
        const legId = leg._id || leg.id;
        if (legId) refreshed[legId] = buildLegSummary(leg);
      });
      state.positions.legSummaries = refreshed;
    },

    clearValues: (state) => {
      return { ...initialState };
    },

    
  },

















});

export const {
  addLeg,
  changeLegOptions,
  changeReEntry,
  changeLegReEntries,
  changeLegReEntryConditions,
  toggleReentrySlTargetExit,
  setNoreEntryAfter,
  updateLeg,
  deleteLeg,
  updateMTMTarget,
  updateMTMStopLoss,
  updateMTMTrailing,
  saveStrategy,
  loadStrategy,
  onChange,
  onTimeChange,
  setEditStrategy,
  clearValues,
  changeLegSegment,
  setLegSummary,
  rebuildLegSummaries,
  removeLegSummary,
} = strategyOneSlice.actions;

export default strategyOneSlice.reducer;
