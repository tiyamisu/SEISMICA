import React, { memo } from 'react';
import { magToColor } from '../../utils/mapHelpers';

export default memo(function WaypointManifest({ quakes, droneIdx }) {
  if (!quakes.length) return null;

  return (
    <div className="glass-panel" style={{
      display:       'flex',
      flexDirection: 'column',
      overflow:      'hidden',
      flex:          1,
      minHeight:     0,
    }}>
      {/* Header */}
      <div style={{
        padding:      '10px 14px 8px',
        borderBottom: '1px solid var(--border)',
        display:      'flex',
        alignItems:   'center',
        gap:          8,
        flexShrink:   0,
      }}>
        <span className="section-title" style={{ marginBottom: 0 }}>WAYPOINT MANIFEST</span>
        <span style={{
          marginLeft:    'auto',
          fontFamily:    'var(--font-display)',
          fontSize:      9,
          color:         'var(--accent)',
          fontWeight:    700,
        }}>
          {quakes.length} WPT
        </span>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {quakes.map((q, i) => {
          const color    = magToColor(q.magnitude);
          const isDrone  = i === (droneIdx >= 0 ? droneIdx % quakes.length : -1);

          return (
            <div
              key={q.id}
              style={{
                display:     'flex',
                alignItems:  'center',
                gap:         8,
                padding:     '5px 14px',
                background:  isDrone
                  ? 'rgba(255,224,0,0.06)'
                  : i % 2 === 0 ? 'rgba(0,242,254,0.02)' : 'transparent',
                borderLeft:  isDrone ? '2px solid #ffe000' : '2px solid transparent',
                transition:  'background 0.3s ease',
              }}
            >
              {/* Index */}
              <span style={{
                fontFamily:  'var(--font-mono)',
                fontSize:    7,
                color:       isDrone ? '#ffe000' : 'var(--text-muted)',
                width:       20,
                textAlign:   'right',
                flexShrink:  0,
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Magnitude dot */}
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: color, boxShadow: `0 0 4px ${color}`, flexShrink: 0,
              }} />

              {/* Place name */}
              <span style={{
                fontFamily:   'var(--font-mono)',
                fontSize:     8,
                color:        isDrone ? '#ffe000' : 'var(--text)',
                flex:         1,
                overflow:     'hidden',
                textOverflow: 'ellipsis',
                whiteSpace:   'nowrap',
              }}>
                {q.place}
              </span>

              {/* Magnitude */}
              <span style={{
                fontFamily:  'var(--font-display)',
                fontSize:    8,
                fontWeight:  700,
                color,
                flexShrink:  0,
              }}>
                M{q.magnitude?.toFixed(1)}
              </span>

              {/* Drone indicator */}
              {isDrone && (
                <span style={{ fontSize: 9, flexShrink: 0 }}>✈</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
