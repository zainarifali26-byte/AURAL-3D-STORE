// Photo credits. Every photo is from Pexels under the Pexels License
// (https://www.pexels.com/license/): free for commercial and non-commercial
// use, modification allowed, attribution not required (given here anyway).
// The products in these photos carry no visible logos. They are used as
// stand-in photography for the fictional AURAL concept; AURAL did not make them.

export const PEXELS_LICENSE = 'https://www.pexels.com/license/';

export const PHOTOGRAPHERS = {
  matveev: { name: 'Andrey Matveev', profile: 'https://www.pexels.com/@zeleboba/' },
  swamy: { name: 'Swamy K', profile: 'https://www.pexels.com/@swamy-k-3521269/' },
  soundon: { name: 'Sound On', profile: 'https://www.pexels.com/@sound-on/' },
  oquendo: { name: 'Caleb Oquendo', profile: 'https://www.pexels.com/@caleboquendo/' },
};

// pexels id → photographer key and what the photo shows
export const PHOTO_SOURCES = {
  33797659: { by: 'matveev', title: 'Black wireless earbuds on yellow background' },
  29128040: { by: 'swamy', title: 'Black earphones on white background' },
  3394665: { by: 'soundon', title: 'White wireless headphones' },
  3394652: { by: 'soundon', title: 'White over-ear headphones' },
  3394666: { by: 'soundon', title: 'White wireless headphones, front' },
  3394650: { by: 'soundon', title: 'White wireless headphones, overhead' },
  3394648: { by: 'soundon', title: 'White headphones, ear cup' },
  3394653: { by: 'soundon', title: 'White headphones, cushion' },
  3394656: { by: 'soundon', title: 'White headphones in a travel case' },
  3394664: { by: 'soundon', title: 'Person wearing white headphones' },
  3756912: { by: 'soundon', title: 'Woman wearing white headphones' },
  7772548: { by: 'oquendo', title: 'Black headphones on white surface' },
  7772549: { by: 'oquendo', title: 'Hand holding black headphones' },
  7772547: { by: 'oquendo', title: 'Black headphones, close-up' },
};

export const photoPage = (id) => `https://www.pexels.com/photo/${id}/`;
