import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

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
// Printed so a broken deploy can be diagnosed from the Actions log alone —
// wrong-base builds show up as 404s on every /assets/* request. DEPLOY.md
// points here.
console.log(`[vite] base=${base}`);

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

/**
 * Node build of src/entry-server.tsx, consumed by scripts/prerender.mjs.
 * Deliberately does NOT inherit the client's manualChunks/hashed filenames:
 * the prerender script imports this by a fixed path, and code-splitting a
 * server bundle buys nothing.
 */
const SSR_BUILD = {
  ssr: 'src/entry-server.tsx',
  outDir: 'dist-ssr',
  target: 'es2022' as const,
  emptyOutDir: true,
  minify: false as const,
  sourcemap: false as const,
  rollupOptions: {
    output: {
      format: 'esm' as const,
      entryFileNames: 'entry-server.js',
    },
  },
};

export default defineConfig(({ isSsrBuild }) => ({
  base,
  plugins: [
    react(),
    // Client-only: rewrites tags in index.html, which the SSR build never emits.
    ...(isSsrBuild ? [] : [stripUnusedPreloads()]),
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
  build: isSsrBuild ? SSR_BUILD : {
    target: 'es2022',
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: true,
    // Lets scripts/prerender.mjs map a route's page module to its built chunk
    // and emit a per-route modulepreload.
    manifest: true,
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
}));
