import axios from 'axios';
import {store} from '.'; // Adjust path if your store is elsewhere

const API_BASE_URL = 'https://speedit-server.onrender.com/v1/api';

const apiInstance = axios.create({
  baseURL: API_BASE_URL,
});

apiInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const {auth} = state; // Get token from Redux store
    const token = auth?.token; // Adjust according to your auth slice structure
    console.log('Axios Request:', token)
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Ensure Content-Type is set for POST/PUT requests if not already set
    if (config.method === 'post' || config.method === 'put') {
      if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] =  'multipart/form-data'
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiInstance;