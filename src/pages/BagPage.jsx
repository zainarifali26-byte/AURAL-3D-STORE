import { Link } from 'react-router-dom';
import BagLines from '../components/BagLines.jsx';
import { useBag } from '../state/bag.jsx';
import { brand, formatPrice } from '../config/brand.js';
import usePageMeta from '../hooks/usePageMeta.js';

export function OrderSummary({ children }) {
  const { lines, subtotal } = useBag();
  return (
    <aside className="bag-summary" aria-labelledby="summary-title">
      <h2 id="summary-title">Order summary</h2>
      <ul className="summary-lines">
        {lines.map((l) => (
          <li key={`${l.productId}-${l.colourId}`}>
            <span>
              {l.product.name} · {l.colour.name} × {l.qty}
            </span>
            <span>{formatPrice(l.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <div className="summary-row">
        <span>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className="summary-row">
        <span>Shipping</span>
        <span>To be set by the owner</span>
      </div>
      <div className="summary-row summary-total">
        <span>Demo total</span>
        <strong>{formatPrice(subtotal)}</strong>
      </div>
      {children}
      <p className="fineprint">{brand.demoNotice}</p>
    </aside>
  );
}

export default function BagPage() {
  usePageMeta('Your bag', 'Your AURAL demo bag, saved in this browser only.');
  const { lines, count } = useBag();

  return (
    <div className="bag-page">
      <div className="container">
        <header className="page-head">
          <p className="eyebrow">Bag</p>
          <h1 className="page-title">Your bag</h1>
          <p className="section-lead">
            {count === 0 ? 'Nothing here yet.' : `${count} ${count === 1 ? 'item' : 'items'}, saved in this browser only.`}
          </p>
        </header>

        {lines.length === 0 ? (
          <div className="empty-state">
            <p className="section-lead">Your bag is empty. Pick a pair to get started.</p>
            <Link className="btn btn-primary" to="/shop">
              Shop all products
            </Link>
          </div>
        ) : (
          <div className="bag-grid">
            <BagLines />
            <OrderSummary>
              <Link className="btn btn-primary btn-block" to="/checkout">
                Continue to demo checkout
              </Link>
              <Link className="btn btn-ghost btn-block" to="/shop">
                Keep shopping
              </Link>
            </OrderSummary>
          </div>
        )}
      </div>
    </div>
  );
}
