import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import Swatches from './Swatches.jsx';
import ProductImage from './ProductImage.jsx';
import Icon from './Icon.jsx';
import { useBagActions } from '../state/bag.jsx';
import { formatPrice } from '../config/brand.js';
import { AVAILABILITY, getCategory } from '../data/products.js';

const BADGE_TEXT = { new: 'New', bestseller: 'Best seller', featured: 'Featured' };

export function Badges({ product }) {
  if (!product.badges.length) return null;
  return (
    <ul className="badges" aria-label="Labels">
      {product.badges.map((b) => (
        <li key={b} className={`badge${b === 'new' ? ' badge-new' : b === 'featured' ? ' badge-gold' : ''}`}>
          {BADGE_TEXT[b]}
        </li>
      ))}
    </ul>
  );
}

/**
 * Product card. Variants:
 *  - "standard": image on top (shop grid, rows)
 *  - "wide": image beside the details (editorial rows on wide screens)
 */
function ProductCard({ product, variant = 'standard', sizes, onQuickView, headingLevel = 3 }) {
  const [colourId, setColourId] = useState(product.colours[0].id);
  const { add } = useBagActions();
  const colour = product.colours.find((c) => c.id === colourId);
  const href = `/products/${product.id}?colour=${colourId}`;
  const Heading = `h${headingLevel}`;
  const preorder = product.availability === 'preorder';

  return (
    <article className={`product-card product-card-${variant}`} aria-labelledby={`card-${product.id}`}>
      <div className="product-card-media" data-tone={colour.tone}>
        <Badges product={product} />
        <ProductImage product={product} colour={colour} sizes={sizes} />
        {onQuickView && (
          <button type="button" className="quick-view-button" onClick={() => onQuickView(product, colourId)}>
            <Icon name="eye" size={18} />
            Quick view<span className="sr-only"> of {product.name}</span>
          </button>
        )}
      </div>
      <div className="product-card-body">
        <p className="product-card-cat">{getCategory(product.category).name}</p>
        <Heading id={`card-${product.id}`} className="product-card-name">
          <Link to={href}>{product.name}</Link>
        </Heading>
        <p className="product-card-desc">{product.short}</p>
        <Swatches product={product} value={colourId} onChange={setColourId} size="sm" hideLegend={variant === 'standard'} />
        <div className="product-card-foot">
          <div>
            <p className="price">
              {formatPrice(product.price)} <span className="price-note">demo</span>
            </p>
            <p className={`availability availability-${product.availability}`}>{AVAILABILITY[product.availability]}</p>
          </div>
          <div className="product-card-actions">
            <Link className="btn btn-ghost btn-sm" to={href}>
              Details<span className="sr-only"> of {product.name}</span>
            </Link>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => add(product.id, colourId, 1)}>
              {preorder ? 'Pre-order' : 'Add to bag'}
              <span className="sr-only">
                : {product.name}, {colour.name}
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
