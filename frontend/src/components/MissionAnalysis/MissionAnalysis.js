import React, { memo, useMemo } from 'react';
import { fmt, fmtPct, fmtMs } from '../../utils/formatters';
import { calcMission } from '../../utils/formatters';

export default memo(function MissionAnalysis({ result, droneParams }) {
  const analysis = useMemo(() => {
    if (!result || !result.route?.length) return null;

    const { route, totalDistanceKm, nnDistanceKm, optimisationEfficiency, executionTimeMs } = result;
    const mission = calcMission(
      totalDistanceKm,
      droneParams.capacityWh,
      droneParams.maxRangeKm,
      droneParams.whPerKm,
      droneParams.speedKmh,
    );

    const mags     = route.map((q) => q.magnitude).filter(Boolean);
    const avgMag   = mags.length ? (mags.reduce((a, b) => a + b, 0) / mags.length).toFixed(2) : '—';
    const maxMag   = mags.length ? Math.max(...mags).toFixed(1) : '—';
    const major    = route.filter((q) => q.magnitude >= 6.0).length;
    const feasible = mission?.feasible ?? true;

    return { route, totalDistanceKm, nnDistanceKm, optimisationEfficiency, executionTimeMs, mission, avgMag, maxMag, major, feasible };
  }, [result, droneParams]);

  if (!analysis) return null;
  const { route, totalDistanceKm, optimisationEfficiency, executionTimeMs, mission, avgMag, maxMag, major, feasible } = analysis;

  const statusColor = feasible ? 'var(--success)' : 'var(--critical)';
  const statusLabel = feasible ? 'MISSION SUCCESS' : 'MISSION FAILURE';

  return (
    <div className="glass-panel" style={{
      padding:   '14px 16px',
      border:    `1px solid ${feasible ? 'rgba(0,255,136,0.2)' : 'rgba(255,59,59,0.3)'}`,
      animation: 'slide-in-up 0.4s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>MISSION ANALYSIS</div>
        <div style={{
          fontFamily:    'var(--font-display)',
          fontSize:      8,
          fontWeight:    700,
          color:         statusColor,
          letterSpacing: '0.18em',
          padding:       '3px 8px',
          background:    feasible ? 'var(--success-dim)' : 'var(--critical-dim)',
          borderRadius:  3,
          border:        `1px solid ${statusColor}`,
        }}>
          {statusLabel}
        </div>
      </div>

      {/* Auto-generated summary */}
      <div style={{
        fontFamily:   'var(--font-mono)',
        fontSize:     10,
        color:        'var(--text)',
        lineHeight:   1.7,
        padding:      '10px 12px',
        background:   'var(--bg-card)',
        borderRadius: 4,
        border:       '1px solid var(--border)',
        marginBottom: 10,
      }}>
        <span style={{ color: 'var(--accent)' }}>{route.length}</span> seismic events detected across active timeframe.{' '}
        2-Opt reduced total route distance by{' '}
        <span style={{ color: 'var(--success)' }}>{fmtPct(optimisationEfficiency)}</span>.{' '}
        Avg magnitude <span style={{ color: 'var(--warning)' }}>M{avgMag}</span>,
        peak <span style={{ color: 'var(--critical)' }}>M{maxMag}</span>
        {major > 0 && `, ${major} major event${major > 1 ? 's' : ''} (M≥6.0)`}.{' '}
        {mission && <>Estimated battery usage: <span style={{ color: mission.feasible ? 'var(--success)' : 'var(--critical)' }}>{fmtPct(mission.batteryUsedPct)}</span>. </>}
        Algorithm resolved in <span style={{ color: 'var(--accent)' }}>{fmtMs(executionTimeMs)}</span>.{' '}
        Mission classified as{' '}
        <span style={{ color: statusColor, fontWeight: 700 }}>{feasible ? 'SUCCESS' : 'FAILURE'}</span>.
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        {[
          { label: 'WAYPOINTS',  value: route.length,                          color: 'var(--accent)'   },
          { label: 'DISTANCE',   value: `${fmt(totalDistanceKm)} km`,           color: 'var(--accent)'   },
          { label: 'EFFICIENCY', value: fmtPct(optimisationEfficiency),         color: 'var(--success)'  },
          { label: 'STATUS',     value: feasible ? 'SUCCESS' : 'FAILURE',       color: statusColor       },
        ].map(({ label, value, color }) => (
          <div key={label} className="metric-card" style={{ padding: '7px 8px' }}>
            <div className="metric-label">{label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
});
