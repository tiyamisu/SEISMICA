// ════════════════════════════════════════════════════════════════════════════
// SEISMICA — Dual Theme System
// ════════════════════════════════════════════════════════════════════════════

// ── DARK THEME — Original Command Center ─────────────────────────────────────
export const DARK_THEME = {
  // Backgrounds
  bg:         '#191414',
  bgPanel:    'rgba(32, 27, 27, 0.85)',
  bgElevated: 'rgba(45, 37, 37, 0.55)',

  // Borders
  border:      'rgba(149, 224, 222, 0.25)',
  borderHover: 'rgba(149, 224, 222, 0.65)',

  // Accents
  highlight:   '#CDF354',
  interactive: '#4100F5',
  hover:       '#F037A5',
  active:      '#CDF354',

  // Status
  success:    '#95E0DE',
  warning:    '#F037A5',
  critical:   '#FF4632',

  // Text
  textPrimary:   '#95E0DE',
  textSecondary: '#CDF354',
  textMuted:     'rgba(149, 224, 222, 0.6)',
  textDim:       'rgba(149, 224, 222, 0.45)',

  // Routes (polyline & legend)
  nnColor:  '#95E0DE',    // Aquamarine — Nearest Neighbour
  optColor: '#F037A5',    // Fuchsia    — 2-Opt Optimised

  // Chart bar palette
  barColors: [
    'rgba(45, 37, 37, 0.9)',
    'rgba(149, 224, 222, 0.30)',
    'rgba(149, 224, 222, 0.55)',
    'rgba(205, 243, 84, 0.50)',
    '#CDF354',
    '#F037A5',
    'rgba(255, 70, 50, 0.70)',
    '#FF4632',
  ],
};

// ── LIGHT THEME — Enterprise Analytics ───────────────────────────────────────
export const LIGHT_THEME = {
  // Backgrounds
  bg:         '#EEF2F9',
  bgPanel:    '#FFFFFF',
  bgElevated: '#F7F9FC',

  // Borders
  border:      'rgba(14, 30, 64, 0.10)',
  borderHover: 'rgba(65, 0, 245, 0.35)',

  // Accents
  highlight:   '#2E0FBF',
  interactive: '#2E0FBF',
  hover:       '#1A0D9A',
  active:      '#2E0FBF',

  // Status — darkened for legibility on light surfaces
  success:  '#1A8A7B',
  warning:  '#C0197A',
  critical: '#D93A2A',

  // Text
  textPrimary:   '#0E1E40',
  textSecondary: 'rgba(14, 30, 64, 0.65)',
  textMuted:     'rgba(14, 30, 64, 0.55)',
  textDim:       'rgba(14, 30, 64, 0.35)',

  // Routes
  nnColor:  '#1A8A7B',   // Teal-green  — Nearest Neighbour
  optColor: '#C0197A',   // Deep Fuchsia — 2-Opt Optimised

  // Chart bar palette
  barColors: [
    '#CBD5E0',
    'rgba(26, 138, 123, 0.35)',
    '#1A8A7B',
    'rgba(46, 15, 191, 0.45)',
    '#2E0FBF',
    '#C0197A',
    'rgba(217, 58, 42, 0.65)',
    '#D93A2A',
  ],
};

// ── Legacy default export (dark) — kept for non-context-aware usages ─────────
export const THEME = DARK_THEME;
