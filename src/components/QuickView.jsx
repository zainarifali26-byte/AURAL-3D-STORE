import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import Swatches from './Swatches.jsx';
import ProductImage from './ProductImage.jsx';
import QuantityStepper from './QuantityStepper.jsx';
import { useBagActions } from '../state/bag.jsx';
import { formatPrice } from '../config/brand.js';
import { AVAILABILITY } from '../data/products.js';

// Quick view built on a native <dialog>: modal semantics, Esc to close and
// focus returns to the button that opened it.
export default function QuickView({ product, initialColour, onClose }) {
  const ref = useRef(null);
  const returnFocus = useRef(null);
  const [colourId, setColourId] = useState(initialColour);
  const [qty, setQty] = useState(1);
  const { add } = useBagActions();
  const colour = product.colours.find((c) => c.id === colourId) ?? product.colours[0];

  useEffect(() => {
    const dialog = ref.current;
    returnFocus.current = document.activeElement;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      returnFocus.current?.focus?.();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="quick-view"
      aria-labelledby="qv-title"
      // The close event is async; ignore a stale one if the dialog has reopened.
      onClose={() => !ref.current?.open && onClose()}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div className="quick-view-panel">
        <button type="button" className="icon-button quick-view-close" onClick={onClose} aria-label="Close quick view">
          <Icon name="close" />
        </button>
        <div className="quick-view-media" data-tone={colour.tone}>
          <ProductImage product={product} colour={colour} sizes="(max-width: 760px) 90vw, 420px" eager />
        </div>
        <div className="quick-view-body">
          <h2 id="qv-title" className="quick-view-title">
            {product.name}
          </h2>
          <p className="product-card-desc">{product.tagline}</p>
          <p className="price">
            {formatPrice(product.price)} <span className="price-note">demo price</span>
          </p>
          <p className={`availability availability-${product.availability}`}>{AVAILABILITY[product.availability]}</p>
          <Swatches product={product} value={colourId} onChange={setColourId} />
          <div className="pdp-buy">
            <QuantityStepper value={qty} onChange={(q) => setQty(Math.min(10, Math.max(1, q)))} />
            <button
              type="button"
              className="btn btn-primary btn-grow"
              onClick={() => {
                add(product.id, colourId, qty);
                onClose();
              }}
            >
              Add to bag
            </button>
          </div>
          <Link className="text-link" to={`/products/${product.id}?colour=${colourId}`} onClick={onClose}>
            View full details
          </Link>
        </div>
      </div>
    </dialog>
  );
}
