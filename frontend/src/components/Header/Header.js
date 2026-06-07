import React, { useState, useEffect } from 'react';
import { fmtUtcClock, fmtUtcDate, fmt } from '../../utils/formatters';

// ── Seismic waveform SVG logo (replicates uploaded inspiration) ───────────────
function SeismicLogo() {
  const rings = [1.4, 1.85, 2.3];
  return (
    <div style={{
      position:     'relative',
      width:        32,
      height:       32,
      flexShrink:   0,
    }}>
      {/* Concentric pulse rings */}
      {rings.map((scale, i) => (
        <div key={i} style={{
          position:      'absolute',
          inset:         0,
          borderRadius:  '50%',
          background:    `rgba(149, 224, 222, ${0.18 - i * 0.05})`,
          transform:     `scale(${scale})`,
          transformOrigin: 'center',
          animation:     `pulse-ring ${2 + i * 0.5}s ease-out infinite`,
          pointerEvents: 'none',
        }} />
      ))}
      {/* Core circle */}
      <div style={{
        position:     'absolute',
        inset:        '25%',
        borderRadius: '50%',
        background:   'linear-gradient(135deg, #4100F5, #95E0DE)',
        boxShadow:    '0 0 16px rgba(65, 0, 245, 0.7)',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
      }}>
        {/* Heartbeat / seismic wave SVG */}
        <svg viewBox="0 0 36 20" width="22" height="12" style={{ overflow: 'visible' }}>
          <polyline
            points="0,10 6,10 9,2 12,18 15,10 21,10 24,5 27,15 30,10 36,10"
            fill="none"
            stroke="#CDF354"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

// ── Single stat cell ──────────────────────────────────────────────────────────
function StatCell({ label, value, color = 'var(--accent)' }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily:    'var(--font-display)',
        fontSize:      '7px',
        letterSpacing: '0.18em',
        color:         'var(--text-muted)',
        marginBottom:  4,
      }}>{label}</div>
      <div style={{
        fontFamily:    'var(--font-display)',
        fontSize:      '15px',
        fontWeight:    700,
        color,
        textShadow:    `0 0 10px ${color}50`,
        animation:     'count-up 0.4s ease',
      }}>{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Header({ stats, statsLoading, timeframe }) {
  const [tick, setTick] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTick(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header style={{
      gridArea:       'topbar',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
      padding:        '0 20px',
      background:     '#191414',
      borderBottom:   '1px solid var(--border)',
      position:       'relative',
      overflow:       'hidden',
      zIndex:         200,
    }}>

      {/* Scanline effect */}
      <div style={{
        position:       'absolute',
        inset:          0,
        background:     'linear-gradient(transparent 50%, rgba(149, 224, 222, 0.015) 50%)',
        backgroundSize: '100% 4px',
        pointerEvents:  'none',
        zIndex:         0,
      }} />

      {/* Left: Logo + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, zIndex: 1 }}>
        <SeismicLogo />
        <div>
          <div style={{
            fontFamily:    'var(--font-display)',
            fontSize:      '22px',
            fontWeight:    900,
            letterSpacing: '0.45em',
            color:         'var(--accent)',
            textShadow:    '0 0 24px rgba(205, 243, 84, 0.35), 0 0 48px rgba(65, 0, 245, 0.2)',
            lineHeight:    1,
          }}>
            SEISMICA
          </div>
          <div style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      '8px',
            letterSpacing: '0.2em',
            color:         'var(--text-muted)',
            marginTop:     4,
          }}>
            COMMAND CENTER · v3.0
          </div>
        </div>
      </div>

      {/* Center: Live stats */}
      <div style={{
        display:    'flex',
        gap:        28,
        zIndex:     1,
        padding:    '0 20px',
        borderLeft: '1px solid var(--border)',
        borderRight:'1px solid var(--border)',
      }}>
        <StatCell
          label="ACTIVE QUAKES"
          value={statsLoading ? '…' : fmt(stats?.totalQuakes, 0) || '—'}
          color="var(--text)"
        />
        <StatCell
          label="AVG MAGNITUDE"
          value={statsLoading ? '…' : fmt(stats?.avgMagnitude) || '—'}
          color="var(--text)"
        />
        <StatCell
          label="MAX MAGNITUDE"
          value={statsLoading ? '…' : fmt(stats?.maxMagnitude) || '—'}
          color="var(--critical)"
        />
        <StatCell
          label="TIMEFRAME"
          value={timeframe.toUpperCase()}
          color="var(--warning)"
        />
      </div>

      {/* Right: UTC Clock */}
      <div style={{ textAlign: 'right', zIndex: 1 }}>
        <div style={{
          fontFamily:    'var(--font-display)',
          fontSize:      '18px',
          fontWeight:    700,
          color:         'var(--accent)',
          letterSpacing: '0.08em',
          textShadow:    '0 0 12px var(--accent-glow)',
        }}>
          {fmtUtcClock(tick)}
        </div>
        <div style={{
          fontFamily:    'var(--font-mono)',
          fontSize:      '8px',
          letterSpacing: '0.14em',
          color:         'var(--text-muted)',
          marginTop:     2,
        }}>
          {fmtUtcDate(tick)}
        </div>
      </div>
    </header>
  );
}
