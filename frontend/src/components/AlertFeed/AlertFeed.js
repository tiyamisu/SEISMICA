import React, { memo, useEffect, useRef } from 'react';

const LEVEL_COLOR = {
  CRITICAL: 'var(--critical)',
  WARNING:  'var(--warning)',
  ALERT:    'var(--accent)',
};

export default memo(function AlertFeed({ entries }) {
  const bottomRef = useRef(null);

  // Auto-scroll to newest entry (newest is at top — reversed feed)
  useEffect(() => {
    // entries are prepended so no scroll needed — newest is visible at top
  }, [entries]);

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
        <span className="status-dot active" />
        <span className="section-title" style={{ marginBottom: 0 }}>MISSION INTELLIGENCE FEED</span>
        {entries.length > 0 && (
          <span style={{
            marginLeft:    'auto',
            fontFamily:    'var(--font-mono)',
            fontSize:      8,
            color:         'var(--text-muted)',
          }}>
            {entries.length} EVENTS
          </span>
        )}
      </div>

      {/* Feed */}
      <div style={{
        flex:       1,
        overflowY:  'auto',
        padding:    '6px 4px',
        fontFamily: 'var(--font-mono)',
        fontSize:   9,
      }}>
        {entries.length === 0 ? (
          <div style={{
            padding:   '20px',
            textAlign: 'center',
            color:     'var(--text-dim)',
            fontSize:  8,
            letterSpacing: '0.1em',
          }}>
            AWAITING MISSION DISPATCH…
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              style={{
                display:      'flex',
                alignItems:   'flex-start',
                gap:          8,
                padding:      '4px 10px',
                borderLeft:   `2px solid ${LEVEL_COLOR[entry.type] || 'var(--accent)'}`,
                marginBottom: 2,
                borderRadius: '0 3px 3px 0',
                background:   'rgba(0,242,254,0.02)',
                animation:    'alert-in 0.25s ease',
                lineHeight:   1.5,
              }}
            >
              <span style={{
                color:         'var(--text-muted)',
                fontSize:      7,
                letterSpacing: '0.05em',
                flexShrink:    0,
                marginTop:     1,
              }}>
                {entry.ts}
              </span>
              <span style={{
                color:         LEVEL_COLOR[entry.type] || 'var(--accent)',
                fontWeight:    700,
                flexShrink:    0,
                fontSize:      8,
              }}>
                [{entry.type}]
              </span>
              <span style={{ color: 'var(--warning)', fontWeight: 700, flexShrink: 0 }}>
                M{entry.mag?.toFixed(1)}
              </span>
              <span style={{ color: 'var(--text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {entry.place}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
});
