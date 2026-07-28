import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import './styles/tailwind.css';
import './styles/global.css';
// Imported here rather than from Skeleton.tsx, which is shared between the entry
// and the admin chunk: manualChunks (vite.config.ts) duplicates such modules, and
// Vite then emits their co-located CSS with only one chunk — it landed in admin,
// leaving public skeletons unstyled. The entry module can't be duplicated, so this
// import is the one placement that guarantees .skel ships in the always-loaded CSS.
import './components/ui/Skeleton.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found in index.html');
}

const tree = (
  <StrictMode>
    <App />
  </StrictMode>
);

// scripts/prerender.mjs stamps data-prerendered on #root after filling it with
// server-rendered markup. Hydrating that markup (rather than throwing it away
// with createRoot) is what keeps the crawlable HTML on screen through to
// interactivity — no blank flash, no double paint. The dev server and any
// route that was not prerendered ship an empty #root and mount fresh.
// Checked via the attribute, not hasChildNodes(), because formatting
// whitespace alone would make an empty #root look populated.
if (container.hasAttribute('data-prerendered')) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
