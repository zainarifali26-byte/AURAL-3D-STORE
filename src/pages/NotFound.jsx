import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta.js';

export default function NotFound() {
  usePageMeta('Page not found', 'This page does not exist in the AURAL demo store.');
  return (
    <div className="not-found">
      <div className="container not-found-inner">
        <p className="not-found-code" aria-hidden="true">
          404
        </p>
        <p className="eyebrow">Page not found</p>
        <h1 className="page-title">This page is silent.</h1>
        <p className="section-lead">The page you were looking for does not exist in this demo store.</p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/">
            Back to home
          </Link>
          <Link className="btn btn-ghost" to="/shop">
            Shop all products
          </Link>
        </div>
      </div>
    </div>
  );
}
