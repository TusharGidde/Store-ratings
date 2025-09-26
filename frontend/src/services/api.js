import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
};

// User API calls (Admin)
export const userAPI = {
  createUser: (userData) => api.post('/users', userData),
  getAllUsers: (params) => api.get('/users', { params }),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Store API calls
export const storeAPI = {
  getAllStores: (params) => api.get('/stores', { params }),
  createStore: (storeData) => api.post('/stores', storeData),
  updateStore: (id, storeData) => api.put(`/stores/${id}`, storeData),
  getMyStore: () => api.get('/stores/my/store'),
  deleteStore: (id) => api.delete(`/stores/${id}`),
};

// Rating API calls
export const ratingAPI = {
  submitRating: (ratingData) => api.post('/ratings', ratingData),
  getMyRatings: (params) => api.get('/ratings/my', { params }),
  deleteRating: (id) => api.delete(`/ratings/${id}`),
  getStoreRatings: (storeId, params) => api.get(`/ratings/store/${storeId}`, { params }),
  getAllRatings: (params) => api.get('/ratings', { params }),
};

export default api;