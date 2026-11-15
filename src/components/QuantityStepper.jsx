import Icon from './Icon.jsx';

export default function QuantityStepper({ value, onChange, max = 10, label = 'Quantity', compact = false }) {
  return (
    <div className={`stepper${compact ? ' stepper-compact' : ''}`} role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <Icon name="minus" size={16} />
      </button>
      <output aria-live="polite" aria-label={`${label}: ${value}`}>
        {value}
      </output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}
