import { useId } from 'react';

// Colour picker: a radio group so arrow keys work natively. A product with a
// single finish shows its name instead of a one-option control.
export default function Swatches({ product, value, onChange, size = 'md', legend = 'Colour', hideLegend = false }) {
  const name = useId();
  const current = product.colours.find((c) => c.id === value) ?? product.colours[0];

  if (product.colours.length === 1) {
    return (
      <p className={`swatches-single swatches-${size}`}>
        <span className="dot" style={{ '--swatch': current.hex }} aria-hidden="true" />
        <span className={hideLegend ? 'sr-only' : 'swatch-legend'}>{legend}: </span>
        <span className="swatch-current">{current.name}</span>
      </p>
    );
  }

  return (
    <fieldset className={`swatches swatches-${size}`}>
      <legend className={hideLegend ? 'sr-only' : 'swatch-legend'}>
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
