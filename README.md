# AURAL — premium headphones & earbuds concept store (frontend demo)

A premium audio e-commerce frontend for **AURAL**, a fictional headphones and earbuds concept: editorial home page,
scroll-driven storytelling, a complete demo shop and an honest asset pipeline. AURAL is a temporary demo name, not a
registered brand. Products, prices, availability and specifications are illustrative; nothing can be purchased.

## Run it

```bash
npm install
npm run dev        # http://localhost:5183
npm run lint       # ESLint
npm run build      # production build in dist/
npm run preview    # serve the build locally
```

## Stack

React 19, React Router 7, Vite, GSAP + ScrollTrigger. Manrope is self-hosted (Fontsource). No other runtime
dependencies, no analytics, no cookies, no third-party scripts. three.js is a **dev-only** dependency used by the
offline render script.

## Routes

`/` · `/shop` · `/products/:id` · `/compare` · `/bag` · `/checkout` · `/about` · `/contact` · `/faq` · `/shipping` ·
`/returns` · `/privacy` · `/terms` · `/credits` · anything else → 404. All routes except home are lazy-loaded.

## Structure

```
src/
  config/brand.js        name, copy, placeholders, siteUrl for canonical tags   ← rebrand here
  data/products.js       the 8 demo products (single source for every page)
  data/assets.js         central image registry: photos + concept renders, srcset helpers
  data/credits.js        photographer and licence data for every photo
  lib/motion.js          GSAP ScrollTrigger reveals, masks, split headlines, parallax (off under reduced motion)
  lib/gsap.js            registers GSAP plugins once
  pages/                 Home, Shop, Product, Compare, Bag, Checkout, InfoPages (+ Credits), NotFound
  components/            Nav, SearchDialog, Footer, ProductCard, ProductImage, QuickView, BagDrawer, TechDiagram…
  state/bag.jsx          bag reducer (add, quantity, colour change, remove, clear) + localStorage
  styles/                base.css (design system), home.css, store.css
  three/, render/        procedural models + offline renderer for concept renders (dev only)
scripts/
  photo-manifest.mjs     which Pexels photos are used, crops and processing mode
  process-photos.mjs     crops, keys backdrops, bakes the studio backdrop, exports WebP (1600/800)
  render-products.mjs    renders the concept-render products onto the same backdrop
  backdrop.js            the shared "studio pearl" backdrop
public/images/photos     processed photography      public/images/renders   concept renders
```

## Design system

Tokens at the top of `src/styles/base.css`: warm ivory `#F6F3EE`, pearl `#FBFAF7`, studio `#EFEBE5`, silver,
champagne `#C2A46D` (text variant `#7A5F2E` for AA), sage, forest `#1E3A2F`, charcoal `#18191B`. One typeface
(Manrope) with a fluid type scale, a 4 px spacing scale, small radii, two shadows and shared easing/durations.
Dark sections are used sparingly (technology in forest, closing CTA and footer in charcoal).

## Product imagery — read this

- **Photography (Pro X, One, Studio):** licensed stock photos from Pexels (Pexels License, free for commercial use).
  Every photo was checked for visible logos; the products are **unbranded stand-ins** for this fictional concept.
  Full credits are on `/credits` and in `src/data/credits.js`.
- **Concept renders (Air, Pulse, Neo, Sport, Mini):** no legitimately reusable, unbranded photography was found for
  these designs (free stock photos of earbuds overwhelmingly show identifiable brands such as Apple, Nothing, Amazon,
  Bang & Olufsen, JBL, Jabra, OPPO and Philips). They are shown as clearly labelled concept renders.
- All images share one 4:5 frame and one baked studio backdrop, so a product looks identical everywhere.

To replace an image: process a new photo with `scripts/process-photos.mjs` (add it to the manifest), then point the
colour's `images` list in `src/data/products.js` at the new key in `PHOTO_ASSETS`.

```bash
# originals are not committed; download the Pexels originals listed in scripts/photo-manifest.mjs, then:
node scripts/process-photos.mjs <folder with <pexelsId>.jpg files>
npm run render:products          # concept renders (needs local Chrome/Edge)
```

## Motion

- Hero: stage wipes open, copy rises, product switcher crossfades between the three photographed products,
  subtle parallax as the hero scrolls away.
- Sections: masked image reveals, word-by-word headline reveals, fade-ups, parallax on editorial photos.
- Technology: a pinned (sticky) stage on desktop whose photo and animated SVG diagram change as each chapter scrolls
  past; stacked chapters with inline diagrams on mobile.
- Cards: second image on hover, quick view; navigation hides on scroll down and returns on scroll up.
- `prefers-reduced-motion`: no GSAP animation runs and all content is visible immediately.

## Simulated, not real

Products, prices, availability, badges and specifications are demo data. Checkout validates a delivery form but never
asks for payment, places no order and stores nothing. The contact form is not connected. Contact details, social links,
shipping, returns, privacy and terms are labelled placeholders.

## Before a real launch

Real product photography and verified specifications · business and contact details · payment provider · shipping,
returns, privacy and terms · a domain (set `brand.siteUrl`) · `robots.txt`, `sitemap.xml`, og:image · hosting with an
SPA fallback (e.g. Netlify `/* /index.html 200`).

## SEO note

Client-rendered SPA: titles, descriptions and Open Graph tags are set per route at runtime (Google renders them), but
crawlers that do not run JavaScript only see the defaults in `index.html`. Pre-rendering would fix that.
