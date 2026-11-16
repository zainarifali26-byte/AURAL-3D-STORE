// Scroll motion for content sections, declared in markup with data attributes:
//   data-reveal            fade and rise into view (once)
//   data-reveal="mask"     image wipes up from a mask while the image settles
//   data-split             headline words rise one after another (see <SplitText>)
//   data-parallax="12"     element drifts by ±12% of its height while scrolling
// One gsap.context per page; reverted on unmount. Nothing runs when the
// visitor prefers reduced motion, so all content stays visible and static.
import { useLayoutEffect } from 'react';
import { gsap, ScrollTrigger } from './gsap.js';

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useScrollMotion(scopeRef, deps = []) {
  useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope || prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-reveal]:not([data-reveal="mask"])', scope).forEach((el) => {
        gsap.from(el, {
          y: 28,
          autoAlpha: 0,
          duration: 0.9,
          ease: 'power3.out',
          delay: Number(el.dataset.delay ?? 0),
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });

      gsap.utils.toArray('[data-reveal="mask"]', scope).forEach((el) => {
        const img = el.querySelector('img');
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
        tl.from(el, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.2, ease: 'power4.inOut' });
        if (img) tl.from(img, { scale: 1.14, duration: 1.6, ease: 'power3.out' }, 0);
      });

      gsap.utils.toArray('[data-split]', scope).forEach((el) => {
        gsap.from(el.querySelectorAll('.w-in'), {
          yPercent: 110,
          duration: 1,
          ease: 'power4.out',
          stagger: 0.06,
          delay: Number(el.dataset.delay ?? 0),
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      });

      gsap.utils.toArray('[data-parallax]', scope).forEach((el) => {
        const amount = Number(el.dataset.parallax) || 10;
        gsap.fromTo(
          el,
          { yPercent: -amount },
          {
            yPercent: amount,
            ease: 'none',
            scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      });
    }, scope);

    // Images that load after layout change section heights.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    return () => {
      window.removeEventListener('load', refresh);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
