import { useId } from 'react';

// Colour picker: a radio group so arrow keys work natively.
export default function Swatches({ product, value, onChange, size = 'md', legend = 'Colour', hideLegend = false }) {
  const name = useId();
  const current = product.colours.find((c) => c.id === value) ?? product.colours[0];
  return (
    <fieldset className={`swatches swatches-${size}`}>
      <legend className={hideLegend ? 'sr-only' : undefined}>
        {legend}: <span className="swatch-current">{current.name}</span>
      </legend>
      <div className="swatch-row">
        {product.colours.map((c) => (
          <label key={c.id} className="swatch" title={c.name}>
            <input type="radio" name={name} value={c.id} checked={c.id === current.id} onChange={() => onChange(c.id)} />
            <span className="swatch-chip" style={{ '--swatch': c.hex }} aria-hidden="true" />
            <span className="sr-only">{c.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
