// Small inline stroke icons (24x24, currentColor).
const PATHS = {
  bag: 'M5 8h14l-1.2 11.2a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3L5 8Zm4 0V6.5a3 3 0 0 1 6 0V8',
  close: 'M6 6l12 12M18 6 6 18',
  menu: 'M4 8h16M4 16h16',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  trash: 'M5 7h14M10 7V5h4v2m-6 0 .8 12h6.4L16 7',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 2-4-4',
  filter: 'M4 6h16M7 12h10M10 18h4',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Zm9.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  zoom: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 2-4-4M11 8v6M8 11h6',
  chevron: 'm9 6 6 6-6 6',
  // Feature glyphs
  anc: 'M3 12h2m14 0h2M7 8v8m10-8v8M12 5v14',
  ear: 'M8 15c0 2.5 1.5 4 3.5 4S15 17 15 15c0-2.5 3-3.5 3-7a6 6 0 0 0-12 0',
  wave: 'M3 12c2 0 2-5 4-5s2 10 4 10 2-12 4-12 2 7 4 7h2',
  bass: 'M5 18V9m4 9V5m4 13v-6m4 6V8m4 10v-4',
  bolt: 'M13 3 5 13h6l-1 8 8-10h-6l1-8Z',
  mic: 'M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm-6-3a6 6 0 0 0 12 0M12 18v3',
  battery: 'M4 8h14v8H4zM18 11h2v2h-2M7 11v2m3-2v2',
  plug: 'M9 3v5m6-5v5M7 8h10v3a5 5 0 0 1-10 0V8Zm5 8v5',
  bluetooth: 'm7 7 10 10-5 4V3l5 4L7 17',
  drop: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z',
  latency: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
};

export default function Icon({ name, size = 20, strokeWidth = 1.6 }) {
  return (
    <svg
      className="icon"
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
