import { createSlice } from "@reduxjs/toolkit";
import { getProjectList, addProjectList, updateProjectList, deleteProjectList, getStraegyList } from './thunk';
export const initialState = {
    projectLists: [],
    allStrategies: [],
    error: {},
};


const TestMyStrategySlice = createSlice({
    name: 'TestMyStrategySlice',
    initialState,
    reducer: {
        setAllStrategies(state, action) {
            state.allStrategies = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getProjectList.fulfilled, (state, action) => {
            state.projectLists = action.payload;
        });
        builder.addCase(getStraegyList.fulfilled, (state, action) => {
            state.allStrategies = action.payload;
        });

        builder.addCase(getProjectList.rejected, (state, action) => {
            state.error = action.payload.error || null;
        });
        builder.addCase(addProjectList.fulfilled, (state, action) => {
            state.projectLists.unshift(action.payload);
        });
        builder.addCase(addProjectList.rejected, (state, action) => {
            state.error = action.payload.error || null;
        });
        builder.addCase(updateProjectList.fulfilled, (state, action) => {
            state.projectLists = state.projectLists.map(project =>
                project._id.toString() === action.payload.data._id.toString()
                    ? { ...project, ...action.payload.data }
                    : project
            );
        });
        builder.addCase(updateProjectList.rejected, (state, action) => {
            state.error = action.payload.error || null;
        });
        builder.addCase(deleteProjectList.fulfilled, (state, action) => {
            state.projectLists = state.projectLists.filter(project => project.id.toString() !== action.payload.id.toString());
        });
        builder.addCase(deleteProjectList.rejected, (state, action) => {
            state.error = action.payload.error || null;
        });
    }
});

export const {
    setAllStrategies,
} = TestMyStrategySlice.actions

export default TestMyStrategySlice.reducer;
