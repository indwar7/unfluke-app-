// apiHelper.js

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Set base URL (you can hardcode or use env for React Native)
axios.defaults.baseURL = "https://api.unfluke.in/"; 
// axios.defaults.baseURL = "http://10.184.31.9:80/"; 
// Replace with your backend URL

// Set content type
axios.defaults.headers.post["Content-Type"] = "application/json";

// Enable custom headers (cookies won't work like web)
axios.defaults.withCredentials = false;

// Get token from AsyncStorage and apply it
const setToken = async () => {
  const token = await AsyncStorage.getItem("access");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

setToken();

// Add response interceptor
axios.interceptors.response.use(
  function (response) {
    return response.data ? response.data : response;
  },
  function (error) {
    let message;

    const status = error?.response?.status;

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
        message = error?.message || "Something went wrong";
    }

    return Promise.reject(message);
  }
);

// Add request interceptor
axios.interceptors.request.use(async function (config) {
  const mrkt = await AsyncStorage.getItem("mkt");
  if (mrkt) {
    config.headers["mrkt"] = mrkt;
  }

  const token = await AsyncStorage.getItem("access");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

/**
 * Sets the default authorization
 */
const setAuthorization = async (token) => {
  await AsyncStorage.setItem("access", token);
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

class APIClient {
  // Add request cancellation support
  cancelTokenSource = axios.CancelToken.source();

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
// Fetch current logged-in user from AsyncStorage
const getLoggedinUser = async () => {
  const userStr = await AsyncStorage.getItem("authUser");
  const token = await AsyncStorage.getItem("access");

  if (!userStr) return null;

  const user = JSON.parse(userStr);
  user.token = token;
  return user;
};

export { APIClient, setAuthorization, getLoggedinUser };
