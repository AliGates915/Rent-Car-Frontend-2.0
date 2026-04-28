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

export const expenseVoucherService = {
  // Get all expenses
  getAll: async () => {
    const response = await api.get('/expenses');
    return response.data;
  },

  // Get expense by ID
  getById: async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  // Create new expense
  create: async (data) => {
    const response = await api.post('/expenses', data);
    return response.data;
  },

  // Update expense
  update: async (id, data) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },

  // Delete expense
  delete: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  // Get expense report by date range
  getReport: async (from, to) => {
    const response = await api.get(`/expenses/report?from=${from}&to=${to}`);
    return response.data;
  },

  // Get expenses by type
  getByType: async (expenseType, from, to) => {
    let url = `/expenses/type/${expenseType}`;
    if (from && to) {
      url += `?from=${from}&to=${to}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // Get expense summary
  getSummary: async (year, month) => {
    let url = `/expenses/summary?year=${year}`;
    if (month) {
      url += `&month=${month}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // Get monthly expense report
  getMonthlyReport: async (year) => {
    const response = await api.get(`/expenses/monthly?year=${year}`);
    return response.data;
  },
};

export default expenseVoucherService;