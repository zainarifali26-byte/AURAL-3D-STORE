import { Link } from 'react-router-dom';
import { brand } from '../config/brand.js';

// Wordmark plus a small mark: two concentric arcs (a sound ring). Swap the
// SVG or brand.wordmark to rebrand.
export function LogoMark({ size = 22 }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="3.2" fill="currentColor" />
      <path d="M5.6 7.2a8 8 0 0 0 0 9.6M18.4 7.2a8 8 0 0 1 0 9.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M2.6 4.6a12 12 0 0 0 0 14.8M21.4 4.6a12 12 0 0 1 0 14.8" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".55" />
    </svg>
  );
}

export default function Logo({ onClick }) {
  return (
    <Link to="/" className="logo" onClick={onClick}>
      <LogoMark />
      <span className="logo-word">{brand.wordmark}</span>
    </Link>
  );
}
