import axios from 'axios';

export const BACKEND_BASE_URL = 'https://sport-backend-mu.vercel.app/api';
export const API_BASE_URL = `${BACKEND_BASE_URL}/api`;
export const getUploadUrl = (fileName = '') => `${BACKEND_BASE_URL}/uploads/${fileName}`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🔄 401 detected, clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 1000);
      }
    }
    return Promise.reject(error);
  }
);

export default api;