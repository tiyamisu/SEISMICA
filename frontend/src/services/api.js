const BASE = 'http://localhost:5000';

const get = async (path) => {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
};

export const api = {
  stats:   (timeframe = '24h') => get(`/api/stats?timeframe=${timeframe}`),
  history: (timeframe = '7d')  => get(`/api/history?timeframe=${timeframe}`),
  route:   (minMag, timeframe = '24h') =>
    get(`/api/route?minMag=${minMag}&timeframe=${timeframe}`),
  health:  () => get('/health'),
};
