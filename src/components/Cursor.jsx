import { useEffect, useRef } from 'react';

// Custom cursor for fine pointers: a precise dot plus a ring that trails with
// inertia, inverted against the page (mix-blend: difference). It grows over
// interactive elements and shows a label over anything marked
// data-cursor="View" (or any word). Hidden for touch and reduced motion.
export default function Cursor() {
  const root = useRef(null);
  const dot = useRef(null);
  const ring = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return undefined;
    document.documentElement.classList.add('has-cursor');

    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let raf = 0;
    let visible = false;

    // Work out the cursor state for whatever is under the pointer.
    const updateTarget = (t) => {
      const labelled = t?.closest('[data-cursor]');
      const interactive = t?.closest('a, button, input, select, textarea, label, summary, [role="button"]');
      root.current.classList.toggle('is-label', Boolean(labelled));
      root.current.classList.toggle('is-hover', !labelled && Boolean(interactive));
      if (labelled) label.current.textContent = labelled.getAttribute('data-cursor');
      label.current.classList.toggle('is-on', Boolean(labelled));
    };
    const move = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        visible = true;
        ringPos.x = pos.x;
        ringPos.y = pos.y;
        root.current.classList.remove('is-hidden');
      }
      dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      updateTarget(e.target instanceof Element ? e.target : null);
    };
    // Content moves under a still pointer while scrolling: re-check it.
    let scrollQueued = false;
    const onScroll = () => {
      if (!visible || scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(() => {
        scrollQueued = false;
        updateTarget(document.elementFromPoint(pos.x, pos.y));
      });
    };
    const leave = () => {
      visible = false;
      root.current.classList.add('is-hidden');
      label.current.classList.remove('is-on');
    };
    const down = () => ring.current.animate([{ scale: 1 }, { scale: 0.82 }, { scale: 1 }], { duration: 380, easing: 'ease-out' });

    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16;
      ringPos.y += (pos.y - ringPos.y) * 0.16;
      ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      const w = label.current.offsetWidth;
      label.current.style.transform = `translate3d(${ringPos.x - w / 2}px, ${ringPos.y - 6}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    window.addEventListener('pointerdown', down);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointerdown', down);
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);

  return (
    <>
      <div ref={root} className="cursor is-hidden" aria-hidden="true">
        <span ref={ring} className="cursor-ring" />
        <span ref={dot} className="cursor-dot" />
      </div>
      <span ref={label} className="cursor-label" aria-hidden="true" />
    </>
  );
}
