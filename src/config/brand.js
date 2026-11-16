// Everything brand-specific lives here so the name, wordmark, copy and
// placeholders can be changed in one place. AURAL is a temporary, fictional
// concept name, not a registered brand.
export const brand = {
  name: 'AURAL',
  wordmark: 'AURAL',
  tagline: 'Sound Beyond Limits.',
  supporting: 'Precision-engineered audio. Designed for every moment.',
  description:
    'AURAL is a fictional headphones and earbuds concept. This site is a frontend demo: products, prices and specifications are illustrative.',
  currency: 'USD',
  locale: 'en-US',
  // Set this when a domain exists (no trailing slash), e.g. 'https://example.com'.
  // Canonical and og:url tags are only written when it is set.
  siteUrl: '',
  // Placeholders only. Replace with real details before launch.
  contact: {
    email: 'hello@aural.example',
    phone: '+00 000 000 0000',
    address: 'Studio address to be confirmed',
    hours: 'Support hours to be confirmed',
  },
  socials: ['Instagram', 'YouTube', 'TikTok', 'X'],
  demoNotice:
    'Demo store. AURAL is a fictional concept: products, prices and specifications are illustrative and nothing can be purchased.',
  // Shipping and returns are placeholders until the owner supplies real terms.
  freeShippingNote: 'Shipping costs and delivery times will be set by the store owner.',
};

export function formatPrice(amount) {
  return new Intl.NumberFormat(brand.locale, {
    style: 'currency',
    currency: brand.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
