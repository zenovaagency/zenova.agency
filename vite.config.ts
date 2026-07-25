import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs';
import { applySeoToTemplate, prerenderRoutes, sitemapXml } from './src/seo/seo-html';
import { SITE, type SeoMeta } from './src/seo/seo-data';

interface ApiBlogListItem {
  slug: string;
  title: string;
  excerpt: string;
  meta_title: string | null;
  meta_description: string | null;
}

interface ApiBlogList {
  items: ApiBlogListItem[];
  total: number;
}

interface ApiSeoPageListItem {
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
}

/**
 * Fetch published blog posts + standalone SEO pages from the API so the build
 * can prerender their HTML and list them in sitemap.xml. Any failure (API
 * down, cold start beyond the timeout, offline build) degrades to the static
 * routes only — runtime SEO still covers the dynamic pages, and the next
 * deploy refreshes the static snapshots.
 */
async function fetchDynamicSeoRoutes(warn: (msg: string) => void): Promise<SeoMeta[]> {
  const apiBase = process.env.VITE_API_URL ?? 'https://api.zenova.agency/api/v1';
  // Render free-tier cold starts can take ~30s — budget generously.
  const getJson = async <T,>(route: string): Promise<T> => {
    const res = await fetch(`${apiBase}${route}`, { signal: AbortSignal.timeout(45_000) });
    if (!res.ok) throw new Error(`GET ${route} -> HTTP ${res.status}`);
    return res.json() as Promise<T>;
  };

  try {
    const routes: SeoMeta[] = [];

    // Published posts, paginated; hard cap keeps a runaway table from stalling CI.
    const pageSize = 50;
    for (let offset = 0; offset < 500; offset += pageSize) {
      const page = await getJson<ApiBlogList>(`/public/blog?limit=${pageSize}&offset=${offset}`);
      for (const p of page.items) {
        routes.push({
          path: `/blog/${p.slug}`,
          title: p.meta_title || `${p.title} | Zenova Blog`,
          description: p.meta_description || p.excerpt || SITE.description,
          h1: p.title,
          intro: p.excerpt,
          index: true,
          changefreq: 'monthly',
          priority: 0.6,
          breadcrumb: [
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: p.title, path: `/blog/${p.slug}` },
          ],
        });
      }
      if (offset + page.items.length >= page.total || page.items.length === 0) break;
    }

    const pages = await getJson<ApiSeoPageListItem[]>('/public/pages');
    for (const p of pages) {
      routes.push({
        path: `/${p.slug}`,
        title: p.meta_title || `${p.title} | ${SITE.name}`,
        description: p.meta_description || SITE.description,
        h1: p.title,
        intro: '',
        index: true,
        changefreq: 'monthly',
        priority: 0.7,
        breadcrumb: [
          { name: 'Home', path: '/' },
          { name: p.title, path: `/${p.slug}` },
        ],
      });
    }

    return routes;
  } catch (err) {
    warn(
      `[seo] dynamic route fetch failed (${err instanceof Error ? err.message : String(err)}) — ` +
        'prerendering static routes only; the next deploy picks up API content',
    );
    return [];
  }
}

function seoPrerenderPlugin(): Plugin {
  return {
    name: 'zenova-seo-prerender',
    apply: 'build',
    async closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const templatePath = path.join(distDir, 'index.html');
      if (!fs.existsSync(templatePath)) {
        this.warn('[seo] dist/index.html not found — skipping prerender');
        return;
      }
      const template = fs.readFileSync(templatePath, 'utf8');
      const dynamic = await fetchDynamicSeoRoutes((msg) => this.warn(msg));
      let count = 0;
      for (const meta of [...prerenderRoutes(), ...dynamic]) {
        const html = applySeoToTemplate(template, meta);
        const outPath =
          meta.path === '/'
            ? templatePath
            : path.join(distDir, meta.path.replace(/^\//, ''), 'index.html');
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, html);
        count += 1;
      }
      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml(dynamic));
      console.log(`[seo] prerendered ${count} routes (${dynamic.length} from API) + sitemap.xml`);
    },
  };
}

function resolveBase(): string {
  if (!process.env.GITHUB_ACTIONS) {
    return '/';
  }
  const customDomain = process.env.CUSTOM_DOMAIN;
  if (customDomain === 'true') {
    return '/';
  }
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo) {
    return '/';
  }
  const [owner, name] = repo.split('/');
  if (name.toLowerCase() === `${owner.toLowerCase()}.github.io`) {
    return '/';
  }
  return `/${name}/`;
}
const base = resolveBase();

function stripUnusedPreloads(): Plugin {
  return {
    name: 'strip-unused-preloads',
    enforce: 'post',
    apply: 'build',
    transformIndexHtml(html) {
      // Lazy-loaded routes (admin portals, legal, below-fold home sections) and their vendor
      // chunks should not be eagerly modulepreloaded on the critical path.
      return html.replace(
        /<link rel="(?:modulepreload|stylesheet)"[^>]*href="[^"]*\/(?:admin|client|team|vendor-pdf|vendor-admin-ui|vendor-legal|vendor-motion|Work-|testimonials-demo-|FAQ-|CTA-)[^"]*"[^>]*>\s*/g,
        '',
      );
    },
  };
}

export default defineConfig({
  base,
  plugins: [
    react(),
    stripUnusedPreloads(),
    seoPrerenderPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    allowedHosts: true,
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) {
              return 'vendor-motion';
            }
            if (id.includes('lenis')) {
              return 'vendor-lenis';
            }
            if (id.includes('@babel/runtime')) {
              return 'vendor-babel';
            }
            if (
              id.includes('jspdf') ||
              id.includes('html2canvas') ||
              id.includes('canvg') ||
              id.includes('pako') ||
              id.includes('fflate') ||
              id.includes('fast-png') ||
              id.includes('iobuffer') ||
              id.includes('css-line-break') ||
              id.includes('text-segmentation') ||
              id.includes('utrie') ||
              id.includes('rgbcolor') ||
              id.includes('stackblur-canvas') ||
              id.includes('svg-pathdata') ||
              id.includes('raf') ||
              id.includes('regenerator-runtime') ||
              id.includes('core-js')
            ) {
              return 'vendor-pdf';
            }
            if (id.includes('react-router') || id.includes('@remix-run')) {
              return 'vendor-router';
            }
            if (id.includes('dompurify')) {
              return 'vendor-legal';
            }
            if (
              id.includes('@radix-ui') ||
              id.includes('class-variance-authority') ||
              id.includes('clsx')
            ) {
              return 'vendor-admin-ui';
            }
            return 'vendor';
          }
          if (id.includes('/admin/')) {
            return 'admin';
          }
          if (id.includes('/client/')) {
            return 'client';
          }
          if (id.includes('/team/')) {
            return 'team';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
