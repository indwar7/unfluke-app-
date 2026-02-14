import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from './config';

// Set base URL from centralized config
axios.defaults.baseURL = Config.BACKEND_URL;
console.log("API Base URL:", axios.defaults.baseURL);

axios.defaults.headers.post["Content-Type"] = "application/json";

// Request interceptor to set auth token
axios.interceptors.request.use(
  async (config) => {
    try {
      // Get token from AsyncStorage for each request
      const authUser = await AsyncStorage.getItem("authUser");
      if (authUser) {
        const user = JSON.parse(authUser);
        if (user.token) {
          config.headers.Authorization = "Bearer " + user.token;
        }
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to capture errors
axios.interceptors.response.use(
  function (response) {
    return response.data ? response.data : response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    let message;
    const status = error.response?.status;
    
    switch (status) {
      case 500:
        message = "Internal Server Error";
        break;
      case 401:
        message = "Invalid credentials";
        break;
      case 404:
        message = "Sorry! the data you are looking for could not be found";
        break;
      default:
        message = error.message || error;
    }
    return Promise.reject(message);
  }
);

/**
 * Sets the default authorization
 * @param {*} token
 */
const setAuthorization = (token) => {
  axios.defaults.headers.common["Authorization"] = "Bearer " + token;
};

class APIClient {
  /**
   * Fetches data from given url
   */
  get = (url, params) => {
    let response;
    let paramKeys = [];

    if (params) {
      Object.keys(params).map(key => {
        paramKeys.push(key + '=' + params[key]);
        return paramKeys;
      });

      const queryString = paramKeys && paramKeys.length ? paramKeys.join('&') : "";
      response = axios.get(`${url}?${queryString}`, params);
    } else {
      response = axios.get(`${url}`, params);
    }

    return response;
  };
  
  /**
   * post given data to url
   */
  create = (url, data) => {
    return axios.post(url, data);
  };
  
  /**
   * Updates data
   */
  update = (url, data) => {
    return axios.patch(url, data);
  };

  put = (url, data) => {
    return axios.put(url, data);
  };
  
  /**
   * Delete
   */
  delete = (url, config) => {
    return axios.delete(url, { ...config });
  };
}

/**
 * Gets the logged in user
 */
const getLoggedinUser = async () => {
  try {
    const user = await AsyncStorage.getItem("authUser");
    if (!user) {
      return null;
    } else {
      return JSON.parse(user);
    }
  } catch (error) {
    console.error('Error getting logged in user:', error);
    return null;
  }
};

export { APIClient, setAuthorization, getLoggedinUser };