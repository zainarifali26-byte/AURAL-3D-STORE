import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { products, getCategory } from '../data/products.js';
import { resolveAsset, assetSrc } from '../data/assets.js';
import { formatPrice } from '../config/brand.js';

const SUGGESTIONS = ['noise cancellation', 'over-ear', 'sport', 'black'];

function match(product, needle) {
  const hay = [product.name, product.short, product.tagline, getCategory(product.category).name, ...product.features, ...product.colours.map((c) => c.name)]
    .join(' ')
    .toLowerCase();
  return needle.split(/\s+/).every((w) => hay.includes(w));
}

// Site search in a native <dialog>: instant results from the catalogue,
// Enter opens the full shop results.
export default function SearchDialog({ open, onClose }) {
  const ref = useRef(null);
  const inputRef = useRef(null);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const needle = q.trim().toLowerCase();
  const results = useMemo(() => (needle ? products.filter((p) => match(p, needle)) : []), [needle]);

  const close = () => {
    onClose();
    setQ('');
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!needle) return;
    close();
    navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <dialog
      ref={ref}
      className="search-dialog"
      aria-label="Search products"
      onClose={() => !ref.current?.open && close()}
      onClick={(e) => e.target === ref.current && close()}
    >
      <form className="search-bar" role="search" onSubmit={onSubmit}>
        <Icon name="search" size={20} />
        <label htmlFor="site-search" className="sr-only">
          Search products
        </label>
        <input
          ref={inputRef}
          id="site-search"
          type="search"
          placeholder="Search earbuds, headphones, features"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoComplete="off"
        />
        <button type="button" className="icon-button" onClick={close} aria-label="Close search">
          <Icon name="close" />
        </button>
      </form>
      <div className="search-results">
        {!needle && (
          <div className="search-hint">
            Try{' '}
            {SUGGESTIONS.map((s, i) => (
              <span key={s}>
                <button type="button" className="link-button" onClick={() => setQ(s)}>
                  {s}
                </button>
                {i < SUGGESTIONS.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        )}
        {needle && results.length === 0 && <p className="search-empty">No products match “{q.trim()}”.</p>}
        {results.length > 0 && (
          <ul aria-label="Results">
            {results.map((p) => {
              const asset = resolveAsset(p, p.colours[0], p.colours[0].images[0]);
              return (
                <li key={p.id}>
                  <Link className="search-result" to={`/products/${p.id}`} onClick={close}>
                    <img src={assetSrc(asset, 'small')} alt="" width="56" height="70" loading="lazy" />
                    <span>
                      <span className="search-result-name">{p.name}</span>
                      <br />
                      <span className="search-result-meta">
                        {getCategory(p.category).name} · {p.short}
                      </span>
                    </span>
                    <span className="price">{formatPrice(p.price)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <p className="sr-only" role="status">
          {needle ? `${results.length} ${results.length === 1 ? 'result' : 'results'}` : ''}
        </p>
      </div>
    </dialog>
  );
}
