import { lazy, Suspense, useEffect, useLayoutEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import BagDrawer from './components/BagDrawer.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import Cursor from './components/Cursor.jsx';
import Preloader from './components/Preloader.jsx';
import { useBag } from './state/bag.jsx';
import { ScrollTrigger } from './lib/gsap.js';
import { startSmoothScroll, scrollToTarget, setScrollLocked } from './lib/smooth.js';

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
    if (!hash) scrollToTarget(0, { immediate: true });
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
      if (el) scrollToTarget(el, { immediate: tries > 0 });
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

// Pause smooth scrolling while a modal or the mobile menu is open.
function ScrollLock() {
  const { open } = useBag();
  useEffect(() => {
    const update = () => setScrollLocked(open || document.body.classList.contains('menu-open') || Boolean(document.querySelector('dialog[open]')));
    update();
    // Only dialog `open` attributes (anywhere) and the body's own class matter.
    const dialogs = new MutationObserver(update);
    dialogs.observe(document.body, { attributes: true, attributeFilter: ['open'], subtree: true });
    const body = new MutationObserver(update);
    body.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => {
      dialogs.disconnect();
      body.disconnect();
    };
  }, [open]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();
  const [introDone, setIntroDone] = useState(pathname !== '/');
  useEffect(() => {
    startSmoothScroll();
  }, []);
  return (
    <>
      {pathname === '/' && !introDone && <Preloader onDone={() => setIntroDone(true)} />}
      <Cursor />
      <ScrollManager />
      <ScrollLock />
      <Nav />
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home introDone={introDone} />} />
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
