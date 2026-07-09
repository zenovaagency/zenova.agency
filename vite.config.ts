import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Base path resolution for GitHub Pages.

// GitHub Actions sets GITHUB_REPOSITORY = "owner/repo". A project site is
// served at https://<owner>.github.io/<repo>/, so the build needs base
// `/<repo>/`. A user/org site (repo named `<owner>.github.io`) is served
// from the root, so base stays `/`.
//
// Locally — outside Actions — base is always `/`.
function resolveBase(): string {
  if (process.env.BASE_PATH) {
    const base = process.env.BASE_PATH;
    return base.endsWith("/") ? base : base + "/";
  }

  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo || !process.env.GITHUB_ACTIONS) return "/";

  const [owner, name] = repo.split("/");

  // User/Org Pages
  if (name.toLowerCase() === `${owner.toLowerCase()}.github.io`) {
    return "/";
  }

  return `/${name}/`;
}

const base = resolveBase();
console.log(`[vite] base=${base}`);

export default defineConfig({
  base,
  plugins: [react()],
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
