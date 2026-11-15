import { Link } from 'react-router-dom';
import { brand } from '../config/brand.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function NotFound() {
  useDocumentTitle(`Page not found | ${brand.name}`);
  return (
    <div className="container not-found">
      <p className="eyebrow">404</p>
      <h1 className="page-title">This page is silent.</h1>
      <p className="section-lead">The page you were looking for does not exist in this demo.</p>
      <Link className="btn btn-primary" to="/">
        Back to {brand.name}
      </Link>
    </div>
  );
}
