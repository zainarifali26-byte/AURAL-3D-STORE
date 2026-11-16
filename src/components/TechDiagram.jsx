// Illustrative diagrams for the technology section. Pure SVG, animated with
// CSS only while `active` (and never under reduced motion). They explain an
// idea; they do not show measured data.

function Anc() {
  return (
    <svg viewBox="0 0 320 140" className="diagram" aria-hidden="true">
      <path className="d-wave d-noise" d="M0 70 Q20 30 40 70 T80 70 T120 70 T160 70" />
      <path className="d-wave d-anti" d="M0 70 Q20 110 40 70 T80 70 T120 70 T160 70" />
      <line className="d-mid" x1="160" y1="70" x2="320" y2="70" />
      <circle className="d-node" cx="160" cy="70" r="5" />
      <text x="0" y="16">Outside noise</text>
      <text x="0" y="134">Opposite signal</text>
      <text x="200" y="58">What you hear</text>
    </svg>
  );
}

function Sound() {
  return (
    <svg viewBox="0 0 320 140" className="diagram" aria-hidden="true">
      {[30, 60, 90, 120].map((y) => (
        <line key={y} className="d-grid" x1="0" y1={y} x2="320" y2={y} />
      ))}
      <path className="d-draw" d="M0 92 C40 70 60 62 90 66 S150 76 180 70 S240 58 260 64 S300 84 320 96" />
      <text x="0" y="136">Low</text>
      <text x="140" y="136">Mid</text>
      <text x="292" y="136">High</text>
      <text x="0" y="16">Balanced tuning (illustrative)</text>
    </svg>
  );
}

function Battery() {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 320 140" className="diagram" aria-hidden="true">
      <circle className="d-track" cx="70" cy="70" r={r} />
      <circle className="d-ring" cx="70" cy="70" r={r} strokeDasharray={c} style={{ '--c': c }} transform="rotate(-90 70 70)" />
      <text x="70" y="66" textAnchor="middle" className="d-big">
        Long
      </text>
      <text x="70" y="86" textAnchor="middle">
        demo spec
      </text>
      <rect className="d-case" x="160" y="44" width="120" height="52" rx="16" />
      <rect className="d-fill" x="168" y="52" width="104" height="36" rx="10" />
      <text x="160" y="118">Top up in the case</text>
    </svg>
  );
}

function Connect() {
  return (
    <svg viewBox="0 0 320 140" className="diagram" aria-hidden="true">
      <circle className="d-node" cx="160" cy="70" r="7" />
      {[24, 44, 64].map((r, i) => (
        <circle key={r} className="d-pulse" cx="160" cy="70" r={r} style={{ animationDelay: `${i * 0.5}s` }} />
      ))}
      <rect className="d-device" x="22" y="48" width="30" height="48" rx="6" />
      <rect className="d-device" x="252" y="52" width="52" height="34" rx="4" />
      <text x="10" y="120">Phone</text>
      <text x="252" y="120">Laptop</text>
      <text x="108" y="16">Multipoint (selected models)</text>
    </svg>
  );
}

function Fit() {
  return (
    <svg viewBox="0 0 320 140" className="diagram" aria-hidden="true">
      {[
        [70, 14, 'S'],
        [160, 18, 'M'],
        [250, 22, 'L'],
      ].map(([x, r, label]) => (
        <g key={label}>
          <circle className="d-tip" cx={x} cy="66" r={r} />
          <circle className="d-tip-inner" cx={x} cy="66" r={r * 0.38} />
          <text x={x} y="118" textAnchor="middle">
            {label}
          </text>
        </g>
      ))}
      <text x="0" y="16">Ear tip sizes for a proper seal</text>
    </svg>
  );
}

function Mic() {
  return (
    <svg viewBox="0 0 320 140" className="diagram" aria-hidden="true">
      <path className="d-beam" d="M60 70 L300 20 L300 120 Z" />
      {[0, 1, 2].map((i) => (
        <path key={i} className="d-voice" d={`M${150 + i * 40} ${48 - i * 6} q14 22 0 ${44 + i * 12}`} style={{ animationDelay: `${i * 0.35}s` }} />
      ))}
      <circle className="d-node" cx="60" cy="70" r="7" />
      <text x="30" y="104">Mic</text>
      <text x="230" y="134">Your voice</text>
      <text x="0" y="16">Focused pickup (illustrative)</text>
    </svg>
  );
}

const DIAGRAMS = { anc: Anc, sound: Sound, battery: Battery, connect: Connect, fit: Fit, mic: Mic };

export default function TechDiagram({ type, active }) {
  const D = DIAGRAMS[type];
  return (
    <div className={`diagram-wrap${active ? ' is-active' : ''}`}>
      <D />
    </div>
  );
}
