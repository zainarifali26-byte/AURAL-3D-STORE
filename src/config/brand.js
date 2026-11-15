// Everything brand-specific lives here so the name, wordmark and copy can be
// changed in one place. AURAL is a temporary, fictional concept name.
export const brand = {
  name: 'AURAL',
  // The wordmark is plain text set in the display font (see components/Logo.jsx).
  wordmark: 'AURAL',
  tagline: 'Sound Beyond Limits.',
  supporting: 'Precision-engineered audio. Designed for every moment.',
  description:
    'AURAL is a fictional wireless earbuds concept. This site is a frontend demo: products, prices and specifications are illustrative.',
  currency: 'USD',
  locale: 'en-US',
  contact: {
    // Placeholder only. Not a real mailbox.
    email: 'hello@aural.example',
  },
  demoNotice:
    'Demo store. AURAL is a fictional concept: products, prices and specifications are illustrative and nothing can be purchased.',
};

export function formatPrice(amount) {
  return new Intl.NumberFormat(brand.locale, {
    style: 'currency',
    currency: brand.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
