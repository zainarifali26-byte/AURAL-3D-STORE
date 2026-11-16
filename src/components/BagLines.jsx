import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import QuantityStepper from './QuantityStepper.jsx';
import { useBag } from '../state/bag.jsx';
import { formatPrice } from '../config/brand.js';
import { productImage } from '../data/products.js';

export default function BagLines({ onNavigate, compact = false }) {
  const { lines, setQty, changeColour, remove, maxQty } = useBag();
  return (
    <ul className={`bag-lines${compact ? ' bag-lines-compact' : ''}`}>
      {lines.map((l) => {
        const key = `${l.productId}-${l.colourId}`;
        return (
          <li key={key} className="bag-line">
            <div className="bag-line-img" data-tone={l.colour.tone}>
              <img src={productImage(l.productId, l.colourId, 'hero', 600)} alt="" width="600" height="500" loading="lazy" />
            </div>
            <div className="bag-line-info">
              <div className="bag-line-top">
                <Link className="bag-line-name" to={`/products/${l.productId}?colour=${l.colourId}`} onClick={onNavigate}>
                  {l.product.name}
                </Link>
                <p className="bag-line-price">{formatPrice(l.lineTotal)}</p>
              </div>
              {l.product.colours.length > 1 ? (
                <label className="bag-line-colour">
                  <span className="dot" style={{ '--swatch': l.colour.hex }} aria-hidden="true" />
                  <span className="sr-only">Colour for {l.product.name}</span>
                  <select value={l.colourId} onChange={(e) => changeColour(l.productId, l.colourId, e.target.value)}>
                    {l.product.colours.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <p className="bag-line-colour">
                  <span className="dot" style={{ '--swatch': l.colour.hex }} aria-hidden="true" />
                  {l.colour.name}
                </p>
              )}
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
          </li>
        );
      })}
    </ul>
  );
}
