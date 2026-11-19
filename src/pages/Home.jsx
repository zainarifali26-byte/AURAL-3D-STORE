import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { AssetImage } from '../components/ProductImage.jsx';
import SoundField from '../components/SoundField.jsx';
import Film from '../components/Film.jsx';
import Icon from '../components/Icon.jsx';
import { products, getProduct, CATEGORIES } from '../data/products.js';
import { PHOTO_ASSETS, renderAsset, assetSrc } from '../data/assets.js';
import { brand, formatPrice } from '../config/brand.js';
import { gsap, ScrollTrigger } from '../lib/gsap.js';
import { prefersReducedMotion } from '../lib/motion.js';
import usePageMeta from '../hooks/usePageMeta.js';

const A = PHOTO_ASSETS;
const fine = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Words wrapped for staggered reveals; screen readers get the plain text. */
function Words({ text, italicFrom = -1 }) {
  // Spaces sit between the clipping spans; inside them they would collapse.
  return text.split(' ').map((word, i, all) => (
    <Fragment key={i}>
      <span className="w" aria-hidden="true">
        <span className={`w-in${italicFrom >= 0 && i >= italicFrom ? ' italic' : ''}`}>{word}</span>
      </span>
      {i < all.length - 1 ? ' ' : null}
    </Fragment>
  ));
}

/** Buttons and links that lean toward the pointer. */
function useMagnetic(ref, strength = 0.35) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !fine() || prefersReducedMotion()) return undefined;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [ref, strength]);
}

function MagneticLink({ className, to, children, href }) {
  const ref = useRef(null);
  useMagnetic(ref);
  return href ? (
    <a ref={ref} className={className} href={href}>
      {children}
    </a>
  ) : (
    <Link ref={ref} className={className} to={to}>
      {children}
    </Link>
  );
}

// ---------------------------------------------------------------- Hero ----
function Hero({ ready }) {
  const root = useRef(null);
  const videoRef = useRef(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap.set('.hero-title .w-in', { yPercent: 115 });
      gsap.set(['.hero-meta > *', '.hero-scroll'], { autoAlpha: 0, y: 24 });
      gsap.set('.hero-media', { scale: 1.18, autoAlpha: 0 });
      gsap.to('.hero-media', {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('.hero-inner', {
        yPercent: -22,
        autoAlpha: 0.15,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!ready || prefersReducedMotion()) return undefined;
    const tl = gsap
      .timeline({ defaults: { ease: 'expo.out' } })
      .to(root.current.querySelector('.hero-media'), { scale: 1, autoAlpha: 1, duration: 2.4 }, 0)
      .to(root.current.querySelectorAll('.hero-title .w-in'), { yPercent: 0, duration: 1.5, stagger: 0.08 }, 0.15)
      .to(root.current.querySelectorAll('.hero-meta > *'), { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.08 }, 0.7)
      .to(root.current.querySelector('.hero-scroll'), { autoAlpha: 1, y: 0, duration: 1 }, 1.1);
    return () => tl.kill();
  }, [ready]);

  // Pause the loop when the hero is off-screen; no autoplay for reduced motion.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return undefined;
    if (prefersReducedMotion()) {
      v.pause();
      return undefined;
    }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()));
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <section className="hero" ref={root} aria-labelledby="hero-title">
      <div className="hero-media" aria-hidden="true">
        <video
          ref={videoRef}
          className="hero-video"
          src="/media/hero.mp4"
          poster="/media/hero-poster.webp"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <SoundField className="hero-field" />

      <div className="hero-inner container">
        <h1 id="hero-title" className="hero-title" aria-label="Sound, undisturbed.">
          <span className="hero-line">
            <Words text="Sound," />
          </span>
          <span className="hero-line hero-line-2">
            <Words text="undisturbed." italicFrom={0} />
          </span>
        </h1>

        <div className="hero-meta">
          <p className="hero-intro">
            Headphones and earbuds for the moment the world goes quiet. Adaptive noise cancellation, soft-touch materials,
            nothing you do not need.
          </p>
          <div className="hero-actions">
            <MagneticLink className="btn btn-primary" to="/shop">
              Shop the collection
              <Icon name="arrow" size={18} />
            </MagneticLink>
            <MagneticLink className="btn btn-secondary" href="#technology">
              Watch the film
            </MagneticLink>
          </div>
        </div>
      </div>

      <a className="hero-scroll" href="#manifesto" aria-label="Scroll to the next section">
        <span className="hero-scroll-line" aria-hidden="true" />
        Scroll
      </a>
    </section>
  );
}

// ----------------------------------------------------------- Manifesto ----
const MANIFESTO =
  'We design for the second the music starts and everything else falls away. Fewer parts, honest materials, and sound that stays out of your way.';
const MANIFESTO_ITALIC = new Set(['falls', 'away.', 'honest']);

function Manifesto() {
  const root = useRef(null);
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.manifesto-text .mw',
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.12,
          ease: 'none',
          scrollTrigger: { trigger: '.manifesto-text', start: 'top 82%', end: 'bottom 50%', scrub: true },
        },
      );
      gsap.from('.manifesto-stats > div', {
        y: 40,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.manifesto-stats', start: 'top 85%', once: true },
      });
      gsap.utils.toArray('.stat-num').forEach((el) => {
        const end = Number(el.dataset.count);
        const o = { v: 0 };
        gsap.to(o, {
          v: end,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => (el.textContent = Math.round(o.v)),
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <section id="manifesto" className="manifesto section" ref={root} aria-labelledby="manifesto-label">
      <div className="container manifesto-grid">
        <p id="manifesto-label" className="eyebrow">
          A manifesto
        </p>
        <p className="manifesto-text" aria-label={MANIFESTO}>
          {MANIFESTO.split(' ').map((w, i) => (
            <span key={i} className={`mw${MANIFESTO_ITALIC.has(w) ? ' italic' : ''}`} aria-hidden="true">
              {w}{' '}
            </span>
          ))}
        </p>
        <dl className="manifesto-stats">
          {[
            ['8', 'h', 'Listening per charge', 'Pro X · demo specification'],
            ['35', 'h', 'Over-ear battery', 'Studio · demo specification'],
            ['2', '', 'Adaptive ANC models', 'Pro X and Studio'],
          ].map(([n, unit, label, note]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>
                <span className="stat-value">
                  <span className="stat-num" data-count={n}>
                    {n}
                  </span>
                  {unit}
                </span>
                <span className="fineprint">{note}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- Marquee ---
function Marquee({ words }) {
  const root = useRef(null);
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const track = root.current.querySelector('.marquee-track');
    let x = 0;
    let dir = -1;
    let speed = 0;
    let raf = 0;
    let visible = false;
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => {
        visible = self.isActive;
        if (visible && !raf) raf = requestAnimationFrame(tick);
      },
      onUpdate: (self) => {
        dir = self.direction === 1 ? -1 : 1;
        speed = Math.min(16, Math.abs(self.getVelocity()) / 200);
      },
    });
    function tick() {
      raf = 0;
      if (!visible) return;
      x += dir * (0.7 + speed);
      speed *= 0.94;
      const half = track.scrollWidth / 2;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      track.style.transform = `translate3d(${x}px, 0, 0)`;
      raf = requestAnimationFrame(tick);
    }
    return () => {
      cancelAnimationFrame(raf);
      st.kill();
    };
  }, []);
  const row = (key) =>
    words.flatMap((w, i) => [
      <span key={`${key}w${i}`} className={i % 2 ? 'marquee-word italic' : 'marquee-word'}>
        {w}
      </span>,
      <span key={`${key}s${i}`} className="marquee-star">
        ✦
      </span>,
    ]);
  return (
    <div className="marquee" ref={root} aria-hidden="true">
      <div className="marquee-track">
        {row('a')}
        {row('b')}
      </div>
    </div>
  );
}

// ----------------------------------------------- Collection (horizontal) --
function Collection() {
  const root = useRef(null);
  const order = ['pro-x', 'studio', 'one', 'pulse', 'air', 'neo', 'sport', 'mini'].map(getProduct);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 961px)', () => {
      const track = root.current.querySelector('.rail-track');
      const bar = root.current.querySelector('.rail-progress span');
      const distance = () => track.scrollWidth - track.clientWidth;
      gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current.querySelector('.rail-pin'),
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => bar && (bar.style.transform = `scaleX(${self.progress})`),
        },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section className="collection" ref={root} aria-labelledby="collection-title">
      <div className="rail-pin">
        <div className="container rail-head">
          <div>
            <p className="eyebrow">The collection</p>
            <h2 id="collection-title" className="section-title">
              Eight ways <em>to listen.</em>
            </h2>
          </div>
          <div className="rail-meta">
            <p className="lead">True wireless, sport and over-ear. One design language, eight demo products.</p>
            <Link className="text-link" to="/shop">
              View all products <Icon name="arrow" size={16} />
            </Link>
          </div>
        </div>
        <ul className="rail-track">
          {order.map((p, i) => (
            <li key={p.id} className="rail-item" data-cursor="View">
              <span className="rail-num">{String(i + 1).padStart(2, '0')}</span>
              <ProductCard product={p} sizes="(max-width: 960px) 78vw, 24vw" />
            </li>
          ))}
        </ul>
        <div className="container rail-foot" aria-hidden="true">
          <span className="rail-progress">
            <span />
          </span>
          <span className="rail-hint">Scroll to browse</span>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------- Categories with hover reveal -
function Categories() {
  const root = useRef(null);
  const previewRef = useRef(null);
  const sport = getProduct('sport');
  const looks = {
    earbuds: A['pro-x-hero'],
    sport: renderAsset(sport, sport.colours[0], 'hero'),
    headphones: A['studio-front'],
  };
  const [active, setActive] = useState(null);

  // The preview image follows the pointer with inertia and leans into motion.
  useEffect(() => {
    const el = previewRef.current;
    if (!el || !fine() || prefersReducedMotion()) return undefined;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3.out' });
    const rTo = gsap.quickTo(el, 'rotation', { duration: 0.9, ease: 'power3.out' });
    let lastX = 0;
    const host = root.current;
    const move = (e) => {
      const r = host.getBoundingClientRect();
      xTo(e.clientX - r.left);
      yTo(e.clientY - r.top);
      rTo(Math.max(-10, Math.min(10, (e.clientX - lastX) * 0.5)));
      lastX = e.clientX;
    };
    host.addEventListener('pointermove', move);
    return () => host.removeEventListener('pointermove', move);
  }, []);

  return (
    <section className="cats section" ref={root} aria-labelledby="cats-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Shop by kind</p>
          <h2 id="cats-title" className="section-title">
            Find <em>your fit.</em>
          </h2>
        </div>
        <ul className="cat-list" onPointerLeave={() => setActive(null)}>
          {CATEGORIES.map((c, i) => {
            const count = products.filter((p) => p.category === c.id).length;
            return (
              <li key={c.id}>
                <Link
                  to={`/shop?category=${c.id}`}
                  className={`cat-row${active && active !== c.id ? ' is-dim' : ''}`}
                  onPointerEnter={() => setActive(c.id)}
                  onFocus={() => setActive(c.id)}
                  onBlur={() => setActive(null)}
                >
                  <span className="cat-index">0{i + 1}</span>
                  <span className="cat-name">{c.name}</span>
                  <span className="cat-blurb">{c.blurb}</span>
                  <span className="cat-count">
                    {count} {count === 1 ? 'model' : 'models'}
                    <Icon name="arrow" size={18} />
                  </span>
                  <span className="cat-thumb" aria-hidden="true">
                    <img src={assetSrc(looks[c.id], 'small')} alt="" width="800" height="1000" loading="lazy" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div className={`cat-preview${active ? ' is-on' : ''}`} ref={previewRef} aria-hidden="true">
        {CATEGORIES.map((c) => (
          <img key={c.id} className={active === c.id ? 'is-on' : ''} src={assetSrc(looks[c.id], 'small')} alt="" width="800" height="1000" loading="lazy" />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------- Spotlight (tilt) ---------
function Spotlight() {
  const root = useRef(null);
  const card = useRef(null);
  const proX = getProduct('pro-x');

  useEffect(() => {
    const el = card.current;
    if (!el || !fine() || prefersReducedMotion()) return undefined;
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.8, ease: 'power3.out' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.8, ease: 'power3.out' });
    const host = root.current;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry(px * 12);
      rx(-py * 9);
      el.style.setProperty('--gx', `${(px + 0.5) * 100}%`);
      el.style.setProperty('--gy', `${(py + 0.5) * 100}%`);
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    host.addEventListener('pointermove', move);
    host.addEventListener('pointerleave', leave);
    return () => {
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerleave', leave);
    };
  }, []);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap.from('.spot-visual', {
        clipPath: 'inset(16% 16% 16% 16%)',
        duration: 1.6,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.spot-visual', start: 'top 82%', once: true },
      });
      gsap.from('.spot-copy > *', {
        y: 40,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.spot-copy', start: 'top 82%', once: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="spot section" ref={root} aria-labelledby="spot-title">
      <div className="container spot-grid">
        <div className="spot-visual">
          <div className="spot-card" ref={card} data-cursor="Explore">
            <Link to={`/products/${proX.id}`} className="spot-link" aria-label={`Explore ${proX.name}`}>
              <AssetImage asset={A['pro-x-hero']} cutout sizes="(max-width: 960px) 90vw, 46vw" alt="" />
            </Link>
            <span className="spot-glare" aria-hidden="true" />
          </div>
        </div>
        <div className="spot-copy">
          <p className="eyebrow">Flagship · {proX.name}</p>
          <h2 id="spot-title" className="section-title">
            Quiet, <em>by design.</em>
          </h2>
          <p className="lead">{proX.description}</p>
          <ul className="spot-specs">
            {proX.features.slice(0, 4).map((f, i) => (
              <li key={f}>
                <span>0{i + 1}</span>
                {f}
              </li>
            ))}
          </ul>
          <div className="spot-buy">
            <p className="spot-price">
              {formatPrice(proX.price)} <span className="price-note">demo price</span>
            </p>
            <MagneticLink className="btn btn-primary" to={`/products/${proX.id}`}>
              Discover Pro X <Icon name="arrow" size={18} />
            </MagneticLink>
          </div>
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------- Brand story ---
function BrandStory() {
  const root = useRef(null);
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.story-img img',
        { yPercent: -8 },
        { yPercent: 8, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
      gsap.from('.story-img', {
        clipPath: 'inset(100% 0 0 0)',
        duration: 1.6,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: '.story-img', start: 'top 82%', once: true },
      });
      gsap.from('.story-quote .w-in', {
        yPercent: 110,
        stagger: 0.04,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.story-quote', start: 'top 82%', once: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);
  const quote = 'The best headphones are the ones you forget you are wearing.';
  return (
    <section id="brand-story" className="story section" ref={root} aria-labelledby="story-title">
      <div className="container story-grid">
        <div className="story-img">
          <img
            src="/images/photos/life-comfort-1600.webp"
            srcSet="/images/photos/life-comfort-800.webp 800w, /images/photos/life-comfort-1600.webp 1600w"
            sizes="(max-width: 960px) 92vw, 40vw"
            alt="Woman wearing white over-ear headphones, smiling"
            width="1600"
            height="2000"
            loading="lazy"
          />
        </div>
        <div className="story-copy">
          <p className="eyebrow">About {brand.name}</p>
          <h2 id="story-title" className="story-quote" aria-label={quote}>
            <Words text={quote} italicFrom={6} />
          </h2>
          <p className="lead">
            {brand.name} is a design concept built around that idea: fewer shapes, honest materials and technology that earns
            its place. A frontend demo, with no factory, no back catalogue and no invented awards.
          </p>
          <Link className="text-link" to="/about">
            Read about the concept <Icon name="arrow" size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ CTA ---
function FinalCta() {
  const root = useRef(null);
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cta-word',
        { xPercent: 8 },
        { xPercent: -8, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
      gsap.fromTo(
        '.cta-media img',
        { scale: 1.25 },
        { scale: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom bottom', scrub: true } },
      );
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <section className="cta" ref={root} aria-labelledby="cta-title">
      <div className="cta-media" aria-hidden="true">
        <img src="/media/seq/hand/lg/030.webp" alt="" width="1280" height="720" loading="lazy" />
      </div>
      <div className="container cta-inner">
        <p className="eyebrow">Find your pair</p>
        <h2 id="cta-title" className="cta-title">
          <span className="cta-word">
            Choose your <em>quiet.</em>
          </span>
        </h2>
        <div className="hero-actions">
          <MagneticLink className="btn btn-primary" to="/shop">
            Shop all products <Icon name="arrow" size={18} />
          </MagneticLink>
          <MagneticLink className="btn btn-secondary" to="/compare">
            Compare models
          </MagneticLink>
        </div>
      </div>
    </section>
  );
}

export default function Home({ introDone = true }) {
  usePageMeta(
    `${brand.name} | Sound, undisturbed`,
    'AURAL is a premium headphones and earbuds concept and frontend demo store: a cinematic scroll film, real product photography and eight demo products.',
  );
  // Refresh trigger positions once fonts and images have settled.
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 700);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      <Hero ready={introDone} />
      <Manifesto />
      <Film />
      <Marquee words={['Quiet', 'Clarity', 'Craft', 'Comfort', 'AURAL']} />
      <Collection />
      <Categories />
      <Spotlight />
      <BrandStory />
      <FinalCta />
    </>
  );
}
