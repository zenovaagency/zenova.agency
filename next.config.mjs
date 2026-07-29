/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Every URL Google has indexed carries a trailing slash: canonicalUrl() in
  // src/seo/seo-data.ts emits them, because GitHub Pages used to 301 /about to
  // /about/. Keeping them identical through the host migration is what makes
  // the DNS cutover an SEO non-event — without this every indexed URL would
  // 308 to a new address on the same day the host changes.
  trailingSlash: true,

  eslint: {
    // Lint is a separate CI step (`npm run lint`); running it again inside the
    // build only doubles the time and can fail a deploy for a style nit.
    ignoreDuringBuilds: true,
  },

  /**
   * Permanent URL moves, expressed at the routing layer.
   *
   * These were client-side `<Navigate>` elements in the old app, which meant a
   * crawler asking for /process got 200 OK and an empty shell, then had to run
   * JavaScript to discover the page had moved — so the URL stayed in the index
   * as a thin duplicate instead of consolidating into /services.
   *
   * They are here rather than in page components deliberately: a Server
   * Component calling redirect() answers 307/308 *without a Location header*
   * for a plain document request, which no crawler and no browser can follow.
   * next.config redirects are handled before rendering and emit a real header.
   *
   * `permanent: true` -> 308, which preserves the method and, unlike 302, tells
   * search engines to transfer ranking signals to the target.
   */
  async redirects() {
    return [
      { source: '/process', destination: '/services', permanent: true },
      // Every historical entry point to the dashboards funnels to one login.
      { source: '/signin', destination: '/login', permanent: true },
      { source: '/admin/login', destination: '/login', permanent: true },
      { source: '/team/login', destination: '/login', permanent: true },
      { source: '/client/login', destination: '/login', permanent: true },
    ];
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // src/lib/sanitize.ts and src/lib/dom.ts require('jsdom') to get a DOM
      // under Node. Those branches are guarded by `typeof window === 'undefined'`
      // and are unreachable in the browser, but webpack still resolves the
      // specifier when it bundles the module — and jsdom is a ~50 MB Node-only
      // package that does not build for the web. Aliasing it away makes the
      // dead branch resolve to an empty module instead.
      config.resolve.alias = { ...config.resolve.alias, jsdom: false };
    }
    return config;
  },
};

export default nextConfig;
