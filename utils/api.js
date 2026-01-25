import axios from 'axios';

const api = axios.create({
  baseURL: 'https://sport-backend-mu.vercel.app/api',
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