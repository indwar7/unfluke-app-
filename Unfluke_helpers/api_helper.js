import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../helpers/config';

// Set base URL - use centralized config with fallbacks
axios.defaults.baseURL = Config.BACKEND_URL;
console.log("Unfluke API Base URL:", Config.BACKEND_URL);

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;

// Create a function to get the current token
const getToken = async () => {
  try {
    return await AsyncStorage.getItem('access');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Request interceptor to add auth token and market header
axios.interceptors.request.use(async (config) => {
  try {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    const mrkt = await AsyncStorage.getItem('mkt');
    if (mrkt) {
      config.headers.mrkt = mrkt;
    }
  } catch (error) {
    console.error('Error setting request headers:', error);
  }
  
  return config;
});

// Response interceptor
axios.interceptors.response.use(
  (response) => response.data || response,
  (error) => {
    // Handle network errors
    if (error.message && error.message.includes('Network Error')) {
      if (new Date().getHours() >= 23) {
        console.log('Maintenance mode activated');
      }
    }
    
    // Handle HTTP errors
    let message = 'An error occurred';
    if (error.response) {
      switch (error.response.status) {
        case 500:
          message = 'Internal Server Error';
          break;
        case 401:
          message = 'Invalid credentials';
          break;
        case 404:
          message = 'Sorry! the data you are looking for could not be found';
          break;
        default:
          message = error.response.data?.message || error.message;
      }
    } else {
      message = error.message;
    }
    
    return Promise.reject(message);
  }
);

/**
 * Sets the authorization token
 * @param {string} token
 */
const setAuthorization = (token) => {
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
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
   * Post given data to url
   */
  create = async (url, data) => {
    return axios.post(url, data);
  };

  /**
   * Updates data
   */
  update = async (url, data) => {
    return axios.patch(url, data);
  };

  put = async (url, data) => {
    return axios.put(url, data);
  };

  /**
   * Delete
   */
  delete = async (url, config) => {
    return axios.delete(url, config);
  };
}

/**
 * Gets the logged in user
 */
const getLoggedinUser = async () => {
  try {
    const userString = await AsyncStorage.getItem('authUser');
    if (!userString) return null;
    
    const user = JSON.parse(userString);
    user.token = await AsyncStorage.getItem('access');
    return user;
  } catch (error) {
    console.error('Error getting logged in user:', error);
    return null;
  }
};

// ✅ ORIGINAL EXPORTS (No change)
export { APIClient, setAuthorization, getLoggedinUser };

// ✅ NEW: Helper exports for Fundamentals & Strategy Charts
const apiClient = new APIClient();
export const get = (url, params) => apiClient.get(url, params);
export const post = (url, data) => apiClient.create(url, data);
export const API_BASE_URL = axios.defaults.baseURL;