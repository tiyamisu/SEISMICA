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

      // Glow gradient stroke
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0,   'rgba(0,242,254,0)');
      grad.addColorStop(0.2, 'rgba(0,242,254,0.8)');
      grad.addColorStop(0.5, active ? 'rgba(255,59,59,0.9)' : 'rgba(0,242,254,0.9)');
      grad.addColorStop(0.8, 'rgba(0,242,254,0.8)');
      grad.addColorStop(1,   'rgba(0,242,254,0)');

      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 1.6;
      ctx.shadowColor = active ? '#ff3b3b' : '#00f2fe';
      ctx.shadowBlur  = 8;

      for (let x = 0; x <= W; x++) {
        const prog = x / W;
        const y = H / 2 +
          Math.sin(prog * 20 + t)        * amp * H * 0.18 +
          Math.sin(prog * 8 + t * 1.3)   * amp * H * 0.12 +
          Math.sin(prog * 45 + t * 2.1)  * amp * H * 0.06 +
          noise()                         * amp * H * 0.03;

        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

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
      background: 'rgba(4,8,16,0.95)',
      borderTop:  '1px solid var(--border)',
      display:    'flex',
      alignItems: 'center',
      padding:    '0 20px',
      gap:        16,
      height:     52,
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
