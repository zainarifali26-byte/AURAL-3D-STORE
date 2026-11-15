import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import Swatches from './Swatches.jsx';
import { useBagActions } from '../state/bag.jsx';
import { formatPrice } from '../config/brand.js';
import { productImage, VIEW_LABELS } from '../data/products.js';

function ProductCard({ product, index }) {
  const [colourId, setColourId] = useState(product.colours[0].id);
  const { add } = useBagActions();
  const colour = product.colours.find((c) => c.id === colourId);
  const href = `/products/${product.id}?colour=${colourId}`;

  return (
    <article className="product-card" style={{ '--card-tint': colour.hex }} aria-labelledby={`card-${product.id}`}>
      <div className="product-card-media">
        <span className="product-index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <img
          src={productImage(product.id, colourId, 'set')}
          alt={`${product.name} in ${colour.name}: ${VIEW_LABELS.set}`}
          width="1000"
          height="800"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="product-card-body">
        <p className="eyebrow">{product.role}</p>
        <h3 id={`card-${product.id}`} className="product-card-name">
          <Link to={href}>{product.name}</Link>
        </h3>
        <p className="product-card-desc">{product.tagline}</p>
        <ul className="feature-list">
          {product.features.slice(0, 3).map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <Swatches product={product} value={colourId} onChange={setColourId} size="sm" />
        <div className="product-card-foot">
          <p className="price">
            {formatPrice(product.price)} <span className="price-note">demo price</span>
          </p>
          <div className="product-card-actions">
            <Link className="btn btn-ghost btn-sm" to={href}>
              View details<span className="sr-only"> of {product.name}</span>
            </Link>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => add(product.id, colourId, 1)}>
              Add to bag<span className="sr-only">: {product.name}, {colour.name}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
