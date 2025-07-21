import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'https://good-sale-pos-backend.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Package API calls
export const packageAPI = {
  getPackages: (posType) => api.get(`/packages?pos_type=${posType}`),
  subscribe: (packageId) => api.post('/subscribe', { package_id: packageId }),
  getCurrentSubscription: () => api.get('/subscription/current'),
  getFeatures: () => api.get('/features'),
};

// Store API calls
export const storeAPI = {
  getStores: () => api.get('/stores'),
  createStore: (storeData) => api.post('/stores', storeData),
  getStore: (storeId) => api.get(`/stores/${storeId}`),
  updateStore: (storeId, storeData) => api.put(`/stores/${storeId}`, storeData),
  deleteStore: (storeId) => api.delete(`/stores/${storeId}`),
  openStore: (storeId) => api.post(`/stores/${storeId}/open`),
  closeStore: (storeId) => api.post(`/stores/${storeId}/close`),
  getDashboard: (storeId) => api.get(`/stores/${storeId}/dashboard`),
};

export default api;
