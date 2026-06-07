// Centralized theme system for SEISMICA
// "Emergency Operations Center" design tokens
export const THEME = {
  // Primary Palette
  bg: '#191414',                 // Black (Primary Background)
  bgPanel: '#201b1b',            // Elevated Dark Grey (Secondary Background)
  bgElevated: '#2d2525',         // Further Elevated Dark Grey
  border: '#95E0DE',             // Aquamarine Border
  highlight: '#CDF354',          // Citric (Highlight Color)
  critical: '#FF4632',           // Tangerine (Critical/Alert Color)

  // Text Hierarchy
  textPrimary: '#95E0DE',        // Aquamarine
  textSecondary: '#CDF354',      // Citric
  textMuted: 'rgba(149, 224, 222, 0.6)', // Muted Aquamarine
  textDim: 'rgba(149, 224, 222, 0.45)',

  // Route Colors
  nnColor: '#95E0DE',            // Nearest Neighbor (Aquamarine)
  optColor: '#F037A5',           // 2-Opt Optimized (Fuchsia)

  // Interactive Elements
  interactive: '#4100F5',        // Klein Blue
  hover: '#F037A5',              // Fuchsia
  active: '#CDF354',             // Citric

  // Transparency variants
  bgPanelAlpha: 'rgba(32, 27, 27, 0.75)',       // Elevated translucent
  bgPanelAlphaBlur: 'rgba(32, 27, 27, 0.92)',   // Elevated higher opacity
  bgElevatedAlpha: 'rgba(149, 224, 222, 0.15)',  // Translucent Aquamarine
  borderAlpha: 'rgba(149, 224, 222, 0.3)',      // Aquamarine border translucent
  borderAlphaHover: 'rgba(149, 224, 222, 0.75)',  // Aquamarine border hover translucent
  highlightAlpha: 'rgba(205, 243, 84, 0.12)',   // Citric highlight translucent
  glowGreen: 'rgba(149, 224, 222, 0.35)',        // Soft Aquamarine glow
  glowBlush: 'rgba(240, 55, 165, 0.25)',        // Soft Fuchsia glow

  // Chart/Graph/Magnitude Colors (derived from palette)
  barColors: [
    '#2d2525', // Low/Minor (Dark Gray)
    'rgba(149, 224, 222, 0.4)', // Low-moderate
    '#95E0DE', // Moderate (Aquamarine)
    'rgba(205, 243, 84, 0.6)', // Moderate-high
    '#CDF354', // Strong (Citric Highlight)
    '#F037A5', // Major (Fuchsia)
    'rgba(255, 70, 50, 0.8)', // Major-high (Tangerine translucent)
    '#FF4632'  // Extreme/Critical (Tangerine)
  ],
};
