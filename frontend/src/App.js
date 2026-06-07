import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react';
import {
  MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap,
} from 'react-leaflet';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import 'leaflet/dist/leaflet.css';

// ═════════════════════════════════════════════════════════════════════════════
//  DESIGN TOKENS
// ═════════════════════════════════════════════════════════════════════════════
const T = {
  bg:        '#0a0e17',
  bgPanel:   'rgba(10,18,30,0.88)',
  border:    'rgba(0,242,254,0.18)',
  accent:    '#00f2fe',
  accentDim: 'rgba(0,242,254,0.12)',
  warn:      '#ff4d6d',
  gold:      '#f5c518',
  green:     '#00e676',
  text:      '#c8d6e5',
  textMuted: '#3a5a70',
  font:      "'Orbitron', 'Roboto Mono', monospace",
};

const TILE_URL  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTR = '&copy; OpenStreetMap &copy; CARTO';
const API       = 'http://localhost:5000';

// ─── inject Orbitron font + pulse keyframe once ────────────────────────────
const INJECTED_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Roboto+Mono:wght@300;400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { width: 100%; height: 100%; background: ${T.bg}; overflow: hidden; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${T.bg}; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }

  @keyframes pulseRing {
    0%   { stroke-opacity: 0.9; stroke-width: 2; r: 0; }
    70%  { stroke-opacity: 0.2; stroke-width: 1; }
    100% { stroke-opacity: 0; }
  }
  @keyframes scanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }
  @keyframes droneFloat {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-4px); }
  }

  .leaflet-popup-content-wrapper {
    background: rgba(8,16,28,0.96) !important;
    border: 1px solid ${T.border} !important;
    border-radius: 8px !important;
    color: ${T.text} !important;
    box-shadow: 0 0 24px rgba(0,242,254,0.15) !important;
    padding: 0 !important;
    font-family: ${T.font} !important;
  }
  .leaflet-popup-content { margin: 14px 16px !important; }
  .leaflet-popup-tip     { background: rgba(0,242,254,0.2) !important; }
  .leaflet-popup-close-button { color: ${T.textMuted} !important; top:6px!important; right:8px!important; }
  .leaflet-popup-close-button:hover { color: ${T.accent} !important; }

  input[type=range] { -webkit-appearance: none; width: 100%; height: 3px; border-radius: 2px;
    background: linear-gradient(90deg, ${T.accent}, #004060); outline: none; cursor: pointer; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width:14px; height:14px;
    border-radius:50%; background:${T.accent}; box-shadow: 0 0 8px ${T.accent}; cursor:pointer; }
  input[type=range]::-moz-range-thumb { width:14px; height:14px; border-radius:50%;
    background:${T.accent}; box-shadow:0 0 8px ${T.accent}; cursor:pointer; border:none; }
`;

// ═════════════════════════════════════════════════════════════════════════════
//  HELPERS
// ═════════════════════════════════════════════════════════════════════════════
const magToRadius = (m) => Math.max(4, (m / 10) * 30);
const magToColor  = (m) => m >= 6 ? '#ff2222' : m >= 5 ? '#ff7a00' : m >= 4 ? '#ffd700' : '#39ff14';
const fmt         = (n, d = 2) => n == null ? '—' : Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtTime     = (ms) => ms == null ? '—' : ms < 1000 ? `${ms.toFixed(1)} ms` : `${(ms / 1000).toFixed(2)} s`;

// ═════════════════════════════════════════════════════════════════════════════
//  GLASS PANEL
// ═════════════════════════════════════════════════════════════════════════════
function GlassPanel({ style, children }) {
  return (
    <div style={{
      background:    T.bgPanel,
      border:        `1px solid ${T.border}`,
      borderRadius:  10,
      backdropFilter:'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      boxShadow:    `0 0 30px rgba(0,242,254,0.06), inset 0 1px 0 rgba(0,242,254,0.06)`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  TOP BAR
// ═════════════════════════════════════════════════════════════════════════════
function TopBar({ stats, statsLoading }) {
  const [tick, setTick] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setTick(new Date()), 1000); return () => clearInterval(id); }, []);

  return (
    <div style={{
      gridArea:      'topbar',
      display:       'flex',
      alignItems:    'center',
      justifyContent:'space-between',
      padding:       '0 24px',
      background:    'rgba(8,14,24,0.95)',
      borderBottom:  `1px solid ${T.border}`,
      zIndex:        100,
    }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 26, color: T.accent, textShadow: `0 0 16px ${T.accent}` }}>⬡</span>
        <div>
          <div style={{ fontFamily: T.font, fontSize: 20, fontWeight: 900, letterSpacing: '0.4em', color: '#e8f4fd',
                        textShadow: `0 0 20px rgba(0,242,254,0.5)` }}>
            SEISMICA
          </div>
          <div style={{ fontSize: 8, letterSpacing: '0.2em', color: T.textMuted }}>
            AUTONOMOUS DRONE ROUTING SYSTEM v2.0
          </div>
        </div>
      </div>

      {/* Live stats */}
      <div style={{ display: 'flex', gap: 28, fontFamily: T.font, fontSize: 10 }}>
        {[
          { label: 'ACTIVE QUAKES', value: statsLoading ? '…' : fmt(stats?.totalQuakes, 0), color: T.accent },
          { label: 'AVG MAG',       value: statsLoading ? '…' : fmt(stats?.avgMagnitude),   color: T.gold  },
          { label: 'MAX MAG',       value: statsLoading ? '…' : fmt(stats?.maxMagnitude),   color: T.warn  },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ color: T.textMuted, letterSpacing: '0.14em', marginBottom: 2 }}>{label}</div>
            <div style={{ color, fontSize: 16, fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Clock */}
      <div style={{ fontFamily: T.font, textAlign: 'right' }}>
        <div style={{ color: T.accent, fontSize: 16, letterSpacing: '0.1em' }}>
          {tick.toLocaleTimeString('en-US', { hour12: false })}
        </div>
        <div style={{ color: T.textMuted, fontSize: 8, letterSpacing: '0.18em' }}>
          {tick.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  CONTROL PANEL
// ═════════════════════════════════════════════════════════════════════════════
function ControlPanel({ magnitude, setMagnitude, onDispatch, loading, status, quakeCount }) {
  const statusCfg = {
    STANDBY:  { color: T.textMuted, dot: '#444',   text: 'STANDBY'   },
    COMPUTING:{ color: T.gold,      dot: T.gold,   text: 'COMPUTING' },
    LIVE:     { color: T.green,     dot: T.green,  text: 'ROUTE LIVE'},
    ERROR:    { color: T.warn,      dot: T.warn,   text: 'ERROR'     },
  };
  const cfg = statusCfg[status] || statusCfg.STANDBY;

  return (
    <GlassPanel style={{ gridArea: 'left', display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontFamily: T.font, fontSize: 9, letterSpacing: '0.22em', color: T.textMuted, marginBottom: 6 }}>
          ▸ CONTROL MATRIX
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot,
                         boxShadow: `0 0 8px ${cfg.dot}`, display: 'inline-block',
                         animation: status === 'COMPUTING' ? 'blink 1s ease infinite' : 'none' }} />
          <span style={{ fontFamily: T.font, fontSize: 10, color: cfg.color, letterSpacing: '0.18em' }}>
            {cfg.text}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Magnitude slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontFamily: T.font, fontSize: 8, letterSpacing: '0.18em', color: T.textMuted }}>
              MIN MAGNITUDE
            </span>
            <span style={{ fontFamily: T.font, fontSize: 16, fontWeight: 700, color: T.accent,
                           background: T.accentDim, border: `1px solid ${T.border}`, borderRadius: 4,
                           padding: '2px 10px' }}>
              {magnitude.toFixed(1)}
            </span>
          </div>
          <input type="range" min={1.0} max={7.0} step={0.1} value={magnitude}
            onChange={(e) => setMagnitude(parseFloat(e.target.value))} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: T.font,
                        fontSize: 8, color: T.textMuted, marginTop: 4 }}>
            <span>1.0</span><span>4.0</span><span>7.0</span>
          </div>
        </div>

        {/* Algorithm info */}
        <div>
          <div style={{ fontFamily: T.font, fontSize: 8, letterSpacing: '0.18em', color: T.textMuted, marginBottom: 10 }}>
            TSP ALGORITHMS
          </div>
          {['Nearest Neighbour (Greedy)', '2-Opt Swap (Optimiser)'].map((name, i) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: T.accent,
                            boxShadow: `0 0 6px ${T.accent}`, flexShrink: 0 }} />
              <div style={{ fontFamily: T.font, fontSize: 9, color: i === 0 ? T.gold : T.accent, letterSpacing: '0.06em' }}>
                {name}
              </div>
            </div>
          ))}
          <div style={{ fontFamily: T.font, fontSize: 7, color: T.textMuted, lineHeight: 1.6, marginTop: 6,
                        padding: '8px 10px', background: 'rgba(0,242,254,0.04)', borderRadius: 4,
                        border: `1px solid ${T.border}` }}>
            Pipeline: NN heuristic generates initial tour → 2-Opt reverses sub-segments iteratively until local optimum.
          </div>
        </div>

        {/* Legend */}
        <div>
          <div style={{ fontFamily: T.font, fontSize: 8, letterSpacing: '0.18em', color: T.textMuted, marginBottom: 10 }}>
            MAGNITUDE SCALE
          </div>
          {[
            { range: '≥ 6.0',     color: '#ff2222', label: 'MAJOR'    },
            { range: '5.0 – 5.9', color: '#ff7a00', label: 'STRONG'   },
            { range: '4.0 – 4.9', color: '#ffd700', label: 'MODERATE' },
            { range: '< 4.0',     color: '#39ff14', label: 'MINOR'    },
          ].map(({ range, color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: color,
                             boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
              <span style={{ fontFamily: T.font, fontSize: 8, color: T.textMuted, flex: 1 }}>{range}</span>
              <span style={{ fontFamily: T.font, fontSize: 7, color, letterSpacing: '0.14em', fontWeight: 700 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dispatch button */}
      <div style={{ padding: '14px 18px', borderTop: `1px solid ${T.border}` }}>
        {quakeCount > 0 && (
          <div style={{ fontFamily: T.font, fontSize: 8, color: T.textMuted, textAlign: 'center', marginBottom: 8, letterSpacing: '0.1em' }}>
            {quakeCount} WAYPOINTS LOCKED
          </div>
        )}
        <button
          id="dispatch-btn"
          onClick={onDispatch}
          disabled={loading}
          style={{
            width:         '100%',
            padding:       '13px 0',
            background:    loading ? 'rgba(0,80,100,0.3)' : `linear-gradient(135deg, rgba(0,80,100,0.6), rgba(0,30,50,0.9))`,
            border:        `1px solid ${loading ? T.textMuted : T.accent}`,
            borderRadius:  6,
            color:         loading ? T.textMuted : T.accent,
            fontFamily:    T.font,
            fontSize:      11,
            fontWeight:    700,
            letterSpacing: '0.28em',
            cursor:        loading ? 'not-allowed' : 'pointer',
            boxShadow:     loading ? 'none' : `0 0 20px rgba(0,242,254,0.18)`,
            transition:    'all 0.25s ease',
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            gap:           4,
          }}
        >
          <span>{loading ? '◌  COMPUTING…' : '⬡  DISPATCH DRONE'}</span>
          {!loading && <span style={{ fontSize: 7, color: T.textMuted, letterSpacing: '0.18em', fontWeight: 400 }}>
            FETCH &amp; OPTIMISE ROUTE
          </span>}
        </button>
      </div>
    </GlassPanel>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  MAP AUTO-FIT
// ═════════════════════════════════════════════════════════════════════════════
function MapFit({ quakes }) {
  const map = useMap();
  useEffect(() => {
    if (quakes.length < 2) return;
    const L = window.L;
    if (!L) return;
    const bounds = L.latLngBounds(quakes.map((q) => [q.latitude, q.longitude]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
  }, [quakes, map]);
  return null;
}

// ═════════════════════════════════════════════════════════════════════════════
//  MAP PANEL
// ═════════════════════════════════════════════════════════════════════════════
function MapPanel({ quakes, polyline, droneIdx }) {
  return (
    <div style={{ gridArea: 'map', position: 'relative', borderRadius: 10, overflow: 'hidden',
                  border: `1px solid ${T.border}` }}>
      <MapContainer center={[20, 0]} zoom={2} style={{ width: '100%', height: '100%', background: T.bg }}
                    zoomControl={true}>
        <TileLayer url={TILE_URL} attribution={TILE_ATTR} subdomains="abcd" maxZoom={19} />
        <MapFit quakes={quakes} />

        {/* Earthquake markers */}
        {quakes.map((q, idx) => (
          <CircleMarker
            key={q.id}
            center={[q.latitude, q.longitude]}
            radius={magToRadius(q.magnitude)}
            pathOptions={{
              color: magToColor(q.magnitude),
              fillColor: magToColor(q.magnitude),
              fillOpacity: 0.75,
              weight: 1.5,
            }}
          >
            <Popup>
              <div style={{ fontFamily: T.font, minWidth: 200, background: 'transparent', color: T.text }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#e8f4fd', marginBottom: 8,
                              paddingBottom: 6, borderBottom: `1px solid ${T.border}`, lineHeight: 1.5 }}>
                  {q.place}
                </div>
                {[
                  ['MAGNITUDE', q.magnitude?.toFixed(1), magToColor(q.magnitude)],
                  ['WAYPOINT',  `#${idx + 1}`,           T.accent],
                  ['DEPTH',     q.depth != null ? `${q.depth.toFixed(1)} km` : '—', T.text],
                  ['LAT / LON', `${q.latitude?.toFixed(3)}, ${q.longitude?.toFixed(3)}`, T.textMuted],
                ].map(([k, v, c]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 8, color: T.textMuted, letterSpacing: '0.12em' }}>{k}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: c }}>{v}</span>
                  </div>
                ))}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Glow polyline (2-layer) */}
        {polyline.length > 1 && (
          <>
            <Polyline positions={polyline} pathOptions={{ color: T.accent, weight: 10, opacity: 0.10 }} />
            <Polyline positions={polyline} pathOptions={{ color: T.accent, weight: 1.8, opacity: 0.88, dashArray: '8 6' }} />
          </>
        )}

        {/* Drone marker */}
        {quakes.length > 0 && droneIdx >= 0 && (
          <CircleMarker
            center={[quakes[droneIdx % quakes.length].latitude, quakes[droneIdx % quakes.length].longitude]}
            radius={10}
            pathOptions={{
              color: T.gold, fillColor: T.gold, fillOpacity: 1, weight: 2,
            }}
          />
        )}
      </MapContainer>

      {/* Map overlay label */}
      {quakes.length > 0 && (
        <div style={{
          position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(5,10,16,0.9)', border: `1px solid ${T.border}`, borderRadius: 6,
          padding: '7px 20px', fontFamily: T.font, fontSize: 9, letterSpacing: '0.2em',
          color: T.accent, pointerEvents: 'none', backdropFilter: 'blur(8px)', zIndex: 800,
          whiteSpace: 'nowrap', boxShadow: `0 0 16px rgba(0,242,254,0.1)`,
        }}>
          {quakes.length} WAYPOINTS · DRONE IN FLIGHT
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  RECHARTS CUSTOM TOOLTIP
// ═════════════════════════════════════════════════════════════════════════════
function HistoTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(8,14,24,0.96)', border: `1px solid ${T.border}`, borderRadius: 6,
                  padding: '8px 14px', fontFamily: T.font, fontSize: 10 }}>
      <div style={{ color: T.textMuted, marginBottom: 4 }}>MAG {label}</div>
      <div style={{ color: T.accent, fontWeight: 700 }}>{payload[0].value} EVENTS</div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  RIGHT TELEMETRY PANEL
// ═════════════════════════════════════════════════════════════════════════════
function TelemetryPanel({ quakes, totalDist, execTime, nnDist, efficiency, histData, histLoading }) {
  // Estimated battery: 1 km ≈ 0.008% drain, base 12%
  const battery = totalDist != null ? Math.min(100, 12 + totalDist * 0.008).toFixed(1) : null;

  const metrics = [
    { label: 'MISSION STATUS',  value: quakes.length ? 'ACTIVE'       : 'STANDBY', color: quakes.length ? T.green : T.textMuted },
    { label: 'TOTAL DISTANCE',  value: totalDist != null ? `${fmt(totalDist)} km`     : '—',         color: T.accent },
    { label: 'BATTERY DRAIN',   value: battery   != null ? `${battery}%`              : '—',         color: T.gold  },
    { label: 'OPTIMISATION',    value: efficiency != null ? `${efficiency}% SAVED`    : '—',         color: T.green },
    { label: 'NN DISTANCE',     value: nnDist     != null ? `${fmt(nnDist)} km`        : '—',         color: T.textMuted },
    { label: 'EXEC TIME',       value: execTime   != null ? fmtTime(execTime)          : '—',         color: T.accent },
  ];

  // Bar chart colours by magnitude range
  const barColors = ['#39ff14', '#39ff14', '#39ff14', '#39ff14', '#ffd700', '#ff7a00', '#ff2222', '#ff2222'];

  return (
    <GlassPanel style={{ gridArea: 'right', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 18px 10px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontFamily: T.font, fontSize: 9, letterSpacing: '0.22em', color: T.textMuted }}>
          ▸ DATA TELEMETRY
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Metric grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {metrics.map(({ label, value, color }) => (
            <div key={label} style={{
              padding:      '9px 11px',
              background:   T.accentDim,
              border:       `1px solid ${T.border}`,
              borderRadius: 6,
            }}>
              <div style={{ fontFamily: T.font, fontSize: 7, color: T.textMuted, letterSpacing: '0.16em', marginBottom: 5 }}>
                {label}
              </div>
              <div style={{ fontFamily: T.font, fontSize: 12, fontWeight: 700, color, letterSpacing: '0.06em' }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Histogram */}
        <div>
          <div style={{ fontFamily: T.font, fontSize: 8, letterSpacing: '0.18em', color: T.textMuted, marginBottom: 8 }}>
            7-DAY FREQUENCY BY MAGNITUDE
          </div>
          {histLoading ? (
            <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: T.font, fontSize: 9, color: T.textMuted }}>
              LOADING…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={histData} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}
                        barCategoryGap="20%">
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(0,242,254,0.08)" vertical={false} />
                <XAxis dataKey="range" tick={{ fontFamily: T.font, fontSize: 7, fill: T.textMuted }}
                       axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily: T.font, fontSize: 7, fill: T.textMuted }}
                       axisLine={false} tickLine={false} />
                <Tooltip content={<HistoTooltip />} cursor={{ fill: 'rgba(0,242,254,0.05)' }} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {(histData || []).map((_, i) => (
                    <Cell key={i} fill={barColors[i] || T.accent} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Waypoint list */}
        {quakes.length > 0 && (
          <div>
            <div style={{ fontFamily: T.font, fontSize: 8, letterSpacing: '0.18em', color: T.textMuted, marginBottom: 8 }}>
              WAYPOINT MANIFEST
            </div>
            <div style={{ maxHeight: 160, overflowY: 'auto' }}>
              {quakes.slice(0, 20).map((q, i) => (
                <div key={q.id} style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          8,
                  padding:      '5px 8px',
                  marginBottom: 3,
                  background:   i % 2 === 0 ? 'rgba(0,242,254,0.03)' : 'transparent',
                  borderRadius: 4,
                }}>
                  <span style={{ fontFamily: T.font, fontSize: 7, color: T.textMuted, width: 20, textAlign: 'right' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: magToColor(q.magnitude),
                                 flexShrink: 0, boxShadow: `0 0 4px ${magToColor(q.magnitude)}` }} />
                  <span style={{ fontFamily: T.font, fontSize: 8, color: T.text, flex: 1,
                                 overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {q.place}
                  </span>
                  <span style={{ fontFamily: T.font, fontSize: 8, color: magToColor(q.magnitude), flexShrink: 0 }}>
                    M{q.magnitude?.toFixed(1)}
                  </span>
                </div>
              ))}
              {quakes.length > 20 && (
                <div style={{ fontFamily: T.font, fontSize: 7, color: T.textMuted, textAlign: 'center', padding: 6 }}>
                  +{quakes.length - 20} MORE WAYPOINTS
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </GlassPanel>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  SEISMIC WAVEFORM CANVAS
// ═════════════════════════════════════════════════════════════════════════════
function WaveformCanvas({ active, intensity }) {
  const canvasRef = useRef(null);
  const frameRef  = useRef(null);
  const phaseRef  = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      const W = canvas.width  = canvas.offsetWidth;
      const H = canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);

      const amp    = active ? Math.min(H * 0.4, 6 + intensity * 0.5) : 4;
      const freq   = active ? 0.025 + intensity * 0.0005 : 0.018;
      const speed  = active ? 0.07 : 0.025;
      const points = [];

      for (let x = 0; x < W; x++) {
        const noise  = (Math.random() - 0.5) * (active ? 3 : 0.5);
        const y = H / 2
          + Math.sin((x * freq) + phaseRef.current) * amp
          + Math.sin((x * freq * 2.3) + phaseRef.current * 1.4) * (amp * 0.35)
          + noise;
        points.push([x, y]);
      }

      // Glow pass
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      points.forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.strokeStyle = active ? `rgba(0,242,254,0.15)` : `rgba(0,242,254,0.05)`;
      ctx.lineWidth = 6;
      ctx.stroke();

      // Core pass
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      points.forEach(([x, y]) => ctx.lineTo(x, y));
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0,   'rgba(0,242,254,0)');
      grad.addColorStop(0.1, active ? `rgba(0,242,254,0.9)` : `rgba(0,242,254,0.35)`);
      grad.addColorStop(0.9, active ? `rgba(0,242,254,0.9)` : `rgba(0,242,254,0.35)`);
      grad.addColorStop(1,   'rgba(0,242,254,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      phaseRef.current += speed;
      frameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, [active, intensity]);

  return (
    <div style={{
      gridArea:     'footer',
      position:     'relative',
      borderTop:    `1px solid ${T.border}`,
      background:   'rgba(8,14,24,0.9)',
      overflow:     'hidden',
    }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <div style={{
        position:   'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
        fontFamily: T.font, fontSize: 8, letterSpacing: '0.2em', color: T.textMuted,
        pointerEvents: 'none',
      }}>
        SEISMIC WAVEFORM · {active ? 'LIVE FEED' : 'STANDBY'}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  ROOT APP
// ═════════════════════════════════════════════════════════════════════════════
export default function App() {
  // Stats (top bar)
  const [stats, setStats]           = useState(null);
  const [statsLoading, setStatsL]   = useState(true);

  // History / histogram
  const [histData, setHistData]     = useState([]);
  const [histLoading, setHistL]     = useState(true);

  // Route
  const [magnitude, setMagnitude]   = useState(4.5);
  const [loading, setLoading]       = useState(false);
  const [status, setStatus]         = useState('STANDBY');
  const [quakes, setQuakes]         = useState([]);
  const [polyline, setPolyline]     = useState([]);
  const [totalDist, setTotalDist]   = useState(null);
  const [nnDist, setNnDist]         = useState(null);
  const [efficiency, setEfficiency] = useState(null);
  const [execTime, setExecTime]     = useState(null);

  // Drone animation
  const [droneIdx, setDroneIdx]     = useState(-1);
  const droneTimer = useRef(null);

  // ── Boot: fetch stats + history ──────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/api/stats`)
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {})
      .finally(() => setStatsL(false));

    fetch(`${API}/api/history`)
      .then((r) => r.json())
      .then((d) => setHistData(d.bins || []))
      .catch(() => {})
      .finally(() => setHistL(false));
  }, []);

  // ── Drone animation ──────────────────────────────────────────────────────
  useEffect(() => {
    clearInterval(droneTimer.current);
    if (quakes.length > 0) {
      setDroneIdx(0);
      droneTimer.current = setInterval(() => setDroneIdx((i) => i + 1), 900);
    } else {
      setDroneIdx(-1);
    }
    return () => clearInterval(droneTimer.current);
  }, [quakes]);

  // ── Dispatch ─────────────────────────────────────────────────────────────
  const dispatch = useCallback(async () => {
    setLoading(true);
    setStatus('COMPUTING');
    setQuakes([]);
    setPolyline([]);
    setTotalDist(null);
    setNnDist(null);
    setEfficiency(null);
    setExecTime(null);

    try {
      const res  = await fetch(`${API}/api/route?minMag=${magnitude}`);
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = await res.json();
      const route = data.route || [];

      setQuakes(route);
      setTotalDist(data.totalDistanceKm);
      setNnDist(data.nnDistanceKm);
      setEfficiency(data.optimisationEfficiency);
      setExecTime(data.executionTimeMs);

      if (route.length > 0) {
        const coords = route.map((q) => [q.latitude, q.longitude]);
        coords.push(coords[0]);
        setPolyline(coords);
      }

      setStatus('LIVE');
    } catch {
      setStatus('ERROR');
    } finally {
      setLoading(false);
    }
  }, [magnitude]);

  const waveformIntensity = useMemo(() => quakes.length * 2 + (totalDist || 0) * 0.001, [quakes, totalDist]);

  return (
    <>
      {/* Inject global styles */}
      <style>{INJECTED_STYLE}</style>

      {/* Root grid */}
      <div style={{
        display:             'grid',
        gridTemplateAreas:   `"topbar topbar topbar" "left map right" "footer footer footer"`,
        gridTemplateColumns: '240px 1fr 280px',
        gridTemplateRows:    '54px 1fr 56px',
        width:               '100vw',
        height:              '100vh',
        background:          T.bg,
        fontFamily:          T.font,
        color:               T.text,
        gap:                 8,
        padding:             8,
      }}>
        <TopBar stats={stats} statsLoading={statsLoading} />

        <ControlPanel
          magnitude={magnitude}
          setMagnitude={setMagnitude}
          onDispatch={dispatch}
          loading={loading}
          status={status}
          quakeCount={quakes.length}
        />

        <MapPanel quakes={quakes} polyline={polyline} droneIdx={droneIdx} />

        <TelemetryPanel
          quakes={quakes}
          totalDist={totalDist}
          execTime={execTime}
          nnDist={nnDist}
          efficiency={efficiency}
          histData={histData}
          histLoading={histLoading}
        />

        <WaveformCanvas active={quakes.length > 0} intensity={waveformIntensity} />
      </div>
    </>
  );
}
