import React, { useState, useEffect } from 'react';
import { fmtUtcClock, fmtUtcDate, fmt } from '../../utils/formatters';

// ── Seismic waveform SVG logo (replicates uploaded inspiration) ───────────────
function SeismicLogo() {
  return (
    <div style={{
      position:     'relative',
      width:        48,
      height:       48,
      flexShrink:   0,
    }}>
      {/* Pulsing rings */}
      {[1, 0.65, 0.38].map((scale, i) => (
        <div key={i} style={{
          position:      'absolute',
          inset:         0,
          borderRadius:  '50%',
          background:    `rgba(255, 90, 90, ${0.12 - i * 0.03})`,
          transform:     `scale(${scale})`,
          transformOrigin: 'center',
          animation:     `pulse-ring ${2 + i * 0.5}s ease-out infinite`,
          animationDelay: `${i * 0.3}s`,
        }} />
      ))}
      {/* Core circle */}
      <div style={{
        position:     'absolute',
        inset:        '25%',
        borderRadius: '50%',
        background:   'linear-gradient(135deg, #ff6b6b, #ff3b3b)',
        boxShadow:    '0 0 16px rgba(255,59,59,0.5)',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
      }}>
        {/* Heartbeat / seismic wave SVG */}
        <svg viewBox="0 0 36 20" width="22" height="12" style={{ overflow: 'visible' }}>
          <polyline
            points="0,10 6,10 9,2 12,18 15,10 21,10 24,5 27,15 30,10 36,10"
            fill="none"
            stroke="white"
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
        textShadow:    color !== 'var(--accent)' ? `0 0 10px ${color}` : '0 0 10px var(--accent-glow)',
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
      background:     'rgba(6,10,20,0.97)',
      borderBottom:   '1px solid var(--border)',
      position:       'relative',
      overflow:       'hidden',
      zIndex:         200,
    }}>

      {/* Scanline effect */}
      <div style={{
        position:       'absolute',
        inset:          0,
        background:     'linear-gradient(transparent 50%, rgba(0,242,254,0.012) 50%)',
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
            color:         '#e8f4fd',
            textShadow:    '0 0 24px rgba(0,242,254,0.5), 0 0 48px rgba(0,242,254,0.15)',
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
            AUTONOMOUS DRONE ROUTING SYSTEM · v3.0
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
          color="var(--accent)"
        />
        <StatCell
          label="AVG MAGNITUDE"
          value={statsLoading ? '…' : fmt(stats?.avgMagnitude) || '—'}
          color="var(--warning)"
        />
        <StatCell
          label="MAX MAGNITUDE"
          value={statsLoading ? '…' : fmt(stats?.maxMagnitude) || '—'}
          color="var(--critical)"
        />
        <StatCell
          label="TIMEFRAME"
          value={timeframe.toUpperCase()}
          color="var(--success)"
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
