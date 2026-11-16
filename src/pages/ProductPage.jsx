import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Swatches from '../components/Swatches.jsx';
import QuantityStepper from '../components/QuantityStepper.jsx';
import { AssetImage } from '../components/ProductImage.jsx';
import ProductCard, { Badges } from '../components/ProductCard.jsx';
import Icon from '../components/Icon.jsx';
import NotFound from './NotFound.jsx';
import { useBag } from '../state/bag.jsx';
import { brand, formatPrice } from '../config/brand.js';
import { getProduct, getColour, getCategory, products, specRows, AVAILABILITY } from '../data/products.js';
import { resolveAsset, assetSrc } from '../data/assets.js';
import usePageMeta from '../hooks/usePageMeta.js';

function ZoomDialog({ asset, onClose }) {
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
    <dialog ref={ref} className="zoom-dialog" aria-label="Zoomed product image" onClose={() => !ref.current?.open && onClose()}>
      <button type="button" className="icon-button icon-button-outline zoom-close" onClick={onClose} aria-label="Close zoom">
        <Icon name="close" />
      </button>
      <div className="zoom-scroll" tabIndex={0} aria-label="Zoomed image, scroll to pan">
        <img src={assetSrc(asset)} alt={asset.alt} width={asset.w} height={asset.h} />
      </div>
    </dialog>
  );
}

function Gallery({ product, colour }) {
  const assets = colour.images.map((key) => resolveAsset(product, colour, key));
  const [index, setIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [lens, setLens] = useState(null);
  const asset = assets[Math.min(index, assets.length - 1)];

  const go = (delta) => setIndex((i) => (i + delta + assets.length) % assets.length);

  // Desktop hover magnifier (mouse only).
  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    setLens({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <div className="gallery">
      <div className="gallery-thumbs" role="group" aria-label="Product images">
        {assets.map((a, i) => (
          <button key={a.id} type="button" className="thumb" aria-pressed={i === index} aria-label={`Image ${i + 1} of ${assets.length}: ${a.alt}`} onClick={() => setIndex(i)}>
            <img src={assetSrc(a, 'small')} alt="" width={a.small} height={a.small * 1.25} loading="lazy" />
          </button>
        ))}
      </div>
      <div
        className={`gallery-main studio-backdrop${lens ? ' is-zooming' : ''}`}
        onPointerMove={onMove}
        onPointerLeave={() => setLens(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(1);
          if (e.key === 'ArrowLeft') go(-1);
        }}
        style={lens ? { '--zx': `${lens.x}%`, '--zy': `${lens.y}%` } : undefined}
      >
        <AssetImage key={asset.id} asset={asset} sizes="(max-width: 960px) 100vw, 56vw" eager className="gallery-img" />
        {product.imagery === 'render' && <span className="render-note">Concept render</span>}
        {assets.length > 1 && (
          <div className="gallery-nav">
            <button type="button" className="icon-button icon-button-outline" onClick={() => go(-1)} aria-label="Previous image">
              <Icon name="chevronLeft" />
            </button>
            <span className="gallery-count" aria-live="polite">
              {index + 1} / {assets.length}
            </span>
            <button type="button" className="icon-button icon-button-outline" onClick={() => go(1)} aria-label="Next image">
              <Icon name="chevronRight" />
            </button>
          </div>
        )}
        <button type="button" className="zoom-button" onClick={() => setZoomOpen(true)}>
          <Icon name="zoom" size={18} />
          Zoom
        </button>
      </div>
      {zoomOpen && <ZoomDialog asset={asset} onClose={() => setZoomOpen(false)} />}
    </div>
  );
}

function ProductDetail({ product }) {
  const [params, setParams] = useSearchParams();
  const colour = getColour(product, params.get('colour'));
  const [qty, setQty] = useState(1);
  const { add, maxQty } = useBag();
  const heroAsset = resolveAsset(product, colour, colour.images[0]);
  usePageMeta(`${product.name} (demo)`, `${product.short} Demo product with illustrative price and specifications.`, assetSrc(heroAsset));

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
          <Gallery key={`${product.id}-${colour.id}`} product={product} colour={colour} />

          <div className="pdp-info">
            <div className="pdp-sticky">
              <Badges product={product} max={3} />
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
              <p className="fineprint">{brand.demoNotice}</p>

              <ul className="pdp-highlights">
                {product.features.slice(0, 3).map((f) => (
                  <li key={f}>
                    <Icon name="check" size={16} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="pdp-details">
          <section className="pdp-section" aria-labelledby="about-title">
            <h2 id="about-title" className="pdp-h2">
              About {product.name.replace('AURAL ', '')}
            </h2>
            <div>
              <p className="pdp-desc">{product.description}</p>
              <p className="pdp-usecase">
                <strong>Best for</strong> {product.useCase}
              </p>
            </div>
          </section>

          <section className="pdp-section" aria-labelledby="features-title">
            <h2 id="features-title" className="pdp-h2">
              Features
            </h2>
            <ul className="feature-grid">
              {product.features.map((f, i) => (
                <li key={f}>
                  <span className="feature-num">0{i + 1}</span>
                  {f}
                </li>
              ))}
            </ul>
          </section>

          <section className="pdp-section" aria-labelledby="specs-title">
            <h2 id="specs-title" className="pdp-h2">
              Specifications <span className="tag">Demo</span>
            </h2>
            <div>
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
                {product.imagery === 'render'
                  ? ' Images are concept renders.'
                  : ' Photography shows an unbranded stand-in product; see image credits.'}
              </p>
            </div>
          </section>
        </div>

        <section className="related" aria-labelledby="related-title">
          <div className="section-head-row">
            <h2 id="related-title" className="section-title related-title">
              You might also like
            </h2>
            <Link className="btn btn-secondary" to="/compare">
              Compare models
            </Link>
          </div>
          <ul className="related-row">
            {related.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} sizes="(max-width: 760px) 78vw, 30vw" />
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
  return <ProductDetail key={product.id} product={product} />;
}
