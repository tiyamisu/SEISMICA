import React, { memo } from 'react';
import { THEME } from '../../theme';

// Brand colours kept consistent with the map polylines
const NN_COLOR   = THEME.nnColor;
const OPT_COLOR  = THEME.optColor;

const ROUTES = [
  {
    key:   'nn',
    label: 'NEAREST NEIGHBOUR',
    desc:  'Initial greedy route',
    color: NN_COLOR,
    distKey: 'nnDistanceKm',
    msKey:   'nnExecutionMs',
  },
  {
    key:   '2opt',
    label: '2-OPT OPTIMISED',
    desc:  'Locally optimal route',
    color: OPT_COLOR,
    distKey: 'totalDistanceKm',
    msKey:   'twoOptExecutionMs',
  },
];

export default memo(function RouteLegend({ focusedRoute, setFocusedRoute, result }) {
  if (!result?.route?.length) return null;

  const handleClick = (key) => {
    // Toggle: click the focused route → show both
    setFocusedRoute(focusedRoute === key ? 'both' : key);
  };

  return (
    <div className="glass-panel" style={{ padding: '12px 14px', flexShrink: 0 }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>ROUTE VISUALIZATION</div>
        {focusedRoute !== 'both' && (
          <button
            onClick={() => setFocusedRoute('both')}
            style={{
              background:    'transparent',
              border:        '1px solid var(--border)',
              borderRadius:  3,
              color:         'var(--text-muted)',
              fontFamily:    'var(--font-display)',
              fontSize:      7,
              letterSpacing: '0.12em',
              padding:       '2px 6px',
              cursor:        'pointer',
              transition:    'all var(--transition)',
            }}
            onMouseEnter={(e) => { e.target.style.color = 'var(--accent)'; e.target.style.borderColor = 'var(--accent)'; }}
            onMouseLeave={(e) => { e.target.style.color = 'var(--text-muted)'; e.target.style.borderColor = 'var(--border)'; }}
          >
            SHOW BOTH
          </button>
        )}
      </div>

      {/* ── Route rows ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {ROUTES.map(({ key, label, desc, color, distKey, msKey }) => {
          const isFocused  = focusedRoute === key || focusedRoute === 'both';
          const isDimmed   = focusedRoute !== 'both' && focusedRoute !== key;

          return (
            <div
              key={key}
              onClick={() => handleClick(key)}
              style={{
                display:       'flex',
                alignItems:    'center',
                gap:           10,
                padding:       '8px 10px',
                borderRadius:  5,
                border:        `1px solid ${isFocused ? color + '50' : 'var(--border)'}`,
                background:    isFocused ? `${color}0d` : 'var(--bg-card)',
                cursor:        'pointer',
                transition:    'all 0.3s ease',
                opacity:       isDimmed ? 0.45 : 1,
                transform:     focusedRoute === key ? 'scale(1.01)' : 'scale(1)',
              }}
            >
              {/* Color swatch + line preview */}
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
                <div style={{
                  width:        14,
                  height:       14,
                  borderRadius: 3,
                  background:   color,
                  boxShadow:    isFocused ? `0 0 8px ${color}` : 'none',
                  transition:   'box-shadow 0.3s ease',
                }} />
                {/* Dashed line sample */}
                <div style={{
                  width:        14,
                  height:       2,
                  background:   `repeating-linear-gradient(90deg, ${color} 0 5px, transparent 5px 8px)`,
                  opacity:      isFocused ? 1 : 0.4,
                }} />
              </div>

              {/* Labels */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily:    'var(--font-display)',
                  fontSize:      9,
                  fontWeight:    700,
                  color:         isFocused ? color : 'var(--text)',
                  letterSpacing: '0.12em',
                  transition:    'color 0.3s ease',
                }}>
                  {label}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize:   8,
                  color:      'var(--text-muted)',
                  marginTop:  2,
                }}>
                  {desc}
                </div>
              </div>

              {/* Distance + time */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize:   10,
                  fontWeight: 700,
                  color:      isFocused ? color : 'var(--text)',
                  transition: 'color 0.3s ease',
                }}>
                  {Number(result[distKey] || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} km
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--text-muted)', marginTop: 1 }}>
                  {(result[msKey] || 0).toFixed(2)} ms
                </div>
              </div>

              {/* Focus indicator */}
              {focusedRoute === key && (
                <div style={{
                  width:        4,
                  height:       28,
                  background:   color,
                  borderRadius: 2,
                  flexShrink:   0,
                  boxShadow:    `0 0 6px ${color}`,
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Instruction hint ─────────────────────────────────────────────── */}
      <div style={{
        marginTop:  8,
        fontFamily: 'var(--font-mono)',
        fontSize:   7,
        color:      'var(--text-dim)',
        textAlign:  'center',
        letterSpacing: '0.06em',
      }}>
        CLICK A ROUTE TO FOCUS · CLICK AGAIN TO SHOW BOTH
      </div>
    </div>
  );
});
