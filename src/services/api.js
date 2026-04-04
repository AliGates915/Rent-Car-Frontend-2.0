import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error.message || 'Something went wrong';
    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    } else {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
};

export const moduleApi = {
  getAll: async (endpoint, params = {}) => {
    // Build query string from params
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const url = queryParams.toString() 
      ? `${endpoint}?${queryParams.toString()}`
      : endpoint;
    
    return await api.get(url); // Assuming you have an api instance
  },

  getOne: (endpoint, id) => api.get(`${endpoint}/${id}`),
  create: async (endpoint, data) => {
    // If data is FormData, send as multipart/form-data
    if (data instanceof FormData) {
      return await api.post(endpoint, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    // Otherwise send as JSON
    return await api.post(endpoint, data);
  },
  getById: async (endpoint, id) => {
    return await api.get(`${endpoint}/${id}`);
  },
  update: (endpoint, id, data) => api.put(`${endpoint}/${id}`, data),
  patch: async (endpoint, id, data) => {
    // If data is FormData, send as multipart/form-data
    if (data instanceof FormData) {
      return await api.put(`${endpoint}/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    // Otherwise send as JSON
    return await api.put(`${endpoint}/${id}`, data);
  },
  remove: (endpoint, id) => api.delete(`${endpoint}/${id}`),
};

export default api;
