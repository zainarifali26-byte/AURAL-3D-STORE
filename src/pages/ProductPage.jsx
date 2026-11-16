import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Swatches from '../components/Swatches.jsx';
import QuantityStepper from '../components/QuantityStepper.jsx';
import ProductImage from '../components/ProductImage.jsx';
import ProductCard, { Badges } from '../components/ProductCard.jsx';
import Icon from '../components/Icon.jsx';
import NotFound from './NotFound.jsx';
import { useBag } from '../state/bag.jsx';
import { brand, formatPrice } from '../config/brand.js';
import {
  getProduct,
  getColour,
  getCategory,
  products,
  productImage,
  viewsFor,
  VIEW_NAMES,
  VIEW_LABELS,
  specRows,
  AVAILABILITY,
} from '../data/products.js';
import usePageMeta from '../hooks/usePageMeta.js';

function ZoomDialog({ src, alt, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const back = document.activeElement;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      back?.focus?.();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="zoom-dialog"
      aria-label="Zoomed product image"
      onClose={() => !ref.current?.open && onClose()}
    >
      <button type="button" className="icon-button zoom-close" onClick={onClose} aria-label="Close zoom">
        <Icon name="close" />
      </button>
      <div className="zoom-scroll" tabIndex={0} aria-label="Zoomed image, scroll to pan">
        <img src={src} alt={alt} width="1200" height="1000" />
      </div>
    </dialog>
  );
}

function Gallery({ product, colour }) {
  const views = viewsFor(product);
  const [view, setView] = useState(views[0]);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [lens, setLens] = useState(null);
  const alt = `${product.name} in ${colour.name}, ${VIEW_LABELS[view]}`;

  // Desktop hover magnifier (pointer devices only).
  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    setLens({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <div className="gallery">
      <div
        className={`gallery-main${lens ? ' is-zooming' : ''}`}
        data-tone={colour.tone}
        onPointerMove={onMove}
        onPointerLeave={() => setLens(null)}
        style={lens ? { '--zx': `${lens.x}%`, '--zy': `${lens.y}%` } : undefined}
      >
        <ProductImage
          key={`${colour.id}-${view}`}
          product={product}
          colour={colour}
          view={view}
          sizes="(max-width: 900px) 100vw, 55vw"
          alt={alt}
          eager
        />
        <button type="button" className="zoom-button" onClick={() => setZoomOpen(true)}>
          <Icon name="zoom" size={18} />
          Zoom
        </button>
      </div>
      <div className="gallery-thumbs" role="group" aria-label="Product views">
        {views.map((v) => (
          <button key={v} type="button" className="thumb" aria-pressed={view === v} onClick={() => setView(v)} data-tone={colour.tone}>
            <img src={productImage(product.id, colour.id, v, 600)} alt="" width="600" height="500" loading="lazy" />
            <span>{VIEW_NAMES[v]}</span>
          </button>
        ))}
      </div>
      {zoomOpen && <ZoomDialog src={productImage(product.id, colour.id, view, 1200)} alt={alt} onClose={() => setZoomOpen(false)} />}
    </div>
  );
}

function ProductDetail({ product }) {
  const [params, setParams] = useSearchParams();
  const colour = getColour(product, params.get('colour'));
  const [qty, setQty] = useState(1);
  const { add, maxQty } = useBag();
  usePageMeta(`${product.name} (demo)`, `${product.short} Demo product with illustrative price and specifications.`, productImage(product.id, colour.id, 'hero', 1200));

  const setColour = (id) => setParams({ colour: id }, { replace: true });
  const related = [
    ...products.filter((p) => p.id !== product.id && p.category === product.category),
    ...products.filter((p) => p.id !== product.id && p.category !== product.category),
  ].slice(0, 3);
  const preorder = product.availability === 'preorder';

  return (
    <div className="pdp">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link to="/shop">Shop</Link>
            </li>
            <li>
              <Link to={`/shop?category=${product.category}`}>{getCategory(product.category).name}</Link>
            </li>
            <li aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="pdp-grid">
          <Gallery key={product.id} product={product} colour={colour} />

          <div className="pdp-info">
            <Badges product={product} />
            <h1 className="pdp-title">{product.name}</h1>
            <p className="pdp-tagline">{product.tagline}</p>
            <div className="pdp-price-row">
              <p className="pdp-price">
                {formatPrice(product.price)} <span className="price-note">demo price</span>
              </p>
              <p className={`availability availability-${product.availability}`}>{AVAILABILITY[product.availability]}</p>
            </div>

            <Swatches product={product} value={colour.id} onChange={setColour} size="lg" />

            <div className="pdp-buy">
              <QuantityStepper value={qty} onChange={(q) => setQty(Math.min(maxQty, Math.max(1, q)))} max={maxQty} />
              <button type="button" className="btn btn-primary btn-grow" onClick={() => add(product.id, colour.id, qty)}>
                <Icon name="bag" size={18} />
                {preorder ? 'Pre-order (demo)' : 'Add to bag'}
              </button>
            </div>
            <p className="notice">{brand.demoNotice}</p>

            <div className="pdp-section">
              <h2 className="pdp-h2">About this product</h2>
              <p className="pdp-desc">{product.description}</p>
              <p className="pdp-usecase">
                <strong>Best for:</strong> {product.useCase}
              </p>
            </div>

            <div className="pdp-section">
              <h2 className="pdp-h2">Features</h2>
              <ul className="feature-list">
                {product.features.map((f) => (
                  <li key={f}>
                    <Icon name="check" size={16} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pdp-section">
              <h2 className="pdp-h2">
                Specifications <span className="pdp-h2-note">demo</span>
              </h2>
              <dl className="spec-list">
                {specRows.map((r) => (
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
                Illustrative values for a fictional concept. Not measured, certified or verified by any manufacturer.
              </p>
            </div>
          </div>
        </div>

        <section className="related" aria-labelledby="related-title">
          <div className="row-head">
            <h2 id="related-title" className="row-title">
              You might also like
            </h2>
            <Link className="text-link" to="/compare">
              Compare models
            </Link>
          </div>
          <ul className="card-row">
            {related.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} sizes="(max-width: 760px) 80vw, 30vw" />
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
