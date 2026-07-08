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
| Custom domain | Set `BASE_PATH` repository variable to `/` |
| Local `npm run build` | `/` |

The resolved base is logged as `[vite] base=…` during build.

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
for `[vite] base=…`. It should print `/<repo>/` for a project site. If it
prints `/`, check that the `BASE_PATH` repository variable isn't overriding it.

**Deep links 404 on refresh**
The Pages site is missing `404.html`. Verify `dist/404.html` exists after
the build — it ships from `public/404.html`. Also check that the
`base-segments` auto-detection is correct for your deployment.
