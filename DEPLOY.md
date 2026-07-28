# Deploying to GitHub Pages

The site auto-deploys to GitHub Pages from `main` via `.github/workflows/deploy.yml`.

## One-time setup

1. Open the repo on GitHub → **Settings** → **Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab).

That's it. The site lives at `https://<owner>.github.io/<repo>/`.

## How the base path is resolved

`vite.config.ts` auto-detects the base from the CI environment:

| Environment | Base |
|---|---|
| Project site on GitHub Pages (e.g. `owner/repo`) | `/<repo>/` |
| User/org site (`owner/owner.github.io`) | `/` |
| Custom domain | Set env `CUSTOM_DOMAIN: "true"` (deploy.yml already does) | 
| Local `npm run build` | `/` |

The resolved base is logged as `[vite] base=…` during build.

> This project deploys to the custom domain `zenova.agency`, so `deploy.yml`
> sets `CUSTOM_DOMAIN: "true"` and the base is `/`. There is deliberately no
> `public/CNAME`; the domain is configured in **Settings → Pages**. If that
> setting is ever cleared, the domain and every root-absolute asset break
> together.

## Build pipeline

`npm run build` is three sequential steps — all three must succeed:

```
tsc --noEmit          type check
vite build            client bundle  -> dist/         (SPA shell + assets)
vite build --ssr …    server bundle  -> dist-ssr/     (Node build of entry-server.tsx)
node scripts/prerender.mjs           -> dist/**/index.html + sitemap.xml
```

The third step server-renders every route with `react-dom/server` and writes the
resulting HTML into `dist/<route>/index.html`, so GitHub Pages serves complete,
crawlable markup with no JavaScript required. `src/main.tsx` then calls
`hydrateRoot()` on that markup instead of `createRoot()`.

`scripts/prerender.mjs` **fails the build** if a route cannot render or if the
homepage comes out empty — shipping an empty `<div id="root">` is the exact
regression this pipeline exists to prevent. The workflow re-checks the same
invariants in its *Verify build output* step.

The prerenderer also fetches blog posts and admin-authored SEO pages from
`VITE_API_URL` so they get static HTML and sitemap entries. That single step is
allowed to fail softly: if the API is down the build still succeeds with the
static routes only, and prints a `[prerender] WARNING` you can find in the log.

> Running `node scripts/prerender.mjs` twice without re-running `vite build`
> in between fails on purpose. `dist/index.html` is both the template and the
> homepage output, so a second pass would feed already-prerendered HTML back in
> and every route would ship the homepage body. Re-run `npm run build:client`
> first.

## SPA deep links (`/work/foo`, `/services/web`, etc.)

GitHub Pages doesn't natively support SPA routes. We use a two-file trick:

- `public/404.html` catches the 404, encodes the deep path into a query
  string, and redirects to the project root.
- `index.html` has a tiny script that decodes the query back into a real path
  before React Router boots.

The base path is auto-detected at runtime: on `*.github.io` hosts the first
path segment is treated as the repo prefix (keep=1); on custom domains there
is no prefix (keep=0). If the auto-detection gives the wrong result, set the
`base-segments` meta tag in both `index.html` and `404.html`:

```html
<meta name="base-segments" content="0" />
<!-- 0 = custom domain / user site, 1 = project site (default) -->
```

## Troubleshooting

**"Failed to load module script … application/octet-stream"**
Pages is serving raw source. Set **Source → GitHub Actions** as above and
re-run the workflow.

**Assets 404 at `/assets/index-XXX.js`**
The base path didn't make it into the build. Look at the workflow run log
for `[vite] base=…`. It should print `/<repo>/` for a project site and `/`
for a custom domain. If a project site prints `/`, check that
`CUSTOM_DOMAIN` isn't set to `"true"` in `deploy.yml`.

**Deep links 404 on refresh**
The Pages site is missing `404.html`. Verify `dist/404.html` exists after
the build — it ships from `public/404.html`. Also check that the
`base-segments` auto-detection is correct for your deployment.

**`curl https://zenova.agency` returns an empty `<div id="root"></div>`**
The prerender step didn't run or didn't take effect. Check the Actions log for
the `[prerender] N routes …` line. If it is missing, the build failed before
step 3; if it is present but the HTML is still empty, `dist/index.html` was
overwritten after prerendering.

**A page renders the homepage body under its own URL**
The shell was reused as a prerender template — see the note in *Build
pipeline*. Run a clean `npm run build`. CI guards this by diffing
`dist/about/index.html` against `dist/index.html`.
