'use strict';

const express = require('express');
const cors    = require('cors');
const axios   = require('axios');

const app  = express();
const PORT = 5000;

// ─── USGS Feed URLs ───────────────────────────────────────────────────────────

const USGS = {
  ALL_DAY:  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
  ALL_WEEK: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson',
};

const MAX_ROUTE_POINTS = 40;
const AXIOS_OPTS = { timeout: 12_000, headers: { Accept: 'application/json' } };

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// ═════════════════════════════════════════════════════════════════════════════
//  TSP SERVICE
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Great-circle distance between two lat/lon points (Haversine).
 * @returns {number} Distance in km
 */
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

/**
 * Build a symmetric N×N distance matrix from an array of {latitude, longitude}.
 */
function buildMatrix(points) {
  const n = points.length;
  const m = Array.from({ length: n }, () => new Float64Array(n));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = haversine(points[i].latitude, points[i].longitude,
                          points[j].latitude, points[j].longitude);
      m[i][j] = d;
      m[j][i] = d;
    }
  }
  return m;
}

/**
 * Nearest-Neighbour heuristic — O(n²) greedy tour starting at index 0.
 * Returns a closed-loop index array (first === last).
 */
function nearestNeighbour(matrix) {
  const n       = matrix.length;
  const visited = new Uint8Array(n);
  const tour    = [0];
  visited[0]    = 1;

  for (let step = 1; step < n; step++) {
    const cur = tour[tour.length - 1];
    let best  = -1;
    let bestD = Infinity;
    for (let j = 0; j < n; j++) {
      if (!visited[j] && matrix[cur][j] < bestD) {
        bestD = matrix[cur][j];
        best  = j;
      }
    }
    tour.push(best);
    visited[best] = 1;
  }
  tour.push(0);
  return tour;
}

/**
 * 2-Opt local search — iteratively reverses sub-segments until no improvement.
 * Mutates `tour` in-place and returns it.
 */
function twoOpt(tour, matrix) {
  const n = tour.length - 1; // city count (tour[0] === tour[n])
  let improved = true;

  while (improved) {
    improved = false;
    for (let i = 1; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = tour[i - 1], b = tour[i];
        const c = tour[j],     d = tour[j + 1];
        if (matrix[a][c] + matrix[b][d] < matrix[a][b] + matrix[c][d] - 1e-10) {
          // Reverse segment [i … j]
          let lo = i, hi = j;
          while (lo < hi) { [tour[lo], tour[hi]] = [tour[hi], tour[lo]]; lo++; hi--; }
          improved = true;
        }
      }
    }
  }
  return tour;
}

/** Sum of all edges in a closed-loop tour. */
function tourLength(tour, matrix) {
  let total = 0;
  for (let i = 0; i < tour.length - 1; i++) total += matrix[tour[i]][tour[i + 1]];
  return total;
}

/**
 * Full TSP pipeline.
 * @param {Array} points  - Array of {latitude, longitude, …}
 * @returns {{ nnTour, nnDistance, optimisedTour, optimisedDistance, efficiency }}
 */
function solveTSP(points) {
  const matrix = buildMatrix(points);

  // Nearest-Neighbour baseline
  const nnTour   = nearestNeighbour(matrix);
  const nnDist   = parseFloat(tourLength(nnTour, matrix).toFixed(2));

  // 2-Opt on a copy
  const optTour  = twoOpt([...nnTour], matrix);
  const optDist  = parseFloat(tourLength(optTour, matrix).toFixed(2));

  // Efficiency: percentage distance saved vs NN-only
  const efficiency = nnDist > 0
    ? parseFloat((((nnDist - optDist) / nnDist) * 100).toFixed(2))
    : 0;

  return { nnTour, nnDistance: nnDist, optimisedTour: optTour, optimisedDistance: optDist, efficiency, matrix };
}

// ═════════════════════════════════════════════════════════════════════════════
//  DATA PARSER
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Parse raw USGS GeoJSON features into clean earthquake objects.
 * Filters out entries with null / NaN coordinates or magnitudes.
 */
function parseFeatures(features) {
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
        typeof q.longitude === 'number' && typeof q.latitude === 'number'
    );
}

// ═════════════════════════════════════════════════════════════════════════════
//  ENDPOINTS
// ═════════════════════════════════════════════════════════════════════════════

// ── /api/stats ────────────────────────────────────────────────────────────────
app.get('/api/stats', async (_req, res) => {
  try {
    const { data } = await axios.get(USGS.ALL_DAY, AXIOS_OPTS);
    const quakes   = parseFeatures(data.features);

    const mags        = quakes.map((q) => q.magnitude);
    const totalQuakes = quakes.length;
    const avgMag      = totalQuakes ? parseFloat((mags.reduce((a, b) => a + b, 0) / totalQuakes).toFixed(2)) : 0;
    const maxMag      = totalQuakes ? parseFloat(Math.max(...mags).toFixed(2)) : 0;
    const minMag      = totalQuakes ? parseFloat(Math.min(...mags).toFixed(2)) : 0;

    return res.json({
      totalQuakes,
      avgMagnitude: avgMag,
      maxMagnitude: maxMag,
      minMagnitude: minMag,
      timestamp:    new Date().toISOString(),
    });
  } catch (err) {
    console.error('[/api/stats]', err.message);
    return res.status(502).json({ error: 'Failed to fetch USGS stats.' });
  }
});

// ── /api/history ─────────────────────────────────────────────────────────────
app.get('/api/history', async (_req, res) => {
  try {
    const { data } = await axios.get(USGS.ALL_WEEK, AXIOS_OPTS);
    const quakes   = parseFeatures(data.features);

    // Bin by integer magnitude floor (0-1, 1-2, … 7+)
    const buckets = {};
    for (let i = 0; i <= 7; i++) buckets[`${i}-${i + 1}`] = 0;

    quakes.forEach(({ magnitude }) => {
      const floor = Math.min(Math.floor(magnitude), 7);
      const key   = `${floor}-${floor + 1}`;
      buckets[key] = (buckets[key] || 0) + 1;
    });

    const bins = Object.entries(buckets).map(([range, count]) => ({ range, count }));

    const times    = quakes.map((q) => q.time).filter(Boolean);
    const dateRange = times.length
      ? { from: new Date(Math.min(...times)).toISOString(), to: new Date(Math.max(...times)).toISOString() }
      : null;

    return res.json({ bins, totalEvents: quakes.length, dateRange });
  } catch (err) {
    console.error('[/api/history]', err.message);
    return res.status(502).json({ error: 'Failed to fetch USGS history.' });
  }
});

// ── /api/route ────────────────────────────────────────────────────────────────
app.get('/api/route', async (req, res) => {
  const t0     = process.hrtime.bigint();
  const rawMag = req.query.minMag;
  const minMag = parseFloat(rawMag);

  if (!rawMag || isNaN(minMag)) {
    return res.status(400).json({ error: 'minMag must be a valid number.' });
  }

  try {
    const { data } = await axios.get(USGS.ALL_DAY, AXIOS_OPTS);
    const allQuakes = parseFeatures(data.features);

    const filtered = allQuakes
      .filter((q) => q.magnitude >= minMag)
      .sort((a, b) => b.magnitude - a.magnitude)
      .slice(0, MAX_ROUTE_POINTS);

    const execMs = () => parseFloat((Number(process.hrtime.bigint() - t0) / 1e6).toFixed(3));

    if (filtered.length === 0) {
      return res.json({ route: [], totalDistanceKm: 0, nnDistanceKm: 0, optimisationEfficiency: 0, executionTimeMs: execMs() });
    }
    if (filtered.length === 1) {
      return res.json({ route: filtered, totalDistanceKm: 0, nnDistanceKm: 0, optimisationEfficiency: 0, executionTimeMs: execMs() });
    }

    const { optimisedTour, optimisedDistance, nnDistance, efficiency } = solveTSP(filtered);

    const route = optimisedTour.slice(0, -1).map((idx) => filtered[idx]);

    return res.json({
      route,
      totalDistanceKm:        optimisedDistance,
      nnDistanceKm:           nnDistance,
      optimisationEfficiency: efficiency,
      executionTimeMs:        execMs(),
    });
  } catch (err) {
    console.error('[/api/route]', err.message);
    if (err.code === 'ECONNABORTED') return res.status(504).json({ error: 'USGS request timed out.' });
    if (err.response)               return res.status(502).json({ error: `USGS returned ${err.response.status}.` });
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found.' }));

// ─── Boot ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n[Seismica] ▸ http://localhost:${PORT}`);
  console.log('[Seismica] Endpoints:');
  console.log('  GET /api/route?minMag=<n>  — TSP-optimised flight path');
  console.log('  GET /api/stats             — Real-time global stats');
  console.log('  GET /api/history           — 7-day magnitude histogram');
  console.log('  GET /health\n');
});
