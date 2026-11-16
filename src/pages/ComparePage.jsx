import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductImage from '../components/ProductImage.jsx';
import { products, compareRows, getProduct } from '../data/products.js';
import { useBagActions } from '../state/bag.jsx';
import { brand, formatPrice } from '../config/brand.js';
import usePageMeta from '../hooks/usePageMeta.js';

const DEFAULT = ['pro-x', 'air', 'studio'];

// Up to three models side by side (two on phones). Every value comes from
// the same catalogue as the product pages.
export default function ComparePage() {
  usePageMeta('Compare models', 'Compare the AURAL demo headphones and earbuds side by side. All specifications are illustrative.');
  const [picked, setPicked] = useState(DEFAULT);
  const { add } = useBagActions();

  const pick = (slot, id) =>
    setPicked((prev) => {
      const next = [...prev];
      const existing = next.indexOf(id);
      if (existing !== -1 && existing !== slot) next[existing] = prev[slot]; // swap instead of duplicating
      next[slot] = id;
      return next;
    });

  const columns = picked.map(getProduct);

  return (
    <div className="compare-page">
      <div className="container">
        <header className="page-head">
          <p className="eyebrow">Compare</p>
          <h1 className="page-title">Find your pair.</h1>
          <p className="section-lead">
            Choose up to three models. Every value is a demo specification from the same catalogue as the product pages,
            not a verified manufacturer specification.
          </p>
        </header>

        <div className="compare-pickers">
          {picked.map((id, slot) => (
            <label key={slot} className={`field${slot === 2 ? ' compare-third' : ''}`}>
              <span className="field-label">Model {slot + 1}</span>
              <select className="select" value={id} onChange={(e) => pick(slot, e.target.value)}>
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
          <caption className="sr-only">Demo specifications of the selected {brand.name} models</caption>
          <thead>
            <tr>
              <td className="compare-corner" />
              {columns.map((p, i) => (
                <th key={p.id} scope="col" className={i === 2 ? 'compare-third' : undefined}>
                  <div className="compare-img">
                    <ProductImage product={p} colour={p.colours[0]} sizes="(max-width: 760px) 40vw, 25vw" />
                  </div>
                  <Link className="compare-name" to={`/products/${p.id}`}>
                    {p.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Demo price</th>
              {columns.map((p, i) => (
                <td key={p.id} className={`compare-price${i === 2 ? ' compare-third' : ''}`}>
                  {formatPrice(p.price)}
                </td>
              ))}
            </tr>
            {compareRows.map((r) => (
              <tr key={r.key}>
                <th scope="row">{r.label}</th>
                {columns.map((p, i) => (
                  <td key={p.id} className={i === 2 ? 'compare-third' : undefined}>
                    {r.get ? r.get(p) : p.specs[r.key]}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th scope="row">Colours</th>
              {columns.map((p, i) => (
                <td key={p.id} className={i === 2 ? 'compare-third' : undefined}>
                  <span className="compare-swatches">
                    {p.colours.map((c) => (
                      <span key={c.id} className="dot" style={{ '--swatch': c.hex }} title={c.name} />
                    ))}
                  </span>
                  <span className="compare-colour-names">{p.colours.map((c) => c.name).join(', ')}</span>
                </td>
              ))}
            </tr>
            <tr className="compare-actions">
              <td />
              {columns.map((p, i) => (
                <td key={p.id} className={i === 2 ? 'compare-third' : undefined}>
                  <button type="button" className="btn btn-primary btn-sm btn-block" onClick={() => add(p.id, p.colours[0].id, 1)}>
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
