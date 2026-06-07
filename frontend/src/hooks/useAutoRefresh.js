import { useState, useEffect, useCallback, useRef } from 'react';

// Auto-refresh every 15 minutes
export const REFRESH_INTERVAL_MS = 15 * 60 * 1000;

export const SYNC_STATUS = {
  IDLE:       'IDLE',
  SYNCING:    'SYNCING',
  RECOMPUTED: 'RECOMPUTED',
  UPDATED:    'UPDATED',
  ERROR:      'ERROR',
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Manages automatic 15-minute USGS data refresh with:
 *   - Real-time countdown to next refresh
 *   - Status notifications (SYNCING → RECOMPUTED → UPDATED)
 *   - Manual refresh trigger that resets the timer
 *   - Graceful error handling (last known data preserved)
 *
 * @param {Function} refreshFn  Async function to call on each refresh cycle.
 *                              Should resolve on success, reject on failure.
 *                              Updated via ref — always captures latest closure.
 * @param {boolean}  enabled    Pass false to suspend auto-refresh (e.g. before first dispatch).
 */
export function useAutoRefresh(refreshFn, enabled = false) {
  const [syncStatus,  setSyncStatus]  = useState(SYNC_STATUS.IDLE);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [countdown,   setCountdown]   = useState(REFRESH_INTERVAL_MS);
  const [errorMsg,    setErrorMsg]    = useState('');

  // Keep refreshFn ref always current (avoids stale closures)
  const refreshFnRef  = useRef(refreshFn);
  const enabledRef    = useRef(enabled);
  const nextAtRef     = useRef(Date.now() + REFRESH_INTERVAL_MS);
  const intervalRef   = useRef(null);
  const countdownRef  = useRef(null);
  const runningRef    = useRef(false);   // prevent concurrent runs

  useEffect(() => { refreshFnRef.current = refreshFn; }, [refreshFn]);
  useEffect(() => { enabledRef.current   = enabled;   }, [enabled]);

  // ── Core refresh execution ─────────────────────────────────────────────────
  const doRefresh = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;

    setSyncStatus(SYNC_STATUS.SYNCING);
    setErrorMsg('');
    try {
      await refreshFnRef.current();
      setSyncStatus(SYNC_STATUS.RECOMPUTED);
      await delay(1200);
      setSyncStatus(SYNC_STATUS.UPDATED);
      setLastUpdated(new Date());
      await delay(2200);
    } catch (err) {
      setErrorMsg(err?.message || 'Unable to reach USGS servers.');
      setSyncStatus(SYNC_STATUS.ERROR);
      await delay(3500);
    }

    setSyncStatus(SYNC_STATUS.IDLE);
    // Reset the countdown
    nextAtRef.current = Date.now() + REFRESH_INTERVAL_MS;
    setCountdown(REFRESH_INTERVAL_MS);
    runningRef.current = false;
  }, []);

  // ── 1-second countdown ticker ──────────────────────────────────────────────
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setCountdown(Math.max(0, nextAtRef.current - Date.now()));
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, []);

  // ── 15-minute auto-refresh interval (only when enabled) ───────────────────
  useEffect(() => {
    if (!enabled) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      doRefresh();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalRef.current);
  }, [enabled, doRefresh]);

  // ── Manual trigger — resets timer ─────────────────────────────────────────
  const manualRefresh = useCallback(() => {
    // Reset auto timer
    clearInterval(intervalRef.current);
    nextAtRef.current = Date.now() + REFRESH_INTERVAL_MS;
    setCountdown(REFRESH_INTERVAL_MS);

    doRefresh().then(() => {
      if (enabledRef.current) {
        intervalRef.current = setInterval(doRefresh, REFRESH_INTERVAL_MS);
      }
    });
  }, [doRefresh]);

  return {
    syncStatus,
    lastUpdated,
    countdown,
    errorMsg,
    manualRefresh,
  };
}

/** Format countdown ms → "Xm Ys" */
export function fmtCountdown(ms) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

/** Format a Date → "HH:MM AM/PM" local time */
export function fmtTime(d) {
  if (!d) return '—';
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}
