
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    selectedStock: {
        symbol: "RELIANCE",
        name: "Reliance Industries Ltd", // Default name
        capcode: 476, // Reliance Capcode
        token: null, // Will be populated from search API if available
        exchange: "NSE", // Default exchange
    },
    searchQuery: "",
    searchResults: [],
    isLoading: false,
    error: null,
};

const globalStockSlice = createSlice({
    name: "GlobalStock",
    initialState,
    reducers: {
        setSelectedStock: (state, action) => {
            // Ensure we're setting a consistent object structure
            // action.payload should be the stock object from the search results
            state.selectedStock = {
                ...state.selectedStock, // Keep existing defaults if payload is partial
                ...action.payload,
            };
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
        setSearchResults: (state, action) => {
            state.searchResults = action.payload;
        },
        setStockLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setStockError: (state, action) => {
            state.error = action.payload;
        },
        resetStockState: (state) => {
            state.searchQuery = "";
            state.searchResults = [];
            state.isLoading = false;
            state.error = null;
        }
    },
});

export const {
    setSelectedStock,
    setSearchQuery,
    setSearchResults,
    setStockLoading,
    setStockError,
    resetStockState
} = globalStockSlice.actions;

export default globalStockSlice.reducer;
