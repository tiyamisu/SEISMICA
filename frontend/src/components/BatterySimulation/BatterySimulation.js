import React, { memo, useMemo } from 'react';
import { calcMission, fmt, fmtPct } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

// ── SVG Battery Arc ───────────────────────────────────────────────────────────
function BatteryGauge({ pct, feasible, theme, isDark }) {
  const r    = 36;
  const cx   = 50;
  const cy   = 50;
  const circ = 2 * Math.PI * r;
  const dash  = (Math.min(pct, 100) / 100) * circ;
  const color = pct > 60 ? theme.success : pct > 30 ? theme.warning : theme.critical;

  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--battery-gauge-track)" strokeWidth={7} />
      {/* Fill */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeWidth={7}
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        style={{
          filter:     isDark ? `drop-shadow(0 0 4px ${color})` : 'none',
          transition: 'stroke-dasharray 0.6s ease',
        }}
      />
      {/* Label */}
      <text x={cx} y={cy - 4} textAnchor="middle" fill={color}
        style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>
        {Math.round(pct)}%
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--text-muted)"
        style={{ fontFamily: 'var(--font-mono)', fontSize: 7 }}>
        {feasible ? 'NOMINAL' : 'CRITICAL'}
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default memo(function BatterySimulation({ totalDistKm, droneParams }) {
  const { isDark, theme } = useTheme();
  const mission = useMemo(() => {
    if (!totalDistKm) return null;
    return calcMission(
      totalDistKm,
      droneParams.capacityWh,
      droneParams.maxRangeKm,
      droneParams.whPerKm,
      droneParams.speedKmh,
    );
  }, [totalDistKm, droneParams]);

  return (
    <div className="glass-panel" style={{ padding: '14px 16px' }}>
      <div className="section-title">BATTERY &amp; RANGE SIMULATION</div>

      {!mission ? (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
          DISPATCH MISSION TO SIMULATE
        </div>
      ) : (
        <>
          {/* Critical alert */}
          {!mission.feasible && (
            <div className="alert-critical-card" style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: 'var(--critical)', letterSpacing: '0.15em' }}>
                ⚠ MISSION FAILURE
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--critical)', marginTop: 4 }}>
                {mission.overRange
                  ? `ROUTE (${fmt(totalDistKm)} km) EXCEEDS MAX RANGE (${fmt(droneParams.maxRangeKm)} km)`
                  : 'INSUFFICIENT BATTERY CAPACITY FOR THIS ROUTE'
                }
              </div>
            </div>
          )}

          {/* Gauge + stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <BatteryGauge pct={mission.batteryUsedPct} feasible={mission.feasible} theme={theme} isDark={isDark} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'STATUS',     value: mission.feasible ? 'FEASIBLE' : 'FAILURE', color: mission.feasible ? 'var(--success)' : 'var(--critical)' },
                { label: 'BATTERY USED', value: fmtPct(mission.batteryUsedPct), color: mission.batteryUsedPct > 80 ? 'var(--critical)' : 'var(--warning)' },
                { label: 'REMAINING',  value: fmtPct(mission.remainingPct),    color: 'var(--success)' },
                { label: 'ETA',        value: `${mission.etaMinutes} min`,      color: 'var(--accent)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
});
