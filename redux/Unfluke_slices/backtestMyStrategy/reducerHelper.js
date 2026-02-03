import { setAllStrategies } from "./reducer";

export const setAllStrategiesList = (array) => async (dispatch) => {
    if (array.length > 0) {
        dispatch(setAllStrategies(array));
    }else{
        dispatch(setAllStrategies([]));
    }
}