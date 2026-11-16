import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { brand } from '../config/brand.js';
import { CATEGORIES } from '../data/products.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>{brand.description}</p>
        </div>

        <nav className="footer-col" aria-label="Shop">
          <h2>Shop</h2>
          <ul>
            <li>
              <Link to="/shop">All products</Link>
            </li>
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link to={`/shop?category=${c.id}`}>{c.name}</Link>
              </li>
            ))}
            <li>
              <Link to="/compare">Compare models</Link>
            </li>
          </ul>
        </nav>

        <nav className="footer-col" aria-label="AURAL">
          <h2>AURAL</h2>
          <ul>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/#technology">Technology</Link>
            </li>
            <li>
              <Link to="/faq">FAQ</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </nav>

        <nav className="footer-col" aria-label="Help">
          <h2>Help</h2>
          <ul>
            <li>
              <Link to="/shipping">Shipping</Link>
            </li>
            <li>
              <Link to="/returns">Returns</Link>
            </li>
            <li>
              <Link to="/privacy">Privacy</Link>
            </li>
            <li>
              <Link to="/terms">Terms</Link>
            </li>
          </ul>
        </nav>

        <div className="footer-col">
          <h2>Follow</h2>
          <ul>
            {brand.socials.map((s) => (
              <li key={s}>
                {/* Placeholders: no real profiles exist yet. */}
                <span className="placeholder-text">{s}</span>
                <span className="placeholder-tag">not live</span>
              </li>
            ))}
            <li>
              <span className="placeholder-text">{brand.contact.email}</span>
              <span className="placeholder-tag">placeholder</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="container footer-base">
        <p className="demo-notice">{brand.demoNotice}</p>
        <p>
          © {new Date().getFullYear()} {brand.name} concept. {brand.name} is a temporary demo name, not a registered
          brand. Product images are original renders of fictional designs.
        </p>
      </div>
    </footer>
  );
}
