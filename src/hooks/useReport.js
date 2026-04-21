// hooks/useReport.js
import { useState, useEffect } from 'react';
import api from '../services/api';

export function useReport(endpoint, dateRange, filters = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [endpoint, dateRange, filters]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...filters,
      };
      const response = await api.get(endpoint, { params });
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchReport };
}