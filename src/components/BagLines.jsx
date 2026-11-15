import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import QuantityStepper from './QuantityStepper.jsx';
import { useBag } from '../state/bag.jsx';
import { formatPrice } from '../config/brand.js';
import { productImage } from '../data/products.js';

export default function BagLines({ onNavigate }) {
  const { lines, setQty, remove, maxQty } = useBag();
  return (
    <ul className="bag-lines">
      {lines.map((l) => (
        <li key={`${l.productId}-${l.colourId}`} className="bag-line">
          <img
            className="bag-line-img"
            src={productImage(l.productId, l.colourId, 'set')}
            alt=""
            width="96"
            height="77"
            loading="lazy"
          />
          <div className="bag-line-info">
            <Link className="bag-line-name" to={`/products/${l.productId}?colour=${l.colourId}`} onClick={onNavigate}>
              {l.product.name}
            </Link>
            <p className="bag-line-meta">
              <span className="dot" style={{ '--swatch': l.colour.hex }} aria-hidden="true" />
              {l.colour.name}
            </p>
            <div className="bag-line-controls">
              <QuantityStepper
                compact
                value={l.qty}
                max={maxQty}
                label={`${l.product.name} ${l.colour.name} quantity`}
                onChange={(q) => setQty(l.productId, l.colourId, q)}
              />
              <button type="button" className="link-button" onClick={() => remove(l.productId, l.colourId)}>
                <Icon name="trash" size={16} />
                Remove<span className="sr-only"> {l.product.name} in {l.colour.name}</span>
              </button>
            </div>
          </div>
          <p className="bag-line-price">{formatPrice(l.lineTotal)}</p>
        </li>
      ))}
    </ul>
  );
}
