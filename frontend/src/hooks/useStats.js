import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

/**
 * Fetches global seismic stats on mount and whenever timeframe changes.
 * Auto-refreshes every 60 seconds.
 */
export function useStats(timeframe = '24h') {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.stats(timeframe);
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 60_000);
    return () => clearInterval(id);
  }, [fetch]);

  return { stats, loading, error, refetch: fetch };
}
