'use strict';

const express = require('express');
const cors    = require('cors');
const axios   = require('axios');

const app  = express();
const PORT = 5000;

// ─── USGS Feed URLs ───────────────────────────────────────────────────────────

const USGS_FEEDS = {
  '24h': 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
  '48h': 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson',
  '7d':  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson',
  '30d': 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson',
};

const TIMEFRAME_MS = {
  '24h': 24 * 60 * 60 * 1000,
  '48h': 48 * 60 * 60 * 1000,
  '7d':  7  * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

const MAX_ROUTE_POINTS = 40;
const AXIOS_OPTS = { timeout: 15_000, headers: { Accept: 'application/json' } };

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// ═════════════════════════════════════════════════════════════════════════════
//  TSP SERVICE
// ═════════════════════════════════════════════════════════════════════════════

/** Great-circle distance (Haversine) — returns km */
function haversine(lat1, lon1, lat2, lon2) {
  const R   = 6371;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Build symmetric N×N distance matrix (Float64Array rows) */
function buildMatrix(points) {
  const n = points.length;
  const m = Array.from({ length: n }, () => new Float64Array(n));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = haversine(
        points[i].latitude, points[i].longitude,
        points[j].latitude, points[j].longitude,
      );
      m[i][j] = d;
      m[j][i] = d;
    }
  }
  return m;
}

/** Nearest-Neighbour greedy tour starting at index 0. Returns closed-loop. */
function nearestNeighbour(matrix) {
  const n       = matrix.length;
  const visited = new Uint8Array(n);
  const tour    = [0];
  visited[0]    = 1;
  for (let step = 1; step < n; step++) {
    const cur = tour[tour.length - 1];
    let best = -1, bestD = Infinity;
    for (let j = 0; j < n; j++) {
      if (!visited[j] && matrix[cur][j] < bestD) { bestD = matrix[cur][j]; best = j; }
    }
    tour.push(best);
    visited[best] = 1;
  }
  tour.push(0);
  return tour;
}

/** 2-Opt local search — mutates tour in-place, returns it. */
function twoOpt(tour, matrix) {
  const n = tour.length - 1;
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = tour[i - 1], b = tour[i], c = tour[j], d = tour[j + 1];
        if (matrix[a][c] + matrix[b][d] < matrix[a][b] + matrix[c][d] - 1e-10) {
          let lo = i, hi = j;
          while (lo < hi) { [tour[lo], tour[hi]] = [tour[hi], tour[lo]]; lo++; hi--; }
          improved = true;
        }
      }
    }
  }
  return tour;
}

/** Sum of all edges in a closed-loop tour */
function tourLength(tour, matrix) {
  let t = 0;
  for (let i = 0; i < tour.length - 1; i++) t += matrix[tour[i]][tour[i + 1]];
  return t;
}

/**
 * Full TSP pipeline.
 * Returns NN tour + timed 2-Opt tour with all metrics.
 */
function solveTSP(points) {
  const matrix = buildMatrix(points);

  // ── Nearest Neighbour ──────────────────────────────────────────────────────
  const t0NN  = process.hrtime.bigint();
  const nnTour = nearestNeighbour(matrix);
  const nnMs   = Number(process.hrtime.bigint() - t0NN) / 1e6;
  const nnDist = tourLength(nnTour, matrix);

  // ── 2-Opt ──────────────────────────────────────────────────────────────────
  const t0Opt  = process.hrtime.bigint();
  const optTour = twoOpt([...nnTour], matrix);
  const optMs   = Number(process.hrtime.bigint() - t0Opt) / 1e6;
  const optDist = tourLength(optTour, matrix);

  const efficiency = nnDist > 0
    ? parseFloat((((nnDist - optDist) / nnDist) * 100).toFixed(2))
    : 0;

  return {
    nnTour,
    nnDistance:         parseFloat(nnDist.toFixed(2)),
    nnExecutionMs:      parseFloat(nnMs.toFixed(3)),
    optimisedTour:      optTour,
    optimisedDistance:  parseFloat(optDist.toFixed(2)),
    twoOptExecutionMs:  parseFloat(optMs.toFixed(3)),
    efficiency,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
//  HELPERS
// ═════════════════════════════════════════════════════════════════════════════

/** Parse raw USGS GeoJSON features into clean earthquake objects */
function parseFeatures(features, sinceMs = null) {
  const cutoff = sinceMs ? Date.now() - sinceMs : null;
  return features
    .map(({ id, properties: p, geometry: g }) => ({
      id,
      magnitude: p.mag,
      place:     p.place || 'Unknown location',
      time:      p.time,
      depth:     g.coordinates[2],
      longitude: g.coordinates[0],
      latitude:  g.coordinates[1],
    }))
    .filter(
      (q) =>
        q.magnitude != null && !isNaN(q.magnitude) &&
        typeof q.longitude === 'number' && typeof q.latitude === 'number' &&
        (cutoff === null || q.time >= cutoff),
    );
}

/** Resolve timeframe string to { url, sinceMs } */
function resolveTimeframe(tf = '24h') {
  const key = USGS_FEEDS[tf] ? tf : '24h';
  return {
    url:     USGS_FEEDS[key],
    sinceMs: TIMEFRAME_MS[key],
  };
}

// ═════════════════════════════════════════════════════════════════════════════
//  ENDPOINTS
// ═════════════════════════════════════════════════════════════════════════════

// ── GET /api/stats ────────────────────────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  const { url, sinceMs } = resolveTimeframe(req.query.timeframe);
  try {
    const { data } = await axios.get(url, AXIOS_OPTS);
    const quakes   = parseFeatures(data.features, sinceMs);
    const mags     = quakes.map((q) => q.magnitude);
    const total    = quakes.length;

    return res.json({
      totalQuakes:  total,
      avgMagnitude: total ? parseFloat((mags.reduce((a, b) => a + b, 0) / total).toFixed(2)) : 0,
      maxMagnitude: total ? parseFloat(Math.max(...mags).toFixed(2)) : 0,
      minMagnitude: total ? parseFloat(Math.min(...mags).toFixed(2)) : 0,
      timestamp:    new Date().toISOString(),
      timeframe:    req.query.timeframe || '24h',
    });
  } catch (err) {
    console.error('[/api/stats]', err.message);
    return res.status(502).json({ error: 'Failed to fetch USGS stats.' });
  }
});

// ── GET /api/history ─────────────────────────────────────────────────────────
app.get('/api/history', async (req, res) => {
  const { url, sinceMs } = resolveTimeframe(req.query.timeframe || '7d');
  try {
    const { data } = await axios.get(url, AXIOS_OPTS);
    const quakes   = parseFeatures(data.features, sinceMs);

    const buckets = {};
    for (let i = 0; i <= 7; i++) buckets[`${i}-${i + 1}`] = 0;
    quakes.forEach(({ magnitude }) => {
      const floor = Math.min(Math.floor(magnitude), 7);
      buckets[`${floor}-${floor + 1}`] = (buckets[`${floor}-${floor + 1}`] || 0) + 1;
    });

    const bins  = Object.entries(buckets).map(([range, count]) => ({ range, count }));
    const times = quakes.map((q) => q.time).filter(Boolean);

    return res.json({
      bins,
      totalEvents: quakes.length,
      timeframe:   req.query.timeframe || '7d',
      dateRange: times.length
        ? { from: new Date(Math.min(...times)).toISOString(), to: new Date(Math.max(...times)).toISOString() }
        : null,
    });
  } catch (err) {
    console.error('[/api/history]', err.message);
    return res.status(502).json({ error: 'Failed to fetch USGS history.' });
  }
});

// ── GET /api/route ────────────────────────────────────────────────────────────
app.get('/api/route', async (req, res) => {
  const t0     = process.hrtime.bigint();
  const rawMag = req.query.minMag;
  const minMag = parseFloat(rawMag);

  if (!rawMag || isNaN(minMag)) {
    return res.status(400).json({ error: 'minMag must be a valid number.' });
  }

  const { url, sinceMs } = resolveTimeframe(req.query.timeframe);
  const execMs = () => parseFloat((Number(process.hrtime.bigint() - t0) / 1e6).toFixed(3));

  try {
    const { data }  = await axios.get(url, AXIOS_OPTS);
    const allQuakes = parseFeatures(data.features, sinceMs);

    const filtered = allQuakes
      .filter((q) => q.magnitude >= minMag)
      .sort((a, b) => b.magnitude - a.magnitude)
      .slice(0, MAX_ROUTE_POINTS);

    if (filtered.length === 0) {
      return res.json({
        route: [], nnRoute: [], totalDistanceKm: 0, nnDistanceKm: 0,
        optimisationEfficiency: 0, nnExecutionMs: 0, twoOptExecutionMs: 0,
        executionTimeMs: execMs(), timeframe: req.query.timeframe || '24h',
      });
    }

    if (filtered.length === 1) {
      return res.json({
        route: filtered, nnRoute: filtered, totalDistanceKm: 0, nnDistanceKm: 0,
        optimisationEfficiency: 0, nnExecutionMs: 0, twoOptExecutionMs: 0,
        executionTimeMs: execMs(), timeframe: req.query.timeframe || '24h',
      });
    }

    const {
      optimisedTour, optimisedDistance, nnTour, nnDistance,
      efficiency, nnExecutionMs, twoOptExecutionMs,
    } = solveTSP(filtered);

    return res.json({
      route:                  optimisedTour.slice(0, -1).map((idx) => filtered[idx]),
      nnRoute:                nnTour.slice(0, -1).map((idx) => filtered[idx]),
      totalDistanceKm:        optimisedDistance,
      nnDistanceKm:           nnDistance,
      optimisationEfficiency: efficiency,
      nnExecutionMs,
      twoOptExecutionMs,
      executionTimeMs:        execMs(),
      timeframe:              req.query.timeframe || '24h',
    });
  } catch (err) {
    console.error('[/api/route]', err.message);
    if (err.code === 'ECONNABORTED') return res.status(504).json({ error: 'USGS request timed out.' });
    if (err.response)               return res.status(502).json({ error: `USGS returned ${err.response.status}.` });
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── GET /health ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', version: '3.0.0', timestamp: new Date().toISOString() }),
);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found.' }));

// ─── Boot ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n[SEISMICA v3.0] ▸ http://localhost:${PORT}`);
  console.log('[Endpoints]');
  console.log('  GET /api/route?minMag=<n>&timeframe=<24h|48h|7d|30d>');
  console.log('  GET /api/stats?timeframe=<24h|48h|7d|30d>');
  console.log('  GET /api/history?timeframe=<7d|30d>');
  console.log('  GET /health\n');
});
