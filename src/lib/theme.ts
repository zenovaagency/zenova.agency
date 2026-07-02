import type { Theme } from '@/types/tweaks';
import { TWEAK_DEFAULTS } from '@/config/tweaks';

const STORAGE_KEY = 'zenova-theme';

/** Stored user choice wins; tweak default is only the first-visit fallback. */
export function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch { /* noop */ }
  return TWEAK_DEFAULTS.theme;
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* noop */ }
}
