import React, { useRef, useEffect, memo } from 'react';

export default memo(function Waveform({ quakeCount = 0, active = false }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const timeRef   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext('2d');

    const amp    = Math.min(0.9, 0.2 + quakeCount * 0.015);
    const noise  = () => (Math.random() - 0.5) * 0.4;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      const t = (timeRef.current += 0.025);

      ctx.clearRect(0, 0, W, H);

      // 1. Draw Accent Highlight Wave in Fuchsia
      ctx.beginPath();
      const gradAccent = ctx.createLinearGradient(0, 0, W, 0);
      gradAccent.addColorStop(0,   'rgba(240, 55, 165, 0)');
      gradAccent.addColorStop(0.3, 'rgba(240, 55, 165, 0.3)');
      gradAccent.addColorStop(0.5, 'rgba(240, 55, 165, 0.6)');
      gradAccent.addColorStop(0.7, 'rgba(240, 55, 165, 0.3)');
      gradAccent.addColorStop(1,   'rgba(240, 55, 165, 0)');

      ctx.strokeStyle = gradAccent;
      ctx.lineWidth   = 0.9;
      ctx.shadowColor = '#4100F5'; // Klein Blue glow
      ctx.shadowBlur  = 6;

      for (let x = 0; x <= W; x += 3) {
        const prog = x / W;
        const y = H / 2 +
          Math.sin(prog * 14 + t * 1.4)  * amp * H * 0.13 +
          Math.sin(prog * 6 + t * 0.8)   * amp * H * 0.07 +
          noise()                        * amp * H * 0.02;

        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 2. Draw Main Base Wave in Aquamarine
      const gradMain = ctx.createLinearGradient(0, 0, W, 0);
      gradMain.addColorStop(0,   'rgba(149, 224, 222, 0)');
      gradMain.addColorStop(0.2, 'rgba(149, 224, 222, 0.55)');
      gradMain.addColorStop(0.5, 'rgba(149, 224, 222, 0.95)');
      gradMain.addColorStop(0.8, 'rgba(149, 224, 222, 0.55)');
      gradMain.addColorStop(1,   'rgba(149, 224, 222, 0)');

      ctx.beginPath();
      ctx.strokeStyle = gradMain;
      ctx.lineWidth   = 1.8;
      ctx.shadowColor = '#4100F5'; // Klein Blue glow
      ctx.shadowBlur  = 12;

      const points = [];
      for (let x = 0; x <= W; x++) {
        const prog = x / W;
        const y = H / 2 +
          Math.sin(prog * 20 + t)        * amp * H * 0.18 +
          Math.sin(prog * 8 + t * 1.3)   * amp * H * 0.12 +
          Math.sin(prog * 45 + t * 2.1)  * amp * H * 0.06 +
          noise()                         * amp * H * 0.03;

        points.push({ x, y });
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 3. Draw Peak and Critical Peak indicators (Citric & Tangerine)
      if (active && amp > 0.15) {
        ctx.shadowBlur = 0; // disable shadow for sharp pixel dots
        for (let i = 15; i < points.length - 15; i += 16) {
          const { x, y } = points[i];
          const dev = Math.abs(y - H / 2);
          const maxPossibleDev = amp * H * 0.36;

          if (dev > maxPossibleDev * 0.65) {
            // Critical Peak (Tangerine)
            ctx.fillStyle = '#FF4632';
            ctx.beginPath();
            ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
            ctx.fill();

            // Vertical indicator
            ctx.strokeStyle = 'rgba(255, 70, 50, 0.25)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, H / 2);
            ctx.lineTo(x, y);
            ctx.stroke();
          } else if (dev > maxPossibleDev * 0.4) {
            // Peak (Citric)
            ctx.fillStyle = '#CDF354';
            ctx.beginPath();
            ctx.arc(x, y, 1.8, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    // Handle resize
    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);
    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [quakeCount, active]);

  return (
    <div style={{
      gridArea:   'footer',
      position:   'relative',
      background: 'rgba(25, 20, 20, 0.95)',
      borderTop:  '1px solid var(--border)',
      display:    'flex',
      alignItems: 'center',
      padding:    '0 20px',
      gap:        16,
      height:     40,
    }}>
      <span style={{
        fontFamily:    'var(--font-display)',
        fontSize:      7,
        letterSpacing: '0.2em',
        color:         'var(--text-muted)',
        flexShrink:    0,
        whiteSpace:    'nowrap',
      }}>
        SEISMIC WAVEFORM
      </span>
      <canvas
        ref={canvasRef}
        style={{ flex: 1, height: '100%', display: 'block' }}
      />
      <span style={{
        fontFamily:    'var(--font-mono)',
        fontSize:      7,
        letterSpacing: '0.1em',
        color:         'var(--text-muted)',
        flexShrink:    0,
        whiteSpace:    'nowrap',
      }}>
        {quakeCount > 0 ? `${quakeCount} ACTIVE EVENTS` : 'MONITORING…'}
      </span>
    </div>
  );
});
