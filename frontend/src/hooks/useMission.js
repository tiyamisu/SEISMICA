import { useState, useCallback, useRef } from 'react';
import { api } from '../services/api';

// 5 steps in the dispatch pipeline
export const STEPS = [
  'Fetching Seismic Data',
  'Generating Initial Route',
  'Running 2-Opt Optimization',
  'Calculating Mission Metrics',
  'Mission Ready',
];

export const STATUS = {
  IDLE:    'IDLE',
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR:   'ERROR',
};

/**
 * Manages the full route dispatch state machine.
 * Now stores both the 2-Opt optimised route AND the raw NN route
 * so the map can render both polylines simultaneously.
 */
export function useMission() {
  const [status,     setStatus]     = useState(STATUS.IDLE);
  const [stepIndex,  setStepIndex]  = useState(-1);
  const [error,      setError]      = useState('');
  const [result,     setResult]     = useState(null);
  const [quakes,     setQuakes]     = useState([]);       // 2-Opt ordered waypoints
  const [polyline,   setPolyline]   = useState([]);       // 2-Opt closed-loop coords
  const [nnQuakes,   setNnQuakes]   = useState([]);       // NN ordered waypoints
  const [nnPolyline, setNnPolyline] = useState([]);       // NN closed-loop coords

  const timerRef = useRef(null);

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const advanceStep = useCallback((idx, delay = 380) => {
    return new Promise((resolve) => {
      timerRef.current = setTimeout(() => {
        setStepIndex(idx);
        resolve();
      }, delay);
    });
  }, []);

  const dispatch = useCallback(async (minMag, timeframe) => {
    clearTimers();
    setStatus(STATUS.LOADING);
    setError('');
    setResult(null);
    setQuakes([]);
    setPolyline([]);
    setNnQuakes([]);
    setNnPolyline([]);

    try {
      await advanceStep(0, 0);                     // Step 0 — Fetching
      const data = await api.route(minMag, timeframe);

      await advanceStep(1, 300);                   // Step 1 — NN done
      await advanceStep(2, 400);                   // Step 2 — 2-Opt done
      await advanceStep(3, 350);                   // Step 3 — Metrics

      // ── 2-Opt optimised route ─────────────────────────────────────────────
      const route = data.route || [];
      setQuakes(route);
      setResult(data);

      if (route.length > 0) {
        const coords = route.map((q) => [q.latitude, q.longitude]);
        coords.push(coords[0]);
        setPolyline(coords);
      }

      // ── Nearest Neighbour route ───────────────────────────────────────────
      const nnRoute = data.nnRoute || [];
      setNnQuakes(nnRoute);

      if (nnRoute.length > 0) {
        const nnCoords = nnRoute.map((q) => [q.latitude, q.longitude]);
        nnCoords.push(nnCoords[0]);
        setNnPolyline(nnCoords);
      }

      await advanceStep(4, 300);                   // Step 4 — Ready
      setStatus(STATUS.SUCCESS);
    } catch (err) {
      setError(err.message);
      setStatus(STATUS.ERROR);
      setStepIndex(-1);
    }
  }, [advanceStep]);

  const reset = useCallback(() => {
    clearTimers();
    setStatus(STATUS.IDLE);
    setStepIndex(-1);
    setError('');
    setResult(null);
    setQuakes([]);
    setPolyline([]);
    setNnQuakes([]);
    setNnPolyline([]);
  }, []);

  return {
    status, stepIndex, error, result,
    quakes,    polyline,          // 2-Opt (optimised)
    nnQuakes,  nnPolyline,        // Nearest Neighbour
    dispatch, reset,
    isLoading: status === STATUS.LOADING,
    isSuccess: status === STATUS.SUCCESS,
  };
}
