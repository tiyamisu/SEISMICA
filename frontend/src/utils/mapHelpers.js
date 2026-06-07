// ─── Magnitude → visual properties ───────────────────────────────────────────

export const magToColor = (mag) => {
  if (mag >= 6.0) return '#ff3b3b';
  if (mag >= 5.0) return '#ff7700';
  if (mag >= 4.0) return '#ffae00';
  return '#00ff88';
};

export const magToRadius = (mag) => Math.max(4, (mag / 10) * 30);

export const magToLabel = (mag) => {
  if (mag >= 6.0) return 'MAJOR';
  if (mag >= 5.0) return 'STRONG';
  if (mag >= 4.0) return 'MODERATE';
  return 'MINOR';
};

// ─── Coordinate formatting ────────────────────────────────────────────────────

export const fmtCoord = (n, decimals = 3) =>
  n == null ? '—' : Number(n).toFixed(decimals);

export const fmtLatLon = (lat, lon) =>
  `${fmtCoord(lat)}°, ${fmtCoord(lon)}°`;

// ─── Map bounds padding ───────────────────────────────────────────────────────

export const DEFAULT_CENTER = [20, 0];
export const DEFAULT_ZOOM   = 2;
