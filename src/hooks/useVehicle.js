// hooks/useVehicles.js
import useFetch from './useFetch';

// Singleton pattern to ensure only one instance
let vehicleCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export default function useVehicles(options = {}) {
  const { skipCache = false } = options;
  
  const { data, loading, error, refetch } = useFetch(
    '/vehicles',
    { limit: 100 },
    true,
    { cacheTime: CACHE_DURATION, skipCache }
  );
  
  return {
    vehicles: data,
    loading,
    error,
    refetchVehicles: refetch
  };
}