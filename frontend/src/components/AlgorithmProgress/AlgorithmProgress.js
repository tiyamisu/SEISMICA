import React, { memo } from 'react';
import { STEPS, STATUS } from '../../hooks/useMission';

const STEP_ICONS = ['📡', '🗺️', '⚙️', '📊', '✅'];

export default memo(function AlgorithmProgress({ status, stepIndex }) {
  if (status === STATUS.IDLE) return null;

  const completedSteps = stepIndex + 1;
  const pct = Math.round((completedSteps / STEPS.length) * 100);
  const done = status === STATUS.SUCCESS;
  const err  = status === STATUS.ERROR;

  return (
    <div className="glass-panel" style={{
      padding:   '14px 16px',
      animation: 'slide-in-up 0.3s ease',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>ALGORITHM PIPELINE</div>
        <div style={{
          fontFamily:    'var(--font-display)',
          fontSize:      11,
          fontWeight:    700,
          color:         err ? 'var(--critical)' : done ? 'var(--success)' : 'var(--warning)',
          letterSpacing: '0.1em',
        }}>
          {err ? 'FAILED' : `${Math.min(pct, 100)}%`}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height:        4, borderRadius: 2, background: 'var(--bg-card)',
        border:        '1px solid var(--border)', marginBottom: 12, overflow: 'hidden',
      }}>
        <div style={{
          height:        '100%',
          width:         `${Math.min(pct, 100)}%`,
          background:    err ? 'var(--critical)' : `linear-gradient(90deg, var(--accent), var(--success))`,
          borderRadius:  2,
          transition:    'width 0.4s ease',
          boxShadow:     err ? '0 0 8px var(--critical)' : '0 0 8px var(--accent-glow)',
        }} />
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {STEPS.map((label, i) => {
          const completed = i < completedSteps;
          const active    = i === stepIndex && !done;
          return (
            <div key={i} style={{
              display:     'flex',
              alignItems:  'center',
              gap:         10,
              padding:     '5px 8px',
              borderRadius: 4,
              background:  active ? 'var(--accent-dim)' : 'transparent',
              border:      active ? '1px solid rgba(149, 224, 222, 0.45)' : '1px solid transparent',
              transition:  'all 0.25s ease',
            }}>
              <span style={{ fontSize: 12, opacity: completed || active ? 1 : 0.25 }}>
                {STEP_ICONS[i]}
              </span>
              <span style={{
                fontFamily:    'var(--font-mono)',
                fontSize:      9,
                letterSpacing: '0.08em',
                color:         completed ? 'var(--success)' : active ? 'var(--accent)' : 'var(--text-muted)',
                flex:          1,
              }}>
                {`STEP ${i + 1}: ${label.toUpperCase()}`}
              </span>
              {completed && !err && (
                <span style={{ color: 'var(--success)', fontSize: 10 }}>✓</span>
              )}
              {active && (
                <span style={{
                  color:     'var(--warning)',
                  fontSize:  9,
                  animation: 'blink 0.8s ease infinite',
                }}>●</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Error message */}
      {err && (
        <div style={{
          marginTop:     10,
          padding:       '6px 10px',
          background:    'var(--critical-dim)',
          border:        '1px solid var(--critical)',
          borderRadius:  4,
          fontFamily:    'var(--font-mono)',
          fontSize:      9,
          color:         'var(--critical)',
        }}>
          DISPATCH FAILED — CHECK BACKEND CONNECTION
        </div>
      )}
    </div>
  );
});
