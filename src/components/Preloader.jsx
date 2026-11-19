import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap.js';
import { brand } from '../config/brand.js';

// Intro curtain: a counter runs to 100 while the wordmark rises, then the
// curtain lifts. Shown once per session, on the home page only, and never
// under reduced motion. Takes about 1.9 s.
// Decided once per page load (not per render, which React may repeat).
let decision = null;
function shouldShow() {
  if (decision !== null) return decision;
  decision = true;
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) decision = false;
    else if (sessionStorage.getItem('aural-intro')) decision = false;
    else sessionStorage.setItem('aural-intro', '1');
  } catch {
    // storage unavailable: still show it
  }
  return decision;
}

export default function Preloader({ onDone }) {
  const root = useRef(null);
  const [show] = useState(shouldShow);

  useLayoutEffect(() => {
    if (!show) {
      onDone?.();
      return undefined;
    }
    document.documentElement.style.overflow = 'hidden';
    const count = { v: 0 };
    const counter = root.current.querySelector('.preloader-count');
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          // Start once the first frames after mount have been painted.
          delay: 0.15,
          defaults: { ease: 'power4.out' },
          onComplete: () => {
            document.documentElement.style.overflow = '';
            onDone?.();
          },
        })
        .from('.preloader-word span', { yPercent: 110, duration: 1.1, stagger: 0.05 }, 0)
        .to(count, { v: 100, duration: 1.3, ease: 'power2.inOut', onUpdate: () => (counter.textContent = String(Math.round(count.v)).padStart(3, '0')) }, 0)
        .to('.preloader-bar', { scaleX: 1, duration: 1.3, ease: 'power2.inOut' }, 0)
        .to('.preloader-word span', { yPercent: -110, duration: 0.6, stagger: 0.03, ease: 'power3.in' }, 1.35)
        .to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'power4.inOut' }, 1.55);
    }, root);
    return () => {
      document.documentElement.style.overflow = '';
      ctx.revert();
    };
    // run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!show) return null;
  return (
    <div ref={root} className="preloader" aria-hidden="true">
      <p className="preloader-word">
        {brand.wordmark.split('').map((ch, i) => (
          <span key={i}>{ch}</span>
        ))}
      </p>
      <div className="preloader-foot">
        <span>Sound, undisturbed</span>
        <span className="preloader-count">000</span>
      </div>
      <span className="preloader-bar" />
    </div>
  );
}
