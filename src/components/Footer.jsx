import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { brand } from '../config/brand.js';
import { products } from '../data/products.js';

const SOCIALS = ['Instagram', 'YouTube', 'TikTok'];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>{brand.description}</p>
        </div>

        <nav className="footer-col" aria-label="Products">
          <h2>Products</h2>
          <ul>
            {products.map((p) => (
              <li key={p.id}>
                <Link to={`/products/${p.id}`}>{p.name}</Link>
              </li>
            ))}
            <li>
              <Link to="/compare">Compare models</Link>
            </li>
          </ul>
        </nav>

        <nav className="footer-col" aria-label="Explore">
          <h2>Explore</h2>
          <ul>
            <li>
              <Link to="/#discover">Discover</Link>
            </li>
            <li>
              <Link to="/#technology">Technology</Link>
            </li>
            <li>
              <Link to="/#about">About</Link>
            </li>
            <li>
              <Link to="/bag">Bag</Link>
            </li>
          </ul>
        </nav>

        <div className="footer-col">
          <h2>Contact</h2>
          <ul>
            <li>
              {/* Placeholder address, deliberately not a mailto: link. */}
              <span className="placeholder-text">{brand.contact.email}</span>
              <span className="placeholder-tag">placeholder</span>
            </li>
            {SOCIALS.map((s) => (
              <li key={s}>
                <span className="placeholder-text">{s}</span>
                <span className="placeholder-tag">not live</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container footer-base">
        <p className="demo-notice">{brand.demoNotice}</p>
        <p>
          © {new Date().getFullYear()} {brand.name} concept. {brand.name} is a temporary demo name, not a registered
          brand.
        </p>
      </div>
    </footer>
  );
}
