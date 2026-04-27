import api from './api';

export const dashboardService = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      const response = await api.get('/api/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },
  
  // Get revenue chart data
  getRevenueChart: async (period = 30) => {
    try {
      const response = await api.get('/api/dashboard/revenue-chart', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue chart:', error);
      throw error;
    }
  },
  
  // Get timeline events
  getTimelineEvents: async (limit = 20) => {
    try {
      const response = await api.get('/api/dashboard/timeline', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching timeline events:', error);
      throw error;
    }
  }
};