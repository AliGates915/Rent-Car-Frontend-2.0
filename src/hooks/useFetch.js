import { useCallback, useEffect, useState } from 'react';
import { moduleApi } from '../services/api';

export default function useFetch(endpoint, params = {}, auto = true) {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (overrideParams = {}) => {
      if (!endpoint) return;
      setLoading(true);
      setError(null);
      try {
        const response = await moduleApi.getAll(endpoint, { ...params, ...overrideParams });
        const payload = response.data;
        const items = Array.isArray(payload) ? payload : payload?.data || [];
        setData(items);
        setMeta({
          total: payload?.total || items.length || 0,
          page: payload?.page || params.page || 1,
          limit: payload?.limit || params.limit || 10,
        });
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [endpoint, JSON.stringify(params)] // ✅ FIX
  );

  useEffect(() => {
    if (auto) fetchData();
  }, [fetchData, auto]);

  return { data, setData, meta, loading, error, refetch: fetchData };
}
