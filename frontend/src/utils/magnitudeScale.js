export const MAG_SCALE = [
  { range: '≥ 6.0',     color: '#FF4632', label: 'MAJOR'    },
  { range: '5.0 – 5.9', color: '#F037A5', label: 'STRONG'   },
  { range: '4.0 – 4.9', color: '#CDF354', label: 'MODERATE' },
  { range: '< 4.0',     color: '#95E0DE', label: 'MINOR'    },
];

export const magToColor = (mag) => {
  if (mag >= 6.0) return '#FF4632'; // Tangerine
  if (mag >= 5.0) return '#F037A5'; // Fuchsia
  if (mag >= 4.0) return '#CDF354'; // Citric
  return '#95E0DE'; // Aquamarine
};

export const magToLabel = (mag) => {
  if (mag >= 6.0) return 'MAJOR';
  if (mag >= 5.0) return 'STRONG';
  if (mag >= 4.0) return 'MODERATE';
  return 'MINOR';
};
