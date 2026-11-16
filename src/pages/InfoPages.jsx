// Supporting pages. All business details are placeholders: the owner must
// supply real contact details, shipping terms, returns terms and legal text.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AssetImage } from '../components/ProductImage.jsx';
import { brand } from '../config/brand.js';
import { products } from '../data/products.js';
import { PHOTO_ASSETS, assetSrc } from '../data/assets.js';
import { PHOTO_SOURCES, PHOTOGRAPHERS, PEXELS_LICENSE, photoPage } from '../data/credits.js';
import usePageMeta from '../hooks/usePageMeta.js';

function InfoLayout({ eyebrow, title, lead, children, aside }) {
  return (
    <div className="info-page">
      <div className="container">
        <header className="page-head info-head">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="page-title">{title}</h1>
          {lead && <p className="section-lead">{lead}</p>}
        </header>
        <div className={`info-grid${aside ? '' : ' info-grid-single'}`}>
          <div className="prose">{children}</div>
          {aside && <aside className="info-aside">{aside}</aside>}
        </div>
      </div>
    </div>
  );
}

function Placeholder({ children }) {
  return (
    <p className="notice notice-gold">
      <strong>Placeholder.</strong> {children}
    </p>
  );
}

export function AboutPage() {
  usePageMeta('About AURAL', 'AURAL is a fictional headphones and earbuds concept and a frontend demo store.');
  return (
    <InfoLayout
      eyebrow="About"
      title="A concept for everyday listening."
      lead={`${brand.name} is a design exercise: what would a headphones and earbuds brand look like if the product story, the store and the products were designed together?`}
      aside={
        <div className="about-images">
          <div className="about-img">
            <AssetImage asset={PHOTO_ASSETS['life-portrait']} sizes="(max-width: 900px) 90vw, 30vw" />
          </div>
          <div className="about-img studio-backdrop">
            <AssetImage asset={PHOTO_ASSETS['pro-x-pair']} sizes="(max-width: 900px) 90vw, 30vw" />
          </div>
        </div>
      }
    >
      <h2>What AURAL is</h2>
      <p>
        {brand.name} is a fictional brand. The eight products in this store are concepts with illustrative prices,
        availability and specifications. Three are shown with licensed stock photography of unbranded stand-in
        products; the other five are shown as concept renders until photography exists. See the{' '}
        <Link to="/credits">image credits</Link>.
      </p>
      <h2>What we care about</h2>
      <ul>
        <li>
          <strong>Audio first.</strong> Clear voices and detail at comfortable volumes.
        </li>
        <li>
          <strong>Restraint in design.</strong> A small family of finishes: onyx, pearl, stone, sage, forest and a touch of
          champagne metal.
        </li>
        <li>
          <strong>Honest technology.</strong> Features explained plainly, never dressed up as measurements.
        </li>
      </ul>
      <h2>What AURAL is not</h2>
      <p>
        There is no company history, factory, founder story or award to tell you about, because none exists. If this
        concept becomes a real business, this page will be rewritten with real information.
      </p>
      <Link className="btn btn-primary" to="/shop">
        Explore the products
      </Link>
    </InfoLayout>
  );
}

export function CreditsPage() {
  usePageMeta('Image credits', 'Sources and licences for the photography used in the AURAL demo store.');
  const used = Object.values(PHOTO_ASSETS).reduce((map, a) => {
    (map[a.pexels] ??= []).push(a);
    return map;
  }, {});
  const renderProducts = products.filter((p) => p.imagery === 'render');
  return (
    <InfoLayout
      eyebrow="Credits"
      title="Image credits"
      lead="Where every image on this site comes from, and under which licence."
    >
      <h2>Photography</h2>
      <p>
        All photographs are from Pexels and used under the <a href={PEXELS_LICENSE}>Pexels License</a>: free for
        commercial and non-commercial use, modification allowed, attribution not required (given here anyway). Each
        photo was checked for visible logos. The products shown are unbranded stand-ins for this fictional concept;
        AURAL did not make them. Photos were cropped and placed on a consistent studio backdrop.
      </p>
      <ul className="credit-list">
        {Object.entries(used).map(([id, assets]) => {
          const src = PHOTO_SOURCES[id];
          const by = PHOTOGRAPHERS[src.by];
          return (
            <li key={id} className="credit">
              <img src={assetSrc(assets[0], 'small')} alt="" width="80" height={assets[0].kind && assets[0].w === 1800 ? 50 : 100} loading="lazy" />
              <span>
                <a href={photoPage(id)}>{src.title}</a> by <a href={by.profile}>{by.name}</a> on Pexels
                <br />
                <span className="fineprint">Used as: {assets.map((a) => a.id).join(', ')}</span>
              </span>
            </li>
          );
        })}
      </ul>
      <h2>Concept renders</h2>
      <p>
        {renderProducts.map((p) => p.name).join(', ')} are shown as concept renders created for this site from procedural
        3D models (three.js). They are labelled “Concept render” wherever they appear and should be replaced with real
        product photography before any commercial use.
      </p>
    </InfoLayout>
  );
}

export function ContactPage() {
  usePageMeta('Contact', 'Contact the AURAL demo store. Contact details are placeholders and the form is not connected.');
  const [values, setValues] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    const found = {};
    if (values.name.trim().length < 2) found.name = 'Enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) found.email = 'Enter an email address like name@example.com.';
    if (values.message.trim().length < 10) found.message = 'Write a message of at least 10 characters.';
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus(`${Object.keys(found).length} field(s) need attention.`);
      document.getElementById(`ct-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setStatus('This form is not connected to any service yet, so nothing was sent. Your message is still in the form.');
  };

  const field = (name, label, Tag = 'input', type = 'text') => (
    <div className="field">
      <label className="field-label" htmlFor={`ct-${name}`}>
        {label}
      </label>
      <Tag
        id={`ct-${name}`}
        className={Tag === 'textarea' ? 'textarea' : 'input'}
        type={Tag === 'input' ? type : undefined}
        name={name}
        value={values[name]}
        onChange={(e) => setValues({ ...values, [name]: e.target.value })}
        aria-invalid={errors[name] ? 'true' : undefined}
        aria-describedby={errors[name] ? `ct-${name}-error` : undefined}
      />
      {errors[name] && (
        <p id={`ct-${name}-error`} className="field-error">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <InfoLayout
      eyebrow="Contact"
      title="Get in touch."
      lead="Questions about the AURAL concept or this demo store."
      aside={
        <dl className="contact-list">
          <div>
            <dt>Email</dt>
            <dd>
              {brand.contact.email} <span className="placeholder-tag-light">placeholder</span>
            </dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>
              {brand.contact.phone} <span className="placeholder-tag-light">placeholder</span>
            </dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>{brand.contact.address}</dd>
          </div>
          <div>
            <dt>Hours</dt>
            <dd>{brand.contact.hours}</dd>
          </div>
        </dl>
      }
    >
      <Placeholder>The contact details are not real, and this form is not connected to an email or form service.</Placeholder>
      <form className="contact-form" noValidate onSubmit={onSubmit}>
        {field('name', 'Name')}
        {field('email', 'Email', 'input', 'email')}
        {field('message', 'Message', 'textarea')}
        <p role="status" className="form-status">
          {status}
        </p>
        <button type="submit" className="btn btn-primary">
          Send message
        </button>
      </form>
    </InfoLayout>
  );
}

const FAQ = [
  ['Can I buy these products?', 'No. AURAL is a fictional concept and this is a frontend demo. The checkout is a demonstration: no order is placed and no payment is taken.'],
  ['Are the specifications real?', 'No. Battery life, noise cancellation, connectivity and durability are illustrative demo specifications. They are not measured, tested or certified.'],
  ['Are the product images photographs?', 'No. Every product image is an original 3D render of a fictional AURAL design, made for this site.'],
  ['Is my bag saved?', 'Yes, in this browser only (localStorage). It is never sent anywhere, and clearing your browser data removes it.'],
  ['What happens to the details I type at checkout?', 'They stay in the page while you use it and are discarded. Nothing is stored or sent. Please do not enter real personal information.'],
  ['Do any products have an IP rating?', 'No. Where a product page mentions splash or sweat resistance, it describes the concept only. No IP rating is claimed.'],
  ['Do you ship internationally?', 'There is no shipping because nothing can be ordered. The shipping page is a placeholder for the store owner to complete.'],
];

export function FaqPage() {
  usePageMeta('FAQ', 'Answers about the AURAL demo store, its products, the bag and the demo checkout.');
  return (
    <InfoLayout eyebrow="FAQ" title="Questions, answered." lead="About the products, this demo store and your data.">
      <div className="faq">
        {FAQ.map(([q, a]) => (
          <details key={q} className="faq-item">
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </InfoLayout>
  );
}

export function ShippingPage() {
  usePageMeta('Shipping', 'Shipping information for the AURAL demo store (placeholder).');
  return (
    <InfoLayout eyebrow="Help" title="Shipping" lead="How delivery would work in a real AURAL store.">
      <Placeholder>
        No orders can be placed, so nothing ships. Delivery regions, costs, carriers and times must be supplied by the
        store owner before launch.
      </Placeholder>
      <h2>To be completed by the owner</h2>
      <ul>
        <li>Countries and regions served</li>
        <li>Delivery options, costs and free-shipping threshold (if any)</li>
        <li>Expected dispatch and delivery times</li>
        <li>Tracking, customs and duties information</li>
      </ul>
    </InfoLayout>
  );
}

export function ReturnsPage() {
  usePageMeta('Returns', 'Returns information for the AURAL demo store (placeholder).');
  return (
    <InfoLayout eyebrow="Help" title="Returns" lead="How returns would work in a real AURAL store.">
      <Placeholder>
        This store sells nothing, so there are no returns. The returns window, conditions, refund method and any
        warranty terms must be written by the store owner and checked against local consumer law.
      </Placeholder>
      <h2>To be completed by the owner</h2>
      <ul>
        <li>Return window and condition of returned items</li>
        <li>How to start a return, and who pays return shipping</li>
        <li>Refund timing and method</li>
        <li>Warranty and faulty-product process</li>
      </ul>
    </InfoLayout>
  );
}

export function PrivacyPage() {
  usePageMeta('Privacy', 'Privacy information for the AURAL demo store (placeholder).');
  return (
    <InfoLayout eyebrow="Legal" title="Privacy" lead="What this demo does with data today.">
      <Placeholder>This is not a privacy policy. A real policy must be written for the real business before launch.</Placeholder>
      <h2>What the demo does today</h2>
      <ul>
        <li>Your bag is stored in your browser&apos;s localStorage so it survives a refresh. It never leaves your device.</li>
        <li>Checkout and contact form details stay in the page while you use it. They are not stored or sent.</li>
        <li>There are no analytics, advertising trackers or cookies.</li>
        <li>Fonts and images are served from this site; no third-party scripts are loaded.</li>
      </ul>
    </InfoLayout>
  );
}

export function TermsPage() {
  usePageMeta('Terms', 'Terms for the AURAL demo store (placeholder).');
  return (
    <InfoLayout eyebrow="Legal" title="Terms" lead="The ground rules of this demo.">
      <Placeholder>These are not terms of sale. Real terms must be prepared for the real business.</Placeholder>
      <h2>About this demo</h2>
      <ul>
        <li>{brand.name} is a fictional concept and a temporary demo name, not a registered brand.</li>
        <li>Products, prices, availability and specifications are illustrative.</li>
        <li>No contract of sale is formed by using the bag or the demo checkout.</li>
      </ul>
    </InfoLayout>
  );
}
