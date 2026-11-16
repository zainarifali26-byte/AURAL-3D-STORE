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

  const close = () => setOpen(false);

  return (
    <dialog
      ref={ref}
      className="drawer"
      aria-labelledby="drawer-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && close()}
    >
      <div className="drawer-panel">
        <div className="drawer-head">
          <h2 id="drawer-title">
            Your bag <span className="drawer-count">({count})</span>
          </h2>
          <button type="button" className="icon-button" onClick={close} aria-label="Close bag">
            <Icon name="close" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="drawer-empty">
            <p className="drawer-empty-title">Your bag is empty.</p>
            <p className="fineprint">Add a pair from the shop. Your bag is saved in this browser only.</p>
            <Link className="btn btn-primary" to="/shop" onClick={close}>
              Shop all products
            </Link>
          </div>
        ) : (
          <>
            <div className="drawer-body">
              <BagLines onNavigate={close} compact />
            </div>
            <div className="drawer-foot">
              <div className="summary-row summary-total">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <p className="fineprint">Demo store: prices are illustrative and no payment is ever taken.</p>
              <Link className="btn btn-primary btn-block" to="/checkout" onClick={close}>
                Checkout (demo)
                <Icon name="arrow" size={18} />
              </Link>
              <Link className="btn btn-ghost btn-block" to="/bag" onClick={close}>
                View bag
              </Link>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
