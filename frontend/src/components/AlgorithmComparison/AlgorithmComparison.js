import React, { memo } from 'react';
import { fmt, fmtMs, fmtPct } from '../../utils/formatters';

// ── Individual metric card ────────────────────────────────────────────────────
function MetricCard({ label, value, unit, color = 'var(--accent)' }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value" style={{ color, fontSize: 14 }}>
        {value}
        {unit && <span className="metric-unit">{unit}</span>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default memo(function AlgorithmComparison({ result }) {
  if (!result || !result.route?.length) return null;

  const {
    nnDistanceKm, totalDistanceKm,
    nnExecutionMs, twoOptExecutionMs,
    optimisationEfficiency,
  } = result;

  const distSaved = nnDistanceKm && totalDistanceKm
    ? parseFloat((nnDistanceKm - totalDistanceKm).toFixed(2))
    : 0;

  const timeDiff = nnExecutionMs != null && twoOptExecutionMs != null
    ? parseFloat((twoOptExecutionMs - nnExecutionMs).toFixed(3))
    : null;

  return (
    <div className="glass-panel" style={{ padding: '14px 16px' }}>
      <div className="section-title">ALGORITHM COMPARISON</div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>

        {/* NN column */}
        <div style={{ padding: '10px', background: 'rgba(149, 224, 222, 0.08)', borderRadius: 6, border: '1px solid rgba(149, 224, 222, 0.35)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 7, color: 'var(--success)', letterSpacing: '0.18em', marginBottom: 8 }}>
            NEAREST NEIGHBOR
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>
            {fmt(nnDistanceKm)} <span style={{ fontSize: 8, fontWeight: 400, color: 'var(--text-muted)' }}>km</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>
            {fmtMs(nnExecutionMs)}
          </div>
        </div>

        {/* 2-Opt column */}
        <div style={{ padding: '10px', background: 'rgba(240, 55, 165, 0.08)', borderRadius: 6, border: '1px solid rgba(240, 55, 165, 0.35)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 7, color: 'var(--warning)', letterSpacing: '0.18em', marginBottom: 8 }}>
            2-OPT OPTIMIZED
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--warning)' }}>
            {fmt(totalDistanceKm)} <span style={{ fontSize: 8, fontWeight: 400, color: 'var(--text-muted)' }}>km</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>
            {fmtMs(twoOptExecutionMs)}
          </div>
        </div>
      </div>

      {/* Delta bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)' }}>OPTIMISATION GAIN</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: 'var(--success)' }}>
            {fmtPct(optimisationEfficiency)}
          </span>
        </div>
        <div style={{ height: 3, borderRadius: 2, background: 'var(--bg-card)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width:  `${Math.min(optimisationEfficiency || 0, 100)}%`,
            background: 'linear-gradient(90deg, var(--accent), var(--success))',
            borderRadius: 2,
            transition: 'width 0.6s ease',
            boxShadow: '0 0 8px var(--accent-glow)',
          }} />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        <MetricCard label="DIST SAVED" value={fmt(distSaved)} unit="km" color="var(--success)" />
        <MetricCard label="GAIN %" value={fmtPct(optimisationEfficiency)} color="var(--success)" />
        <MetricCard label="2-OPT OVERHEAD" value={timeDiff != null ? (timeDiff >= 0 ? `+${fmtMs(timeDiff)}` : fmtMs(timeDiff)) : '—'} color="var(--accent)" />
      </div>
    </div>
  );
});
