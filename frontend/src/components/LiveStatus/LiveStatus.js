import React, { memo } from 'react';
import { SYNC_STATUS, fmtCountdown, fmtTime } from '../../hooks/useAutoRefresh';

const STATUS_CONFIG = {
  [SYNC_STATUS.IDLE]:       { color: 'var(--success)',  pulse: true,  label: 'LIVE'                   },
  [SYNC_STATUS.SYNCING]:    { color: '#ffae00',          pulse: true,  label: 'SYNCING USGS DATA…'     },
  [SYNC_STATUS.RECOMPUTED]: { color: 'var(--accent)',   pulse: true,  label: 'ROUTE RECOMPUTED'        },
  [SYNC_STATUS.UPDATED]:    { color: 'var(--success)',  pulse: true,  label: 'LIVE FEED UPDATED ✓'     },
  [SYNC_STATUS.ERROR]:      { color: 'var(--critical)', pulse: false, label: 'DATA FEED WARNING'       },
};

export default memo(function LiveStatus({
  syncStatus,
  lastUpdated,
  countdown,
  errorMsg,
  onManualRefresh,
  hasDispatched,
}) {
  const cfg = STATUS_CONFIG[syncStatus] || STATUS_CONFIG[SYNC_STATUS.IDLE];

  return (
    <div className="glass-panel" style={{ padding: '10px 14px', flexShrink: 0 }}>

      {/* ── Header row ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {/* Animated status dot */}
        <span style={{
          width:        7,
          height:       7,
          borderRadius: '50%',
          background:   cfg.color,
          flexShrink:   0,
          boxShadow:    `0 0 ${cfg.pulse ? 6 : 2}px ${cfg.color}`,
          animation:    cfg.pulse ? 'blink 1.4s ease infinite' : 'none',
          transition:   'background 0.4s ease, box-shadow 0.4s ease',
        }} />
        <span style={{
          fontFamily:    'var(--font-display)',
          fontSize:      9,
          fontWeight:    700,
          color:         cfg.color,
          letterSpacing: '0.18em',
          flex:          1,
          transition:    'color 0.4s ease',
        }}>
          {cfg.label}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize:   7,
          color:      'var(--text-muted)',
          letterSpacing: '0.06em',
        }}>
          AUTO-REFRESH
        </span>
      </div>

      {/* ── Error message ────────────────────────────────────────────────── */}
      {syncStatus === SYNC_STATUS.ERROR && errorMsg && (
        <div style={{
          marginBottom:  7,
          padding:       '5px 8px',
          background:    'var(--critical-dim)',
          border:        '1px solid var(--critical)',
          borderRadius:  3,
          fontFamily:    'var(--font-mono)',
          fontSize:      8,
          color:         'var(--critical)',
          lineHeight:    1.5,
        }}>
          {errorMsg}<br />
          <span style={{ opacity: 0.7 }}>Displaying last known dataset.</span>
        </div>
      )}

      {/* ── Metrics row ──────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>

        {/* Last updated */}
        <div style={{
          background:   'var(--bg-card)',
          border:       '1px solid var(--border)',
          borderRadius: 4,
          padding:      '5px 8px',
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 7, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 2 }}>
            LAST UPDATED
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)', fontWeight: 700 }}>
            {lastUpdated ? fmtTime(lastUpdated) : '—'}
          </div>
        </div>

        {/* Countdown */}
        <div style={{
          background:   'var(--bg-card)',
          border:       `1px solid ${hasDispatched ? 'var(--border)' : 'rgba(0,242,254,0.06)'}`,
          borderRadius: 4,
          padding:      '5px 8px',
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 7, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 2 }}>
            NEXT REFRESH
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize:   10,
            fontWeight: 700,
            color:      hasDispatched ? 'var(--warning)' : 'var(--text-dim)',
          }}>
            {hasDispatched ? fmtCountdown(countdown) : 'STANDBY'}
          </div>
        </div>
      </div>

      {/* ── Manual refresh button ────────────────────────────────────────── */}
      <button
        onClick={onManualRefresh}
        disabled={syncStatus === SYNC_STATUS.SYNCING || syncStatus === SYNC_STATUS.RECOMPUTED || !hasDispatched}
        style={{
          marginTop:     8,
          width:         '100%',
          padding:       '6px 0',
          background:    'transparent',
          border:        `1px solid ${hasDispatched ? 'var(--border)' : 'rgba(0,242,254,0.08)'}`,
          borderRadius:  4,
          color:         hasDispatched ? 'var(--accent)' : 'var(--text-dim)',
          fontFamily:    'var(--font-display)',
          fontSize:      8,
          fontWeight:    700,
          letterSpacing: '0.18em',
          cursor:        hasDispatched && syncStatus === SYNC_STATUS.IDLE ? 'pointer' : 'not-allowed',
          transition:    'all var(--transition)',
          opacity:       hasDispatched ? 1 : 0.4,
        }}
        onMouseEnter={(e) => {
          if (hasDispatched && syncStatus === SYNC_STATUS.IDLE)
            e.target.style.background = 'var(--accent-dim)';
        }}
        onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
      >
        {syncStatus === SYNC_STATUS.SYNCING    ? '⟳ SYNCING…'         :
         syncStatus === SYNC_STATUS.RECOMPUTED ? '⟳ COMPUTING…'       :
         '⟳ REFRESH NOW'}
      </button>
    </div>
  );
});
