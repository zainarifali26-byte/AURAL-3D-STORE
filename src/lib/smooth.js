// Smooth, inertial scrolling (Lenis) driven by GSAP's ticker, so ScrollTrigger
// and Lenis share one clock. Off for reduced motion; touch keeps native
// scrolling. Scrollable overlays (dialogs, menu) are excluded.
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap.js';

let lenis = null;

export function startSmoothScroll() {
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    prevent: (node) => Boolean(node.closest?.('dialog, .mobile-menu, [data-lenis-prevent]')),
  });
  lenis.on('scroll', ScrollTrigger.update);
  const raf = (time) => lenis?.raf(time * 1000);
  gsap.ticker.add(raf);
  // Keep GSAP's default lag smoothing: after a long frame (page load, image
  // decode) timelines resume where they were instead of jumping ahead.
  lenis.__raf = raf;
  return lenis;
}

export function getLenis() {
  return lenis;
}

/** Scroll to an element or y position, smoothly when Lenis is running. */
export function scrollToTarget(target, { immediate = false, offset = 0 } = {}) {
  if (lenis) lenis.scrollTo(target, { immediate, offset });
  else if (typeof target === 'number') window.scrollTo(0, target + offset);
  else target?.scrollIntoView?.({ block: 'start' });
}

export function setScrollLocked(locked) {
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}
