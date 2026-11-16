import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import QuickView from '../components/QuickView.jsx';
import Icon from '../components/Icon.jsx';
import { products, CATEGORIES, COLOUR_FAMILIES, AVAILABILITY, getCategory } from '../data/products.js';
import usePageMeta from '../hooks/usePageMeta.js';

const SORTS = {
  featured: 'Featured',
  newest: 'Newest',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
};

const featuredRank = (p) => (p.badges.includes('featured') ? 0 : p.badges.includes('bestseller') ? 1 : 2);

const familiesInCatalogue = Object.keys(COLOUR_FAMILIES).filter((f) =>
  products.some((p) => p.colours.some((c) => c.family === f)),
);
const familySwatch = (f) =>
  products.flatMap((p) => p.colours).find((c) => c.family === f)?.hex ?? '#ccc';

function useShopState() {
  const [params, setParams] = useSearchParams();
  const state = {
    q: params.get('q') ?? '',
    category: params.get('category') ?? 'all',
    colours: params.getAll('colour'),
    availability: params.getAll('availability'),
    sort: SORTS[params.get('sort')] ? params.get('sort') : 'featured',
  };

  const update = (changes) => {
    // Start from the live URL, not this render's `params`, so rapid updates
    // (typing, then a filter) never overwrite each other.
    const next = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(changes)) {
      next.delete(key);
      const values = Array.isArray(value) ? value : [value];
      for (const v of values) {
        if (v && !(key === 'category' && v === 'all') && !(key === 'sort' && v === 'featured')) next.append(key, v);
      }
    }
    setParams(next, { replace: true });
  };

  const clear = () => setParams(new URLSearchParams(), { replace: true });
  return [state, update, clear];
}

function filterProducts({ q, category, colours, availability, sort }) {
  const needle = q.trim().toLowerCase();
  const list = products.filter((p) => {
    if (category !== 'all' && p.category !== category) return false;
    if (colours.length && !p.colours.some((c) => colours.includes(c.family))) return false;
    if (availability.length && !availability.includes(p.availability)) return false;
    if (needle) {
      const haystack = [p.name, p.short, p.tagline, p.description, getCategory(p.category).name, ...p.features, ...p.colours.map((c) => c.name)]
        .join(' ')
        .toLowerCase();
      if (!needle.split(/\s+/).every((word) => haystack.includes(word))) return false;
    }
    return true;
  });
  const sorters = {
    featured: (a, b) => featuredRank(a) - featuredRank(b) || b.released - a.released,
    newest: (a, b) => b.released - a.released,
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
  };
  return list.sort(sorters[sort]);
}

function toggle(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Filters({ state, update, idPrefix }) {
  return (
    <div className="filters">
      <fieldset className="filter-group">
        <legend>Category</legend>
        {[{ id: 'all', name: 'All products' }, ...CATEGORIES].map((c) => (
          <label key={c.id} className="check">
            <input
              type="radio"
              name={`${idPrefix}-category`}
              checked={state.category === c.id}
              onChange={() => update({ category: c.id })}
            />
            <span>{c.name}</span>
            <span className="check-count">
              {c.id === 'all' ? products.length : products.filter((p) => p.category === c.id).length}
            </span>
          </label>
        ))}
      </fieldset>

      <fieldset className="filter-group">
        <legend>Colour</legend>
        <div className="colour-filter">
          {familiesInCatalogue.map((f) => (
            <label key={f} className="colour-check">
              <input
                type="checkbox"
                checked={state.colours.includes(f)}
                onChange={() => update({ colour: toggle(state.colours, f) })}
              />
              <span className="dot" style={{ '--swatch': familySwatch(f) }} aria-hidden="true" />
              <span>{COLOUR_FAMILIES[f]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="filter-group">
        <legend>Availability</legend>
        {Object.entries(AVAILABILITY).map(([key, label]) => (
          <label key={key} className="check">
            <input
              type="checkbox"
              checked={state.availability.includes(key)}
              onChange={() => update({ availability: toggle(state.availability, key) })}
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}

function FilterSheet({ open, onClose, children, resultCount }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog ref={ref} className="sheet" aria-labelledby="sheet-title" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className="sheet-panel">
        <div className="drawer-head">
          <h2 id="sheet-title">Filters</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close filters">
            <Icon name="close" />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
        <div className="sheet-foot">
          <button type="button" className="btn btn-primary btn-block" onClick={onClose}>
            Show {resultCount} {resultCount === 1 ? 'product' : 'products'}
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default function ShopPage() {
  usePageMeta('Shop all products', 'Browse the eight AURAL demo products: true wireless earbuds, sport earbuds and over-ear headphones.');
  const [urlState, update, clear] = useShopState();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [quick, setQuick] = useState(null);

  // The search box keeps its own text so fast typing never loses characters
  // while the URL update (a deferred navigation) catches up.
  const [query, setQuery] = useState(urlState.q);
  const lastUrlQ = useRef(urlState.q);
  useEffect(() => {
    // Follow external changes to ?q= (chip removal, "Clear all", back button).
    if (urlState.q !== lastUrlQ.current) {
      lastUrlQ.current = urlState.q;
      setQuery(urlState.q);
    }
  }, [urlState.q]);
  const onSearch = (value) => {
    setQuery(value);
    lastUrlQ.current = value;
    update({ q: value });
  };

  const state = useMemo(() => ({ ...urlState, q: query }), [urlState, query]);
  const results = useMemo(() => filterProducts(state), [state]);

  const chips = [
    ...(state.q ? [{ key: 'q', label: `“${state.q}”`, remove: () => onSearch('') }] : []),
    ...(state.category !== 'all'
      ? [{ key: 'cat', label: getCategory(state.category).name, remove: () => update({ category: 'all' }) }]
      : []),
    ...state.colours.map((f) => ({ key: `c-${f}`, label: COLOUR_FAMILIES[f], remove: () => update({ colour: state.colours.filter((x) => x !== f) }) })),
    ...state.availability.map((a) => ({
      key: `a-${a}`,
      label: AVAILABILITY[a].replace(' (demo)', ''),
      remove: () => update({ availability: state.availability.filter((x) => x !== a) }),
    })),
  ];

  return (
    <div className="shop-page">
      <div className="container">
        <header className="page-head shop-head">
          <p className="eyebrow">Shop</p>
          <h1 className="page-title">All headphones and earbuds</h1>
          <p className="section-lead">Eight demo products. Prices, availability and specifications are illustrative.</p>
        </header>

        <div className="shop-toolbar">
          <label className="search">
            <Icon name="search" size={18} />
            <span className="sr-only">Search products</span>
            <input
              type="search"
              className="input"
              placeholder="Search by name, feature or colour"
              value={query}
              onChange={(e) => onSearch(e.target.value)}
            />
          </label>
          <button type="button" className="btn btn-ghost filter-toggle" onClick={() => setSheetOpen(true)} aria-haspopup="dialog">
            <Icon name="filter" size={18} />
            Filters{chips.length ? ` (${chips.length})` : ''}
          </button>
          <label className="sort">
            <span className="sort-label">Sort</span>
            <select className="select" value={state.sort} onChange={(e) => update({ sort: e.target.value })}>
              {Object.entries(SORTS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="shop-layout">
          <aside className="shop-filters" aria-label="Filters">
            <Filters state={state} update={update} idPrefix="side" />
          </aside>

          <div className="shop-results">
            <div className="results-bar">
              <p role="status" className="results-count">
                Showing {results.length} of {products.length} products
              </p>
              {chips.length > 0 && (
                <ul className="chips" aria-label="Active filters">
                  {chips.map((c) => (
                    <li key={c.key}>
                      <button type="button" className="chip" onClick={c.remove}>
                        {c.label}
                        <Icon name="close" size={14} />
                        <span className="sr-only">Remove filter</span>
                      </button>
                    </li>
                  ))}
                  <li>
                    <button type="button" className="link-button" onClick={clear}>
                      Clear all
                    </button>
                  </li>
                </ul>
              )}
            </div>

            {results.length === 0 ? (
              <div className="empty-state">
                <h2>No products match.</h2>
                <p className="section-lead">Try a different search or remove a filter.</p>
                <button type="button" className="btn btn-primary" onClick={clear}>
                  Clear filters
                </button>
              </div>
            ) : (
              <ul className="product-grid">
                {results.map((p) => (
                  <li key={p.id}>
                    <ProductCard
                      product={p}
                      sizes="(max-width: 640px) 92vw, (max-width: 1100px) 45vw, 30vw"
                      onQuickView={(product, colourId) => setQuick({ product, colourId })}
                      headingLevel={2}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <FilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)} resultCount={results.length}>
        <Filters state={state} update={update} idPrefix="sheet" />
        {chips.length > 0 && (
          <button type="button" className="link-button" onClick={clear}>
            Clear all filters
          </button>
        )}
      </FilterSheet>

      {quick && <QuickView product={quick.product} initialColour={quick.colourId} onClose={() => setQuick(null)} />}
    </div>
  );
}
