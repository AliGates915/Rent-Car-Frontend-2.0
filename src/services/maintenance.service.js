import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const maintenanceService = {
  // Get all maintenance logs
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.vehicle_id) params.append('vehicle_id', filters.vehicle_id);
    if (filters.from_date) params.append('from_date', filters.from_date);
    if (filters.to_date) params.append('to_date', filters.to_date);
    if (filters.status) params.append('status', filters.status);
    
    const response = await api.get(`/maintenance?${params.toString()}`);
    return response.data;
  },

  // Get maintenance by ID
  getById: async (id) => {
    const response = await api.get(`/maintenance/${id}`);
    return response.data;
  },

  // Create new maintenance log
  create: async (data) => {
    const response = await api.post('/maintenance', data);
    return response.data;
  },

  // Update maintenance log
  update: async (id, data) => {
    const response = await api.put(`/maintenance/${id}`, data);
    return response.data;
  },

  // Delete maintenance log
  delete: async (id) => {
    const response = await api.delete(`/maintenance/${id}`);
    return response.data;
  },

  // Complete maintenance
  complete: async (vehicle_id, maintenance_id) => {
    const response = await api.post('/maintenance/complete', { vehicle_id, maintenance_id });
    return response.data;
  },

  // Get due maintenance
  getDueMaintenance: async (days_ahead = 7) => {
    const response = await api.get(`/maintenance/due?days_ahead=${days_ahead}`);
    return response.data;
  },

  // Get maintenance summary
  getSummary: async (year, month) => {
    let url = `/maintenance/summary?year=${year}`;
    if (month) url += `&month=${month}`;
    const response = await api.get(url);
    return response.data;
  },

  // Get monthly maintenance costs
  getMonthlyCosts: async (year) => {
    const response = await api.get(`/maintenance/monthly-costs?year=${year}`);
    return response.data;
  },

  // Get maintenance statistics
  getStatistics: async () => {
    const response = await api.get('/maintenance/statistics');
    return response.data;
  },
};

export default maintenanceService;