import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE, canonicalUrl, jsonLdObjects, resolveSeo } from './seo-data';

/**
 * Keeps document <head> in sync with the current route during client-side
 * navigation (title, description, canonical, robots, Open Graph, Twitter,
 * JSON-LD). Build-time prerendering (see vite.config.ts) writes the correct
 * head into each route's static HTML for crawlers; this component ensures the
 * head stays correct as users navigate within the SPA and when Google renders.
 */
export function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = resolveSeo(pathname);
    const url = canonicalUrl(meta.path);
    const robots = meta.index ? 'index,follow' : 'noindex,follow';

    document.title = meta.title;
    setMeta('name', 'description', meta.description);
    setMeta('name', 'robots', robots);
    setLink('canonical', url);

    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', SITE.name);
    setMeta('property', 'og:locale', SITE.locale);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:title', meta.title);
    setMeta('property', 'og:description', meta.description);
    setMeta('property', 'og:image', SITE.ogImage);

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', meta.title);
    setMeta('name', 'twitter:description', meta.description);
    setMeta('name', 'twitter:image', SITE.ogImage);

    // Replace any prior route's JSON-LD with this route's graph.
    document.querySelectorAll('script[data-seo-jsonld]').forEach((n) => n.remove());
    for (const obj of jsonLdObjects(meta)) {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute('data-seo-jsonld', '');
      s.textContent = JSON.stringify(obj);
      document.head.appendChild(s);
    }
  }, [pathname]);

  return null;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}
