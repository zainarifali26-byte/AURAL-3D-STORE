// Fictional demo catalogue. Every price and specification below is
// illustrative. The comparison table, product pages and the 3D renders all
// read from this one file, so the data stays consistent.
//
// `model` holds the parameters for the procedural 3D model (src/three/model.js).
// `finish` on each colour holds the material colours for that model.

export const VIEWS = ['set', 'buds', 'case'];

export const VIEW_LABELS = {
  set: 'earbuds above the open charging case',
  buds: 'close-up of the earbuds',
  case: 'closed charging case',
};

export const products = [
  {
    id: 'pro',
    name: 'AURAL Pro',
    role: 'Flagship',
    tagline: 'Everything we know about sound, in one pair.',
    description:
      'The flagship concept. A satin shell, a machined accent ring and adaptive noise cancellation for the commute, the office and everything in between.',
    price: 249,
    colours: [
      { id: 'graphite', name: 'Graphite', hex: '#2a2f38', finish: { body: '#1d2129', accent: '#b8d8ff', tip: '#0d0f13' } },
      { id: 'glacier', name: 'Glacier', hex: '#dfe6ee', finish: { body: '#d9e0e8', accent: '#8fa6c2', tip: '#c3ccd6' } },
      { id: 'midnight', name: 'Midnight', hex: '#22385c', finish: { body: '#1a2c4a', accent: '#d6e6ff', tip: '#101a2c' } },
    ],
    features: ['Adaptive noise cancellation', 'Transparency mode', 'Wireless charging case', 'Multipoint pairing'],
    specs: {
      design: 'Sealed in-ear, satin shell',
      battery: '8 h per charge',
      caseBattery: '32 h with case',
      connectivity: 'Bluetooth 5.4, multipoint',
      weight: '5.2 g per earbud',
      chargingCase: 'USB-C and wireless',
      anc: 'Adaptive ANC',
      durability: 'Splash resistant (concept)',
    },
    model: { caseN: 3.2, case: [1.3, 0.78, 0.46, 0.86], bud: 1, ring: 1, hook: false, roughness: 0.36, metalness: 0.2 },
  },
  {
    id: 'air',
    name: 'AURAL Air',
    role: 'Everyday',
    tagline: 'Light enough to forget. Good enough to notice.',
    description:
      'The everyday concept. A smaller, lighter earbud in a pocket-sized case, tuned for calls, podcasts and long days.',
    price: 129,
    colours: [
      { id: 'chalk', name: 'Chalk', hex: '#e9e6df', finish: { body: '#e6e2da', accent: '#b9b2a4', tip: '#d4cfc5' } },
      { id: 'sage', name: 'Sage', hex: '#8fa394', finish: { body: '#7f9486', accent: '#dfe9e1', tip: '#667a6d' } },
      { id: 'slate', name: 'Slate', hex: '#4a5361', finish: { body: '#3d4552', accent: '#b8d8ff', tip: '#2a303a' } },
    ],
    features: ['Featherweight fit', 'Clear-voice microphones', 'Pocket-sized case', 'Fast pairing'],
    specs: {
      design: 'Semi-open, compact shell',
      battery: '6 h per charge',
      caseBattery: '24 h with case',
      connectivity: 'Bluetooth 5.3',
      weight: '3.9 g per earbud',
      chargingCase: 'USB-C',
      anc: 'Not included',
      durability: 'Sweat resistant (concept)',
    },
    model: { caseN: 2.6, case: [1.12, 0.7, 0.42, 0.8], bud: 0.86, ring: 0.6, hook: false, roughness: 0.55, metalness: 0.05 },
  },
  {
    id: 'studio',
    name: 'AURAL Studio',
    role: 'Audio-first',
    tagline: 'For people who listen to the recording, not just the song.',
    description:
      'The listening concept. A larger acoustic chamber, a wide metal accent ring and a tuning aimed at detail over volume.',
    price: 299,
    colours: [
      { id: 'obsidian', name: 'Obsidian', hex: '#17191d', finish: { body: '#121418', accent: '#c9a86a', tip: '#0a0b0d' } },
      { id: 'titanium', name: 'Titanium', hex: '#9aa1ab', finish: { body: '#8a919b', accent: '#e8edf3', tip: '#5d636c' } },
      { id: 'ivory', name: 'Ivory', hex: '#ece7dc', finish: { body: '#e8e2d5', accent: '#c9a86a', tip: '#d0c9ba' } },
    ],
    features: ['Dual-driver concept', 'High-resolution wireless audio', 'Adaptive noise cancellation', 'Custom EQ profiles'],
    specs: {
      design: 'Sealed in-ear, metal accent ring',
      battery: '7 h per charge',
      caseBattery: '28 h with case',
      connectivity: 'Bluetooth 5.4, hi-res codec',
      weight: '5.8 g per earbud',
      chargingCase: 'USB-C and wireless',
      anc: 'Adaptive ANC',
      durability: 'Splash resistant (concept)',
    },
    model: { caseN: 4.2, case: [1.34, 0.76, 0.44, 0.84], bud: 1.06, ring: 1.45, hook: false, roughness: 0.3, metalness: 0.45 },
  },
  {
    id: 'sport',
    name: 'AURAL Sport',
    role: 'Fitness',
    tagline: 'Stays put when you do not.',
    description:
      'The training concept. A soft ear fin for a secure fit, a grippy matte shell and an ambient mode that keeps the street audible.',
    price: 179,
    colours: [
      { id: 'carbon', name: 'Carbon', hex: '#202326', finish: { body: '#191c1f', accent: '#ff7a45', tip: '#0d0f10' } },
      { id: 'volt', name: 'Volt', hex: '#c9dc5a', finish: { body: '#bfd24e', accent: '#1c1f22', tip: '#1c1f22' } },
      { id: 'arctic', name: 'Arctic', hex: '#dfe7ec', finish: { body: '#d8e1e7', accent: '#4f8fd6', tip: '#b9c5cd' } },
    ],
    features: ['Secure ear-fin fit', 'Ambient awareness mode', 'Sweat and rain resistant concept', 'Physical button controls'],
    specs: {
      design: 'Sealed in-ear with ear fin',
      battery: '9 h per charge',
      caseBattery: '27 h with case',
      connectivity: 'Bluetooth 5.3',
      weight: '6.1 g per earbud',
      chargingCase: 'USB-C',
      anc: 'Ambient mode only',
      durability: 'Sweat and rain resistant (concept)',
    },
    model: { caseN: 2.4, case: [1.26, 0.8, 0.5, 0.9], bud: 1, ring: 0.8, hook: true, roughness: 0.7, metalness: 0.02 },
  },
];

// Rows of the comparison table, in display order.
export const compareRows = [
  { key: 'design', label: 'Design' },
  { key: 'battery', label: 'Battery life' },
  { key: 'caseBattery', label: 'With charging case' },
  { key: 'connectivity', label: 'Connectivity' },
  { key: 'weight', label: 'Weight' },
  { key: 'chargingCase', label: 'Charging case' },
  { key: 'anc', label: 'Noise cancellation' },
  { key: 'durability', label: 'Durability' },
];

export function getProduct(id) {
  return products.find((p) => p.id === id);
}

export function getColour(product, colourId) {
  return product.colours.find((c) => c.id === colourId) ?? product.colours[0];
}

export function productImage(productId, colourId, view = 'set') {
  return `/products/${productId}-${colourId}-${view}.webp`;
}
