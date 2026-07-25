import { useEffect, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE, canonicalUrl, jsonLdObjects, resolveSeo } from './seo-data';
import { getDynamicSeo, subscribeDynamicSeo } from './dynamic-seo';

/**
 * Keeps document <head> in sync with the current route during client-side
 * navigation (title, description, canonical, robots, Open Graph, Twitter,
 * JSON-LD). Build-time prerendering (see vite.config.ts) writes the correct
 * head into each route's static HTML for crawlers; this component ensures the
 * head stays correct as users navigate within the SPA and when Google renders.
 *
 * Static routes resolve from seo-data.ts; API-driven routes (blog posts, SEO
 * pages) publish their metadata at runtime via dynamic-seo.ts and win over
 * the static fallback for their path.
 */
export function SeoManager() {
  const { pathname } = useLocation();
  const dyn = useSyncExternalStore(subscribeDynamicSeo, () => getDynamicSeo(pathname));

  useEffect(() => {
    const meta = dyn?.meta ?? resolveSeo(pathname);
    const url = canonicalUrl(meta.path);
    const robots = meta.index ? 'index,follow' : 'noindex,follow';
    const ogImage = dyn?.ogImage || SITE.ogImage;

    document.title = meta.title;
    setMeta('name', 'description', meta.description);
    setMeta('name', 'robots', robots);
    setLink('canonical', url);

    setMeta('property', 'og:type', dyn?.ogType ?? 'website');
    setMeta('property', 'og:site_name', SITE.name);
    setMeta('property', 'og:locale', SITE.locale);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:title', meta.title);
    setMeta('property', 'og:description', meta.description);
    setMeta('property', 'og:image', ogImage);

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', meta.title);
    setMeta('name', 'twitter:description', meta.description);
    setMeta('name', 'twitter:image', ogImage);

    // `article:*` meta only exists on article routes — clear stale ones first.
    document.head
      .querySelectorAll('meta[property^="article:"]')
      .forEach((n) => n.remove());
    if (dyn?.ogType === 'article' && dyn.articleMeta) {
      const a = dyn.articleMeta;
      if (a.publishedTime) addMeta('property', 'article:published_time', a.publishedTime);
      if (a.modifiedTime) addMeta('property', 'article:modified_time', a.modifiedTime);
      if (a.author) addMeta('property', 'article:author', a.author);
    }

    // Replace any prior route's JSON-LD with this route's graph.
    document.querySelectorAll('script[data-seo-jsonld]').forEach((n) => n.remove());
    for (const obj of [...jsonLdObjects(meta), ...(dyn?.extraJsonLd ?? [])]) {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute('data-seo-jsonld', '');
      s.textContent = JSON.stringify(obj);
      document.head.appendChild(s);
    }
  }, [pathname, dyn]);

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

/** Append a new meta element without deduplicating. */
function addMeta(attr: 'name' | 'property', key: string, content: string) {
  const el = document.createElement('meta');
  el.setAttribute(attr, key);
  el.setAttribute('content', content);
  document.head.appendChild(el);
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
