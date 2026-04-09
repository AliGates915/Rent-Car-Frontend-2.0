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
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const url = queryParams.toString() 
      ? `${endpoint}?${queryParams.toString()}`
      : endpoint;
    
    return await api.get(url);
  },

  getOne: (endpoint, id) => api.get(`${endpoint}/${id}`),
  
  create: async (endpoint, data) => {
    if (data instanceof FormData) {
      return await api.post(endpoint, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return await api.post(endpoint, data);
  },
  
  getById: async (endpoint, id) => {
    return await api.get(`${endpoint}/${id}`);
  },
  
  update: (endpoint, id, data) => api.put(`${endpoint}/${id}`, data),
  
  // FIXED: Use PATCH method, not PUT
  patch: async (endpoint, idOrData, dataOrNull) => {
    let url, data;
    
    // Handle different calling patterns
    if (typeof idOrData === 'object' || idOrData === undefined) {
      // Pattern: patch('/bookings/10/status', { status: 'confirmed' })
      url = endpoint;
      data = idOrData;
    } else {
      // Pattern: patch('/bookings', 10, { status: 'confirmed' })
      url = `${endpoint}/${idOrData}`;
      data = dataOrNull;
    }
    
    if (data instanceof FormData) {
      return await api.patch(url, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return await api.patch(url, data);
  },
  
  // Convenience methods
  updateStatus: async (bookingId, status) => {
    return await api.patch(`/bookings/${bookingId}/status`, { status });
  },
  
  cancelBooking: async (bookingId) => {
    return await api.patch(`/bookings/${bookingId}/cancel`);
  },
  
  remove: (endpoint, id) => api.delete(`${endpoint}/${id}`),
};

export const fetchHandovers = async () => {
  try {
    const response = await moduleApi.getAll('/handovers', {
      params: { page, limit, search, status }
    });
    
    // ✅ Check if response has the expected structure
    if (response.data && response.data.data) {
      // If response is { data: { data: [...], total: ... } }
      setHandovers(response.data.data);
      setTotal(response.data.total);
    } else if (Array.isArray(response.data)) {
      // If response is just an array
      setHandovers(response.data);
      setTotal(response.data.length);
    } else if (response.data && Array.isArray(response.data)) {
      // If response.data is the array
      setHandovers(response.data);
      setTotal(response.data.length);
    } else {
      console.error('Unexpected response structure:', response);
      setHandovers([]);
      setTotal(0);
    }
  } catch (error) {
    console.error('Error fetching handovers:', error);
    setHandovers([]);
    setTotal(0);
  }
};


export default api;
