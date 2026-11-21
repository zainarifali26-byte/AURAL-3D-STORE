import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from '../lib/gsap.js';

// Scroll-scrubbed film: a WebP frame sequence drawn to a canvas as the section
// scrolls. Chapters with dip-to-black transitions and editorial captions.
// Frames load progressively (first frame of each chapter first); phones get
// the smaller set. Reduced motion shows the chapters as still images.
// Configurable (see STAND_IN_FILM and components/ProXFilm.jsx).

export const FILM_CHAPTERS = [
  {
    id: 'case',
    index: '01',
    kicker: 'The case',
    title: ['A case that closes', 'like a held breath.'],
    body: 'Soft-touch black, rounded at every edge, with magnets that settle the lid without a sound.',
  },
  {
    id: 'open',
    index: '02',
    kicker: 'Opened',
    title: ['Inside, everything', 'has its place.'],
    body: 'Two earbuds rest in machined cradles, charging the moment they touch down.',
  },
  {
    id: 'above',
    index: '03',
    kicker: 'Form',
    title: ['Shaped by sound,', 'not by trend.'],
    body: 'An acoustic chamber drawn around the driver first, and only then the shell around it.',
  },
  {
    id: 'hand',
    index: '04',
    kicker: 'Yours',
    title: ['The moment you', 'pick them up.'],
    body: 'Light in the palm, quiet in the ear. Everything else fades.',
  },
];
/** The stand-in footage film (scripts/extract-frames.mjs). */
const STAND_IN_FILM = {
  id: 'technology',
  label: 'The film',
  chapters: FILM_CHAPTERS,
  perChapter: 45,
  frame: (chapter, n, size) => `/media/seq/${chapter}/${size}/${String(n).padStart(3, '0')}.webp`,
  pickSize: () => (window.innerWidth < 900 || (navigator.connection && navigator.connection.saveData) ? 'sm' : 'lg'),
  still: { width: 1280, height: 720 },
  credit: 'Footage: unbranded stand-in product, H.Espinosa Films via Pexels.',
};

function useReducedMotion() {
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  return reduced;
}

function FilmStatic({ config }) {
  const titleId = `${config.id}-title`;
  return (
    <section id={config.id} className="film-static" aria-labelledby={titleId}>
      <h2 id={titleId} className="sr-only">
        {config.label}
      </h2>
      {config.chapters.map((c) => (
        <article key={c.id} className="film-static-item">
          <img src={config.frame(c.id, Math.ceil(config.perChapter / 2), 'lg')} alt="" width={config.still.width} height={config.still.height} loading="lazy" />
          <div>
            <p className="eyebrow">
              {c.index} · {c.kicker}
            </p>
            <h3 className="film-title">
              {c.title[0]} <em>{c.title[1]}</em>
            </h3>
            <p className="lead">{c.body}</p>
          </div>
        </article>
      ))}
    </section>
  );
}

function FilmAnimated({ config }) {
  const FILM_CHAPTERS = config.chapters;
  const PER_CHAPTER = config.perChapter;
  const TOTAL = FILM_CHAPTERS.length * PER_CHAPTER;
  const frameUrl = config.frame;
  const titleId = `${config.id}-title`;
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    const size = config.pickSize();
    const frames = new Array(TOTAL);
    let cancelled = false;
    let count = 0;

    // Load order: first frame of each chapter, then every 4th, then the rest.
    const order = [];
    const seen = new Set();
    const push = (i) => {
      if (i < TOTAL && !seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    };
    FILM_CHAPTERS.forEach((_, c) => push(c * PER_CHAPTER));
    for (let i = 0; i < TOTAL; i += 4) push(i);
    for (let i = 0; i < TOTAL; i++) push(i);

    let next = 0;
    const loadNext = () => {
      if (cancelled || next >= order.length) return;
      const i = order[next++];
      const c = Math.floor(i / PER_CHAPTER);
      const img = new Image();
      img.decoding = 'async';
      img.src = frameUrl(FILM_CHAPTERS[c].id, (i % PER_CHAPTER) + 1, size);
      img.onload = () => {
        frames[i] = img;
        count++;
        if (count % 12 === 0 || count === TOTAL) setLoaded(count);
        needsDraw = true;
        loadNext();
      };
      img.onerror = loadNext;
    };
    // Start loading when the film is within two screens.
    const startObserver = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        startObserver.disconnect();
        for (let k = 0; k < 6; k++) loadNext();
      },
      { rootMargin: '200% 0px' },
    );
    startObserver.observe(section);

    // Nearest loaded frame to the requested index.
    const nearest = (i) => {
      for (let d = 0; d < TOTAL; d++) {
        if (frames[i - d]) return frames[i - d];
        if (frames[i + d]) return frames[i + d];
      }
      return null;
    };

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      needsDraw = true;
    };

    let target = 0;
    let current = 0;
    let needsDraw = true;
    let visible = false;
    let raf = 0;
    const captions = [...section.querySelectorAll('.film-caption')];
    const ticks = [...section.querySelectorAll('.film-tick')];
    const bar = section.querySelector('.film-bar');

    const draw = () => {
      const f = Math.min(TOTAL - 1, Math.max(0, current));
      const i = Math.round(f);
      const img = nearest(i);
      ctx.fillStyle = '#080808';
      ctx.fillRect(0, 0, w, h);
      if (!img) return;
      // Dip to black at chapter boundaries.
      const local = (f % PER_CHAPTER) / (PER_CHAPTER - 1);
      const edge = Math.min(local, 1 - local);
      const alpha = Math.min(1, edge / 0.08);
      ctx.globalAlpha = Math.max(0.05, alpha);
      // Slow push-in across the whole film for extra depth.
      const zoom = 1.04 + (f / TOTAL) * 0.08;
      const s = Math.max(w / img.width, h / img.height) * zoom;
      const dw = img.width * s;
      const dh = img.height * s;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      ctx.globalAlpha = 1;
    };

    const updateOverlay = (p) => {
      const f = p * (TOTAL - 1);
      const chapter = Math.min(FILM_CHAPTERS.length - 1, Math.floor(f / PER_CHAPTER));
      const local = (f - chapter * PER_CHAPTER) / PER_CHAPTER;
      captions.forEach((el, k) => {
        if (k !== chapter) {
          el.style.opacity = '0';
          el.style.transform = `translate3d(0, ${k < chapter ? -40 : 40}px, 0)`;
          el.classList.remove('is-active');
          return;
        }
        // in over the first 25%, hold, out over the last 15%
        const vin = Math.min(1, Math.max(0, (local - 0.06) / 0.2));
        const vout = Math.min(1, Math.max(0, (0.94 - local) / 0.14));
        const v = Math.min(vin, vout);
        el.style.opacity = v.toFixed(3);
        el.style.transform = `translate3d(0, ${((1 - vin) * 40 - (1 - vout) * 40).toFixed(1)}px, 0)`;
        el.classList.toggle('is-active', v > 0.5);
      });
      ticks.forEach((t, k) => t.classList.toggle('is-active', k === chapter));
      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
    };

    const loop = () => {
      raf = 0;
      if (!visible) return;
      const diff = target - current;
      if (Math.abs(diff) > 0.01 || needsDraw) {
        current += diff * 0.18;
        if (Math.abs(diff) < 0.01) current = target;
        draw();
        needsDraw = false;
      }
      raf = requestAnimationFrame(loop);
    };

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        target = self.progress * (TOTAL - 1);
        updateOverlay(self.progress);
      },
      onToggle: (self) => {
        visible = self.isActive || visible;
      },
    });
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(section);

    resize();
    updateOverlay(0);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      startObserver.disconnect();
      io.disconnect();
      ro.disconnect();
      st.kill();
    };
    // The config is static for the life of the section.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pct = Math.round((loaded / TOTAL) * 100);

  return (
    <section id={config.id} ref={sectionRef} className="film" aria-labelledby={titleId}>
      <div className="film-sticky">
        <canvas ref={canvasRef} className="film-canvas" aria-hidden="true" />
        <div className="film-shade" aria-hidden="true" />
        <div className="film-ui container">
          <h2 id={titleId} className="film-label">
            <span className="eyebrow">{config.label}</span>
          </h2>
          <ol className="film-ticks" aria-hidden="true">
            {FILM_CHAPTERS.map((c) => (
              <li key={c.id} className="film-tick">
                <span>{c.index}</span> {c.kicker}
              </li>
            ))}
          </ol>
          {FILM_CHAPTERS.map((c) => (
            <article key={c.id} className="film-caption">
              <p className="film-index">{c.index}</p>
              <h3 className="film-title">
                {c.title[0]}
                <br />
                <em>{c.title[1]}</em>
              </h3>
              <p className="film-body">{c.body}</p>
            </article>
          ))}
          <div className="film-progress" aria-hidden="true">
            <span className="film-bar" />
          </div>
          {pct < 100 && (
            <p className="film-loading" aria-hidden="true">
              Loading film {pct}%
            </p>
          )}
          <p className="film-credit">{config.credit}</p>
        </div>
      </div>
    </section>
  );
}

export default function Film({ config = STAND_IN_FILM }) {
  const reduced = useReducedMotion();
  return reduced ? <FilmStatic config={config} /> : <FilmAnimated config={config} />;
}
