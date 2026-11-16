import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { OrderSummary } from './BagPage.jsx';
import Icon from '../components/Icon.jsx';
import { useBag } from '../state/bag.jsx';
import { formatPrice } from '../config/brand.js';
import usePageMeta from '../hooks/usePageMeta.js';

// Demo checkout. Details live only in this component's memory: nothing is
// stored, sent or charged, and no payment details are ever requested.
const FIELDS = [
  { name: 'name', label: 'Full name', autoComplete: 'name', required: true },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', required: true },
  { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel', required: true },
  { name: 'address', label: 'Delivery address', autoComplete: 'street-address', required: true, wide: true },
  { name: 'city', label: 'City', autoComplete: 'address-level2', required: true },
  { name: 'postcode', label: 'Postcode (optional)', autoComplete: 'postal-code' },
];

function validate(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) errors.email = 'Enter an email address like name@example.com.';
  if (values.phone.replace(/\D/g, '').length < 7) errors.phone = 'Enter a phone number with at least 7 digits.';
  if (values.address.trim().length < 5) errors.address = 'Enter a delivery address.';
  if (values.city.trim().length < 2) errors.city = 'Enter a city.';
  return errors;
}

const empty = Object.fromEntries(FIELDS.map((f) => [f.name, '']));

export default function CheckoutPage() {
  usePageMeta('Demo checkout', 'Demo checkout for the AURAL concept store. No payment is collected and no order is placed.');
  const { lines, subtotal, clear } = useBag();
  const [values, setValues] = useState({ ...empty, notes: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const formRef = useRef(null);

  const onChange = (e) => {
    const next = { ...values, [e.target.name]: e.target.value };
    setValues(next);
    if (submitted) setErrors(validate(next));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const found = validate(values);
    setErrors(found);
    const count = Object.keys(found).length;
    if (count) {
      setStatus(`${count} ${count === 1 ? 'field needs' : 'fields need'} attention.`);
      formRef.current?.querySelector(`[name="${Object.keys(found)[0]}"]`)?.focus();
      return;
    }
    // Simulate placing the order: keep a snapshot for the confirmation, then empty the bag.
    setOrder({
      reference: `DEMO-${Date.now().toString(36).slice(-6).toUpperCase()}`,
      name: values.name.trim(),
      email: values.email.trim(),
      lines: lines.map((l) => ({ key: `${l.productId}-${l.colourId}`, text: `${l.product.name} · ${l.colour.name} × ${l.qty}`, total: l.lineTotal })),
      subtotal,
    });
    clear();
    window.scrollTo(0, 0);
  };

  if (order) {
    return (
      <div className="checkout-page">
        <div className="container confirm">
          <span className="confirm-icon" aria-hidden="true">
            <Icon name="check" size={28} strokeWidth={2} />
          </span>
          <p className="eyebrow">Demo order confirmation</p>
          <h1 className="page-title">Thanks, {order.name.split(' ')[0]}.</h1>
          <p className="notice notice-gold">
            This was a demonstration. <strong>No real order was placed, nothing was charged and no email was sent</strong> to{' '}
            {order.email}. Your details were not stored or sent anywhere.
          </p>
          <dl className="confirm-meta">
            <div>
              <dt>Demo reference</dt>
              <dd>{order.reference}</dd>
            </div>
            <div>
              <dt>Demo total</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
          </dl>
          <ul className="summary-lines">
            {order.lines.map((l) => (
              <li key={l.key}>
                <span>{l.text}</span>
                <span>{formatPrice(l.total)}</span>
              </li>
            ))}
          </ul>
          <Link className="btn btn-primary" to="/shop">
            Back to the shop
          </Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container empty-state">
          <h1 className="page-title">Checkout</h1>
          <p className="section-lead">Your bag is empty, so there is nothing to check out yet.</p>
          <Link className="btn btn-primary" to="/shop">
            Shop all products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <header className="page-head">
          <p className="eyebrow">Checkout · demo mode</p>
          <h1 className="page-title">Delivery details</h1>
          <p className="notice notice-gold">
            Demo checkout: no payment details are requested, no order is placed and nothing is charged. Do not enter real
            personal information.
          </p>
        </header>

        <div className="bag-grid">
          <form ref={formRef} className="checkout-form" noValidate onSubmit={onSubmit} aria-describedby="checkout-status">
            <fieldset className="form-section">
              <legend>Contact and delivery</legend>
              <div className="form-grid">
                {FIELDS.map((f) => (
                  <div key={f.name} className={`field${f.wide ? ' field-wide' : ''}`}>
                    <label className="field-label" htmlFor={`co-${f.name}`}>
                      {f.label}
                    </label>
                    <input
                      id={`co-${f.name}`}
                      className="input"
                      name={f.name}
                      type={f.type ?? 'text'}
                      autoComplete={f.autoComplete}
                      required={f.required}
                      value={values[f.name]}
                      onChange={onChange}
                      aria-invalid={errors[f.name] ? 'true' : undefined}
                      aria-describedby={errors[f.name] ? `co-${f.name}-error` : undefined}
                    />
                    {errors[f.name] && (
                      <p id={`co-${f.name}-error`} className="field-error">
                        {errors[f.name]}
                      </p>
                    )}
                  </div>
                ))}
                <div className="field field-wide">
                  <label className="field-label" htmlFor="co-notes">
                    Delivery notes (optional)
                  </label>
                  <textarea id="co-notes" className="textarea" name="notes" value={values.notes} onChange={onChange} />
                </div>
              </div>
            </fieldset>

            <fieldset className="form-section">
              <legend>Shipping</legend>
              <label className="option-card">
                <input type="radio" name="shipping" defaultChecked />
                <span>
                  <strong>Standard delivery</strong>
                  <span className="fineprint">Placeholder. Cost and delivery time will be set by the store owner.</span>
                </span>
              </label>
            </fieldset>

            <fieldset className="form-section">
              <legend>Payment</legend>
              <p className="fineprint">
                Payment is not collected in this demo. A real store would connect a payment provider here.
              </p>
            </fieldset>

            <p id="checkout-status" role="status" className="form-status">
              {status}
            </p>
            <button type="submit" className="btn btn-primary btn-block">
              Place demo order
            </button>
          </form>

          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
