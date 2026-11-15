import { useState } from 'react';
import { Link } from 'react-router-dom';
import { products, compareRows, productImage } from '../data/products.js';
import { useBagActions } from '../state/bag.jsx';
import { brand, formatPrice } from '../config/brand.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

// Wide screens show all four columns. Narrow screens show the two models
// picked in the selectors (other columns get `is-off`).
export default function ComparePage() {
  useDocumentTitle(`Compare models | ${brand.name} demo store`);
  const [pair, setPair] = useState(['pro', 'air']);
  const { add } = useBagActions();

  const pick = (slot, id) =>
    setPair((prev) => {
      const next = [...prev];
      if (next[1 - slot] === id) next[1 - slot] = prev[slot]; // swap instead of duplicating
      next[slot] = id;
      return next;
    });

  const off = (id) => (pair.includes(id) ? '' : ' is-off');

  return (
    <div className="compare-page">
      <div className="container">
        <header className="page-head">
          <p className="eyebrow">Compare</p>
          <h1 className="page-title">Find your pair.</h1>
          <p className="section-lead">
            All four concepts side by side. Every value is a demo specification taken from the same catalogue as the
            product pages.
          </p>
        </header>

        <div className="compare-pickers">
          {[0, 1].map((slot) => (
            <label key={slot} className="field">
              <span>Model {slot + 1}</span>
              <select value={pair[slot]} onChange={(e) => pick(slot, e.target.value)}>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <table className="compare-table">
          <caption className="sr-only">Demo specifications of the four {brand.name} concepts</caption>
          <thead>
            <tr>
              <td />
              {products.map((p) => (
                <th key={p.id} scope="col" className={`compare-product${off(p.id)}`}>
                  <img src={productImage(p.id, p.colours[0].id, 'set')} alt="" width="1000" height="800" loading="lazy" />
                  <span className="compare-name">{p.name}</span>
                  <span className="compare-role">{p.role}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compareRows.map((r) => (
              <tr key={r.key}>
                <th scope="row">{r.label}</th>
                {products.map((p) => (
                  <td key={p.id} className={off(p.id).trim() || undefined}>
                    {p.specs[r.key]}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th scope="row">Colours</th>
              {products.map((p) => (
                <td key={p.id} className={off(p.id).trim() || undefined}>
                  <span className="compare-swatches">
                    {p.colours.map((c) => (
                      <span key={c.id} className="dot" style={{ '--swatch': c.hex }} title={c.name} />
                    ))}
                  </span>
                  <span className="sr-only">{p.colours.map((c) => c.name).join(', ')}</span>
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Demo price</th>
              {products.map((p) => (
                <td key={p.id} className={`compare-price${off(p.id)}`}>
                  {formatPrice(p.price)}
                </td>
              ))}
            </tr>
            <tr className="compare-actions">
              <td />
              {products.map((p) => (
                <td key={p.id} className={off(p.id).trim() || undefined}>
                  <Link className="btn btn-ghost btn-sm" to={`/products/${p.id}`}>
                    Details<span className="sr-only"> of {p.name}</span>
                  </Link>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => add(p.id, p.colours[0].id, 1)}>
                    Add to bag
                    <span className="sr-only">
                      : {p.name} in {p.colours[0].name}
                    </span>
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <p className="fineprint">{brand.demoNotice}</p>
      </div>
    </div>
  );
}
