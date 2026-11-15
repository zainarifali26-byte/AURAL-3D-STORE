import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap, ScrollTrigger } from '../lib/gsap.js';
import { brand } from '../config/brand.js';
import { getProduct } from '../data/products.js';
import { useReducedMotion, hasWebGL } from '../hooks/useMedia.js';
import { createStoryState, buildSceneTimeline, SCENES, TOTAL, SCENE_FOCUS } from './timeline.js';
import { heroCopy, sceneCopy } from './copy.js';

const STORY_PRODUCT = getProduct('pro');
const sceneImage = (key) => `/story/scene-${key}.webp`;

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

function FinalActions() {
  return (
    <div className="scene-actions">
      <a className="btn btn-primary" href="#collection">
        Choose your {brand.name}
      </a>
      <Link className="btn btn-ghost" to="/compare">
        Compare models
      </Link>
    </div>
  );
}

function HeroText({ animated }) {
  return (
    <>
      <p className="hero-brand" aria-hidden="true">
        {brand.wordmark}
      </p>
      <p className="eyebrow hero-eyebrow">{heroCopy.eyebrow}</p>
      <h1 className="hero-title">{brand.tagline}</h1>
      <p className="hero-sub">{brand.supporting}</p>
      {animated && (
        <div className="hero-cues">
          <a className="scroll-cue" href="#scene-reveal">
            <span className="scroll-cue-line" aria-hidden="true" />
            Scroll to explore
          </a>
          <a className="skip-story" href="#collection">
            Skip to the products
          </a>
        </div>
      )}
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
          <HeroText animated={false} />
        </div>
        <img
          className="static-img"
          src={sceneImage('hero')}
          alt={`${STORY_PRODUCT.name} concept: charging case with two earbuds`}
          width="1400"
          height="1000"
        />
      </div>
      {SCENES.map(({ key }) => (
        <article key={key} id={`scene-${key}`} className="static-scene">
          {key === 'explode' && <span id="technology" className="sr-anchor" aria-hidden="true" />}
          <img
            className="static-img"
            src={sceneImage(key)}
            alt=""
            width="1400"
            height="1000"
            loading="lazy"
            decoding="async"
          />
          <div className="static-copy">
            <SceneText k={key}>{key === 'final' && <FinalActions />}</SceneText>
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
  if (!stateRef.current) stateRef.current = createStoryState();

  const [webgl] = useState(hasWebGL);
  const [mode, setMode] = useState(webgl ? 'loading' : 'fallback');
  const fallback = mode === 'fallback';

  // Timeline + ScrollTrigger (text, progress rail, fallback stills).
  useEffect(() => {
    const section = sectionRef.current;
    const S = stateRef.current;
    const ctx = gsap.context(() => {
      const copies = gsap.utils.toArray('.scene-copy', section);
      const dots = gsap.utils.toArray('.rail-link', section);
      let active = -2;

      const setActive = (time) => {
        let index = time < 0.4 ? -1 : -3;
        SCENES.forEach((s, i) => {
          const end = SCENES[i + 1]?.time ?? TOTAL + 1;
          if (time >= s.time + 0.3 && time < end - 0.3) index = i;
        });
        if (index === active) return;
        active = index;
        copies.forEach((el, i) => el.classList.toggle('is-active', i === index));
        dots.forEach((el, i) => el.toggleAttribute('aria-current', i === index));
        section.dataset.scene = index >= 0 ? SCENES[index].key : index === -1 ? 'hero' : 'between';
      };

      const tl = buildSceneTimeline(S);
      tl.eventCallback('onUpdate', () => {
        S.version++;
        setActive(tl.time());
      });

      // Hero copy leaves first.
      tl.to('.hero-copy', { opacity: 0, y: -40, duration: 0.6, ease: 'power1.in' }, 0.05);

      SCENES.forEach((scene, i) => {
        const el = copies[i];
        const end = SCENES[i + 1]?.time ?? null;
        tl.fromTo(el, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, scene.time + 0.3);
        if (end !== null) tl.to(el, { opacity: 0, y: -28, duration: 0.4, ease: 'power1.in' }, end - 0.45);
      });

      // Battery meter (illustrative).
      const meter = section.querySelector('.charge');
      const pct = section.querySelector('.charge-value');
      if (meter && pct) {
        const proxy = { v: 0.18 };
        const write = () => {
          meter.style.setProperty('--charge', proxy.v.toFixed(3));
          pct.textContent = `${Math.round(proxy.v * 100)}%`;
        };
        write();
        tl.to(proxy, { v: 1, duration: 0.9, ease: 'power1.inOut', onUpdate: write }, 14.0);
      }

      // Still images when WebGL is unavailable.
      if (fallback) {
        const stills = gsap.utils.toArray('.stage-still', section);
        const keys = ['hero', ...SCENES.map((s) => s.key)];
        keys.forEach((key, i) => {
          if (i === 0) return;
          const t = SCENES[i - 1].time;
          tl.fromTo(stills[i], { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'none' }, Math.max(0, t + 0.1));
          tl.to(stills[i - 1], { opacity: 0, duration: 0.5, ease: 'none' }, Math.max(0, t + 0.1));
        });
      }

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.7,
        animation: tl,
        invalidateOnRefresh: true,
      });
      setActive(0);
    }, section);

    section.classList.add('is-animated');
    return () => {
      section.classList.remove('is-animated');
      ctx.revert();
    };
  }, [fallback]);

  // Keyboard: focusing something inside a scene scrolls to that scene, so
  // focus never lands on invisible copy.
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
        const colour = STORY_PRODUCT.colours[0];
        S.intro = 0;
        experience = createExperience({
          container: canvasRef.current,
          labelsEl: labelsRef.current,
          bgEl: bgRef.current,
          state: S,
          model: STORY_PRODUCT.model,
          finish: colour.finish,
          maxDpr: 1.5,
          onFirstFrame: () => {
            if (cancelled) return;
            setMode('3d');
            intro = gsap.to(S, {
              intro: 1,
              duration: 1.8,
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
      <span id="technology" className="story-anchor" style={{ '--f': SCENE_FOCUS.explode / TOTAL }} aria-hidden="true" />

      <div className="stage">
        <div className="stage-bg" ref={bgRef} aria-hidden="true" />
        <div className="stage-canvas" ref={canvasRef} aria-hidden="true" />
        {fallback && (
          <div className="stage-stills">
            {['hero', ...SCENES.map((s) => s.key)].map((key, i) => (
              <img
                key={key}
                className="stage-still"
                src={sceneImage(key)}
                alt=""
                width="1400"
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
          <HeroText animated />
        </header>

        {SCENES.map(({ key }) => (
          <article key={key} className="scene-copy" data-scene={key} data-side={sceneCopy[key].side}>
            <SceneText k={key}>
              {key === 'battery' && (
                <div className="charge" aria-hidden="true">
                  <div className="charge-head">
                    <span>Case charge (illustrative)</span>
                    <span className="charge-value">18%</span>
                  </div>
                  <div className="charge-track">
                    <span className="charge-fill" />
                  </div>
                </div>
              )}
              {key === 'final' && <FinalActions />}
            </SceneText>
          </article>
        ))}

        <nav className="rail" aria-label="Story chapters">
          <ol>
            {SCENES.map(({ key }) => (
              <li key={key}>
                <a className="rail-link" href={`#scene-${key}`}>
                  <span className="rail-dot" aria-hidden="true" />
                  <span className="rail-label">{sceneCopy[key].eyebrow.split('/ ')[1]}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
}

export default function Story() {
  const reduced = useReducedMotion();
  return reduced ? <StoryStatic /> : <StoryAnimated />;
}
