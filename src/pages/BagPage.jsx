import { useState } from 'react';
import { Link } from 'react-router-dom';
import BagLines from '../components/BagLines.jsx';
import { useBag } from '../state/bag.jsx';
import { brand, formatPrice } from '../config/brand.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function BagPage() {
  useDocumentTitle(`Bag | ${brand.name} demo store`);
  const { lines, count, subtotal } = useBag();
  const [notice, setNotice] = useState(false);

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
          <Link className="btn btn-primary" to="/#collection">
            Browse the collection
          </Link>
        ) : (
          <div className="bag-grid">
            <BagLines />
            <aside className="bag-summary" aria-labelledby="summary-title">
              <h2 id="summary-title">Summary</h2>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Not applicable</span>
              </div>
              <div className="summary-row summary-total">
                <span>Demo total</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <button type="button" className="btn btn-primary btn-block" onClick={() => setNotice(true)}>
                Demo checkout
              </button>
              <div role="status" className="checkout-status">
                {notice && (
                  <p>
                    This is a demo store. No order was placed, no payment details were requested and nothing was
                    charged. Your bag has been kept.
                  </p>
                )}
              </div>
              <p className="fineprint">{brand.demoNotice}</p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
