# AURAL — premium headphones & earbuds concept store (frontend demo)

A cinematic, scroll-driven 3D product story and a complete frontend demo store for **AURAL**, a fictional
headphones and earbuds concept. AURAL is a temporary demo name, not a registered or established brand. Every product,
price, availability state and specification is illustrative. Nothing can be purchased.

## Run it

```bash
npm install
npm run dev        # http://localhost:5183
npm run lint       # ESLint
npm run build      # production build in dist/
npm run preview    # serve the build locally
```

`npm run render:products` re-renders the product images (`public/products`, 1200 and 600 px WebP) and the story
fallback stills (`public/story`) from the 3D models with headless Chrome. Run it after changing models, colours or the
catalogue. Arguments: `products`, `story`, or `products <id>` for one product. Needs local Chrome/Edge (or `CHROME_PATH`).

## Stack

React 19, React Router 7, Vite, Three.js, GSAP + ScrollTrigger. Fonts (Sora, Manrope) are self-hosted via Fontsource.
No other runtime dependencies, no analytics, no cookies, no third-party scripts.

## Routes

`/` home · `/shop` · `/products/:id` · `/compare` · `/bag` · `/checkout` · `/about` · `/contact` · `/faq` ·
`/shipping` · `/returns` · `/privacy` · `/terms` · anything else → 404. Store and info pages are lazy-loaded chunks.

## Structure

```
src/
  config/brand.js        name, tagline, placeholders (contact, socials), siteUrl for canonical tags ← rebrand here
  data/products.js       the 8 demo products (single source for shop, home, product pages, compare, bag)
  data/features.js       technology feature tiles; "available on" is derived from the catalogue
  story/timeline.js      story state + the one GSAP timeline (10 scenes, light → navy → light)
  story/copy.js          story text per scene
  story/Story.jsx        sticky stage, ScrollTrigger, overlays, nav tone, progress/skip, fallbacks
  three/model.js         procedural earbuds + case (bean / stem / fin styles, metal lids, display case)
  three/headphones.js    procedural over-ear headphones
  three/pose.js          docking poses shared by the model and the timeline (no three.js import)
  three/experience.js    renderer, camera framing, render-on-demand loop, labels, adaptive quality
  three/effects.js       sound, voice and noise rings; water droplets
  three/studio.js        procedural studio environment (+ a bright "light tent" for chrome)
  state/bag.jsx          bag reducer (add, quantity, colour change, remove, clear) + localStorage
  pages/                 Home, Shop, Product, Compare, Bag, Checkout, InfoPages, NotFound
  components/            Nav, Footer, BagDrawer, BagLines, ProductCard, ProductImage, QuickView, Swatches…
  render/main.js         dev-only offline renderer used by the render script (not in the build)
  styles/                base.css (design system), story.css, store.css
```

## Design system

Light by default: paper `#F7FAFA`, ice `#C9E8F4`, sky `#A9D4E5`, mint `#BDE5D7`; deep navy `#071B35` and teal `#174D4B`
for cinematic moments; champagne gold `#C8A76B` as a sparing accent (`#7F6128` when used as text on light, for AA
contrast). Tokens live at the top of `src/styles/base.css`. Product renders are transparent; each colour has a `tone`
(`ice`, `mint`, `cream`, `navy`, `teal`, `dark`) that sets its backdrop through `[data-tone]`.

## How the story works

- The home page opens on a tall section with a `position: sticky` stage. One ScrollTrigger scrubs one GSAP timeline
  across it; scrolling up reverses everything. No pinning, no scroll-jacking.
- Scenes: hero → intro (light) → open → separate → rotate → acoustics (exploded view with labels) → voice (mic) →
  noise cancellation → power → durability → final (light). The stage background, nav colours and the chapter rail follow
  each scene's tone.
- The timeline tweens a plain state object. The 3D stage reads it every frame and draws only when it changed or an
  ambient effect runs (capped ~30 fps). It pauses off-screen and in background tabs, caps the pixel ratio at 1.5 and
  lowers it when frames are slow. Three.js loads as a separate lazy chunk.
- Phones: each scene gets a shorter scroll distance, copy sits below the product, and a "Skip the story" control and a
  progress bar stay visible. Camera framing adapts to the aspect ratio.
- **No WebGL** or lost context: pre-rendered stills crossfade on the same timeline.
- **Reduced motion**: a calm stacked page of stills and text, no scroll animation.

## Product imagery

All product images are original renders of the procedural AURAL models. Supplied reference photos of real branded
products were used only as art direction, not as product images. To use real photography later, add
`images: { hero: '/path.webp', ... }` to a colour in `src/data/products.js`; `productImage()` prefers it.

## Simulated, not real

- Products, prices, availability, badges ("best seller", "new") and specifications are demo data.
- Checkout validates a delivery form but never asks for payment, places no order and stores nothing; the confirmation
  says so. The bag lives in this browser's localStorage only.
- The contact form is not connected and says nothing was sent.
- Contact details, social links, shipping, returns, privacy and terms are labelled placeholders.

## Before a real launch (needs owner input)

Real business and contact details · payment provider · shipping and returns terms · privacy policy and terms of sale ·
real product photography and verified specifications · a domain (then set `brand.siteUrl` for canonical/og tags) ·
`robots.txt`, `sitemap.xml` and an og:image · hosting with an SPA fallback (e.g. Netlify `/* /index.html 200`).

## SEO limitations

This is a client-rendered SPA. Titles, descriptions and Open Graph tags are set per route at runtime, which Google
renders, but social previews and crawlers that do not run JavaScript see only the defaults in `index.html`.
Pre-rendering or server rendering would be needed for full per-page previews.
