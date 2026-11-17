import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import Icon from './Icon.jsx';
import SearchDialog from './SearchDialog.jsx';
import { useBag } from '../state/bag.jsx';

const LINKS = [
  { to: '/shop', label: 'Shop' },
  { to: '/#technology', label: 'Technology', hash: true },
  { to: '/compare', label: 'Compare' },
  { to: '/about', label: 'About' },
];
const MORE = [
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
  { to: '/shipping', label: 'Shipping' },
  { to: '/returns', label: 'Returns' },
];

export default function Nav() {
  const { count, setOpen } = useBag();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const location = useLocation();
  const menuButton = useRef(null);
  const panel = useRef(null);

  // Solid after a little scroll; slides away while scrolling down.
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setSolid(y > 12);
        setHidden(y > 400 && y > last + 4);
        if (y < last - 4) setHidden(false);
        last = y;
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  const close = () => setMenuOpen(false);
  const navClass = ({ isActive }) => (isActive ? 'active' : undefined);
  const show = !hidden || menuOpen;

  return (
    <header className={`nav${solid || menuOpen ? ' is-solid' : ''}${show ? '' : ' is-hidden'}${menuOpen ? ' is-menu-open' : ''}`}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="nav-inner">
        <Logo onClick={close} />
        <nav aria-label="Main">
          <ul className="nav-links">
            {LINKS.map((l) => (
              <li key={l.label}>
                {l.hash ? (
                  <Link to={l.to}>{l.label}</Link>
                ) : (
                  <NavLink to={l.to} className={navClass}>
                    {l.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav-actions">
          <button type="button" className="icon-button" onClick={() => setSearchOpen(true)} aria-label="Search products" aria-haspopup="dialog">
            <Icon name="search" />
          </button>
          <button type="button" className="icon-button bag-button" onClick={() => setOpen(true)} aria-haspopup="dialog">
            <Icon name="bag" />
            <span className={`bag-count${count === 0 ? ' is-empty' : ''}`} aria-hidden="true">
              {count}
            </span>
            <span className="sr-only">Bag, {count === 1 ? '1 item' : `${count} items`}</span>
          </button>
          <button
            ref={menuButton}
            type="button"
            className="icon-button menu-button"
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
        <nav aria-label="Mobile">
          <ul>
            {LINKS.map((l) => (
              <li key={l.label}>
                {l.hash ? (
                  <Link to={l.to} onClick={close}>
                    {l.label}
                    <Icon name="arrow" size={18} />
                  </Link>
                ) : (
                  <NavLink to={l.to} className={navClass} onClick={close}>
                    {l.label}
                    <Icon name="arrow" size={18} />
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
          <ul className="mobile-menu-foot">
            {MORE.map((l) => (
              <li key={l.label}>
                <Link to={l.to} onClick={close}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
