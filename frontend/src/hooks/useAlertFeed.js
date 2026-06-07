import { useState, useCallback, useRef } from 'react';

const MAX_FEED_ITEMS = 80;

/**
 * Manages the live mission intelligence alert feed.
 * Generates entries from earthquake data and auto-scrolls.
 */
export function useAlertFeed() {
  const [entries, setEntries] = useState([]);
  const idRef = useRef(0);

  const addEntry = useCallback((mag, place, type = 'ALERT') => {
    const id   = ++idRef.current;
    const ts   = new Date().toISOString().slice(11, 19);
    const entry = { id, mag, place, type, ts };
    setEntries((prev) => {
      const next = [entry, ...prev];
      return next.slice(0, MAX_FEED_ITEMS);
    });
  }, []);

  const populateFromRoute = useCallback((quakes) => {
    if (!quakes?.length) return;
    // Add entries one by one with staggered delay for live-feed feel
    quakes.forEach((q, i) => {
      setTimeout(() => {
        const level = q.magnitude >= 6 ? 'CRITICAL' : q.magnitude >= 5 ? 'WARNING' : 'ALERT';
        addEntry(q.magnitude, q.place, level);
      }, i * 120);
    });
  }, [addEntry]);

  const clear = useCallback(() => setEntries([]), []);

  return { entries, populateFromRoute, addEntry, clear };
}
