// Central image registry. Every product image on the site is resolved here,
// so a product looks the same on the home page, shop, product page, compare
// page and bag. Two kinds of asset:
//   photo   processed stock photography (scripts/process-photos.mjs)
//   render  concept renders of designs that have no photography yet
//           (scripts/render-products.mjs); labelled as renders in the UI
// Both sit on the same "studio pearl" backdrop and share the 4:5 frame.

const PORTRAIT = { w: 1600, h: 2000, small: 800 };
const WIDE = { w: 1800, h: 1125, small: 900 };

function photo(id, pexels, alt, frame = PORTRAIT) {
  return { kind: 'photo', id, pexels, alt, base: `/images/photos/${id}`, ...frame };
}

export const PHOTO_ASSETS = {
  'pro-x-hero': photo('pro-x-hero', 33797659, 'Pair of black stem earbuds with a rose-gold microphone grille'),
  'pro-x-pair': photo('pro-x-pair', 29128040, 'Black stem earbuds seen from the side, ear tips facing'),
  'pro-x-wide': photo('pro-x-wide', 33797659, 'Black stem earbuds on a warm studio backdrop', WIDE),
  'one-front': photo('one-front', 3394665, 'White over-ear headphones at a three-quarter angle'),
  'one-angle': photo('one-angle', 3394652, 'White over-ear headphones, cushion side'),
  'one-upright': photo('one-upright', 3394666, 'White over-ear headphones standing upright'),
  'one-top': photo('one-top', 3394650, 'White over-ear headphones from above'),
  'one-case': photo('one-case', 3394656, 'White headphones folded in a black travel case'),
  'one-wide': photo('one-wide', 3394665, 'White over-ear headphones on a warm studio backdrop', WIDE),
  'studio-front': photo('studio-front', 7772548, 'Black over-ear headphones, front view'),
  'studio-side': photo('studio-side', 7772547, 'Black over-ear headphones from the side'),
  'studio-wide': photo('studio-wide', 7772547, 'Black over-ear headphones on a light backdrop', WIDE),
  'life-portrait': photo('life-portrait', 3394664, 'Person wearing white over-ear headphones'),
  'life-comfort': photo('life-comfort', 3756912, 'Woman wearing white over-ear headphones, smiling'),
};

const VIEW_ALT = {
  hero: 'charging case open with earbuds above it',
  buds: 'both earbuds, side profile',
  case: 'closed charging case',
};

export function renderAsset(product, colour, view) {
  return {
    kind: 'render',
    id: `${product.id}-${colour.id}-${view}`,
    alt: `${product.name} in ${colour.name}, ${VIEW_ALT[view]} (concept render)`,
    base: `/images/renders/${product.id}-${colour.id}-${view}`,
    ...PORTRAIT,
  };
}

/** Resolve an image key from the catalogue to an asset object. */
export function resolveAsset(product, colour, key) {
  if (PHOTO_ASSETS[key]) return PHOTO_ASSETS[key];
  return renderAsset(product, colour, key);
}

export function assetSrc(asset, size = 'large') {
  return `${asset.base}-${size === 'large' ? asset.w : asset.small}.webp`;
}

export function assetSrcSet(asset) {
  return `${assetSrc(asset, 'small')} ${asset.small}w, ${assetSrc(asset)} ${asset.w}w`;
}

export function cutoutSrc(asset, size = 'large') {
  return `${asset.base}-cutout-${size === 'large' ? asset.w : asset.small}.webp`;
}
