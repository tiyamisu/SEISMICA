import React, { memo } from 'react';
import { STATUS } from '../../hooks/useMission';
import { MAG_SCALE } from '../../utils/magnitudeScale';

const TIMEFRAMES = [
  { key: '24h', label: '24 H' },
  { key: '48h', label: '48 H' },
  { key: '7d',  label: '7 D'  },
  { key: '30d', label: '30 D' },
];

export default memo(function ControlMatrix({
  magnitude, setMagnitude,
  timeframe, setTimeframe,
  droneParams, setDroneParams,
  onDispatch, status, quakeCount,
}) {
  const isLoading = status === STATUS.LOADING;

  const statusCfg = {
    [STATUS.IDLE]:    { dot: 'idle',    text: 'STANDBY'   },
    [STATUS.LOADING]: { dot: 'loading', text: 'COMPUTING' },
    [STATUS.SUCCESS]: { dot: 'active',  text: 'ROUTE LIVE'},
    [STATUS.ERROR]:   { dot: 'error',   text: 'ERROR'     },
  };
  const cfg = statusCfg[status] || statusCfg[STATUS.IDLE];

  return (
    <div className="glass-panel" style={{
      display:       'flex',
      flexDirection: 'column',
      overflow:      'hidden',
      flex:          1,
      minHeight:     0,
    }}>
      {/* Panel Header */}
      <div style={{
        padding:       '14px 16px 10px',
        borderBottom:  '1px solid var(--border)',
        display:       'flex',
        alignItems:    'center',
        gap:           8,
      }}>
        <span className={`status-dot ${cfg.dot}`} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.22em', color: 'var(--text-muted)' }}>
          CONTROL MATRIX
        </span>
        <span style={{
          marginLeft:    'auto',
          fontFamily:    'var(--font-display)',
          fontSize:      9,
          color:         cfg.dot === 'active' ? 'var(--success)' : cfg.dot === 'error' ? 'var(--critical)' : cfg.dot === 'loading' ? 'var(--warning)' : 'var(--text-muted)',
          letterSpacing: '0.14em',
        }}>
          {cfg.text}
        </span>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Magnitude */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span className="section-title" style={{ marginBottom: 0 }}>MIN MAGNITUDE</span>
            <span style={{
              fontFamily:  'var(--font-display)', fontSize: 15, fontWeight: 700,
              color:       'var(--accent)', background: 'var(--accent-dim)',
              border:      '1px solid var(--border)', borderRadius: 4, padding: '2px 10px',
            }}>
              {magnitude.toFixed(1)}
            </span>
          </div>
          <input
            type="range" min={1.0} max={7.0} step={0.1}
            value={magnitude}
            onChange={(e) => setMagnitude(parseFloat(e.target.value))}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', marginTop: 4 }}>
            <span>1.0</span><span>4.0</span><span>7.0</span>
          </div>
        </div>

        {/* Timeframe */}
        <div>
          <div className="section-title">TIMEFRAME</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
            {TIMEFRAMES.map(({ key, label }) => (
              <button
                key={key}
                className={`btn-tactical${timeframe === key ? ' active' : ''}`}
                style={{ padding: '7px 0', fontSize: 9, letterSpacing: '0.12em', textAlign: 'center' }}
                onClick={() => setTimeframe(key)}
                disabled={isLoading}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* Drone Params */}
        <div>
          <div className="section-title">DRONE PARAMETERS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { key: 'capacityWh', label: 'Battery Capacity (Wh)',    min: 10,   max: 500,    step: 10  },
              { key: 'maxRangeKm', label: 'Max Range (km)',            min: 100,  max: 10000,  step: 100 },
              { key: 'speedKmh',   label: 'Cruise Speed (km/h)',       min: 30,   max: 300,    step: 5   },
              { key: 'whPerKm',    label: 'Consumption (Wh/km)',       min: 0.01, max: 0.5,    step: 0.01},
            ].map(({ key, label, min, max, step }) => (
              <div key={key}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', marginBottom: 4 }}>
                  {label}
                </div>
                <input
                  type="number" min={min} max={max} step={step}
                  value={droneParams[key]}
                  onChange={(e) => setDroneParams((p) => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* Legend */}
        <div>
          <div className="section-title">MAGNITUDE SCALE</div>
          {MAG_SCALE.map(({ range, color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', flex: 1 }}>{range}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 7, color, letterSpacing: '0.14em', fontWeight: 700 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dispatch button */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
        {quakeCount > 0 && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 8, letterSpacing: '0.1em' }}>
            {quakeCount} WAYPOINTS LOCKED
          </div>
        )}
        <button
          id="dispatch-btn"
          className="btn-tactical"
          onClick={onDispatch}
          disabled={isLoading}
          style={{
            width:         '100%',
            padding:       '13px 0',
            fontSize:      11,
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            gap:           4,
            boxShadow:     isLoading ? 'none' : 'var(--btn-dispatch-shadow)',
          }}
        >
          <span>{isLoading ? '◌  COMPUTING…' : '⬡  DISPATCH DRONE'}</span>
          {!isLoading && (
            <span style={{ fontSize: 7, color: 'var(--text-muted)', letterSpacing: '0.18em', fontWeight: 400 }}>
              FETCH &amp; OPTIMISE ROUTE
            </span>
          )}
        </button>
      </div>
    </div>
  );
});
