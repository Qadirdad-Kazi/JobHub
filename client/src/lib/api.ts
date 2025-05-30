import axios from 'axios';
import { config } from '../config';

// Remove /api suffix if it exists in the base URL to prevent double /api
const baseURL = config.api.baseUrl.endsWith('/api')
  ? config.api.baseUrl.slice(0, -4) // Remove trailing /api
  : config.api.baseUrl;

console.log('API configured with baseURL:', baseURL);

export const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: config.api.timeout,
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    // Always use the direct token key for consistency
    const token = localStorage.getItem('token');
    
    if (token) {
      // Ensure Authorization header is properly formatted
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding token to request:', config.url);
    } else {
      console.log('No token available for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`Request to ${response.config.url} successful:`, response.status);
    return response;
  },
  (error) => {
    console.error(`API error for ${error.config?.url}:`, error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('Unauthorized access, clearing token');
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
); 