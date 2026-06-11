import React, { memo } from 'react';
import {
  MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, useMap, ZoomControl,
} from 'react-leaflet';
import { magToColor, magToRadius, DEFAULT_CENTER, DEFAULT_ZOOM } from '../../utils/mapHelpers';
import { fmtTimestamp } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

// ── Tile provider: Stadia Maps Alidade Smooth Dark
//    ✓ English-only labels worldwide
//    ✓ Dark tactical aesthetic
const TILE_URL  = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';
const TILE_ATTR = '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>';

// ── Auto-fit map bounds when route changes ────────────────────────────────────
function MapFit({ quakes }) {
  const map = useMap();
  React.useEffect(() => {
    if (quakes.length < 2) return;
    try {
      const L      = require('leaflet');
      const bounds = L.latLngBounds(quakes.map((q) => [q.latitude, q.longitude]));
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 6, animate: true, duration: 1 });
    } catch (_) {}
  }, [quakes, map]);
  return null;
}

// ── Single earthquake marker ──────────────────────────────────────────────────
const QuakeMarker = memo(({ quake, idx }) => {
  const color  = magToColor(quake.magnitude);
  const radius = magToRadius(quake.magnitude);

  return (
    <>
      {/* Pulse ring */}
      <CircleMarker
        center={[quake.latitude, quake.longitude]}
        radius={radius * 2.2}
        pathOptions={{ color, fillColor: color, fillOpacity: 0, weight: 1, opacity: 0.25 }}
      />
      {/* Core marker */}
      <CircleMarker
        center={[quake.latitude, quake.longitude]}
        radius={radius}
        pathOptions={{ color, fillColor: color, fillOpacity: 0.78, weight: 1.5 }}
      >
        <Tooltip direction="top" offset={[0, -radius - 4]} opacity={1}>
          <div style={{ fontFamily: 'var(--font-mono)', minWidth: 200 }}>
            <div style={{
              fontWeight: 700, color: 'var(--text)', fontSize: 11,
              marginBottom: 6, paddingBottom: 5,
              borderBottom: '1px solid var(--border)', lineHeight: 1.4,
            }}>
              {quake.place}
            </div>
            {[
              ['MAGNITUDE', `${quake.magnitude?.toFixed(1)}`,         color],
              ['WAYPOINT',  `#${idx + 1}`,                            'var(--accent)'],
              ['LATITUDE',  `${quake.latitude?.toFixed(4)}°`,         'var(--text)'],
              ['LONGITUDE', `${quake.longitude?.toFixed(4)}°`,        'var(--text)'],
              ['DEPTH',     quake.depth != null ? `${quake.depth.toFixed(1)} km` : '—', 'var(--text)'],
              ['TIME',      fmtTimestamp(quake.time),                  'var(--text-muted)'],
            ].map(([k, v, c]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 3 }}>
                <span style={{ fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.12em' }}>{k}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: c }}>{v}</span>
              </div>
            ))}
          </div>
        </Tooltip>
      </CircleMarker>
    </>
  );
});

// ── Drone position marker ─────────────────────────────────────────────────────
const DroneMarker = memo(({ quake, idx, criticalColor }) => {
  if (!quake) return null;
  return (
    <CircleMarker
      center={[quake.latitude, quake.longitude]}
      radius={11}
      pathOptions={{ color: criticalColor, fillColor: criticalColor, fillOpacity: 1, weight: 2.5 }}
    >
      <Tooltip permanent direction="top" offset={[0, -14]} opacity={1}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 8, color: criticalColor, letterSpacing: '0.12em' }}>
          ✈ WPT {idx + 1}
        </span>
      </Tooltip>
    </CircleMarker>
  );
});

// ── Dual-route polyline renderer ──────────────────────────────────────────────
/**
 * Renders glow + core layers for a single route.
 * Focus/dim state is driven by CSS transition on stroke-opacity.
 */
const RouteLines = memo(({ positions, color, focused, dimmed, routeFailed }) => {
  if (!positions || positions.length < 2) return null;

  const lineColor  = routeFailed ? '#FF4632' : color;
  const glowOp     = dimmed ? 0.01 : focused ? 0.35 : 0.15;
  const coreOp     = dimmed ? 0.12 : focused ? 0.98 : 0.70;
  const coreWeight = focused ? 3.5 : 2.0;
  const glowWeight = focused ? 16  : 10;

  return (
    <>
      {/* Glow layer */}
      <Polyline
        positions={positions}
        pathOptions={{
          color:   lineColor,
          weight:  glowWeight,
          opacity: glowOp,
        }}
        className="route-glow"
      />
      {/* Core dashed layer */}
      <Polyline
        positions={positions}
        pathOptions={{
          color:     lineColor,
          weight:    coreWeight,
          opacity:   coreOp,
          dashArray: '8 6',
        }}
        className="route-core"
      />
    </>
  );
});

// ─────────────────────────────────────────────────────────────────────────────

export default function TacticalMap({
  quakes,
  polyline,       // 2-Opt optimised
  nnPolyline,     // Nearest Neighbour
  droneIdx,
  routeFailed,
  focusedRoute,   // 'nn' | '2opt' | 'both'
}) {
  const { theme } = useTheme();
  const NN_COLOR  = theme.nnColor;
  const OPT_COLOR = theme.optColor;

  const droneQuake = quakes.length > 0 && droneIdx >= 0
    ? quakes[droneIdx % quakes.length]
    : null;

  // Focus flags for each route
  const nnFocused  = focusedRoute === 'nn';
  const nnDimmed   = focusedRoute === '2opt';
  const optFocused = focusedRoute === '2opt';
  const optDimmed  = focusedRoute === 'nn';

  const hasRoutes = polyline.length > 1 || nnPolyline.length > 1;

  return (
    <div style={{
      gridArea:     'map',
      position:     'relative',
      borderRadius: 8,
      overflow:     'hidden',
      border:       '1px solid var(--border)',
    }}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ width: '100%', height: '100%', background: 'var(--bg)' }}
        zoomControl={false}
      >
        <TileLayer
          url={TILE_URL}
          attribution={TILE_ATTR}
          subdomains="abcd"
          maxZoom={20}
        />

        {/* Zoom control — bottom-left */}
        <ZoomControl position="bottomleft" />

        <MapFit quakes={quakes} />

        {/* Earthquake markers */}
        {quakes.map((q, i) => <QuakeMarker key={q.id} quake={q} idx={i} />)}

        {/* ── Nearest Neighbour route — Orange ──────────────────────────── */}
        <RouteLines
          positions={nnPolyline}
          color={NN_COLOR}
          focused={nnFocused}
          dimmed={nnDimmed}
          routeFailed={routeFailed}
        />

        {/* ── 2-Opt Optimised route — Cyan ──────────────────────────────── */}
        <RouteLines
          positions={polyline}
          color={OPT_COLOR}
          focused={optFocused}
          dimmed={optDimmed}
          routeFailed={routeFailed}
        />

        {/* Drone marker animates along the 2-Opt (optimised) route */}
        <DroneMarker
          quake={droneQuake}
          idx={droneIdx >= 0 ? droneIdx % Math.max(1, quakes.length) : 0}
          criticalColor={theme.critical}
        />
      </MapContainer>

      {/* ── Bottom-center route badge ──────────────────────────────────────── */}
      {hasRoutes && (
        <div style={{
          position:       'absolute',
          bottom:         16,
          left:           '50%',
          transform:      'translateX(-50%)',
          background:     'var(--map-overlay-bg)',
          border:         `1px solid ${routeFailed ? 'var(--critical)' : 'var(--border)'}`,
          borderRadius:   6,
          padding:        '7px 20px',
          fontFamily:     'var(--font-display)',
          fontSize:       8,
          letterSpacing:  '0.2em',
          color:          routeFailed ? 'var(--critical)' : 'var(--accent)',
          pointerEvents:  'none',
          backdropFilter: 'blur(8px)',
          zIndex:         800,
          whiteSpace:     'nowrap',
          boxShadow:      `var(--map-overlay-shadow)`,
        }}>
          {routeFailed
            ? `⚠ ROUTE EXCEEDS RANGE — ${quakes.length} WAYPOINTS`
            : `✈ ROUTE OPTIMISED · ${quakes.length} WAYPOINTS`}
        </div>
      )}

      {/* ── Top-left overlay ──────────────────────────────────────────────── */}
      <div style={{
        position:      'absolute',
        top:           12,
        left:          12,
        fontFamily:    'var(--font-mono)',
        fontSize:      8,
        color:         'var(--text-muted)',
        letterSpacing: '0.08em',
        pointerEvents: 'none',
        zIndex:        800,
        lineHeight:    1.8,
      }}>
        <div>TACTICAL MAP · STADIA DARK</div>
        <div>DATA: USGS LIVE FEED · ENGLISH LABELS</div>
      </div>

      {/* ── Top-right dual-route mini legend ──────────────────────────────── */}
      {hasRoutes && (
        <div style={{
          position:       'absolute',
          top:            12,
          right:          12,
          background:     'var(--map-minilegend-bg)',
          border:         '1px solid var(--border)',
          borderRadius:   5,
          padding:        '6px 10px',
          pointerEvents:  'none',
          zIndex:         800,
          backdropFilter: 'blur(6px)',
          display:        'flex',
          flexDirection:  'column',
          gap:            4,
        }}>
          {[
            { color: NN_COLOR,  label: 'NEAREST NEIGHBOUR', dimmed: nnDimmed  },
            { color: OPT_COLOR, label: '2-OPT OPTIMISED',   dimmed: optDimmed },
          ].map(({ color, label, dimmed }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: dimmed ? 0.3 : 1, transition: 'opacity 0.35s ease' }}>
              <div style={{
                width: 18, height: 2,
                background: `repeating-linear-gradient(90deg, ${color} 0 5px, transparent 5px 8px)`,
                flexShrink: 0,
              }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 7, color, letterSpacing: '0.1em' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
