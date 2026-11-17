// Source photos and how each is processed into the site's image set.
// All sources are from Pexels under the Pexels License (free for commercial
// use, modification allowed, no attribution required; credited anyway in
// src/data/credits.js). Every photo was checked for visible logos.
//
// crop: [x, y, w, h] as fractions of the source image. For product shots the
//       crop is drawn around the WHOLE product so nothing is ever cut off.
// fit:  'cover' fills the frame with the crop (only where the crop already
//       has the frame's shape); 'contain' fits the whole crop inside the frame
//       with `pad` margin and feathered edges onto the studio backdrop.
// mode:
//   plate      multiply the photo onto the AURAL studio backdrop (white-seamless photos)
//   key-yellow key out a yellow backdrop, then place on the studio backdrop
//   key-white  key out a white backdrop, then place on the studio backdrop
//   photo      crop and resize only (lifestyle images keep their own background)
// size: 'portrait' (4:5, 1600x2000 + 800x1000) or 'wide' (16:10, 1800x1125 + 900x563)
// cutout: also export a transparent version (keyed modes only)

export const PHOTOS = [
  // AURAL Pro X: black stem earbuds with a rose-gold microphone grille
  { id: 'pro-x-hero', pexels: 33797659, crop: [0.29, 0.08, 0.5, 0.833], mode: 'key-yellow', size: 'portrait', cutout: true },
  { id: 'pro-x-pair', pexels: 29128040, crop: [0.22, 0, 0.534, 1], mode: 'key-white', size: 'portrait', cutout: true },
  { id: 'pro-x-wide', pexels: 33797659, crop: [0.06, 0.08, 1 - 0.12, 0.84], mode: 'key-yellow', size: 'wide' },

  // AURAL One: white on-ear headphones (whole product in every frame)
  { id: 'one-front', pexels: 3394665, crop: [0.17, 0.08, 0.73, 0.9], fit: 'contain', pad: 0.05, mode: 'plate', size: 'portrait' },
  { id: 'one-angle', pexels: 3394652, crop: [0.2, 0.04, 0.68, 0.94], fit: 'contain', pad: 0.05, mode: 'plate', size: 'portrait' },
  { id: 'one-upright', pexels: 3394666, crop: [0.28, 0.04, 0.48, 0.94], fit: 'contain', pad: 0.05, mode: 'plate', size: 'portrait' },
  { id: 'one-top', pexels: 3394650, crop: [0.02, 0, 0.96, 1], fit: 'contain', pad: 0.05, mode: 'plate', size: 'portrait' },
  { id: 'one-case', pexels: 3394656, crop: [0.05, 0.06, 0.9, 0.9], fit: 'contain', pad: 0.05, mode: 'plate', size: 'portrait' },
  { id: 'one-wide', pexels: 3394665, crop: [0.08, 0.04, 0.88, 0.94], fit: 'contain', pad: 0.05, mode: 'plate', size: 'wide' },

  // AURAL Studio: black over-ear headphones
  { id: 'studio-front', pexels: 7772548, crop: [0, 0.44, 1, 0.56], fit: 'contain', pad: 0.05, mode: 'plate', size: 'portrait' },
  { id: 'studio-side', pexels: 7772547, crop: [0.06, 0.06, 0.9, 0.92], fit: 'contain', pad: 0.05, mode: 'plate', size: 'portrait' },
  { id: 'studio-wide', pexels: 7772547, crop: [0.02, 0.04, 0.96, 0.92], fit: 'contain', pad: 0.05, mode: 'plate', size: 'wide' },

  // Lifestyle (the white headphones being worn): people, cropped as portraits
  { id: 'life-portrait', pexels: 3394664, crop: [0, 0.04, 1, 0.834], mode: 'photo', size: 'portrait' },
  { id: 'life-comfort', pexels: 3756912, crop: [0.08, 0, 0.8, 1], mode: 'photo', size: 'portrait' },
];

export const PEXELS_URL = (id, w = 2400) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
