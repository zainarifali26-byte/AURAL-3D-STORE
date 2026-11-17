import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { AssetImage } from '../components/ProductImage.jsx';
import SplitText from '../components/SplitText.jsx';
import Story from '../story/Story.jsx';
import Icon from '../components/Icon.jsx';
import { products, getProduct, CATEGORIES } from '../data/products.js';
import { PHOTO_ASSETS, renderAsset } from '../data/assets.js';
import { brand, formatPrice } from '../config/brand.js';
import { useScrollMotion, prefersReducedMotion } from '../lib/motion.js';
import { gsap } from '../lib/gsap.js';
import usePageMeta from '../hooks/usePageMeta.js';

const A = PHOTO_ASSETS;

// ---- Hero: a switcher across the three photographed products ----------
const HERO = [
  {
    id: 'pro-x',
    eyebrow: 'AURAL Pro X · True wireless',
    title: 'Quiet, by design.',
    text: 'Adaptive noise cancellation in a soft-matte black shell, finished with a single rose-gold grille.',
    asset: A['pro-x-hero'],
    cutout: true,
  },
  {
    id: 'studio',
    eyebrow: 'AURAL Studio · Over-ear',
    title: 'Room to breathe.',
    text: 'Deep, rounded cushions and adaptive noise cancellation for long, unhurried listening.',
    asset: A['studio-front'],
  },
  {
    id: 'one',
    eyebrow: 'AURAL One · On-ear',
    title: 'Light all day.',
    text: 'A soft pearl frame that folds flat into its case, made for study, travel and everything between.',
    asset: A['one-front'],
  },
];

function Hero() {
  const [index, setIndex] = useState(0);
  const slide = HERO[index];
  const product = getProduct(slide.id);
  const root = useRef(null);

  // Entrance: the stage wipes open, then the copy rises.
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power4.out' } })
        .from('.hero-stage', { clipPath: 'inset(12% 8% 12% 8% round 10px)', duration: 1.4, ease: 'power4.inOut' })
        .from('.hero-slide.is-active img', { scale: 1.12, duration: 1.8 }, 0)
        .from('.hero-copy > *', { y: 30, autoAlpha: 0, duration: 1, stagger: 0.08 }, 0.35)
        .from('.hero-switch', { autoAlpha: 0, y: 12, duration: 0.8 }, 0.9);
      // The whole stage drifts slightly as the hero scrolls away (the image
      // itself never moves inside its frame, so it is never cropped).
      gsap.to('.hero-stage', {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" ref={root} aria-labelledby="hero-title">
      <div className="hero-grid container">
        <div className="hero-copy" aria-live="polite">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h1 id="hero-title" className="display hero-title">
            {slide.title}
          </h1>
          <p className="lead">{slide.text}</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to={`/products/${product.id}`}>
              Shop {product.name.replace('AURAL ', '')}
              <Icon name="arrow" size={18} />
            </Link>
            <Link className="btn btn-secondary" to="/#technology">
              Explore technology
            </Link>
          </div>
          <p className="hero-meta">
            <span className="price">{formatPrice(product.price)}</span>
            <span className="price-note">demo price</span>
            <span className="hero-meta-sep" aria-hidden="true" />
            <span className="dot" style={{ '--swatch': product.colours[0].hex }} aria-hidden="true" />
            {product.colours[0].name}
          </p>
        </div>

        <div className="hero-stage studio-backdrop">
          <div className="hero-stage-inner">
            {HERO.map((s, i) => (
              <div key={s.id} className={`hero-slide${i === index ? ' is-active' : ''}${s.cutout ? ' is-cutout' : ''}`} aria-hidden={i !== index}>
                <AssetImage asset={s.asset} cutout={s.cutout} sizes="(max-width: 960px) 92vw, 52vw" eager={i === 0} alt={i === index ? s.asset.alt : ''} />
              </div>
            ))}
          </div>
          <div className="hero-switch" role="group" aria-label="Featured product">
            {HERO.map((s, i) => (
              <button key={s.id} type="button" aria-pressed={i === index} onClick={() => setIndex(i)}>
                <span className="hero-switch-index">0{i + 1}</span>
                {getProduct(s.id).name.replace('AURAL ', '')}
              </button>
            ))}
          </div>
        </div>
      </div>
      <ul className="hero-strip container" aria-label="Across the range">
        <li>Adaptive noise cancellation</li>
        <li>Multipoint pairing</li>
        <li>Wireless charging</li>
        <li>Concept range · demo store</li>
      </ul>
    </section>
  );
}

// ---- Categories -----------------------------------------------------------
function Categories() {
  const sport = getProduct('sport');
  const look = {
    earbuds: { asset: A['pro-x-wide'], cls: 'cat-xl' },
    headphones: { asset: A['one-upright'], cls: 'cat-tall' },
    sport: { asset: renderAsset(sport, sport.colours[0], 'hero'), cls: 'cat-tall', render: true },
  };
  return (
    <section className="section categories" aria-labelledby="cat-title">
      <div className="container">
        <div className="section-head-row">
          <div className="section-head">
            <p className="eyebrow" data-reveal="">
              Collections
            </p>
            <SplitText id="cat-title" className="section-title" text="Three ways to listen." />
          </div>
          <p className="lead" data-reveal="">
            True wireless for every day, sport for movement, over-ear for when you want the world to fall away.
          </p>
        </div>
        <ul className="cat-grid">
          {CATEGORIES.map((c) => {
            const l = look[c.id];
            const count = products.filter((p) => p.category === c.id).length;
            return (
              <li key={c.id} className={l.cls}>
                <Link to={`/shop?category=${c.id}`} className="cat-tile">
                  <div className="cat-media studio-backdrop" data-reveal="mask">
                    <AssetImage asset={l.asset} alt="" sizes="(max-width: 960px) 92vw, 50vw" />
                  </div>
                  <div className="cat-text">
                    <span className="cat-name">{c.name}</span>
                    <span className="cat-meta">
                      {count} {count === 1 ? 'model' : 'models'}
                      {l.render ? ' · concept render' : ''}
                    </span>
                  </div>
                  <span className="cat-arrow" aria-hidden="true">
                    <Icon name="arrow" size={18} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

// ---- Featured products ----------------------------------------------------
function Featured() {
  const picks = ['pro-x', 'studio', 'one', 'pulse'].map(getProduct);
  return (
    <section className="section featured" aria-labelledby="featured-title">
      <div className="container">
        <div className="section-head-row">
          <div className="section-head">
            <p className="eyebrow" data-reveal="">
              Featured
            </p>
            <SplitText id="featured-title" className="section-title" text="Made to be lived with." />
          </div>
          <Link className="btn btn-secondary" to="/shop" data-reveal="">
            Shop all {products.length}
            <Icon name="arrow" size={18} />
          </Link>
        </div>
        <ul className="featured-row">
          {picks.map((p, i) => (
            <li key={p.id} data-reveal="" data-delay={i * 0.08}>
              <ProductCard product={p} sizes="(max-width: 760px) 78vw, (max-width: 1200px) 45vw, 24vw" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ---- Brand story ------------------------------------------------------------
function BrandStory() {
  return (
    <section id="brand-story" className="section story" aria-labelledby="brand-title">
      <div className="container story-grid">
        <div className="story-media-main" data-reveal="mask">
          <div className="parallax-frame">
            <img
              data-parallax="6"
              src="/images/photos/life-comfort-1600.webp"
              srcSet="/images/photos/life-comfort-800.webp 800w, /images/photos/life-comfort-1600.webp 1600w"
              sizes="(max-width: 960px) 92vw, 46vw"
              alt="Woman wearing white over-ear headphones, smiling"
              width="1600"
              height="2000"
              loading="lazy"
            />
          </div>
        </div>
        <div className="story-copy">
          <p className="eyebrow" data-reveal="">
            About {brand.name}
          </p>
          <SplitText id="brand-title" className="section-title" text="Designed to disappear." />
          <p className="lead" data-reveal="">
            The best headphones are the ones you stop noticing. {brand.name} is a design concept built around that idea:
            fewer shapes, honest materials, and technology that earns its place.
          </p>
          <ul className="story-principles">
            <li data-reveal="">
              <span>01</span>
              <h3>Audio first</h3>
              <p>Clear voices and real detail at comfortable volumes.</p>
            </li>
            <li data-reveal="" data-delay="0.08">
              <span>02</span>
              <h3>Considered materials</h3>
              <p>Soft-matte shells, protein leather and a touch of champagne metal.</p>
            </li>
            <li data-reveal="" data-delay="0.16">
              <span>03</span>
              <h3>Said plainly</h3>
              <p>No invented numbers. Where a spec appears, it is marked as demo.</p>
            </li>
          </ul>
          <Link className="text-link" to="/about" data-reveal="">
            Read about the concept <Icon name="arrow" size={16} />
          </Link>
        </div>
        <div className="story-media-small" data-reveal="mask">
          <AssetImage asset={A['life-portrait']} sizes="(max-width: 960px) 60vw, 22vw" />
        </div>
      </div>
    </section>
  );
}

// ---- Closing call to action -----------------------------------------------
function FinalCta() {
  return (
    <section className="cta on-dark" aria-labelledby="cta-title">
      <div className="container cta-grid">
        <div className="cta-copy">
          <p className="eyebrow" data-reveal="">
            Find your pair
          </p>
          <SplitText id="cta-title" className="display cta-title" text="Choose your quiet." />
          <p className="lead" data-reveal="">
            Eight concepts, from pocket-sized to full-size. Compare them side by side or start with the one you like the
            look of.
          </p>
          <div className="hero-actions" data-reveal="">
            <Link className="btn btn-light" to="/shop">
              Shop all products
              <Icon name="arrow" size={18} />
            </Link>
            <Link className="btn btn-ghost-light" to="/compare">
              Compare models
            </Link>
          </div>
        </div>
        <div className="cta-media studio-backdrop" data-reveal="mask">
          <AssetImage asset={A['studio-wide']} sizes="(max-width: 960px) 92vw, 56vw" />
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  usePageMeta(
    `${brand.name} | Headphones and earbuds, quietly refined`,
    'AURAL is a premium headphones and earbuds concept and frontend demo store: real product photography, eight demo products and illustrative specifications.',
  );
  const root = useRef(null);
  useScrollMotion(root);
  return (
    <div ref={root}>
      <Hero />
      <Categories />
      <Featured />
      <Story />
      <BrandStory />
      <FinalCta />
    </div>
  );
}
