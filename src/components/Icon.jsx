// Small inline stroke icons (24x24, currentColor).
const PATHS = {
  bag: 'M5.5 8h13l-1 11.3a1.5 1.5 0 0 1-1.5 1.2H8a1.5 1.5 0 0 1-1.5-1.2L5.5 8Zm3.5 0V6.5a3 3 0 0 1 6 0V8',
  close: 'M6 6l12 12M18 6 6 18',
  menu: 'M4 9h16M4 15h16',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  trash: 'M5 7h14M10 7V5h4v2m-6 0 .8 12h6.4L16 7',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 2-4-4',
  filter: 'M4 6h16M7 12h10M10 18h4',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Zm9.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  zoom: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 2-4-4M11 8v6M8 11h6',
  chevronLeft: 'm15 6-6 6 6 6',
  chevronRight: 'm9 6 6 6-6 6',
};

export default function Icon({ name, size = 20, strokeWidth = 1.6 }) {
  return (
    <svg
      className={`icon icon-${name}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
