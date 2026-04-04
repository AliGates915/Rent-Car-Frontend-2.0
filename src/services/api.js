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
  getAll: (endpoint, params) => api.get(endpoint, { params }),
  getOne: (endpoint, id) => api.get(`${endpoint}/${id}`),
  create: (endpoint, data) => api.post(endpoint, data),
  update: (endpoint, id, data) => api.put(`${endpoint}/${id}`, data),
  patch: (endpoint, id, data) => api.patch(`${endpoint}/${id}`, data),
  remove: (endpoint, id) => api.delete(`${endpoint}/${id}`),
};

export default api;
