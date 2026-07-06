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
      colors: {
        background: "var(--bg)",
        foreground: "var(--fg)",
        border: "var(--line)",
        primary: {
          DEFAULT: "#ff813a",
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
        ring: "#ff813a",
      },
      borderColor: {
        DEFAULT: "var(--line)",
      },
    },
  },
  plugins: [],
};
