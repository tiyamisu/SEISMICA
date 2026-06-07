import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react';
import 'leaflet/dist/leaflet.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartTooltip, ResponsiveContainer, Cell,
} from 'recharts';

// ── Components ────────────────────────────────────────────────────────────────
import Header              from './components/Header/Header';
import TacticalMap         from './components/TacticalMap/TacticalMap';
import ControlMatrix       from './components/ControlMatrix/ControlMatrix';
import AlgorithmProgress   from './components/AlgorithmProgress/AlgorithmProgress';
import AlgorithmComparison from './components/AlgorithmComparison/AlgorithmComparison';
import BatterySimulation   from './components/BatterySimulation/BatterySimulation';
import MissionAnalysis     from './components/MissionAnalysis/MissionAnalysis';
import AlertFeed           from './components/AlertFeed/AlertFeed';
import WaypointManifest    from './components/WaypointManifest/WaypointManifest';
import Waveform            from './components/Waveform/Waveform';
import RouteLegend         from './components/RouteLegend/RouteLegend';
import LiveStatus          from './components/LiveStatus/LiveStatus';
import { THEME }           from './theme';

// ── Hooks & Services ──────────────────────────────────────────────────────────
import { useMission, STATUS }  from './hooks/useMission';
import { useStats }            from './hooks/useStats';
import { useAlertFeed }        from './hooks/useAlertFeed';
import { useAutoRefresh }      from './hooks/useAutoRefresh';
import { api }                 from './services/api';
import { calcMission }         from './utils/formatters';

// ─────────────────────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_DRONE_PARAMS = {
  capacityWh: 100,
  maxRangeKm: 2000,
  speedKmh:   120,
  whPerKm:    0.05,
};

const BAR_COLORS = THEME.barColors;

// Algorithm-specific telemetry card highlighting colours
const FOCUS_COLORS = {
  nn:   THEME.nnColor,
  '2opt': THEME.optColor,
  both: null,
};

// ─────────────────────────────────────────────────────────────────────────────
//  TelemetryPanel — with algorithm-aware card highlighting
// ─────────────────────────────────────────────────────────────────────────────
function HistoTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(32, 27, 27, 0.97)', border: '1px solid var(--border)',
      borderRadius: 6, padding: '8px 14px',
      fontFamily: 'var(--font-display)', fontSize: 10,
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>MAG {label}</div>
      <div style={{ color: 'var(--accent)', fontWeight: 700 }}>{payload[0].value} EVENTS</div>
    </div>
  );
}

function TelemetryPanel({ result, histData, histLoading, focusedRoute }) {
  // Which metric cards get highlighted per algorithm selection
  const nnHighlight  = focusedRoute === 'nn';
  const optHighlight = focusedRoute === '2opt';

  const metrics = result ? [
    {
      label:     'TOTAL DISTANCE',
      value:     `${Number(result.totalDistanceKm).toLocaleString('en-US',{maximumFractionDigits:0})} km`,
      color:     'var(--warning)',
      highlight: optHighlight,
      hColor:    FOCUS_COLORS['2opt'],
    },
    {
      label:     'NN DISTANCE',
      value:     `${Number(result.nnDistanceKm).toLocaleString('en-US',{maximumFractionDigits:0})} km`,
      color:     'var(--success)',
      highlight: nnHighlight,
      hColor:    FOCUS_COLORS.nn,
    },
    {
      label:     'OPTIMISATION',
      value:     `${Number(result.optimisationEfficiency).toFixed(1)}% SAVED`,
      color:     'var(--accent)',
      highlight: false,
      hColor:    null,
    },
    {
      label:     'EXEC TIME',
      value:     result.executionTimeMs < 1000
        ? `${result.executionTimeMs.toFixed(1)} ms`
        : `${(result.executionTimeMs / 1000).toFixed(2)} s`,
      color:     'var(--text)',
      highlight: false,
      hColor:    null,
    },
    {
      label:     'NN TIME',
      value:     `${result.nnExecutionMs?.toFixed(2) ?? '—'} ms`,
      color:     'var(--success)',
      highlight: nnHighlight,
      hColor:    FOCUS_COLORS.nn,
    },
    {
      label:     '2-OPT TIME',
      value:     `${result.twoOptExecutionMs?.toFixed(2) ?? '—'} ms`,
      color:     'var(--warning)',
      highlight: optHighlight,
      hColor:    FOCUS_COLORS['2opt'],
    },
  ] : [];

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>▸ DATA TELEMETRY</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {metrics.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
            {metrics.map(({ label, value, color, highlight, hColor }) => (
              <div
                key={label}
                className="metric-card"
                style={{
                  border:     highlight ? `1px solid ${hColor}60` : undefined,
                  background: highlight ? `${hColor}10` : undefined,
                  boxShadow:  highlight ? `0 0 10px ${hColor}20` : undefined,
                  transition: 'all 0.35s ease',
                }}
              >
                <div className="metric-label">{label}</div>
                <div
                  className="metric-value"
                  style={{ color: highlight ? hColor : color, fontSize: 11, transition: 'color 0.35s ease' }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Histogram */}
        <div>
          <div className="section-title">SEISMIC FREQUENCY BY MAGNITUDE</div>
          {histLoading ? (
            <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>
              LOADING…
            </div>
          ) : histData.length > 0 ? (
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={histData} margin={{ top: 0, right: 4, left: -22, bottom: 0 }} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(149, 224, 222, 0.15)" vertical={false} />
                <XAxis dataKey="range" tick={{ fontFamily: 'var(--font-mono)', fontSize: 7, fill: 'var(--text-muted)' }}
                       axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 7, fill: 'var(--text-muted)' }}
                       axisLine={false} tickLine={false} />
                <RechartTooltip content={<HistoTooltip />} cursor={{ fill: 'rgba(149, 224, 222, 0.08)' }} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {histData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i] || 'var(--accent)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>
              NO DATA
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  ROOT APPLICATION
// ═════════════════════════════════════════════════════════════════════════════
export default function App() {
  // ── Mission parameters ────────────────────────────────────────────────────
  const [magnitude,    setMagnitude]    = useState(4.5);
  const [timeframe,    setTimeframe]    = useState('24h');
  const [droneParams,  setDroneParams]  = useState(DEFAULT_DRONE_PARAMS);

  // ── Route focus state — default: 2-Opt selected ───────────────────────────
  const [focusedRoute, setFocusedRoute] = useState('2opt');

  // ── Core hooks ───────────────────────────────────────────────────────────
  const mission   = useMission();
  const { stats, loading: statsLoading } = useStats(timeframe);
  const alertFeed = useAlertFeed();

  // ── History / histogram ───────────────────────────────────────────────────
  const [histData,    setHistData]    = useState([]);
  const [histLoading, setHistLoading] = useState(true);

  useEffect(() => {
    setHistLoading(true);
    api.history(timeframe === '30d' ? '30d' : '7d')
      .then((d) => setHistData(d.bins || []))
      .catch(() => setHistData([]))
      .finally(() => setHistLoading(false));
  }, [timeframe]);

  // ── Drone animation ───────────────────────────────────────────────────────
  const [droneIdx,  setDroneIdx]  = useState(-1);
  const droneTimer  = useRef(null);

  useEffect(() => {
    clearInterval(droneTimer.current);
    if (mission.quakes.length > 0 && mission.isSuccess) {
      setDroneIdx(0);
      droneTimer.current = setInterval(() => setDroneIdx((i) => i + 1), 900);
    } else {
      setDroneIdx(-1);
    }
    return () => clearInterval(droneTimer.current);
  }, [mission.quakes, mission.isSuccess]);

  // ── Alert feed ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mission.isSuccess && mission.quakes.length > 0) {
      alertFeed.populateFromRoute(mission.quakes);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mission.isSuccess, mission.quakes]);

  // ── Dispatch handler ──────────────────────────────────────────────────────
  const handleDispatch = useCallback(() => {
    alertFeed.clear();
    mission.dispatch(magnitude, timeframe);
  }, [alertFeed, mission, magnitude, timeframe]);

  // ── Track whether user has dispatched at least once ───────────────────────
  const hasDispatchedRef = useRef(false);
  useEffect(() => {
    if (mission.isSuccess) hasDispatchedRef.current = true;
  }, [mission.isSuccess]);

  // ── Auto-refresh: stable refs for current params ──────────────────────────
  const magnitudeRef = useRef(magnitude);
  const timeframeRef = useRef(timeframe);
  useEffect(() => { magnitudeRef.current = magnitude; }, [magnitude]);
  useEffect(() => { timeframeRef.current = timeframe; }, [timeframe]);

  // dispatchRef keeps useAutoRefresh's refreshFn stable across re-renders
  const dispatchRef = useRef(mission.dispatch);
  useEffect(() => { dispatchRef.current = mission.dispatch; }, [mission.dispatch]);

  const autoRefreshCb = useCallback(async () => {
    if (!hasDispatchedRef.current) return;
    alertFeed.clear();
    await dispatchRef.current(magnitudeRef.current, timeframeRef.current);
  }, [alertFeed]);

  const {
    syncStatus,
    lastUpdated,
    countdown,
    errorMsg,
    manualRefresh,
  } = useAutoRefresh(autoRefreshCb, hasDispatchedRef.current && mission.isSuccess);

  // ── Battery feasibility → map polyline colour ─────────────────────────────
  const routeFailed = useMemo(() => {
    if (!mission.result?.totalDistanceKm) return false;
    const m = calcMission(
      mission.result.totalDistanceKm,
      droneParams.capacityWh,
      droneParams.maxRangeKm,
      droneParams.whPerKm,
      droneParams.speedKmh,
    );
    return m ? !m.feasible : false;
  }, [mission.result, droneParams]);

  // ── ControlMatrix status ──────────────────────────────────────────────────
  const cmStatus = mission.status === STATUS.LOADING ? STATUS.LOADING
    : mission.status === STATUS.SUCCESS              ? STATUS.SUCCESS
    : mission.status === STATUS.ERROR                ? STATUS.ERROR
    : STATUS.IDLE;

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display:             'grid',
      gridTemplateAreas:   '"topbar topbar topbar" "left map right" "footer footer footer"',
      gridTemplateColumns: '260px 1fr 300px',
      gridTemplateRows:    '48px 1fr 40px',
      width:               '100%',
      height:              '100%',
      background:          'var(--bg)',
      fontFamily:          'var(--font-display)',
      color:               'var(--text)',
      gap:                 8,
      padding:             8,
      overflow:            'hidden',
    }}>

      {/* ── TOP BAR ──────────────────────────────────────────────────────── */}
      <Header
        stats={stats}
        statsLoading={statsLoading}
        timeframe={timeframe}
      />

      {/* ── LEFT PANEL ───────────────────────────────────────────────────── */}
      <div style={{
        gridArea:      'left',
        display:       'flex',
        flexDirection: 'column',
        gap:           8,
        overflow:      'hidden',
        height:        '100%',
      }}>
        <ControlMatrix
          magnitude={magnitude}     setMagnitude={setMagnitude}
          timeframe={timeframe}     setTimeframe={setTimeframe}
          droneParams={droneParams} setDroneParams={setDroneParams}
          onDispatch={handleDispatch}
          status={cmStatus}
          quakeCount={mission.quakes.length}
        />

        {/* Live auto-refresh status */}
        <LiveStatus
          syncStatus={syncStatus}
          lastUpdated={lastUpdated}
          countdown={countdown}
          errorMsg={errorMsg}
          onManualRefresh={manualRefresh}
          hasDispatched={mission.isSuccess || hasDispatchedRef.current}
        />
      </div>

      {/* ── MAP ──────────────────────────────────────────────────────────── */}
      <TacticalMap
        quakes={mission.quakes}
        polyline={mission.polyline}
        nnPolyline={mission.nnPolyline}
        droneIdx={droneIdx}
        routeFailed={routeFailed}
        focusedRoute={focusedRoute}
      />

      {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
      <div style={{
        gridArea:  'right',
        display:   'flex',
        flexDirection: 'column',
        gap:       8,
        overflowY: 'auto',
        overflowX: 'hidden',
        height:    '100%',
      }}>

        {/* Algorithm pipeline progress */}
        <AlgorithmProgress
          status={mission.status}
          stepIndex={mission.stepIndex}
        />

        {/* Route legend — interactive focus toggle */}
        <RouteLegend
          focusedRoute={focusedRoute}
          setFocusedRoute={setFocusedRoute}
          result={mission.result}
        />

        {/* Telemetry with algorithm-aware card highlighting */}
        <TelemetryPanel
          result={mission.result}
          histData={histData}
          histLoading={histLoading}
          focusedRoute={focusedRoute}
        />

        {/* NN vs 2-Opt side-by-side comparison */}
        {mission.result && <AlgorithmComparison result={mission.result} />}

        {/* Battery simulation */}
        <BatterySimulation
          totalDistKm={mission.result?.totalDistanceKm ?? null}
          droneParams={droneParams}
        />

        {/* Auto-generated mission narrative */}
        {mission.result && (
          <MissionAnalysis
            result={mission.result}
            droneParams={droneParams}
          />
        )}

        {/* Waypoint manifest */}
        {mission.quakes.length > 0 && (
          <WaypointManifest
            quakes={mission.quakes}
            droneIdx={droneIdx}
          />
        )}

        {/* Live alert feed */}
        <AlertFeed entries={alertFeed.entries} />
      </div>

      {/* ── FOOTER WAVEFORM ───────────────────────────────────────────────── */}
      <Waveform
        quakeCount={mission.quakes.length}
        active={mission.isSuccess}
      />
    </div>
  );
}
