import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Swatches from '../components/Swatches.jsx';
import QuantityStepper from '../components/QuantityStepper.jsx';
import Icon from '../components/Icon.jsx';
import NotFound from './NotFound.jsx';
import { useBag } from '../state/bag.jsx';
import { brand, formatPrice } from '../config/brand.js';
import { getProduct, getColour, products, productImage, VIEWS, VIEW_LABELS, compareRows } from '../data/products.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const VIEW_NAMES = { set: 'Set', buds: 'Earbuds', case: 'Case' };

function ProductDetail({ product }) {
  const [params, setParams] = useSearchParams();
  const colour = getColour(product, params.get('colour'));
  const [view, setView] = useState('set');
  const [qty, setQty] = useState(1);
  const { add, maxQty } = useBag();
  useDocumentTitle(`${product.name} | ${brand.name} demo store`);

  const setColour = (id) => setParams({ colour: id }, { replace: true });
  const others = products.filter((p) => p.id !== product.id);

  return (
    <div className="pdp">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link to="/#collection">Collection</Link>
            </li>
            <li aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="pdp-grid">
          <div className="gallery" style={{ '--card-tint': colour.hex }}>
            <div className="gallery-main">
              <img
                key={`${colour.id}-${view}`}
                src={productImage(product.id, colour.id, view)}
                alt={`${product.name} in ${colour.name}: ${VIEW_LABELS[view]}`}
                width="1000"
                height="800"
              />
            </div>
            <div className="gallery-thumbs" role="group" aria-label="Product views">
              {VIEWS.map((v) => (
                <button
                  key={v}
                  type="button"
                  className="thumb"
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                >
                  <img src={productImage(product.id, colour.id, v)} alt="" width="160" height="128" loading="lazy" />
                  <span>{VIEW_NAMES[v]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pdp-info">
            <p className="eyebrow">{product.role}</p>
            <h1 className="pdp-title">{product.name}</h1>
            <p className="pdp-tagline">{product.tagline}</p>
            <p className="pdp-price">
              {formatPrice(product.price)} <span className="price-note">demo price</span>
            </p>
            <p className="pdp-desc">{product.description}</p>

            <Swatches product={product} value={colour.id} onChange={setColour} size="lg" />

            <div className="pdp-buy">
              <QuantityStepper value={qty} onChange={(q) => setQty(Math.min(maxQty, Math.max(1, q)))} max={maxQty} />
              <button type="button" className="btn btn-primary btn-grow" onClick={() => add(product.id, colour.id, qty)}>
                <Icon name="bag" size={18} />
                Add to bag
              </button>
            </div>
            <p className="fineprint">{brand.demoNotice}</p>

            <h2 className="pdp-h2">Features</h2>
            <ul className="feature-list feature-list-lg">
              {product.features.map((f) => (
                <li key={f}>
                  <Icon name="check" size={16} />
                  {f}
                </li>
              ))}
            </ul>

            <h2 className="pdp-h2">
              Technical specifications <span className="pdp-h2-note">demo</span>
            </h2>
            <dl className="spec-list">
              {compareRows.map((r) => (
                <div key={r.key}>
                  <dt>{r.label}</dt>
                  <dd>{product.specs[r.key]}</dd>
                </div>
              ))}
              <div>
                <dt>Colours</dt>
                <dd>{product.colours.map((c) => c.name).join(', ')}</dd>
              </div>
            </dl>
            <p className="fineprint">
              Illustrative specifications for a fictional concept. Not measured, certified or tested.
            </p>
          </div>
        </div>

        <section className="pdp-others" aria-labelledby="others-title">
          <div className="others-head">
            <h2 id="others-title" className="pdp-h2">
              Other models
            </h2>
            <Link className="text-link" to="/compare">
              Compare all models
            </Link>
          </div>
          <ul className="others-grid">
            {others.map((p) => (
              <li key={p.id}>
                <Link to={`/products/${p.id}`} className="other-link">
                  <img src={productImage(p.id, p.colours[0].id, 'set')} alt="" width="1000" height="800" loading="lazy" />
                  <span className="other-name">{p.name}</span>
                  <span className="other-meta">
                    {p.role} · {formatPrice(p.price)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const product = getProduct(id);
  if (!product) return <NotFound />;
  // Key by id so local state (view, quantity) resets between products.
  return <ProductDetail key={product.id} product={product} />;
}
