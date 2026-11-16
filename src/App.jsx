import { lazy, Suspense, useEffect, useLayoutEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import BagDrawer from './components/BagDrawer.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import { useBag } from './state/bag.jsx';
import { ScrollTrigger } from './lib/gsap.js';

// Store pages are split out so the home page loads less JavaScript.
const ShopPage = lazy(() => import('./pages/ShopPage.jsx'));
const ProductPage = lazy(() => import('./pages/ProductPage.jsx'));
const ComparePage = lazy(() => import('./pages/ComparePage.jsx'));
const BagPage = lazy(() => import('./pages/BagPage.jsx'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage.jsx'));
const info = (name) => lazy(() => import('./pages/InfoPages.jsx').then((m) => ({ default: m[name] })));
const AboutPage = info('AboutPage');
const ContactPage = info('ContactPage');
const FaqPage = info('FaqPage');
const ShippingPage = info('ShippingPage');
const ReturnsPage = info('ReturnsPage');
const PrivacyPage = info('PrivacyPage');
const TermsPage = info('TermsPage');
const CreditsPage = info('CreditsPage');

// Route changes start at the top; hash links (/#technology) scroll to their
// target once the page and its ScrollTriggers have laid out.
function ScrollManager() {
  const { pathname, hash, key } = useLocation();

  useLayoutEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  useEffect(() => {
    if (!hash) return undefined;
    const id = decodeURIComponent(hash.slice(1));
    let tries = 0;
    let frame = 0;
    const go = () => {
      const el = document.getElementById(id);
      if (!el && tries++ < 30) {
        frame = requestAnimationFrame(go);
        return;
      }
      ScrollTrigger.refresh();
      el?.scrollIntoView({ block: 'start' });
    };
    frame = requestAnimationFrame(go);
    return () => cancelAnimationFrame(frame);
    // `key` changes on every navigation, so the same hash link works twice.
  }, [pathname, hash, key]);

  return null;
}

function Announcer() {
  const { announcement } = useBag();
  return (
    <div className="sr-only" role="status" aria-live="polite">
      {announcement}
    </div>
  );
}

function PageFallback() {
  return <div className="page-loading" aria-hidden="true" />;
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Nav />
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/products/:id" element={<ProductPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/bag" element={<BagPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/shipping" element={<ShippingPage />} />
            <Route path="/returns" element={<ReturnsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/credits" element={<CreditsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <BagDrawer />
      <Announcer />
    </>
  );
}
