import React, { useState, useEffect } from 'react';
import { fmtUtcClock, fmtUtcDate, fmt } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

// ── Theme Toggle ──────────────────────────────────────────────────────────────
function ThemeToggle({ isDark, onToggle }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <div
      style={{
        display:     'flex',
        alignItems:  'center',
        gap:         8,
        padding:     '5px 12px',
        borderRadius: 20,
        background:  hovered
          ? isDark ? 'rgba(149,224,222,0.06)' : 'rgba(46,15,191,0.05)'
          : 'transparent',
        border:      `1px solid ${hovered ? 'var(--border-hover)' : 'var(--border)'}`,
        transition:  'background 0.25s ease, border-color 0.25s ease',
        cursor:      'pointer',
        userSelect:  'none',
      }}
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Sun SVG */}
      <svg
        width="13" height="13" viewBox="0 0 24 24" fill="none"
        aria-hidden="true"
        style={{
          opacity:    isDark ? 0.30 : 1,
          transition: 'opacity 0.35s ease',
          color:      isDark ? 'var(--text-muted)' : 'var(--warning)',
          flexShrink: 0,
        }}
      >
        <circle cx="12" cy="12" r="5" fill="currentColor" />
        {[0,45,90,135,180,225,270,315].map(deg => {
          const rad = deg * Math.PI / 180;
          const x1  = 12 + 8 * Math.cos(rad);
          const y1  = 12 + 8 * Math.sin(rad);
          const x2  = 12 + 10 * Math.cos(rad);
          const y2  = 12 + 10 * Math.sin(rad);
          return (
            <line key={deg}
              x1={x1.toFixed(2)} y1={y1.toFixed(2)}
              x2={x2.toFixed(2)} y2={y2.toFixed(2)}
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Pill switch */}
      <button
        role="switch"
        aria-checked={!isDark}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        style={{
          width:        44,
          height:       24,
          borderRadius: 12,
          background:   isDark
            ? 'linear-gradient(135deg, #4100F5, rgba(65,0,245,0.7))'
            : 'linear-gradient(135deg, #2E0FBF, #1A8A7B)',
          border:       'none',
          cursor:       'pointer',
          position:     'relative',
          transition:   'background 0.4s ease',
          padding:      0,
          outline:      focused ? '2px solid var(--accent)' : 'none',
          outlineOffset: 2,
          flexShrink:   0,
        }}
      >
        {/* Animated thumb */}
        <div
          aria-hidden="true"
          style={{
            position:     'absolute',
            top:          3,
            left:         isDark ? 3 : 21,
            width:        18,
            height:       18,
            borderRadius: '50%',
            background:   isDark ? '#CDF354' : '#FFFFFF',
            boxShadow:    isDark
              ? '0 1px 4px rgba(0,0,0,0.4), 0 0 6px rgba(205,243,84,0.5)'
              : '0 1px 4px rgba(14,30,64,0.25)',
            transition:   'left 0.32s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.4s ease, box-shadow 0.4s ease',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
          }}
        />
      </button>

      {/* Moon SVG */}
      <svg
        width="12" height="12" viewBox="0 0 24 24" fill="none"
        aria-hidden="true"
        style={{
          opacity:    isDark ? 1 : 0.30,
          transition: 'opacity 0.35s ease',
          color:      isDark ? 'var(--success)' : 'var(--text-muted)',
          flexShrink: 0,
        }}
      >
        <path
          d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
          fill="currentColor"
        />
      </svg>

      {/* Mode label */}
      <span style={{
        fontFamily:    'var(--font-display)',
        fontSize:      8,
        fontWeight:    700,
        letterSpacing: '0.14em',
        color:         'var(--toggle-label-color)',
        textTransform: 'uppercase',
        transition:    'color 0.3s ease',
        minWidth:      30,
      }}>
        {isDark ? 'Dark' : 'Light'}
      </span>
    </div>
  );
}

// ── Seismic logo ──────────────────────────────────────────────────────────────
function SeismicLogo({ isDark }) {
  const rings = [1.3, 1.7, 2.1];
  const coreGradient = isDark
    ? 'linear-gradient(135deg, #4100F5, #95E0DE)'
    : 'linear-gradient(135deg, #2E0FBF, #1A8A7B)';
  const ringColor = isDark
    ? 'rgba(149,224,222,' 
    : 'rgba(26,138,123,';

  return (
    <div style={{ position: 'relative', width: 34, height: 34, flexShrink: 0 }}>
      {rings.map((scale, i) => (
        <div key={i} style={{
          position:        'absolute',
          inset:           0,
          borderRadius:    '50%',
          background:      `${ringColor}${0.12 - i * 0.03})`,
          transform:       `scale(${scale})`,
          transformOrigin: 'center',
          animation:       `pulse-ring ${2 + i * 0.5}s ease-out infinite`,
          pointerEvents:   'none',
        }} />
      ))}
      <div style={{
        position:       'absolute',
        inset:          '20%',
        borderRadius:   '50%',
        background:     coreGradient,
        boxShadow:      isDark
          ? '0 0 16px rgba(65,0,245,0.6)'
          : '0 2px 10px rgba(46,15,191,0.35)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        transition:     'background 0.4s ease, box-shadow 0.4s ease',
      }}>
        <svg viewBox="0 0 36 20" width="22" height="12" style={{ overflow: 'visible' }}>
          <polyline
            points="0,10 6,10 9,2 12,18 15,10 21,10 24,5 27,15 30,10 36,10"
            fill="none" stroke="#FFFFFF" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

// ── Stat cell ─────────────────────────────────────────────────────────────────
function StatCell({ label, value, color = 'var(--accent)' }) {
  return (
    <div style={{ textAlign: 'center', padding: '0 4px' }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 7, fontWeight: 600,
        letterSpacing: '0.18em', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
        color, animation: 'count-up 0.4s ease', letterSpacing: '0.02em',
      }}>{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Header({ stats, statsLoading, timeframe }) {
  const { isDark, toggleTheme } = useTheme();
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
      background:     'var(--header-bg)',
      borderBottom:   '1px solid var(--header-border)',
      boxShadow:      'var(--header-shadow)',
      position:       'relative',
      overflow:       'hidden',
      zIndex:         200,
      transition:     'background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
    }}>

      {/* ── Dark mode: scanline overlay ──────────────────────────────────────── */}
      {isDark && (
        <div style={{
          position:   'absolute',
          top:        0,
          left:       0,
          right:      0,
          height:     '120%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(149,224,222,0.025) 50%, transparent 100%)',
          animation:  'scanline 6s linear infinite',
          pointerEvents: 'none',
          zIndex:     0,
        }} />
      )}

      {/* ── Light mode: gradient accent stripe ──────────────────────────────── */}
      {!isDark && (
        <div style={{
          position:      'absolute',
          top:           0,
          left:          0,
          right:         0,
          height:        '3px',
          background:    'linear-gradient(90deg, #2E0FBF 0%, #1A8A7B 50%, #C0197A 100%)',
          pointerEvents: 'none',
          zIndex:        0,
        }} />
      )}

      {/* ── Left: Logo + Title ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, zIndex: 1 }}>
        <SeismicLogo isDark={isDark} />
        <div>
          <div style={{
            fontFamily:    'var(--font-display)',
            fontSize:      isDark ? '20px' : '22px',
            fontWeight:    isDark ? 900 : 800,
            letterSpacing: isDark ? '0.55em' : '0.40em',
            color:         isDark ? 'var(--accent)' : 'var(--accent)',
            lineHeight:    1,
            textShadow:    isDark ? '0 0 20px var(--accent-glow)' : 'none',
            transition:    'font-size 0.4s ease, letter-spacing 0.4s ease, text-shadow 0.4s ease',
          }}>
            SEISMICA
          </div>
          <div style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      8,
            letterSpacing: '0.18em',
            color:         'var(--text-muted)',
            marginTop:     4,
            textTransform: 'uppercase',
          }}>
            {isDark ? 'Tactical Intelligence · v3.0' : 'Intelligence Platform · v3.0'}
          </div>
        </div>
      </div>

      {/* ── Center: Live stats ───────────────────────────────────────────────── */}
      <div style={{
        display:     'flex',
        gap:         24,
        zIndex:      1,
        padding:     '0 24px',
        borderLeft:  '1px solid var(--border)',
        borderRight: '1px solid var(--border)',
        alignItems:  'center',
      }}>
        <StatCell
          label="Active Quakes"
          value={statsLoading ? '…' : fmt(stats?.totalQuakes, 0) || '—'}
          color="var(--text)"
        />
        <StatCell
          label="Avg Magnitude"
          value={statsLoading ? '…' : fmt(stats?.avgMagnitude) || '—'}
          color="var(--text)"
        />
        <StatCell
          label="Max Magnitude"
          value={statsLoading ? '…' : fmt(stats?.maxMagnitude) || '—'}
          color="var(--critical)"
        />
        <StatCell
          label="Timeframe"
          value={timeframe.toUpperCase()}
          color="var(--warning)"
        />
      </div>

      {/* ── Right: Theme Toggle + UTC Clock ─────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, zIndex: 1 }}>
        {/* Theme Toggle */}
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: 'var(--border)' }} />

        {/* UTC Clock */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily:    'var(--font-display)',
            fontSize:      '18px',
            fontWeight:    700,
            color:         'var(--accent)',
            letterSpacing: '0.06em',
            textShadow:    isDark ? '0 0 12px var(--accent-glow)' : 'none',
            transition:    'text-shadow 0.4s ease',
          }}>
            {fmtUtcClock(tick)}
          </div>
          <div style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      8,
            letterSpacing: '0.12em',
            color:         'var(--text-muted)',
            marginTop:     2,
            textTransform: 'uppercase',
          }}>
            {fmtUtcDate(tick)} UTC
          </div>
        </div>
      </div>
    </header>
  );
}
