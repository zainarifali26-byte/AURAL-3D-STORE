// Fictional demo catalogue: the single source for the shop, home page,
// product pages, comparison and bag. Every price, availability state and
// specification is illustrative, not a manufacturer specification.
//
// Images are rendered from the procedural 3D models (npm run render:products)
// using `kind`, `model` and each colour's `finish`. To use real photography
// later, add `images: { hero: '/path.webp', ... }` to a colour; productImage()
// prefers it.

export const CATEGORIES = [
  { id: 'earbuds', name: 'True wireless', blurb: 'Pocket-sized, everyday earbuds.' },
  { id: 'sport', name: 'Sport', blurb: 'A secure fit for training.' },
  { id: 'headphones', name: 'Over-ear', blurb: 'Full-size comfort for long listening.' },
];

export const AVAILABILITY = {
  'in-stock': 'In stock (demo)',
  'low-stock': 'Low stock (demo)',
  preorder: 'Pre-order (demo)',
};

export const COLOUR_FAMILIES = {
  black: 'Black',
  white: 'White',
  blue: 'Blue',
  green: 'Green',
  gold: 'Gold',
  silver: 'Silver',
  grey: 'Grey',
};

export const VIEWS = {
  earbuds: ['hero', 'buds', 'case', 'top'],
  headphones: ['hero', 'side', 'detail'],
};

export const VIEW_LABELS = {
  hero: 'product shown at a three-quarter angle',
  buds: 'close-up of both earbuds',
  case: 'closed charging case',
  top: 'open case seen from above',
  side: 'side profile',
  detail: 'close-up of the ear cup',
};

export const VIEW_NAMES = { hero: 'Overview', buds: 'Earbuds', case: 'Case', top: 'Open case', side: 'Profile', detail: 'Ear cup' };

export const products = [
  {
    id: 'pro-x',
    name: 'AURAL Pro X',
    kind: 'earbuds',
    category: 'earbuds',
    badges: ['featured', 'bestseller'],
    released: 6,
    price: 249,
    availability: 'in-stock',
    useCase: 'Commute, office, travel',
    tagline: 'The flagship concept, finished in black and champagne gold.',
    short: 'Stem earbuds with adaptive noise cancellation and a metal-lidded case.',
    description:
      'Pro X is the most complete AURAL concept. A gloss stem design that sits close to the ear, adaptive noise cancellation for loud streets and open offices, and a charging case with a polished metal lid. It is the model the scroll story on our home page is built around.',
    features: ['Adaptive noise cancellation', 'Transparency mode', 'Dual call microphones', 'Wireless charging case', 'Multipoint pairing'],
    specs: {
      design: 'Stem, gloss shell, metal-lid case',
      battery: 'Long (around 8 h, illustrative)',
      anc: 'Adaptive ANC',
      connectivity: 'Bluetooth 5.4, multipoint',
      weight: 'Around 5 g per earbud',
      chargingCase: 'USB-C and wireless',
      durability: 'Splash resistant (concept)',
      latency: 'Low-latency mode',
    },
    colours: [
      { id: 'onyx-gold', name: 'Onyx & Gold', hex: '#111214', family: 'black', tone: 'dark', finish: { body: '#0e0f12', case: '#0c0d10', lid: '#c8a76b', accent: '#c8a76b', tip: '#16171a' } },
      { id: 'glacier', name: 'Glacier', hex: '#e9f2f6', family: 'white', tone: 'ice', finish: { body: '#eef3f6', case: '#edf2f5', lid: '#d4dde3', accent: '#c9d4dc', tip: '#e2e8ec' } },
      { id: 'navy', name: 'Deep Navy', hex: '#14284a', family: 'blue', tone: 'navy', finish: { body: '#132544', case: '#112139', lid: '#c8a76b', accent: '#d8c08f', tip: '#0d1a30' } },
    ],
    model: { budStyle: 'stem', stem: 0.62, caseN: 3.6, case: [1.15, 0.95, 0.5, 0.74], bud: 0.86, ring: 1, roughness: 0.16, metalness: 0.15, caseRoughness: 0.2, lidMetal: true },
  },
  {
    id: 'air',
    name: 'AURAL Air',
    kind: 'earbuds',
    category: 'earbuds',
    badges: ['bestseller'],
    released: 3,
    price: 119,
    availability: 'in-stock',
    useCase: 'Everyday listening, calls',
    tagline: 'Light enough to forget. Good enough to notice.',
    short: 'Featherweight stemless earbuds in a pebble-shaped case.',
    description:
      'Air is the everyday concept: a small, rounded earbud that disappears in the ear, and a pebble case that disappears in a pocket. Tuned for podcasts, calls and long days rather than for maximum isolation.',
    features: ['Featherweight fit', 'Clear-voice microphones', 'Pocket-sized case', 'Fast pairing'],
    specs: {
      design: 'Stemless, compact matte shell',
      battery: 'Standard (around 6 h, illustrative)',
      anc: 'Not included',
      connectivity: 'Bluetooth 5.3',
      weight: 'Around 4 g per earbud',
      chargingCase: 'USB-C',
      durability: 'Sweat resistant (concept)',
      latency: 'Standard',
    },
    colours: [
      { id: 'ice', name: 'Ice Blue', hex: '#c9e8f4', family: 'blue', tone: 'ice', finish: { body: '#bfdfec', accent: '#ffffff', tip: '#a9cfe0' } },
      { id: 'chalk', name: 'Chalk', hex: '#f1efe9', family: 'white', tone: 'cream', finish: { body: '#ece9e2', accent: '#c4bcab', tip: '#dcd6ca' } },
      { id: 'mint', name: 'Mint', hex: '#bde5d7', family: 'green', tone: 'mint', finish: { body: '#b2dccd', accent: '#f4fffb', tip: '#9ccbba' } },
    ],
    model: { budStyle: 'bean', caseN: 2.5, case: [1.08, 0.72, 0.42, 0.82], bud: 0.86, ring: 0.6, roughness: 0.5, metalness: 0.05 },
  },
  {
    id: 'studio',
    name: 'AURAL Studio',
    kind: 'headphones',
    category: 'headphones',
    badges: ['featured'],
    released: 7,
    price: 329,
    availability: 'in-stock',
    useCase: 'Home listening, focus, travel',
    tagline: 'Full-size sound, soft enough for the whole afternoon.',
    short: 'Over-ear headphones with deep memory-foam cushions and adaptive ANC.',
    description:
      'Studio is the full-size concept. Oval cups that surround the ear instead of pressing on it, a slim padded band and adaptive noise cancellation for long, focused listening sessions at home or on a plane.',
    features: ['Adaptive noise cancellation', 'Memory-foam cushions', 'Physical playback buttons', 'Wired and wireless listening', 'Custom EQ profiles'],
    specs: {
      design: 'Over-ear, oval cups, padded band',
      battery: 'Extended (around 40 h, illustrative)',
      anc: 'Adaptive ANC',
      connectivity: 'Bluetooth 5.4, 3.5 mm wired',
      weight: 'Around 250 g',
      chargingCase: 'Soft carry pouch, USB-C',
      durability: 'Everyday use (concept)',
      latency: 'Low-latency mode',
    },
    colours: [
      { id: 'ice', name: 'Ice Blue', hex: '#cfe8ef', family: 'blue', tone: 'ice', finish: { body: '#cfe6ee', band: '#cfe6ee', cushion: '#9fb3db', accent: '#eef3f6' } },
      { id: 'teal', name: 'Deep Teal', hex: '#174d4b', family: 'green', tone: 'teal', finish: { body: '#1c5654', band: '#1c5654', cushion: '#143f3e', accent: '#9fc9c3' } },
      { id: 'graphite', name: 'Graphite', hex: '#2a2f35', family: 'grey', tone: 'dark', finish: { body: '#2a2f35', band: '#2a2f35', cushion: '#1d2025', accent: '#c8a76b' } },
    ],
    model: { roughness: 0.42 },
  },
  {
    id: 'pulse',
    name: 'AURAL Pulse',
    kind: 'earbuds',
    category: 'earbuds',
    badges: ['new'],
    released: 8,
    price: 159,
    availability: 'in-stock',
    useCase: 'Everyday listening, light workouts',
    tagline: 'A polished blade, a soft cream shell.',
    short: 'Stem earbuds with a polished metal blade and a square-cornered case.',
    description:
      'Pulse pairs a soft-touch shell with a polished blade stem that catches the light. Hybrid noise cancellation keeps the bus quiet, and the square-cornered case stands upright on a desk.',
    features: ['Hybrid noise cancellation', 'Polished blade stem', 'Touch and swipe controls', 'Fast charging'],
    specs: {
      design: 'Blade stem, soft-touch shell',
      battery: 'Standard (around 7 h, illustrative)',
      anc: 'Hybrid ANC',
      connectivity: 'Bluetooth 5.3',
      weight: 'Around 4.5 g per earbud',
      chargingCase: 'USB-C, fast charging',
      durability: 'Sweat resistant (concept)',
      latency: 'Low-latency mode',
    },
    colours: [
      { id: 'champagne', name: 'Champagne', hex: '#e7e0d2', family: 'white', tone: 'cream', finish: { body: '#e4ddcf', case: '#e1dacb', accent: '#dcdfe3', tip: '#d6cebd' } },
      { id: 'sky', name: 'Sky', hex: '#a9d4e5', family: 'blue', tone: 'ice', finish: { body: '#a2cde0', case: '#a6d0e2', accent: '#e9eef2', tip: '#8fbdd1' } },
      { id: 'slate', name: 'Slate', hex: '#3e4650', family: 'grey', tone: 'dark', finish: { body: '#3a424c', case: '#353c45', accent: '#c9cfd6', tip: '#2b3138' } },
    ],
    model: { budStyle: 'stem', stem: 0.58, stemShape: 'blade', caseN: 4.4, case: [1.1, 0.92, 0.48, 0.72], bud: 0.84, ring: 0.5, roughness: 0.55, metalness: 0.05 },
  },
  {
    id: 'neo',
    name: 'AURAL Neo',
    kind: 'earbuds',
    category: 'earbuds',
    badges: ['new'],
    released: 5,
    price: 139,
    availability: 'preorder',
    useCase: 'Gaming, everyday listening',
    tagline: 'Your battery, at a glance.',
    short: 'Compact earbuds with a small status display on the case.',
    description:
      'Neo puts a small status display on the front of its case, so you can see the charge of each earbud without opening an app. A low-latency mode is aimed at games and video.',
    features: ['Case status display (concept)', 'Low-latency game mode', 'Environmental noise reduction for calls', 'Touch controls'],
    specs: {
      design: 'Stemless, gloss shell, display case',
      battery: 'Standard (around 6 h, illustrative)',
      anc: 'Call noise reduction only',
      connectivity: 'Bluetooth 5.3',
      weight: 'Around 4.3 g per earbud',
      chargingCase: 'USB-C, status display',
      durability: 'Splash resistant (concept)',
      latency: 'Game mode',
    },
    colours: [
      { id: 'carbon', name: 'Carbon', hex: '#16181b', family: 'black', tone: 'dark', finish: { body: '#141619', accent: '#9fb0c2', tip: '#0d0e10' } },
      { id: 'frost', name: 'Frost', hex: '#eef2f4', family: 'white', tone: 'ice', finish: { body: '#eceff1', accent: '#a9b4be', tip: '#d9dee2' } },
    ],
    model: { budStyle: 'bean', display: true, caseN: 4.2, case: [1.12, 0.86, 0.46, 0.8], bud: 0.88, ring: 0.7, roughness: 0.18, metalness: 0.12 },
  },
  {
    id: 'sport',
    name: 'AURAL Sport',
    kind: 'earbuds',
    category: 'sport',
    badges: [],
    released: 2,
    price: 179,
    availability: 'in-stock',
    useCase: 'Running, gym, outdoor training',
    tagline: 'Stays put when you do not.',
    short: 'Training earbuds with a soft ear fin and an ambient mode.',
    description:
      'Sport is the training concept. A soft ear fin holds each earbud in place, the matte shell is easy to grip with wet hands, and an ambient mode keeps traffic audible on a run.',
    features: ['Secure ear-fin fit', 'Ambient awareness mode', 'Physical button controls', 'Grippy matte finish'],
    specs: {
      design: 'Ear fin, matte shell',
      battery: 'Long (around 9 h, illustrative)',
      anc: 'Ambient mode only',
      connectivity: 'Bluetooth 5.3',
      weight: 'Around 6 g per earbud',
      chargingCase: 'USB-C',
      durability: 'Sweat and rain resistant (concept)',
      latency: 'Standard',
    },
    colours: [
      { id: 'mint', name: 'Mint', hex: '#a8dcc6', family: 'green', tone: 'mint', finish: { body: '#9fd5be', accent: '#174d4b', tip: '#174d4b' } },
      { id: 'carbon', name: 'Carbon', hex: '#202326', family: 'black', tone: 'dark', finish: { body: '#191c1f', accent: '#bde5d7', tip: '#0d0f10' } },
      { id: 'arctic', name: 'Arctic', hex: '#dfe7ec', family: 'white', tone: 'ice', finish: { body: '#d8e1e7', accent: '#4f8fd6', tip: '#b9c5cd' } },
    ],
    model: { budStyle: 'fin', caseN: 2.4, case: [1.26, 0.8, 0.5, 0.9], bud: 1, ring: 0.8, roughness: 0.7, metalness: 0.02 },
  },
  {
    id: 'elite',
    name: 'AURAL Elite',
    kind: 'earbuds',
    category: 'earbuds',
    badges: ['featured'],
    released: 4,
    price: 299,
    availability: 'low-stock',
    useCase: 'Statement piece, travel',
    tagline: 'A mirror-polished case for people who like to be noticed.',
    short: 'Gloss stem earbuds in a polished chrome case.',
    description:
      'Elite is the statement concept: gloss black earbuds in a chrome-finished case that reflects everything around it. Underneath, it shares the adaptive noise cancellation and call microphones of Pro X.',
    features: ['Adaptive noise cancellation', 'Mirror-polished case', 'Dual call microphones', 'Wireless charging case'],
    specs: {
      design: 'Stem, gloss shell, chrome case',
      battery: 'Long (around 8 h, illustrative)',
      anc: 'Adaptive ANC',
      connectivity: 'Bluetooth 5.4, multipoint',
      weight: 'Around 5 g per earbud',
      chargingCase: 'USB-C and wireless',
      durability: 'Splash resistant (concept)',
      latency: 'Low-latency mode',
    },
    colours: [
      { id: 'chrome', name: 'Chrome', hex: '#c9ccd0', family: 'silver', tone: 'dark', finish: { body: '#101113', case: '#d6d9dd', accent: '#d6d9dd', tip: '#16171a' } },
      { id: 'gunmetal', name: 'Gunmetal', hex: '#4b4f55', family: 'grey', tone: 'dark', finish: { body: '#141518', case: '#5a5f66', accent: '#9aa0a8', tip: '#16171a' } },
    ],
    model: { budStyle: 'stem', stem: 0.6, caseN: 3.4, case: [1.15, 0.95, 0.5, 0.74], bud: 0.86, ring: 1, roughness: 0.14, metalness: 0.15, caseRoughness: 0.08, caseMetalness: 1 },
  },
  {
    id: 'one',
    name: 'AURAL One',
    kind: 'headphones',
    category: 'headphones',
    badges: ['bestseller', 'new'],
    released: 9,
    price: 199,
    availability: 'in-stock',
    useCase: 'Everyday listening, study',
    tagline: 'The easy-going full-size pair.',
    short: 'Lightweight over-ear headphones in soft, everyday colours.',
    description:
      'One is the lighter, simpler full-size concept: smaller cups, a lighter band and a relaxed tuning for study sessions and everyday listening. Passive isolation instead of active noise cancellation keeps it simple.',
    features: ['Lightweight frame', 'Soft protein-leather cushions', 'Physical playback buttons', 'Long battery life'],
    specs: {
      design: 'Over-ear, compact cups',
      battery: 'Extended (around 45 h, illustrative)',
      anc: 'Passive isolation only',
      connectivity: 'Bluetooth 5.3',
      weight: 'Around 210 g',
      chargingCase: 'USB-C, no case',
      durability: 'Everyday use (concept)',
      latency: 'Standard',
    },
    colours: [
      { id: 'mint', name: 'Mint', hex: '#bde5d7', family: 'green', tone: 'mint', finish: { body: '#b8e0d1', band: '#b8e0d1', cushion: '#f2f4f1', accent: '#ffffff' } },
      { id: 'sand', name: 'Sand', hex: '#e6dccb', family: 'white', tone: 'cream', finish: { body: '#e3d8c6', band: '#e3d8c6', cushion: '#c9b99f', accent: '#c8a76b' } },
      { id: 'black', name: 'Black', hex: '#1a1c1f', family: 'black', tone: 'dark', finish: { body: '#1b1d20', band: '#1b1d20', cushion: '#111214', accent: '#8f969e' } },
    ],
    model: { roughness: 0.6, cupScale: 0.9 },
  },
];

// Comparison rows, in display order. All values are demo specifications.
export const compareRows = [
  { key: 'category', label: 'Type', get: (p) => getCategory(p.category).name },
  { key: 'design', label: 'Design' },
  { key: 'battery', label: 'Battery' },
  { key: 'anc', label: 'Noise cancellation' },
  { key: 'connectivity', label: 'Connectivity' },
  { key: 'useCase', label: 'Best for', get: (p) => p.useCase },
  { key: 'chargingCase', label: 'Charging' },
  { key: 'durability', label: 'Durability' },
];

export const specRows = [
  { key: 'design', label: 'Design' },
  { key: 'battery', label: 'Battery' },
  { key: 'anc', label: 'Noise cancellation' },
  { key: 'connectivity', label: 'Connectivity' },
  { key: 'latency', label: 'Latency' },
  { key: 'weight', label: 'Weight' },
  { key: 'chargingCase', label: 'Charging' },
  { key: 'durability', label: 'Durability' },
];

export function getProduct(id) {
  return products.find((p) => p.id === id);
}

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

export function getColour(product, colourId) {
  return product.colours.find((c) => c.id === colourId) ?? product.colours[0];
}

export function viewsFor(product) {
  return VIEWS[product.kind];
}

/** Image URL for a product/colour/view at a width (600 or 1200). */
export function productImage(productId, colourId, view = 'hero', width = 1200) {
  const product = getProduct(productId);
  const colour = product && getColour(product, colourId);
  if (colour?.images?.[view]) return colour.images[view];
  return `/products/${productId}-${colourId}-${view}-${width}.webp`;
}

export function productSrcSet(productId, colourId, view = 'hero') {
  const product = getProduct(productId);
  const colour = product && getColour(product, colourId);
  if (colour?.images?.[view]) return undefined;
  return `${productImage(productId, colourId, view, 600)} 600w, ${productImage(productId, colourId, view, 1200)} 1200w`;
}
