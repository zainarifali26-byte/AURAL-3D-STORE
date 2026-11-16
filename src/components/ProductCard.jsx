import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import Swatches from './Swatches.jsx';
import ProductImage from './ProductImage.jsx';
import Icon from './Icon.jsx';
import { useBagActions } from '../state/bag.jsx';
import { formatPrice } from '../config/brand.js';
import { AVAILABILITY, getCategory } from '../data/products.js';

const BADGE_TEXT = { new: 'New', bestseller: 'Best seller', featured: 'Featured' };

export function Badges({ product, max = 2 }) {
  if (!product.badges.length) return null;
  return (
    <ul className="badges" aria-label="Labels">
      {product.badges.slice(0, max).map((b) => (
        <li key={b} className={`tag${b === 'new' ? ' tag-dark' : b === 'featured' ? ' tag-gold' : ''}`}>
          {BADGE_TEXT[b]}
        </li>
      ))}
    </ul>
  );
}

export function RenderNote({ product }) {
  if (product.imagery !== 'render') return null;
  return <span className="render-note">Concept render</span>;
}

/**
 * Product card: large 4:5 image, quiet details below. The second image (if
 * any) fades in on hover for a quick look at another angle.
 */
function ProductCard({ product, sizes = '(max-width: 640px) 92vw, (max-width: 1100px) 45vw, 30vw', onQuickView, headingLevel = 3 }) {
  const [colourId, setColourId] = useState(product.colours[0].id);
  const { add } = useBagActions();
  const colour = product.colours.find((c) => c.id === colourId);
  const href = `/products/${product.id}?colour=${colourId}`;
  const Heading = `h${headingLevel}`;
  const preorder = product.availability === 'preorder';
  const altKey = colour.images[1];

  return (
    <article className="card" aria-labelledby={`card-${product.id}`}>
      <div className="card-media">
        <Link to={href} className="card-media-link" tabIndex={-1} aria-hidden="true">
          <ProductImage product={product} colour={colour} sizes={sizes} className="card-img" />
          {altKey && (
            <ProductImage product={product} colour={colour} imageKey={altKey} sizes={sizes} className="card-img card-img-alt" alt="" />
          )}
        </Link>
        <Badges product={product} />
        <RenderNote product={product} />
        {onQuickView && (
          <button type="button" className="card-quick" onClick={() => onQuickView(product, colourId)}>
            <Icon name="eye" size={16} />
            Quick view<span className="sr-only"> of {product.name}</span>
          </button>
        )}
      </div>
      <div className="card-body">
        <div className="card-title-row">
          <Heading id={`card-${product.id}`} className="card-name">
            <Link to={href}>{product.name}</Link>
          </Heading>
          <p className="price">{formatPrice(product.price)}</p>
        </div>
        <p className="card-meta">
          {getCategory(product.category).name} · {product.short}
        </p>
        <div className="card-foot">
          <Swatches product={product} value={colourId} onChange={setColourId} size="sm" hideLegend />
          <button
            type="button"
            className="card-add"
            onClick={() => add(product.id, colourId, 1)}
            aria-label={`${preorder ? 'Pre-order' : 'Add to bag'}: ${product.name}, ${colour.name}`}
          >
            <Icon name="plus" size={18} />
            <span aria-hidden="true">{preorder ? 'Pre-order' : 'Add'}</span>
          </button>
        </div>
        <p className="card-availability">
          {AVAILABILITY[product.availability]} · <span className="price-note">demo price</span>
        </p>
      </div>
    </article>
  );
}

export default memo(ProductCard);
