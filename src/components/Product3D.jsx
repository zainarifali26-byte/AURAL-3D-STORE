import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from '../lib/gsap.js';
import { useReducedMotion, hasWebGL } from '../hooks/useMedia.js';

// "Explore in 3D" section for product pages: a sticky stage whose 3D model
// turns (and, for earbuds, opens and lifts out) as the section scrolls past.
// Drag to rotate by hand. three.js loads only when the section is near.
export default function Product3D({ product, colour }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const viewerRef = useRef(null);
  const [state, setState] = useState('idle'); // idle | loading | ready | unavailable
  const reduced = useReducedMotion();
  const [webgl] = useState(hasWebGL);
  const earbuds = product.kind === 'earbuds';

  // Load the viewer when the section approaches the viewport.
  useEffect(() => {
    if (!webgl) return undefined;
    let cancelled = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || viewerRef.current) return;
        io.disconnect();
        setState('loading');
        import('../three/viewer.js')
          .then(({ createProductViewer }) => {
            if (cancelled) return;
            viewerRef.current = createProductViewer({
              container: stageRef.current,
              product,
              colour,
              onReady: () => !cancelled && setState('ready'),
            });
            viewerRef.current.setProgress(reduced ? 0.6 : 0);
          })
          .catch(() => !cancelled && setState('unavailable'));
      },
      { rootMargin: '400px 0px' },
    );
    io.observe(sectionRef.current);
    return () => {
      cancelled = true;
      io.disconnect();
      viewerRef.current?.dispose();
      viewerRef.current = null;
    };
  }, [product, colour, webgl, reduced]);

  // Scroll progress drives the model (not under reduced motion).
  useEffect(() => {
    if (reduced || state !== 'ready') return undefined;
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => viewerRef.current?.setProgress(self.progress),
    });
    return () => st.kill();
  }, [reduced, state]);

  // Drag to rotate (pointer events: mouse, pen and touch).
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    let startX = 0;
    let base = 0;
    let current = 0;
    let dragging = false;
    const down = (e) => {
      dragging = true;
      startX = e.clientX;
      base = current;
      el.setPointerCapture?.(e.pointerId);
    };
    const move = (e) => {
      if (!dragging) return;
      current = base + ((e.clientX - startX) / el.clientWidth) * Math.PI * 1.5;
      viewerRef.current?.setDrag(current);
    };
    const up = () => {
      dragging = false;
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, []);

  if (!webgl || state === 'unavailable') return null;

  return (
    <section ref={sectionRef} className={`p3d${reduced ? ' is-static' : ''}`} aria-labelledby="p3d-title">
      <div className="p3d-sticky">
        <div className="p3d-copy">
          <p className="eyebrow">Explore in 3D</p>
          <h2 id="p3d-title" className="p3d-title">
            {earbuds ? 'Open it up.' : 'Turn it around.'}
          </h2>
          <p className="p3d-text">
            {earbuds
              ? 'Keep scrolling to turn the case, open the lid and lift the earbuds out. Drag to rotate it yourself.'
              : 'Keep scrolling to see every side. Drag to rotate it yourself.'}
          </p>
          <p className="fineprint">Interactive 3D model of the {product.name} design. Proportions are a concept.</p>
        </div>
        <div className="p3d-stage studio-backdrop" ref={stageRef} role="img" aria-label={`Interactive 3D model of ${product.name} in ${colour.name}`}>
          {state !== 'ready' && <p className="p3d-loading">Loading 3D model</p>}
          <span className="p3d-hint" aria-hidden="true">
            Drag to rotate
          </span>
        </div>
      </div>
    </section>
  );
}
