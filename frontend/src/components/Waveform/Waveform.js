import React, { useRef, useEffect, memo } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default memo(function Waveform({ quakeCount = 0, active = false }) {
  const { isDark } = useTheme();
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const timeRef   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const amp = Math.min(0.9, 0.2 + quakeCount * 0.015);
    const noise = () => (Math.random() - 0.5) * 0.4;

    const draw = () => {
      const W = canvas.width  / window.devicePixelRatio;
      const H = canvas.height / window.devicePixelRatio;
      const t = (timeRef.current += 0.025);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isDark) {
        // ── DARK MODE — Aquamarine + Fuchsia with Klein Blue glow ────────────

        // Accent wave — Fuchsia
        const gradAccent = ctx.createLinearGradient(0, 0, W, 0);
        gradAccent.addColorStop(0,   'rgba(240, 55, 165, 0)');
        gradAccent.addColorStop(0.3, 'rgba(240, 55, 165, 0.30)');
        gradAccent.addColorStop(0.5, 'rgba(240, 55, 165, 0.55)');
        gradAccent.addColorStop(0.7, 'rgba(240, 55, 165, 0.30)');
        gradAccent.addColorStop(1,   'rgba(240, 55, 165, 0)');

        ctx.beginPath();
        ctx.strokeStyle = gradAccent;
        ctx.lineWidth   = 1.2;
        ctx.shadowColor = 'rgba(240, 55, 165, 0.4)';
        ctx.shadowBlur  = 6;

        for (let x = 0; x <= W; x += 3) {
          const prog = x / W;
          const y = H / 2
            + Math.sin(prog * 14 + t * 1.4) * amp * H * 0.14
            + Math.sin(prog * 6  + t * 0.8) * amp * H * 0.08
            + noise() * amp * H * 0.02;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Main wave — Aquamarine with glow
        const gradMain = ctx.createLinearGradient(0, 0, W, 0);
        gradMain.addColorStop(0,   'rgba(149, 224, 222, 0)');
        gradMain.addColorStop(0.2, 'rgba(149, 224, 222, 0.4)');
        gradMain.addColorStop(0.5, 'rgba(149, 224, 222, 0.85)');
        gradMain.addColorStop(0.8, 'rgba(149, 224, 222, 0.4)');
        gradMain.addColorStop(1,   'rgba(149, 224, 222, 0)');

        ctx.beginPath();
        ctx.strokeStyle = gradMain;
        ctx.lineWidth   = 2.0;
        ctx.shadowColor = 'rgba(65, 0, 245, 0.5)';
        ctx.shadowBlur  = 14;

        const points = [];
        for (let x = 0; x <= W; x++) {
          const prog = x / W;
          const y = H / 2
            + Math.sin(prog * 20 + t)       * amp * H * 0.20
            + Math.sin(prog * 8  + t * 1.3) * amp * H * 0.12
            + Math.sin(prog * 45 + t * 2.1) * amp * H * 0.06
            + noise() * amp * H * 0.03;
          points.push({ x, y });
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Peak indicators (dark)
        if (active && amp > 0.15) {
          for (let i = 15; i < points.length - 15; i += 16) {
            const { x, y } = points[i];
            const dev = Math.abs(y - H / 2);
            const maxDev = amp * H * 0.38;

            ctx.shadowBlur = 0;
            if (dev > maxDev * 0.65) {
              ctx.fillStyle = '#FF4632';
              ctx.shadowColor = 'rgba(255,70,50,0.8)';
              ctx.shadowBlur  = 8;
              ctx.beginPath();
              ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
              ctx.fill();
              ctx.shadowBlur = 0;
              ctx.strokeStyle = 'rgba(255,70,50,0.25)';
              ctx.lineWidth   = 1;
              ctx.beginPath();
              ctx.moveTo(x, H / 2);
              ctx.lineTo(x, y);
              ctx.stroke();
            } else if (dev > maxDev * 0.4) {
              ctx.fillStyle   = '#CDF354';
              ctx.shadowColor = 'rgba(205,243,84,0.6)';
              ctx.shadowBlur  = 6;
              ctx.beginPath();
              ctx.arc(x, y, 1.8, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
        }

      } else {
        // ── LIGHT MODE — Klein Blue + Deep Fuchsia, no glow ──────────────────

        // Accent wave — Deep Fuchsia
        const gradAccent = ctx.createLinearGradient(0, 0, W, 0);
        gradAccent.addColorStop(0,   'rgba(192, 25, 122, 0)');
        gradAccent.addColorStop(0.3, 'rgba(192, 25, 122, 0.20)');
        gradAccent.addColorStop(0.5, 'rgba(192, 25, 122, 0.42)');
        gradAccent.addColorStop(0.7, 'rgba(192, 25, 122, 0.20)');
        gradAccent.addColorStop(1,   'rgba(192, 25, 122, 0)');

        ctx.beginPath();
        ctx.strokeStyle = gradAccent;
        ctx.lineWidth   = 1.0;
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur  = 0;

        for (let x = 0; x <= W; x += 3) {
          const prog = x / W;
          const y = H / 2
            + Math.sin(prog * 14 + t * 1.4) * amp * H * 0.13
            + Math.sin(prog * 6  + t * 0.8) * amp * H * 0.07
            + noise() * amp * H * 0.02;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Main wave — Deep Klein Blue
        const gradMain = ctx.createLinearGradient(0, 0, W, 0);
        gradMain.addColorStop(0,   'rgba(46, 15, 191, 0)');
        gradMain.addColorStop(0.2, 'rgba(46, 15, 191, 0.35)');
        gradMain.addColorStop(0.5, 'rgba(46, 15, 191, 0.72)');
        gradMain.addColorStop(0.8, 'rgba(46, 15, 191, 0.35)');
        gradMain.addColorStop(1,   'rgba(46, 15, 191, 0)');

        ctx.beginPath();
        ctx.strokeStyle = gradMain;
        ctx.lineWidth   = 1.8;
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur  = 0;

        const points = [];
        for (let x = 0; x <= W; x++) {
          const prog = x / W;
          const y = H / 2
            + Math.sin(prog * 20 + t)       * amp * H * 0.18
            + Math.sin(prog * 8  + t * 1.3) * amp * H * 0.12
            + Math.sin(prog * 45 + t * 2.1) * amp * H * 0.06
            + noise() * amp * H * 0.03;
          points.push({ x, y });
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Peak indicators (light)
        if (active && amp > 0.15) {
          for (let i = 15; i < points.length - 15; i += 16) {
            const { x, y } = points[i];
            const dev    = Math.abs(y - H / 2);
            const maxDev = amp * H * 0.36;

            if (dev > maxDev * 0.65) {
              ctx.fillStyle = '#D93A2A';
              ctx.beginPath();
              ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
              ctx.fill();
              ctx.strokeStyle = 'rgba(217,58,42,0.20)';
              ctx.lineWidth   = 1;
              ctx.beginPath();
              ctx.moveTo(x, H / 2);
              ctx.lineTo(x, y);
              ctx.stroke();
            } else if (dev > maxDev * 0.4) {
              ctx.fillStyle = '#1A8A7B';
              ctx.beginPath();
              ctx.arc(x, y, 1.8, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    // Handle resize / DPR scaling
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);
    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [quakeCount, active, isDark]);  // re-init canvas when theme changes

  return (
    <div style={{
      gridArea:   'footer',
      position:   'relative',
      background: 'var(--waveform-bg)',
      borderTop:  '1px solid var(--waveform-border)',
      boxShadow:  isDark ? '0 -1px 0 rgba(149,224,222,0.06)' : '0 -1px 6px rgba(14,30,64,0.05)',
      display:    'flex',
      alignItems: 'center',
      padding:    '0 20px',
      gap:        16,
      height:     40,
      transition: 'background 0.4s ease, border-color 0.4s ease',
    }}>
      <span style={{
        fontFamily:    'var(--font-display)',
        fontSize:      7,
        fontWeight:    600,
        letterSpacing: '0.18em',
        color:         'var(--text-muted)',
        flexShrink:    0,
        whiteSpace:    'nowrap',
        textTransform: 'uppercase',
      }}>
        Seismic Waveform
      </span>
      <canvas
        ref={canvasRef}
        style={{ flex: 1, height: '100%', display: 'block' }}
      />
      <span style={{
        fontFamily:    'var(--font-mono)',
        fontSize:      7,
        letterSpacing: '0.10em',
        color:         quakeCount > 0 ? 'var(--success)' : 'var(--text-dim)',
        flexShrink:    0,
        whiteSpace:    'nowrap',
        fontWeight:    quakeCount > 0 ? 600 : 400,
      }}>
        {quakeCount > 0 ? `${quakeCount} Active Events` : 'Monitoring…'}
      </span>
    </div>
  );
});
