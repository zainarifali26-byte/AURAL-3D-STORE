import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import BagLines from './BagLines.jsx';
import { useBag } from '../state/bag.jsx';
import { formatPrice } from '../config/brand.js';

// Side sheet built on a native <dialog> (modal semantics, Esc, inert page).
export default function BagDrawer() {
  const { lines, count, subtotal, open, setOpen } = useBag();
  const ref = useRef(null);
  const returnFocus = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocus.current = document.activeElement;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const onClose = () => {
    setOpen(false);
    const target = returnFocus.current;
    if (target && document.contains(target)) target.focus();
  };

  const onClick = (e) => {
    if (e.target === ref.current) setOpen(false); // backdrop
  };

  return (
    <dialog ref={ref} className="drawer" aria-labelledby="drawer-title" onClose={onClose} onClick={onClick}>
      <div className="drawer-panel">
        <div className="drawer-head">
          <h2 id="drawer-title">
            Bag <span className="drawer-count">{count}</span>
          </h2>
          <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Close bag">
            <Icon name="close" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="drawer-empty">
            <p>Your bag is empty.</p>
            <Link className="btn btn-ghost" to="/#collection" onClick={() => setOpen(false)}>
              Browse the collection
            </Link>
          </div>
        ) : (
          <>
            <div className="drawer-body">
              <BagLines onNavigate={() => setOpen(false)} />
            </div>
            <div className="drawer-foot">
              <div className="summary-row">
                <span>Subtotal (demo)</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <p className="fineprint">Demo store. Prices are illustrative and nothing can be bought.</p>
              <Link className="btn btn-primary btn-block" to="/bag" onClick={() => setOpen(false)}>
                Review bag
                <Icon name="arrow" size={18} />
              </Link>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
