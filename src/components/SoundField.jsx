import { useEffect, useRef } from 'react';

// An interactive "sound field": fine horizontal waveforms across the hero.
// They breathe slowly on their own; the pointer bends them like a magnet,
// and moving it leaves ripples that travel outward and fade. Lines near the
// pointer warm to champagne. Canvas 2D, paused off-screen, capped DPR, and a
// single static frame under reduced motion.
export default function SoundField({ lines = 34, className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let visible = true;
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, energy: 0 };
    const ripples = [];
    let lastRipple = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) draw(0);
    };

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = e.clientX - r.left;
      mouse.ty = e.clientY - r.top;
      const now = performance.now();
      const speed = Math.hypot(e.movementX || 0, e.movementY || 0);
      mouse.energy = Math.min(1, mouse.energy + speed / 60);
      if (now - lastRipple > 90 && speed > 6) {
        ripples.push({ x: mouse.tx, y: mouse.ty, t: now, power: Math.min(1, speed / 40) });
        if (ripples.length > 10) ripples.shift();
        lastRipple = now;
      }
    };
    const onLeave = () => {
      mouse.tx = -9999;
      mouse.ty = -9999;
    };

    function draw(time) {
      ctx.clearRect(0, 0, w, h);
      // ease pointer
      if (mouse.tx < -9000) {
        mouse.x = -9999;
        mouse.y = -9999;
      } else {
        if (mouse.x < -9000) {
          mouse.x = mouse.tx;
          mouse.y = mouse.ty;
        }
        mouse.x += (mouse.tx - mouse.x) * 0.12;
        mouse.y += (mouse.ty - mouse.y) * 0.12;
      }
      mouse.energy *= 0.96;

      const gap = h / (lines + 1);
      const t = time / 1000;
      const step = Math.max(6, w / 180);
      const radius = Math.min(260, w * 0.22);
      for (let i = 1; i <= lines; i++) {
        const y0 = i * gap;
        const dyMouse = Math.abs(y0 - mouse.y);
        const near = Math.max(0, 1 - dyMouse / (radius * 1.2));
        ctx.beginPath();
        for (let x = 0; x <= w + step; x += step) {
          // idle breathing
          let y = y0 + Math.sin(x * 0.006 + t * 0.7 + i * 0.45) * 2.2 * (0.6 + Math.sin(t * 0.3 + i) * 0.4);
          // pointer: a smooth bump that pushes lines apart around the cursor
          const dx = x - mouse.x;
          const dy = y0 - mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < radius) {
            const f = Math.pow(1 - d / radius, 2);
            y += Math.sign(dy || 1) * f * (26 + mouse.energy * 30) + Math.sin(dx * 0.05 - t * 6) * f * 6 * mouse.energy;
          }
          // ripples travel outward from where the pointer moved fast
          for (const r of ripples) {
            const age = (time - r.t) / 1000;
            const rr = age * 520;
            const dist = Math.hypot(x - r.x, y0 - r.y);
            const band = Math.exp(-Math.pow((dist - rr) / 26, 2));
            y += band * Math.sin((dist - rr) * 0.25) * 9 * r.power * Math.max(0, 1 - age / 1.4);
          }
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        const warm = near * (0.35 + mouse.energy * 0.65);
        ctx.strokeStyle = warm > 0.02 ? `rgba(${201 + 35 * (1 - warm)}, ${169 + 62 * (1 - warm)}, ${120 + 103 * (1 - warm)}, ${0.07 + warm * 0.45})` : 'rgba(236, 231, 223, 0.07)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      while (ripples.length && time - ripples[0].t > 1400) ripples.shift();
    }

    const loop = (time) => {
      raf = 0;
      if (!visible) return;
      draw(time);
      raf = requestAnimationFrame(loop);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !reduced && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    if (!reduced && !coarse) {
      window.addEventListener('pointermove', onMove, { passive: true });
      canvas.parentElement.addEventListener('pointerleave', onLeave);
    }
    if (!reduced) raf = requestAnimationFrame(loop);
    const host = canvas.parentElement;

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, [lines]);

  return <canvas ref={canvasRef} className={`sound-field ${className}`} aria-hidden="true" />;
}
