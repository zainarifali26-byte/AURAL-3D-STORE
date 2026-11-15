import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import Icon from './Icon.jsx';
import { useBag } from '../state/bag.jsx';

const LINKS = [
  { to: '/#discover', label: 'Discover' },
  { to: '/#collection', label: 'Products' },
  { to: '/#technology', label: 'Technology' },
  { to: '/compare', label: 'Compare', route: true },
];

export default function Nav() {
  const { count, setOpen } = useBag();
  const [menuOpen, setMenuOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const location = useLocation();
  const menuButton = useRef(null);
  const panel = useRef(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the menu whenever the route or hash changes.
  useEffect(() => setMenuOpen(false), [location.pathname, location.hash]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    panel.current?.querySelector('a')?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    const onPointer = (e) => {
      if (!panel.current?.contains(e.target) && !menuButton.current?.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <header className={`nav${solid || menuOpen ? ' is-solid' : ''}`}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="nav-inner">
        <Logo onClick={close} />
        <nav aria-label="Main">
          <ul className="nav-links">
            {LINKS.map((l) => (
              <li key={l.label}>
                {l.route ? (
                  <NavLink to={l.to}>{l.label}</NavLink>
                ) : (
                  <Link to={l.to}>{l.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav-actions">
          <button type="button" className="bag-button" onClick={() => setOpen(true)}>
            <Icon name="bag" />
            <span className="bag-button-label">Bag</span>
            <span className={`bag-count${count === 0 ? ' is-empty' : ''}`} aria-hidden="true">
              {count}
            </span>
            <span className="sr-only">, {count === 1 ? '1 item' : `${count} items`}</span>
          </button>
          <button
            ref={menuButton}
            type="button"
            className="menu-button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
            <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </div>
      <div id="mobile-menu" ref={panel} className="mobile-menu" hidden={!menuOpen}>
        <ul>
          {LINKS.map((l) => (
            <li key={l.label}>
              <Link to={l.to} onClick={close}>
                {l.label}
                <Icon name="arrow" size={18} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
