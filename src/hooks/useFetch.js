// hooks/useFetch.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { moduleApi } from '../services/api';

// Global cache outside the hook to persist across component instances
const globalCache = new Map();
const pendingRequests = new Map();

export default function useFetch(endpoint, params = {}, auto = true, options = {}) {
  const { cacheTime = 5 * 60 * 1000, skipCache = false } = options; // 5 minutes default cache
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Use ref to track previous values
  const paramsRef = useRef(params);
  const endpointRef = useRef(endpoint);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);
  
  // Generate unique cache key
  const getCacheKey = useCallback(() => {
    const sortedParams = {};
    Object.keys(params).sort().forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        sortedParams[key] = params[key];
      }
    });
    return `${endpoint}-${JSON.stringify(sortedParams)}`;
  }, [endpoint, params]);

  const clearCache = useCallback(() => {
    const cacheKey = getCacheKey();
    globalCache.delete(cacheKey);
  }, [getCacheKey]);

  const fetchData = useCallback(
    async (overrideParams = {}, forceRefresh = false) => {
      if (!endpoint) return;
      
      const cacheKey = getCacheKey();
      const now = Date.now();
      
      // Check cache
      if (!forceRefresh && !skipCache && globalCache.has(cacheKey)) {
        const cached = globalCache.get(cacheKey);
        if (now - cached.timestamp < cacheTime) {
          setData(cached.data);
          setMeta(cached.meta);
          return;
        } else {
          // Cache expired
          globalCache.delete(cacheKey);
        }
      }
      
      // Check if there's already a pending request for this key
      if (pendingRequests.has(cacheKey)) {
        try {
          const result = await pendingRequests.get(cacheKey);
          if (isMountedRef.current) {
            setData(result.data);
            setMeta(result.meta);
          }
          return;
        } catch (err) {
          if (isMountedRef.current) {
            setError(err);
          }
          return;
        }
      }
      
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      
      setLoading(true);
      setError(null);
      
      // Create request promise
      const requestPromise = (async () => {
        try {
          // Merge params with overrideParams
          const mergedParams = { ...params, ...overrideParams };
          
          // Remove undefined or empty values to keep URL clean
          const cleanParams = {};
          Object.keys(mergedParams).forEach(key => {
            if (mergedParams[key] !== undefined && mergedParams[key] !== null && mergedParams[key] !== '') {
              cleanParams[key] = mergedParams[key];
            }
          });
          
          const response = await moduleApi.getAll(endpoint, cleanParams, { 
            signal: abortController.signal 
          });
          const payload = response.data;
          
          // Handle different response structures
          const items = Array.isArray(payload) 
            ? payload 
            : payload?.data || [];
          
          const newMeta = {
            total: payload?.total || items.length || 0,
            page: payload?.page || cleanParams.page || 1,
            limit: payload?.limit || cleanParams.limit || 10,
          };
          
          const result = { data: items, meta: newMeta };
          
          // Store in cache
          if (!skipCache) {
            globalCache.set(cacheKey, {
              data: items,
              meta: newMeta,
              timestamp: now
            });
          }
          
          return result;
        } catch (err) {
          if (err.name === 'AbortError') {
            throw err;
          }
          throw err;
        }
      })();
      
      // Store pending request
      pendingRequests.set(cacheKey, requestPromise);
      
      try {
        const result = await requestPromise;
        if (isMountedRef.current) {
          setData(result.data);
          setMeta(result.meta);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Request aborted');
          return;
        }
        console.error('Fetch error:', err);
        if (isMountedRef.current) {
          setError(err);
          setData([]);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
        pendingRequests.delete(cacheKey);
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      }
    },
    [endpoint, params, getCacheKey, cacheTime, skipCache]
  );

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Auto fetch when dependencies change
  useEffect(() => {
    if (!auto) return;
    
    const paramsChanged = JSON.stringify(paramsRef.current) !== JSON.stringify(params);
    const endpointChanged = endpointRef.current !== endpoint;
    
    if (paramsChanged || endpointChanged) {
      paramsRef.current = params;
      endpointRef.current = endpoint;
      fetchData({}, false);
    } else {
      // Initial fetch
      fetchData({}, false);
    }
  }, [endpoint, params, auto, fetchData]);

  return { 
    data, 
    setData, 
    meta, 
    loading, 
    error, 
    refetch: () => fetchData({}, true),
    clearCache 
  };
}