// Fictional demo catalogue: the single source for the shop, home page,
// product pages, comparison and bag. Prices, availability and
// specifications are illustrative, not manufacturer specifications.
//
// Each colour lists image keys resolved by src/data/assets.js. Keys found in
// PHOTO_ASSETS are photographs; any other key ('hero', 'buds', 'case') is a
// concept render of that colour, produced by scripts/render-products.mjs from
// `model` and the colour's `finish`.

export const CATEGORIES = [
  { id: 'earbuds', name: 'True Wireless', blurb: 'Pocket-sized, all-day earbuds.' },
  { id: 'sport', name: 'Sport', blurb: 'A secure fit for training.' },
  { id: 'headphones', name: 'Over-ear', blurb: 'Full-size comfort and sound.' },
];

export const AVAILABILITY = {
  'in-stock': 'In stock (demo)',
  'low-stock': 'Low stock (demo)',
  preorder: 'Pre-order (demo)',
};

export const COLOUR_FAMILIES = {
  black: 'Black',
  white: 'White',
  grey: 'Grey',
  silver: 'Silver',
  gold: 'Champagne',
  green: 'Green',
};

export const VIEW_NAMES = {
  hero: 'Overview',
  buds: 'Earbuds',
  case: 'Case',
};

export const products = [
  {
    id: 'pro-x',
    name: 'AURAL Pro X',
    kind: 'earbuds',
    imagery: 'photo',
    category: 'earbuds',
    badges: ['featured', 'bestseller'],
    released: 7,
    price: 249,
    availability: 'in-stock',
    useCase: 'Commute, office, travel',
    tagline: 'Black, quiet, and finished with a rose-gold grille.',
    short: 'Flagship stem earbuds with adaptive noise cancellation.',
    description:
      'Pro X is the flagship of the AURAL concept range. A soft-matte black shell, a short angled stem that keeps the weight close to the ear, and a rose-gold microphone grille as the one quiet flourish. Adaptive noise cancellation for loud streets and open offices.',
    features: ['Adaptive noise cancellation', 'Transparency mode', 'Dual call microphones per earbud', 'Wireless charging case', 'Multipoint pairing'],
    specs: {
      design: 'Stem, soft-matte shell, rose-gold grille',
      battery: 'Long (around 8 h, illustrative)',
      anc: 'Adaptive ANC',
      connectivity: 'Bluetooth 5.4, multipoint',
      weight: 'Around 5 g per earbud',
      chargingCase: 'USB-C and wireless',
      durability: 'Splash resistant (concept)',
      latency: 'Low-latency mode',
    },
    colours: [{ id: 'onyx', name: 'Onyx', hex: '#17181a', family: 'black', images: ['pro-x-hero', 'pro-x-pair'] }],
  },
  {
    id: 'one',
    name: 'AURAL One',
    kind: 'headphones',
    imagery: 'photo',
    category: 'headphones',
    badges: ['bestseller'],
    released: 6,
    price: 199,
    availability: 'in-stock',
    useCase: 'Everyday listening, study, travel',
    tagline: 'Light, soft and easy to live with.',
    short: 'Lightweight on-ear headphones that fold flat into a travel case.',
    description:
      'One is the everyday full-size AURAL concept. A light, smooth pearl frame, cushions soft enough for an afternoon of study, and hinges that fold the cups flat into the included travel case. Simple controls on the cup, no app required.',
    features: ['Lightweight folding frame', 'Soft protein-leather cushions', 'Travel case included', 'Physical playback buttons', 'Long battery life'],
    specs: {
      design: 'On-ear, folding, matte pearl finish',
      battery: 'Extended (around 40 h, illustrative)',
      anc: 'Passive isolation only',
      connectivity: 'Bluetooth 5.3',
      weight: 'Around 180 g',
      chargingCase: 'USB-C, travel case included',
      durability: 'Everyday use (concept)',
      latency: 'Standard',
    },
    colours: [
      {
        id: 'pearl',
        name: 'Pearl',
        hex: '#ece9e3',
        family: 'white',
        images: ['one-front', 'one-angle', 'one-upright', 'one-top', 'one-cup', 'one-cushion', 'one-case'],
      },
    ],
  },
  {
    id: 'studio',
    name: 'AURAL Studio',
    kind: 'headphones',
    imagery: 'photo',
    category: 'headphones',
    badges: ['featured', 'new'],
    released: 9,
    price: 329,
    availability: 'in-stock',
    useCase: 'Focus, home listening, long flights',
    tagline: 'Matte black, deep cushions, nothing extra.',
    short: 'Over-ear headphones with adaptive noise cancellation and plush cushions.',
    description:
      'Studio is the most immersive AURAL concept. Deep, rounded cushions that surround the ear, a slim matte-black band and adaptive noise cancellation for long, focused sessions. The cups are deliberately plain: no logos, no lights, just sound.',
    features: ['Adaptive noise cancellation', 'Plush over-ear cushions', 'Wired and wireless listening', 'Custom EQ profiles', 'Low-latency mode'],
    specs: {
      design: 'Over-ear, matte black, rounded cups',
      battery: 'Extended (around 35 h, illustrative)',
      anc: 'Adaptive ANC',
      connectivity: 'Bluetooth 5.4, 3.5 mm wired',
      weight: 'Around 250 g',
      chargingCase: 'USB-C, soft pouch',
      durability: 'Everyday use (concept)',
      latency: 'Low-latency mode',
    },
    colours: [{ id: 'graphite', name: 'Graphite', hex: '#1d1e20', family: 'black', images: ['studio-front', 'studio-detail', 'studio-hand'] }],
  },
  {
    id: 'air',
    name: 'AURAL Air',
    kind: 'earbuds',
    imagery: 'render',
    category: 'earbuds',
    badges: [],
    released: 3,
    price: 119,
    availability: 'in-stock',
    useCase: 'Everyday listening, calls',
    tagline: 'Light enough to forget. Good enough to notice.',
    short: 'Minimal stemless earbuds in a pebble-shaped case.',
    description:
      'Air is the everyday concept: a small, rounded earbud that disappears in the ear and a pebble case that disappears in a pocket. Tuned for podcasts, calls and long days rather than maximum isolation.',
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
      { id: 'pearl', name: 'Pearl', hex: '#f1efea', family: 'white', images: ['hero', 'buds', 'case'], finish: { body: '#eeebe5', accent: '#c2a46d', tip: '#e2ded6' } },
      { id: 'stone', name: 'Stone', hex: '#bdb6aa', family: 'grey', images: ['hero', 'buds', 'case'], finish: { body: '#b9b2a6', accent: '#ece8e1', tip: '#a39b8e' } },
    ],
    model: { budStyle: 'bean', caseN: 2.5, case: [1.08, 0.72, 0.42, 0.82], bud: 0.86, ring: 0.6, roughness: 0.5, metalness: 0.03 },
  },
  {
    id: 'pulse',
    name: 'AURAL Pulse',
    kind: 'earbuds',
    imagery: 'render',
    category: 'earbuds',
    badges: ['new'],
    released: 8,
    price: 159,
    availability: 'in-stock',
    useCase: 'Everyday listening, light workouts',
    tagline: 'A polished blade on a soft champagne shell.',
    short: 'Metallic blade-stem earbuds in a square-cornered case.',
    description:
      'Pulse pairs a soft-touch shell with a polished metal blade stem that catches the light. Hybrid noise cancellation keeps the bus quiet, and the square-cornered case stands upright on a desk.',
    features: ['Hybrid noise cancellation', 'Polished blade stem', 'Touch and swipe controls', 'Fast charging'],
    specs: {
      design: 'Blade stem, soft-touch shell, metal accent',
      battery: 'Standard (around 7 h, illustrative)',
      anc: 'Hybrid ANC',
      connectivity: 'Bluetooth 5.3',
      weight: 'Around 4.5 g per earbud',
      chargingCase: 'USB-C, fast charging',
      durability: 'Sweat resistant (concept)',
      latency: 'Low-latency mode',
    },
    colours: [
      { id: 'champagne', name: 'Champagne', hex: '#d8c7a6', family: 'gold', images: ['hero', 'buds', 'case'], finish: { body: '#cfb88d', case: '#d8c49f', accent: '#efe6d3', tip: '#c2ab80' } },
      { id: 'silver', name: 'Silver', hex: '#c6c9cc', family: 'silver', images: ['hero', 'buds', 'case'], finish: { body: '#c9ccd0', case: '#d3d6d9', accent: '#eef0f2', tip: '#b1b5b9' } },
    ],
    model: { budStyle: 'stem', stem: 0.58, stemShape: 'blade', caseN: 4.4, case: [1.1, 0.92, 0.48, 0.72], bud: 0.84, ring: 0.5, roughness: 0.42, metalness: 0.08 },
  },
  {
    id: 'neo',
    name: 'AURAL Neo',
    kind: 'earbuds',
    imagery: 'render',
    category: 'earbuds',
    badges: ['new'],
    released: 5,
    price: 139,
    availability: 'preorder',
    useCase: 'Gaming, everyday listening',
    tagline: 'Your battery, at a glance.',
    short: 'Compact black earbuds with a small status display on the case.',
    description:
      'Neo puts a small status display on the front of its case, so you can see the charge without opening an app. A low-latency mode is aimed at games and video.',
    features: ['Case status display (concept)', 'Low-latency game mode', 'Call noise reduction', 'Touch controls'],
    specs: {
      design: 'Stemless, gloss black, display case',
      battery: 'Standard (around 6 h, illustrative)',
      anc: 'Call noise reduction only',
      connectivity: 'Bluetooth 5.3',
      weight: 'Around 4.3 g per earbud',
      chargingCase: 'USB-C, status display',
      durability: 'Splash resistant (concept)',
      latency: 'Game mode',
    },
    colours: [
      { id: 'onyx', name: 'Onyx', hex: '#141517', family: 'black', images: ['hero', 'buds', 'case'], finish: { body: '#141518', accent: '#c2a46d', tip: '#0f1012' } },
    ],
    model: { budStyle: 'bean', display: true, caseN: 4.2, case: [1.12, 0.86, 0.46, 0.8], bud: 0.88, ring: 0.7, roughness: 0.18, metalness: 0.1 },
  },
  {
    id: 'sport',
    name: 'AURAL Sport',
    kind: 'earbuds',
    imagery: 'render',
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
      { id: 'forest', name: 'Forest', hex: '#2b4a3d', family: 'green', images: ['hero', 'buds', 'case'], finish: { body: '#2c4a3e', accent: '#c2a46d', tip: '#1f362d' } },
      { id: 'pearl', name: 'Pearl', hex: '#ece9e3', family: 'white', images: ['hero', 'buds', 'case'], finish: { body: '#e8e4dd', accent: '#2b4a3d', tip: '#cfcac1' } },
    ],
    model: { budStyle: 'fin', caseN: 2.4, case: [1.26, 0.8, 0.5, 0.9], bud: 1, ring: 0.8, roughness: 0.62, metalness: 0.02 },
  },
  {
    id: 'mini',
    name: 'AURAL Mini',
    kind: 'earbuds',
    imagery: 'render',
    category: 'earbuds',
    badges: ['new'],
    released: 4,
    price: 89,
    availability: 'in-stock',
    useCase: 'Everyday listening, small ears',
    tagline: 'The smallest AURAL, in sage and silver.',
    short: 'Compact everyday earbuds in a palm-sized round case.',
    description:
      'Mini is the smallest AURAL concept: a petite earbud for smaller ears and a round case that fits in a coin pocket. Simple, comfortable and easy to recommend.',
    features: ['Compact, light fit', 'Coin-pocket case', 'Clear-voice microphones', 'Fast pairing'],
    specs: {
      design: 'Stemless, petite matte shell',
      battery: 'Standard (around 5 h, illustrative)',
      anc: 'Not included',
      connectivity: 'Bluetooth 5.3',
      weight: 'Around 3.5 g per earbud',
      chargingCase: 'USB-C',
      durability: 'Sweat resistant (concept)',
      latency: 'Standard',
    },
    colours: [
      { id: 'sage', name: 'Sage', hex: '#b3c0ab', family: 'green', images: ['hero', 'buds', 'case'], finish: { body: '#b4c1ac', accent: '#ecefe9', tip: '#9aa892' } },
      { id: 'silver', name: 'Silver', hex: '#c6c9cc', family: 'silver', images: ['hero', 'buds', 'case'], finish: { body: '#cdd0d3', accent: '#9aa0a6', tip: '#b3b7bb' } },
    ],
    model: { budStyle: 'bean', caseN: 2.1, case: [0.92, 0.66, 0.4, 0.92], bud: 0.74, ring: 0.5, roughness: 0.48, metalness: 0.05 },
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
