import { createAsyncThunk } from "@reduxjs/toolkit";
import Toast from 'react-native-toast-message';

//Include Both Helper File with needed methods
import {
    getProjectList as getProjectListApi,
    addProjectList as addProjectListApi,
    updateProjectList as updateProjectListApi,
    deleteProjectList as deleteProjectListApi,
    getStrategies as getStraegyListApi
} from "../../../Unfluke_helpers/backend_helper";

export const getProjectList = createAsyncThunk("projects/getProjectList", async () => {
    try {
        const response = getProjectListApi();
        return response;
    } catch (error) {
        return error;
    }
});



export const getStraegyList = createAsyncThunk("projects/getStraegyList", async () => {
    try {
        const response = getStraegyListApi();
        return response;
    } catch (error) {
        return error;
    }
});

export const addProjectList = createAsyncThunk("projects/addProjectList", async (project) => {
    try {
        const response = addProjectListApi(project);
        const data = await response;
        Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'project-list Added Successfully',
            visibilityTime: 3000,
        });
        return data;
    } catch (error) {
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'project-list Added Failed',
            visibilityTime: 3000,
        });
        return error;
    }
});

export const updateProjectList = createAsyncThunk("projects/updateProjectList", async (project) => {
    try {
        const response = updateProjectListApi(project);
        const data = await response;
        Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'project-list Updated Successfully',
            visibilityTime: 3000,
        });
        return data;
    } catch (error) {
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'project-list Updated Failed',
            visibilityTime: 3000,
        });
        return error;
    }
});

export const deleteProjectList = createAsyncThunk("projects/deleteProjectList", async (data) => {
    try {
        const response = deleteProjectListApi(data);
        const newdata = await response;
        Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'project-list Delete Successfully',
            visibilityTime: 3000,
        });
        return newdata;
    } catch (error) {
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'project-list Delete Failed',
            visibilityTime: 3000,
        });
        return error;
    }
});