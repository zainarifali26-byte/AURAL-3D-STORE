// Frontend-only shopping bag. Lines are keyed by product + colour, kept in a
// reducer and persisted to localStorage. Nothing is ever sent anywhere.
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { getProduct, getColour } from '../data/products.js';

const STORAGE_KEY = 'aural-bag-v1';
const MAX_QTY = 10;

const BagContext = createContext(null);
const BagActionsContext = createContext(null);

const clampQty = (n) => Math.min(MAX_QTY, Math.max(1, Math.round(Number(n) || 1)));

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(raw)) return [];
    // Drop anything that no longer matches the catalogue.
    return raw
      .filter((l) => getProduct(l.productId) && getProduct(l.productId).colours.some((c) => c.id === l.colourId))
      .map((l) => ({ productId: l.productId, colourId: l.colourId, qty: clampQty(l.qty) }));
  } catch {
    return [];
  }
}

function reducer(lines, action) {
  const same = (l) => l.productId === action.productId && l.colourId === action.colourId;
  switch (action.type) {
    case 'add': {
      const existing = lines.find(same);
      if (existing) return lines.map((l) => (same(l) ? { ...l, qty: clampQty(l.qty + action.qty) } : l));
      return [...lines, { productId: action.productId, colourId: action.colourId, qty: clampQty(action.qty) }];
    }
    case 'setQty':
      return lines.map((l) => (same(l) ? { ...l, qty: clampQty(action.qty) } : l));
    case 'remove':
      return lines.filter((l) => !same(l));
    case 'replace':
      return load();
    default:
      return lines;
  }
}

export function BagProvider({ children }) {
  const [lines, dispatch] = useReducer(reducer, undefined, load);
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Storage can be unavailable (private mode); the bag still works in memory.
    }
  }, [lines]);

  // Keep tabs in sync.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) dispatch({ type: 'replace' });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const add = useCallback((productId, colourId, qty = 1) => {
    dispatch({ type: 'add', productId, colourId, qty });
    const p = getProduct(productId);
    setAnnouncement(`${p.name} in ${getColour(p, colourId).name} added to bag.`);
    setOpen(true);
  }, []);
  const setQty = useCallback((productId, colourId, qty) => dispatch({ type: 'setQty', productId, colourId, qty }), []);
  const remove = useCallback((productId, colourId) => {
    dispatch({ type: 'remove', productId, colourId });
    setAnnouncement(`${getProduct(productId).name} removed from bag.`);
  }, []);

  const value = useMemo(() => {
    const detailed = lines.map((l) => {
      const product = getProduct(l.productId);
      return { ...l, product, colour: getColour(product, l.colourId), lineTotal: product.price * l.qty };
    });
    return {
      lines: detailed,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: detailed.reduce((n, l) => n + l.lineTotal, 0),
      add,
      setQty,
      remove,
      open,
      setOpen,
      announcement,
      maxQty: MAX_QTY,
    };
  }, [lines, add, setQty, remove, open, announcement]);

  // Stable actions in their own context, so components that only add to the
  // bag (product cards) do not re-render when the bag changes.
  const actions = useMemo(() => ({ add, setOpen }), [add]);

  return (
    <BagActionsContext.Provider value={actions}>
      <BagContext.Provider value={value}>{children}</BagContext.Provider>
    </BagActionsContext.Provider>
  );
}

export function useBagActions() {
  const ctx = useContext(BagActionsContext);
  if (!ctx) throw new Error('useBagActions must be used inside <BagProvider>');
  return ctx;
}

export function useBag() {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error('useBag must be used inside <BagProvider>');
  return ctx;
}
