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
};

export default function Icon({ name, size = 20 }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
