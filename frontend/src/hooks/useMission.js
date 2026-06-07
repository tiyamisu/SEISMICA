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
  IDLE:      'IDLE',
  LOADING:   'LOADING',
  SUCCESS:   'SUCCESS',
  ERROR:     'ERROR',
};

/**
 * Manages the full route dispatch state machine including
 * step-by-step progress simulation and result storage.
 */
export function useMission() {
  const [status,     setStatus]     = useState(STATUS.IDLE);
  const [stepIndex,  setStepIndex]  = useState(-1);
  const [error,      setError]      = useState('');
  const [result,     setResult]     = useState(null); // full API response
  const [quakes,     setQuakes]     = useState([]);
  const [polyline,   setPolyline]   = useState([]);

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

    try {
      // Step 0 — Fetching
      await advanceStep(0, 0);

      const data = await api.route(minMag, timeframe);

      // Step 1 — NN done (backend already ran it)
      await advanceStep(1, 300);

      // Step 2 — 2-Opt done
      await advanceStep(2, 400);

      // Step 3 — Metrics
      await advanceStep(3, 350);

      const route = data.route || [];

      setQuakes(route);
      setResult(data);

      if (route.length > 0) {
        const coords = route.map((q) => [q.latitude, q.longitude]);
        coords.push(coords[0]);
        setPolyline(coords);
      }

      // Step 4 — Ready
      await advanceStep(4, 300);
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
  }, []);

  return {
    status, stepIndex, error, result, quakes, polyline,
    dispatch, reset,
    isLoading: status === STATUS.LOADING,
    isSuccess: status === STATUS.SUCCESS,
  };
}
