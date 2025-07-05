import axios from 'axios';
import {store} from '.'; // Adjust path if your store is elsewhere

const API_BASE_URL = 'https://speedit-server.onrender.com/v1/api'; //live
// const API_BASE_URL = 'http://192.168.231.196:8080/v1/api';  //android
// const API_BASE_URL = 'http://172.20.10.6:8080/v1/api'; //ios

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const {auth} = state; // Get token from Redux store
    const token = auth?.token; // Adjust according to your auth slice structure
    // console.log('Axios Request:', token)
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Ensure Content-Type is set for POST/PUT requests if not already set
    if (config.method === 'post' || config.method === 'put') {
      if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;