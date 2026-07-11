import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs';
import { applySeoToTemplate, prerenderRoutes, sitemapXml } from './src/seo/seo-html';

// Build-time SEO prerender: after Vite writes dist/, emit a static HTML file
// per public route (real 200 + crawlable content + unique <head>/JSON-LD) and
// a sitemap.xml. This is what fixes the GitHub Pages SPA problem where deep
// routes returned 404 and crawlers only ever saw an empty #root shell.
function seoPrerenderPlugin(): Plugin {
  return {
    name: 'zenova-seo-prerender',
    apply: 'build',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const templatePath = path.join(distDir, 'index.html');
      if (!fs.existsSync(templatePath)) {
        this.warn('[seo] dist/index.html not found — skipping prerender');
        return;
      }
      const template = fs.readFileSync(templatePath, 'utf8');

      let count = 0;
      for (const meta of prerenderRoutes()) {
        const html = applySeoToTemplate(template, meta);
        const outPath =
          meta.path === '/'
            ? templatePath
            : path.join(distDir, meta.path.replace(/^\//, ''), 'index.html');
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, html);
        count += 1;
      }

      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml());
      // eslint-disable-next-line no-console
      console.log(`[seo] prerendered ${count} routes + sitemap.xml`);
    },
  };
}

// Base path resolution for GitHub Pages.

// GitHub Actions sets GITHUB_REPOSITORY = "owner/repo". A project site is
// served at https://<owner>.github.io/<repo>/, so the build needs base
// `/<repo>/`. A user/org site (repo named `<owner>.github.io`) is served
// from the root, so base stays `/`.
//
// Locally — outside Actions — base is always `/`.
function resolveBase(): string {
  if (!process.env.GITHUB_ACTIONS) {
    return "/";
  }

  const customDomain = process.env.CUSTOM_DOMAIN;

  // Custom domain build
  if (customDomain === "true") {
    return "/";
  }

  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo) {
    return "/";
  }

  const [owner, name] = repo.split("/");

  if (name.toLowerCase() === `${owner.toLowerCase()}.github.io`) {
    return "/";
  }

  return `/${name}/`;
}
const base = resolveBase();
console.log(`[vite] base=${base}`);

export default defineConfig({
  base,
  plugins: [react(), seoPrerenderPlugin()],
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
    sourcemap: true,
  },
});
