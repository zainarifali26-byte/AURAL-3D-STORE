# AURAL — 3D earbuds concept store (frontend demo)

A scroll-driven 3D product story and a frontend-only demo store for **AURAL**, a fictional wireless earbuds concept.
AURAL is a temporary demo name, not a registered or established brand. Every product, price and specification is illustrative,
and nothing can be purchased.

## Run it

```bash
npm install
npm run dev        # http://localhost:5183
npm run lint       # ESLint
npm run build      # production build in dist/
npm run preview    # serve the build locally
```

`npm run render:products` re-renders the product images and story stills from the 3D model (needs a local Chrome or Edge,
or set `CHROME_PATH`). Run it after changing the model, colours or catalogue. Pass `products` or `story` to render only one set.

## Stack

React 19, React Router 7, Vite, Three.js, GSAP + ScrollTrigger. Fonts (Sora, Manrope) are self-hosted through Fontsource.
No smooth-scroll library: the page uses native scrolling.

## Structure

```
src/
  config/brand.js        brand name, wordmark, tagline, demo notice, price formatting  ← rebrand here
  data/products.js       the four demo products: copy, prices, colours, specs, 3D parameters
  story/timeline.js      story state object + the one GSAP timeline that animates it (8 scenes)
  story/copy.js          story text per scene
  story/Story.jsx        sticky stage, ScrollTrigger, text overlays, fallbacks
  three/model.js         procedural earbuds + case (modular; see "Replacing the model")
  three/experience.js    renderer, camera, render-on-demand loop, labels, quality control
  three/effects.js       sound rings, noise rings, water droplets
  three/studio.js        procedural studio environment and lights
  state/bag.jsx          bag reducer, localStorage persistence
  pages/                 Home, ProductPage, ComparePage, BagPage, NotFound
  components/            Nav, Footer, BagDrawer, ProductCard, Swatches, QuantityStepper…
  render/main.js         dev-only offline renderer used by the render script (not in the build)
public/products, public/story   rendered WebP images
```

## How the story works

- The story section is tall (`--beats` × `--beat`) with a `position: sticky` stage inside it. One ScrollTrigger scrubs one
  GSAP timeline across that height. There is no pinning and no scroll-jacking; the visitor scrolls normally and the
  animation reverses when scrolling up.
- The timeline tweens a plain state object (`S`). The 3D stage reads `S` each frame and draws only when it changed or an
  ambient effect is running (capped at ~30 fps). It pauses off-screen and in background tabs, caps the pixel ratio at 1.5
  and drops it further if frames are slow.
- Three.js is a separate lazy chunk, so the page and text paint before the 3D loads.
- **No WebGL** (or a lost context): pre-rendered stills crossfade on the same timeline.
- **Reduced motion**: the story becomes a calm, stacked page of stills and text with no scroll animation.
- Chapter rail (desktop), "Skip to the products" link, and nav anchors (`#technology`, `#scene-*`) jump straight to any
  scene. Focusing a link inside an off-screen scene scrolls to that scene.

## Replacing the model

The site does not ship a downloaded 3D asset. `three/model.js` builds an original, generic shape from Three.js geometry.
`createEarbudSet()` returns a small interface (`root`, `caseGroup`, `lidPivot`, `lid`, `led`, `buds[i].group`,
`buds[i].parts`, `buds[i].setExplode(t)`, `dims`, `dispose`). To use a GLB instead, load it with `GLTFLoader`
(plus Draco/KTX2 for compression), map its nodes to the same handles, and the story will drive it unchanged.
Check the model's licence first, and avoid copies of real commercial products.

The internal components in the exploded view are **illustrative**, and the site labels them so.

## Simulated, not real

- Products, prices, colours and specifications are fictional demo data.
- Noise cancellation, battery life and splash resistance are part of the demo specification only. No IP rating is claimed.
- The bag is stored in this browser's localStorage. "Demo checkout" places no order, asks for no payment details and charges nothing.
- Contact email and social links in the footer are labelled placeholders, not links.

## Deploying

Not deployed. Because routes such as `/products/pro` are client-side, the host needs an SPA fallback
(serve `index.html` for unknown paths), for example a Netlify `_redirects` rule `/* /index.html 200`.
