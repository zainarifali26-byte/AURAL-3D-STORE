import { Link } from 'react-router-dom';
import Story from '../story/Story.jsx';
import ProductCard from '../components/ProductCard.jsx';
import ProductImage from '../components/ProductImage.jsx';
import Icon from '../components/Icon.jsx';
import { products, getProduct, CATEGORIES } from '../data/products.js';
import { features } from '../data/features.js';
import { brand, formatPrice } from '../config/brand.js';
import usePageMeta from '../hooks/usePageMeta.js';

const proX = getProduct('pro-x');
const studio = getProduct('studio');
const newArrivals = products.filter((p) => p.badges.includes('new')).sort((a, b) => b.released - a.released);
const bestSellers = products.filter((p) => p.badges.includes('bestseller'));

const CATEGORY_LOOK = {
  earbuds: { product: 'air', colour: 'ice', tone: 'ice' },
  sport: { product: 'sport', colour: 'mint', tone: 'mint' },
  headphones: { product: 'studio', colour: 'teal', tone: 'teal' },
};

function Technology() {
  return (
    <section id="technology" className="section tech" aria-labelledby="tech-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Technology</p>
          <h2 id="tech-title" className="section-title">
            Ten things your earbuds should do well.
          </h2>
          <p className="section-lead">
            The feature categories across the AURAL range, explained plainly. Each tile lists the demo models that
            include it. Descriptions are illustrative, not measured specifications.
          </p>
        </div>
        <ul className="tech-grid">
          {features.map((f) => (
            <li key={f.id} className={`tech-tile${f.size ? ` tech-${f.size}` : ''}`}>
              {f.size === 'xl' && (
                <div className="tech-media" aria-hidden="true">
                  <img
                    src="/products/pro-x-onyx-gold-buds-1200.webp"
                    srcSet="/products/pro-x-onyx-gold-buds-600.webp 600w, /products/pro-x-onyx-gold-buds-1200.webp 1200w"
                    sizes="(max-width: 760px) 90vw, 40vw"
                    alt=""
                    width="1200"
                    height="1000"
                    loading="lazy"
                  />
                </div>
              )}
              <span className="tech-icon">
                <Icon name={f.icon} size={22} />
              </span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
              <p className="tech-models">
                <span className="sr-only">Available on: </span>
                {f.models.length === products.length ? 'All models' : f.models.join(' · ')}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Featured() {
  const colour = proX.colours[0];
  return (
    <article className="featured on-dark" aria-labelledby="featured-title">
      <div className="featured-media">
        <ProductImage product={proX} colour={colour} view="hero" sizes="(max-width: 900px) 92vw, 55vw" />
      </div>
      <div className="featured-body">
        <p className="eyebrow">Featured · Flagship concept</p>
        <h3 id="featured-title" className="featured-title">
          {proX.name}
        </h3>
        <p className="featured-text">{proX.description}</p>
        <ul className="featured-points">
          {proX.features.slice(0, 3).map((f) => (
            <li key={f}>
              <Icon name="check" size={16} />
              {f}
            </li>
          ))}
        </ul>
        <p className="featured-price">
          {formatPrice(proX.price)} <span className="price-note">demo price</span>
        </p>
        <div className="featured-actions">
          <Link className="btn btn-primary" to={`/products/${proX.id}`}>
            Shop {proX.name}
          </Link>
          <Link className="btn btn-ghost" to="/compare">
            Compare models
          </Link>
        </div>
      </div>
    </article>
  );
}

function Collection() {
  return (
    <section id="collection" className="section collection" aria-labelledby="collection-title">
      <div className="container">
        <div className="section-head-row">
          <div className="section-head">
            <p className="eyebrow">The collection</p>
            <h2 id="collection-title" className="section-title">
              Eight ways to listen.
            </h2>
            <p className="section-lead">
              True wireless, sport and over-ear concepts in one design language. All products and prices are demo
              information.
            </p>
          </div>
          <Link className="btn btn-ghost" to="/shop">
            Shop all {products.length}
            <Icon name="arrow" size={18} />
          </Link>
        </div>

        <Featured />

        <ul className="category-grid" aria-label="Shop by category">
          {CATEGORIES.map((c) => {
            const look = CATEGORY_LOOK[c.id];
            const p = getProduct(look.product);
            const count = products.filter((x) => x.category === c.id).length;
            return (
              <li key={c.id}>
                <Link to={`/shop?category=${c.id}`} className="category-tile" data-tone={look.tone}>
                  <span className="category-text">
                    <span className="category-name">{c.name}</span>
                    <span className="category-meta">
                      {c.blurb} {count} {count === 1 ? 'model' : 'models'}.
                    </span>
                  </span>
                  <img
                    src={`/products/${p.id}-${look.colour}-hero-600.webp`}
                    alt=""
                    width="600"
                    height="500"
                    loading="lazy"
                  />
                  <span className="category-arrow" aria-hidden="true">
                    <Icon name="arrow" size={18} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="row-head">
          <h3 className="row-title">New arrivals</h3>
          <Link className="text-link" to="/shop?sort=newest">
            See newest
          </Link>
        </div>
        <ul className="card-row" aria-label="New arrivals">
          {newArrivals.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} sizes="(max-width: 760px) 80vw, 30vw" headingLevel={4} />
            </li>
          ))}
        </ul>

        <div className="row-head">
          <h3 className="row-title">Best sellers</h3>
          <p className="fineprint">Demo label, not based on real sales.</p>
        </div>
        <ol className="bestsellers">
          {bestSellers.map((p, i) => {
            const colour = p.colours[0];
            return (
              <li key={p.id} className="bestseller">
                <span className="bestseller-rank" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="bestseller-media" data-tone={colour.tone}>
                  <ProductImage product={p} colour={colour} sizes="(max-width: 760px) 40vw, 220px" />
                </div>
                <div className="bestseller-body">
                  <h4 className="bestseller-name">
                    <Link to={`/products/${p.id}`}>{p.name}</Link>
                  </h4>
                  <p>{p.tagline}</p>
                </div>
                <p className="price bestseller-price">{formatPrice(p.price)}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function BrandStory() {
  return (
    <section id="story" className="section brand-story" aria-labelledby="brand-title">
      <div className="container brand-grid">
        <div className="brand-intro">
          <p className="eyebrow">About {brand.name}</p>
          <h2 id="brand-title" className="brand-statement">
            We design for the moment the music starts and everything else goes quiet.
          </h2>
        </div>
        <div className="brand-copy">
          <p className="section-lead">
            {brand.name} is a design concept for everyday listening: headphones and earbuds that look considered, feel
            light and get out of the way. This store is a frontend demo. There is no factory, no back catalogue and no
            awards to show you, only the products and the ideas behind them.
          </p>
          <Link className="text-link" to="/about">
            Read about the concept
            <Icon name="arrow" size={18} />
          </Link>
        </div>
        <ul className="brand-pillars">
          <li>
            <h3>Audio</h3>
            <p>Tuned for detail and voices, at volumes that are kind to your ears.</p>
          </li>
          <li>
            <h3>Design</h3>
            <p>A small set of shapes, finishes and colours, used the same way everywhere.</p>
          </li>
          <li>
            <h3>Technology</h3>
            <p>Features that earn their place, explained without jargon.</p>
          </li>
          <li>
            <h3>Everyday</h3>
            <p>Made for commutes, desks, runs and long flights, not for a lab.</p>
          </li>
        </ul>
        <div className="brand-images" aria-hidden="true">
          <div className="brand-img brand-img-a" data-tone="teal">
            <img src="/products/studio-teal-side-600.webp" alt="" width="600" height="500" loading="lazy" />
          </div>
          <div className="brand-img brand-img-b" data-tone="mint">
            <img src="/products/air-mint-hero-600.webp" alt="" width="600" height="500" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  const colour = studio.colours[0];
  return (
    <section className="final-cta" aria-labelledby="final-title">
      <p className="final-word" aria-hidden="true">
        LISTEN
      </p>
      <div className="container final-grid">
        <div className="final-copy">
          <p className="eyebrow">Find your pair</p>
          <h2 id="final-title" className="section-title">
            From pocket-sized to full-size.
          </h2>
          <p className="section-lead">Compare all eight concepts side by side, or start with the one you like the look of.</p>
          <div className="final-actions">
            <Link className="btn btn-primary" to="/shop">
              Shop now
            </Link>
            <Link className="btn btn-ghost" to="/compare">
              Compare models
            </Link>
          </div>
        </div>
        <div className="final-media">
          <ProductImage product={studio} colour={colour} sizes="(max-width: 900px) 90vw, 50vw" />
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  usePageMeta(
    `${brand.name} | ${brand.tagline}`,
    'AURAL is a fictional premium headphones and earbuds concept: a cinematic 3D product story and a demo store with eight illustrative products.',
  );
  return (
    <>
      <Story />
      <Technology />
      <Collection />
      <BrandStory />
      <FinalCta />
    </>
  );
}
