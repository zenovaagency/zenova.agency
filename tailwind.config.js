/** @type {import('tailwindcss').Config} */
export default {
  // Project theme is driven by the `data-theme` attribute on <html> (see
  // index.html / global.css), not the `.dark` class — so map Tailwind's
  // `dark:` variant onto it. This lets the hero-01 block's dark styles work.
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Canonical layout breakpoints, mirrored from global.css: 1024/768/640/480.
      // Tailwind's defaults already are sm:640 md:768 lg:1024 xl:1280, so only
      // `xs` is new — redefining theme.screens wholesale would silently retarget
      // the existing `md:` usages in the testimonials components.
      screens: { xs: "480px" },
      maxWidth: { container: "1280px" },
      // The fluid spacing scale, so Tailwind utilities and hand-written CSS
      // draw from the same tokens.
      spacing: {
        gutter: "var(--gutter)",
        "section-y": "var(--section-y)",
        "page-top": "var(--page-top)",
      },
      colors: {
        background: "var(--bg)",
        foreground: "var(--fg)",
        border: "var(--line)",
        primary: {
          DEFAULT: "var(--accent-1)",
          foreground: "#fff",
        },
        destructive: {
          DEFAULT: "var(--adm-danger-text)",
          foreground: "#fff",
        },
        muted: {
          DEFAULT: "var(--card)",
          foreground: "var(--fg-dim)",
        },
        accent: {
          DEFAULT: "var(--card-hover)",
          foreground: "var(--fg)",
        },
        secondary: {
          DEFAULT: "var(--card)",
          foreground: "var(--fg)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--fg)",
        },
        input: "var(--line)",
        ring: "var(--accent-1)",
      },
      borderColor: {
        DEFAULT: "var(--line)",
      },
    },
  },
  plugins: [],
};
