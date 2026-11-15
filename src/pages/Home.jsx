import { Link } from 'react-router-dom';
import Story from '../story/Story.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { products } from '../data/products.js';
import { brand } from '../config/brand.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const PRINCIPLES = [
  {
    n: '01',
    title: 'Listen first',
    body: 'Every concept starts with a recording we know well and a question: what is getting in the way of it?',
  },
  {
    n: '02',
    title: 'Make less',
    body: 'Four models, three finishes each. Fewer things, considered longer, is the whole idea.',
  },
  {
    n: '03',
    title: 'Say only what is true',
    body: 'This is a concept. Where a number appears, it is marked as a demo specification, never a promise.',
  },
];

export default function Home() {
  useDocumentTitle(`${brand.name} | ${brand.tagline}`);
  return (
    <>
      <Story />

      <section id="collection" className="section collection" aria-labelledby="collection-title">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">The collection</p>
            <h2 id="collection-title" className="section-title">
              Four ways to listen.
            </h2>
            <p className="section-lead">
              One design language across four concepts, from the everyday Air to the audio-first Studio. All four are
              demo products with illustrative prices.
            </p>
            <Link className="text-link" to="/compare">
              Compare all four models
            </Link>
          </div>
          <div className="product-grid">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="section brand-story" aria-labelledby="about-title">
        <div className="container brand-grid">
          <div className="brand-intro">
            <p className="eyebrow">About {brand.name}</p>
            <h2 id="about-title" className="section-title">
              A concept, built in the open.
            </h2>
            <p className="section-lead">
              {brand.name} is a fictional studio and a design exercise: what would a pair of earbuds look like if the
              product story, the store and the object were designed as one thing? Nothing here is for sale. Everything
              here was made to be looked at closely.
            </p>
          </div>
          <blockquote className="brand-quote">
            <p>“The best earbuds are the ones you stop noticing. The music is what should stay with you.”</p>
            <footer>Design note, {brand.name} concept</footer>
          </blockquote>
          <ol className="principles">
            {PRINCIPLES.map((p) => (
              <li key={p.n}>
                <span className="principle-n" aria-hidden="true">
                  {p.n}
                </span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
