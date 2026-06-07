// ─── Number formatting ────────────────────────────────────────────────────────

export const fmt = (n, decimals = 2) =>
  n == null ? '—' : Number(n).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

export const fmtInt = (n) =>
  n == null ? '—' : Math.round(n).toLocaleString('en-US');

export const fmtMs = (ms) => {
  if (ms == null) return '—';
  return ms < 1000 ? `${Number(ms).toFixed(2)} ms` : `${(ms / 1000).toFixed(2)} s`;
};

export const fmtPct = (n) =>
  n == null ? '—' : `${Number(n).toFixed(1)}%`;

// ─── Date / time formatting ───────────────────────────────────────────────────

export const fmtTimestamp = (epochMs) => {
  if (!epochMs) return '—';
  const d = new Date(epochMs);
  return d.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
};

export const fmtUtcClock = (date = new Date()) =>
  date.toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' }) + ' UTC';

export const fmtUtcDate = (date = new Date()) =>
  date.toLocaleDateString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).toUpperCase();

// ─── Battery / mission helpers ────────────────────────────────────────────────

/**
 * Calculate drone mission feasibility.
 * @param {number} distKm     - Total flight distance in km
 * @param {number} capacityWh - Battery capacity in Wh
 * @param {number} maxRangeKm - Maximum drone range in km
 * @param {number} wh_per_km  - Energy consumption in Wh/km
 * @param {number} speedKmh   - Cruise speed in km/h
 */
export const calcMission = (distKm, capacityWh, maxRangeKm, wh_per_km, speedKmh) => {
  if (!distKm || distKm === 0) return null;
  const energyUsed     = distKm * wh_per_km;
  const batteryUsedPct = Math.min(100, (energyUsed / capacityWh) * 100);
  const remainingPct   = Math.max(0, 100 - batteryUsedPct);
  const etaHours       = distKm / speedKmh;
  const feasible       = distKm <= maxRangeKm && batteryUsedPct < 100;

  return {
    energyUsed:     parseFloat(energyUsed.toFixed(1)),
    batteryUsedPct: parseFloat(batteryUsedPct.toFixed(1)),
    remainingPct:   parseFloat(remainingPct.toFixed(1)),
    etaHours:       parseFloat(etaHours.toFixed(2)),
    etaMinutes:     Math.round(etaHours * 60),
    feasible,
    overRange:      distKm > maxRangeKm,
    overEnergy:     batteryUsedPct >= 100,
  };
};
