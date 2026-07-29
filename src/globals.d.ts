/**
 * Ambient declarations that used to come from `vite/client` via
 * src/vite-env.d.ts, which the migration removed.
 *
 * Next's own next-env.d.ts types the CSS imports it handles, but not a dynamic
 * `import('lenis/dist/lenis.css')` — see src/hooks/useSmoothScroll.ts, which
 * loads Lenis and its stylesheet together and only on pointer devices.
 */
declare module '*.css';
