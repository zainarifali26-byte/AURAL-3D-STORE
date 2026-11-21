import Film from './Film.jsx';

// The Pro X film: an original scroll-scrubbed product film rendered from the
// procedural AURAL model (scripts/render-film.mjs). Wide frames for laptops and
// desktops, tall frames for phones, so the product fills every screen.
export const PRO_X_CHAPTERS = [
  {
    id: 'float',
    index: '01',
    kicker: 'Weightless',
    title: ['Sound you can', 'barely feel.'],
    body: 'Two featherlight earbuds, shaped to settle into the ear and simply disappear.',
  },
  {
    id: 'case',
    index: '02',
    kicker: 'The case',
    title: ['A pebble of', 'quiet black.'],
    body: 'Soft-matte, pocket-sized and sealed by a seam you can barely see.',
  },
  {
    id: 'open',
    index: '03',
    kicker: 'Open',
    title: ['Lift the lid.', 'They wake up.'],
    body: 'The light glows the moment it opens. Pro X is ready before it reaches your ears.',
  },
  {
    id: 'rise',
    index: '04',
    kicker: 'Ready',
    title: ['Rise. Play.', 'Disappear.'],
    body: 'From case to ear in one easy motion. Everything else fades.',
  },
];

export const PRO_X_FILM = {
  id: 'pro-x-film',
  label: 'AURAL Pro X',
  chapters: PRO_X_CHAPTERS,
  perChapter: 45,
  frame: (chapter, n, size) => `/media/prox/${chapter}/${size}/${String(n).padStart(3, '0')}.webp`,
  // Tall frames on portrait screens (phones, tablets held upright), wide ones elsewhere.
  pickSize: () => (window.innerHeight > window.innerWidth ? 'sm' : 'lg'),
  still: { width: 1600, height: 900 },
  credit: 'Film: original AURAL concept render, not a real product.',
};

export default function ProXFilm() {
  return <Film config={PRO_X_FILM} />;
}
