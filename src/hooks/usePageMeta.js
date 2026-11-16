import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { brand } from '../config/brand.js';

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Per-page title, description, Open Graph tags and canonical URL. The
 * canonical and og:url are written only once brand.siteUrl is configured.
 */
export default function usePageMeta(title, description = brand.description, image) {
  const { pathname } = useLocation();
  useEffect(() => {
    const fullTitle = title.includes(brand.name) ? title : `${title} | ${brand.name}`;
    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    const url = brand.siteUrl ? `${brand.siteUrl}${pathname}` : '';
    setCanonical(url);
    if (url) setMeta('property', 'og:url', url);
    if (brand.siteUrl && image) setMeta('property', 'og:image', `${brand.siteUrl}${image}`);
  }, [title, description, image, pathname]);
}
