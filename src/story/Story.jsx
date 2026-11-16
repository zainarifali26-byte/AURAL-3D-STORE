import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap, ScrollTrigger } from '../lib/gsap.js';
import { brand, formatPrice } from '../config/brand.js';
import { getProduct } from '../data/products.js';
import { useReducedMotion, hasWebGL } from '../hooks/useMedia.js';
import { createStoryState, buildSceneTimeline, SCENES, TOTAL, SCENE_FOCUS } from './timeline.js';
import { heroCopy, sceneCopy } from './copy.js';

const STORY_PRODUCT = getProduct('pro-x');
const STORY_COLOUR = STORY_PRODUCT.colours[0];
const sceneImage = (key) => `/story/scene-${key}.webp`;
const toneOf = (key) => (key === 'hero' ? 'light' : (SCENES.find((s) => s.key === key)?.tone ?? 'light'));

/** Top-of-section scroll position (px) for a timeline time. */
function scrollForTime(section, time) {
  const top = section.getBoundingClientRect().top + window.scrollY;
  return top + (time / TOTAL) * (section.offsetHeight - window.innerHeight);
}

function SceneText({ k, children }) {
  const c = sceneCopy[k];
  return (
    <>
      <p className="eyebrow">{c.eyebrow}</p>
      <h2 className="scene-title">
        {c.title.split(/(?<=\.)\s+/).map((line) => (
          <span key={line} className="title-line">
            {line}{' '}
          </span>
        ))}
      </h2>
      <p className="scene-body">{c.body}</p>
      {c.note && <p className="scene-note">{c.note}</p>}
      {children}
    </>
  );
}

function IntroActions() {
  return (
    <div className="scene-buy">
      <p className="scene-price">
        {formatPrice(STORY_PRODUCT.price)} <span className="price-note">demo price</span>
      </p>
      <Link className="text-link" to={`/products/${STORY_PRODUCT.id}`}>
        View {STORY_PRODUCT.name}
      </Link>
    </div>
  );
}

function FinalActions() {
  return (
    <div className="scene-actions">
      <Link className="btn btn-primary" to={`/products/${STORY_PRODUCT.id}`}>
        Shop {STORY_PRODUCT.name}
      </Link>
      <Link className="btn btn-ghost" to="/shop">
        Browse the collection
      </Link>
    </div>
  );
}

function ChargeMeter() {
  return (
    <div className="charge" aria-hidden="true">
      <div className="charge-head">
        <span>Case charge (illustrative)</span>
        <span className="charge-value">18%</span>
      </div>
      <div className="charge-track">
        <span className="charge-fill" />
      </div>
    </div>
  );
}

function sceneExtras(key) {
  if (key === 'intro') return <IntroActions />;
  if (key === 'battery') return <ChargeMeter />;
  if (key === 'final') return <FinalActions />;
  return null;
}

function HeroText() {
  return (
    <>
      <p className="eyebrow hero-eyebrow">{heroCopy.eyebrow}</p>
      <h1 className="hero-title">{brand.tagline}</h1>
      <p className="hero-sub">{brand.supporting}</p>
      <div className="hero-actions">
        <Link className="btn btn-primary" to="/shop">
          Shop now
        </Link>
        <a className="btn btn-ghost" href="#scene-open">
          Explore the technology
        </a>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Reduced motion: the same story as a calm, stacked page with still renders.
function StoryStatic() {
  return (
    <section id="discover" className="story-static" aria-label="Product story">
      <div className="static-hero">
        <div className="static-hero-copy">
          <HeroText />
        </div>
        <img
          className="static-img"
          src={sceneImage('hero')}
          alt={`${STORY_PRODUCT.name} concept in ${STORY_COLOUR.name}: closed charging case`}
          width="1600"
          height="1000"
        />
      </div>
      {SCENES.map(({ key, tone }) => (
        <article key={key} id={`scene-${key}`} className="static-scene" data-mood={tone}>
          <img className="static-img" src={sceneImage(key)} alt="" width="1600" height="1000" loading="lazy" decoding="async" />
          <div className="static-copy">
            <SceneText k={key}>{key === 'battery' ? null : sceneExtras(key)}</SceneText>
          </div>
        </article>
      ))}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Full experience: a tall section with a sticky stage. One GSAP timeline is
// scrubbed by one ScrollTrigger; the 3D stage reads the shared state object.
function StoryAnimated() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const labelsRef = useRef(null);
  const bgRef = useRef(null);
  const stateRef = useRef(null);
  if (!stateRef.current) stateRef.current = createStoryState(STORY_PRODUCT.model);

  const [webgl] = useState(hasWebGL);
  const [mode, setMode] = useState(webgl ? 'loading' : 'fallback');
  const fallback = mode === 'fallback';

  // Timeline + ScrollTrigger (text, progress, nav tone, fallback stills).
  useEffect(() => {
    const section = sectionRef.current;
    const S = stateRef.current;
    const root = document.documentElement;
    const ctx = gsap.context(() => {
      const copies = gsap.utils.toArray('.scene-copy', section);
      const dots = gsap.utils.toArray('.rail-link', section);
      const progress = section.querySelector('.story-progress');
      let active = -2;

      const setActive = (time) => {
        let index = time < 0.35 ? -1 : -3;
        SCENES.forEach((s, i) => {
          const end = SCENES[i + 1]?.time ?? TOTAL + 1;
          if (time >= s.time + 0.3 && time < end - 0.3) index = i;
        });
        progress?.style.setProperty('--p', (time / TOTAL).toFixed(4));
        if (index === active) return;
        active = index;
        copies.forEach((el, i) => el.classList.toggle('is-active', i === index));
        dots.forEach((el, i) => el.toggleAttribute('aria-current', i === index));
        const key = index >= 0 ? SCENES[index].key : index === -1 ? 'hero' : null;
        if (key) {
          section.dataset.scene = key;
          root.dataset.navTone = toneOf(key);
        }
      };

      const tl = buildSceneTimeline(S, STORY_PRODUCT.model);
      tl.eventCallback('onUpdate', () => {
        S.version++;
        setActive(tl.time());
      });

      // CSS reads --tone for the stage background when the 3D is not running.
      tl.to(section, { '--tone': 1, duration: 1.2, ease: 'power2.inOut' }, 2.0).to(
        section,
        { '--tone': 0, duration: 1.2, ease: 'power2.inOut' },
        20.4,
      );

      tl.to('.hero-copy', { opacity: 0, y: -40, duration: 0.5, ease: 'power1.in' }, 0.05);

      SCENES.forEach((scene, i) => {
        const el = copies[i];
        const end = SCENES[i + 1]?.time ?? null;
        tl.fromTo(el, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, scene.time + 0.3);
        if (end !== null) tl.to(el, { opacity: 0, y: -28, duration: 0.4, ease: 'power1.in' }, end - 0.45);
      });

      const meter = section.querySelector('.charge');
      const pct = section.querySelector('.charge-value');
      if (meter && pct) {
        const proxy = { v: 0.18 };
        const write = () => {
          meter.style.setProperty('--charge', proxy.v.toFixed(3));
          pct.textContent = `${Math.round(proxy.v * 100)}%`;
        };
        write();
        tl.to(proxy, { v: 1, duration: 0.9, ease: 'power1.inOut', onUpdate: write }, 17.2);
      }

      if (fallback) {
        const stills = gsap.utils.toArray('.stage-still', section);
        SCENES.forEach((scene, i) => {
          const t = Math.max(0, scene.time + 0.1);
          tl.fromTo(stills[i + 1], { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'none' }, t);
          tl.to(stills[i], { opacity: 0, duration: 0.5, ease: 'none' }, t);
        });
      }

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        animation: tl,
        invalidateOnRefresh: true,
      });
      setActive(0);
    }, section);

    section.classList.add('is-animated');
    return () => {
      section.classList.remove('is-animated');
      delete root.dataset.navTone;
      ctx.revert();
    };
  }, [fallback]);

  // Keyboard: focusing something inside an off-screen scene scrolls to it,
  // so focus never lands on invisible copy.
  useEffect(() => {
    const section = sectionRef.current;
    const onFocus = (e) => {
      const copy = e.target.closest?.('.scene-copy');
      if (!copy || copy.classList.contains('is-active')) return;
      window.scrollTo({ top: scrollForTime(section, SCENE_FOCUS[copy.dataset.scene]), behavior: 'instant' });
    };
    section.addEventListener('focusin', onFocus);
    return () => section.removeEventListener('focusin', onFocus);
  }, []);

  // 3D stage, loaded as its own chunk.
  useEffect(() => {
    if (!webgl) return undefined;
    let cancelled = false;
    let experience = null;
    let intro = null;
    const S = stateRef.current;

    import('../three/experience.js')
      .then(({ createExperience }) => {
        if (cancelled) return;
        S.intro = 0;
        experience = createExperience({
          container: canvasRef.current,
          labelsEl: labelsRef.current,
          bgEl: bgRef.current,
          state: S,
          model: STORY_PRODUCT.model,
          finish: STORY_COLOUR.finish,
          maxDpr: 1.5,
          onFirstFrame: () => {
            if (cancelled) return;
            setMode('3d');
            intro = gsap.to(S, {
              intro: 1,
              duration: 1.6,
              ease: 'power3.out',
              onUpdate: () => {
                S.version++;
              },
            });
          },
          onContextLost: () => !cancelled && setMode('fallback'),
        });
      })
      .catch(() => !cancelled && setMode('fallback'));

    return () => {
      cancelled = true;
      intro?.kill();
      S.intro = 1;
      experience?.dispose();
    };
  }, [webgl]);

  return (
    <section
      id="discover"
      ref={sectionRef}
      className={`story is-${mode}`}
      style={{ '--beats': TOTAL }}
      aria-label="Product story"
    >
      <span id="scene-hero" className="story-anchor" style={{ '--f': 0 }} aria-hidden="true" />
      {SCENES.map(({ key }) => (
        <span
          key={key}
          id={`scene-${key}`}
          className="story-anchor"
          style={{ '--f': SCENE_FOCUS[key] / TOTAL }}
          aria-hidden="true"
        />
      ))}

      <div className="stage">
        <div className="stage-bg" ref={bgRef} aria-hidden="true" />
        <p className="stage-word" aria-hidden="true">
          {brand.wordmark}
        </p>
        <div className="stage-canvas" ref={canvasRef} aria-hidden="true" />
        {fallback && (
          <div className="stage-stills">
            {['hero', ...SCENES.map((s) => s.key)].map((key, i) => (
              <img
                key={key}
                className="stage-still"
                src={sceneImage(key)}
                alt=""
                width="1600"
                height="1000"
                decoding="async"
                loading={i < 2 ? 'eager' : 'lazy'}
                style={{ opacity: i === 0 ? 1 : 0 }}
              />
            ))}
          </div>
        )}
        {mode === 'loading' && (
          <p className="stage-loading" role="status">
            Loading 3D preview
          </p>
        )}
        <div className="stage-labels" ref={labelsRef} aria-hidden="true" />

        <header className="hero-copy">
          <HeroText />
        </header>

        {SCENES.map(({ key, tone }) => (
          <article key={key} className="scene-copy" data-scene={key} data-mood={tone} data-side={sceneCopy[key].side}>
            <SceneText k={key}>{sceneExtras(key)}</SceneText>
          </article>
        ))}

        <nav className="rail" aria-label="Story chapters">
          <ol>
            {SCENES.map(({ key }) => (
              <li key={key}>
                <a className="rail-link" href={`#scene-${key}`}>
                  <span className="rail-dot" aria-hidden="true" />
                  <span className="rail-label">{sceneCopy[key].eyebrow.split('/ ').pop()}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="story-progress" aria-hidden="true">
          <span className="story-progress-bar" />
        </div>
        <a className="skip-story" href="#technology">
          Skip the story
        </a>
      </div>
    </section>
  );
}

export default function Story() {
  const reduced = useReducedMotion();
  return reduced ? <StoryStatic /> : <StoryAnimated />;
}
