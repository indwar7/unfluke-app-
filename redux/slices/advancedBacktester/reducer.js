import { createSlice } from '@reduxjs/toolkit';
import { createAdvancedBacktestLeg } from '../../../components/UnflukeMain/Utils/common_vars';
import { deepCopy } from '../../../components/UnflukeMain/BasicBacktester/StrategyLegs/utils';

const initialState = {
    strategyName: "strategy_name",
    user: {
        backtests: 0,
        _id: "",
        tier: 0
    },
    entries: 1,
    totalLegs: 1,
    legs: {
        entry: [],
        exit: []
    },
    mtm: {
        target: 0,
        stoploss: 0,
        trailX: 0,
        trailY: 0
    }
}

const advancedBacktestSlice = createSlice({
    name: 'advancedStrategy',
    initialState,
    reducers: {
        handleChange: (state, action) => {
            state[action.payload.name] = action.payload.value
        },
        handleMTMChange: (state, action) => {
            state["mtm"][action.payload.name] = action.payload.value
        },
        handleAddLeg: (state, action) => {

            if(state["totalLegs"] < 10)
            {
                const index = action.payload.index
                const market = action.payload.market
                const legStateEntry = createAdvancedBacktestLeg(index, "entry", market)
                const legStateExit = createAdvancedBacktestLeg(index, "exit", market)
                state["legs"]["entry"] = state["legs"]["entry"].concat([legStateEntry])
                state["legs"]["exit"] = state["legs"]["exit"].concat([legStateExit])
                state["totalLegs"] = state["legs"]["entry"].length
            }

            return state
        },
         handleUpdateExecutionLeg: (state, action) => {
            const type = action.payload.type
            const parentIndex = action.payload.parentIndex
            const subIndex = action.payload.subIndex
            const legInfo = action.payload.legInfo

            state["legs"][type][parentIndex].optionLegs[subIndex] = legInfo
        },
        handleUpdateLeg: (state, action) => {
            const type = action.payload.type
            const index = action.payload.index

            state["legs"][type][index] = action.payload
        },
        handleRemoveLeg: (state, action) => {
            const index = parseInt(action.payload.index)-1

            if(state.totalLegs > 1){
                state["legs"]["entry"].splice(index, 1)
                state["legs"]["exit"].splice(index, 1)
                state["totalLegs"] = state["legs"]["entry"].length

                state["legs"]["entry"].forEach((leg, i)=>{
                    state["legs"]["entry"][i].index = i
                })

                state["legs"]["exit"].forEach((leg, i)=>{
                    state["legs"]["exit"][i].index = i
                })
            }

            return state
        },
        setBacktester: (state, action) => {
            state = action.payload
            return state;
        },
        clearValues: (state) => {
            return { ...initialState };
        },
    },
});

export const {
    handleChange,
    handleAddLeg,
    handleUpdateLeg,
    handleRemoveLeg,
    handleUpdateExecutionLeg,
    setBacktester,
    handleMTMChange,
    clearValues
} = advancedBacktestSlice.actions;
  
  
export default advancedBacktestSlice.reducer;