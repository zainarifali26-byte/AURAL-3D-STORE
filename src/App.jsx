import { useEffect, useLayoutEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import BagDrawer from './components/BagDrawer.jsx';
import Home from './pages/Home.jsx';
import ProductPage from './pages/ProductPage.jsx';
import ComparePage from './pages/ComparePage.jsx';
import BagPage from './pages/BagPage.jsx';
import NotFound from './pages/NotFound.jsx';
import { useBag } from './state/bag.jsx';
import { ScrollTrigger } from './lib/gsap.js';

// Route changes start at the top; hash links (/#collection) scroll to their
// target once the page and its ScrollTriggers have laid out.
function ScrollManager() {
  const { pathname, hash, key } = useLocation();

  useLayoutEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);


  useEffect(() => {
    if (!hash) return undefined;
    const id = decodeURIComponent(hash.slice(1));
    const frame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      document.getElementById(id)?.scrollIntoView({ block: 'start' });
    });
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

export default function App() {
  return (
    <>
      <ScrollManager />
      <Nav />
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/bag" element={<BagPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <BagDrawer />
      <Announcer />
    </>
  );
}
