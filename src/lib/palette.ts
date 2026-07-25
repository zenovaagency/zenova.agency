import type { Palette } from '@/types/tweaks';

export const PALETTES: Record<string, Palette> = {
  'Ember': ['#ff813a', '#ff6b1a', '#ff9a5c'],
};

export function applyPalette(colors: Palette): void {
  const [c1, c2, c3] = colors;
  const root = document.documentElement;
  root.style.setProperty('--accent-1', c1);
  root.style.setProperty('--accent-2', c2);
  root.style.setProperty('--accent-3', c3);
  root.style.setProperty('--grad', `linear-gradient(90deg, ${c1}, ${c2} 50%, ${c3})`);
  root.style.setProperty('--grad-soft', `linear-gradient(135deg, ${c1}30, ${c3}30)`);
}

// ── Ramp derivation ────────────────────────────────────────────────────────
// The accent is stored as a single hex; the UI needs the same 3-stop ramp the
// Ember palette used (base, a darker mid, a lighter tail). We derive it in HSL
// so any base color produces a coherent gradient. The multipliers mirror the
// Ember relationship (#ff813a → #ff6b1a → #ff9a5c): mid ≈ 10% darker, tail ≈
// 14% lighter.

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function normalizeHex(hex: string): string {
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3 || h.length === 4) {
    h = h
      .slice(0, 3)
      .split('')
      .map((c) => c + c)
      .join('');
  }
  return h.slice(0, 6).padEnd(6, '0');
}

function hexToHsl(hex: string): [number, number, number] {
  const h = normalizeHex(hex);
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let hue = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        hue = ((g - b) / d) % 6;
        break;
      case g:
        hue = (b - r) / d + 2;
        break;
      default:
        hue = (r - g) / d + 4;
    }
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  return [hue, s, l];
}

function hslToHex(hDeg: number, s: number, l: number): string {
  const sat = clamp01(s);
  const lig = clamp01(l);
  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const hp = (((hDeg % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r, g, b] =
    hp < 1 ? [c, x, 0]
    : hp < 2 ? [x, c, 0]
    : hp < 3 ? [0, c, x]
    : hp < 4 ? [0, x, c]
    : hp < 5 ? [x, 0, c]
    : [c, 0, x];
  const m = lig - c / 2;
  const to = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** The original Ember base — the fallback when no valid accent is available. */
const DEFAULT_ACCENT = '#ff813a';

/**
 * Turn a single accent hex into the [base, darker mid, lighter tail] ramp.
 * Tolerant of missing/invalid input: a cached brand snapshot from before the
 * `accent` field existed yields `undefined`, so we fall back to the default
 * rather than throwing and taking down the whole app.
 */
export function deriveRamp(base: string): Palette {
  const safe =
    typeof base === 'string' && /^#?[0-9a-fA-F]{3,8}$/.test(base.trim())
      ? base
      : DEFAULT_ACCENT;
  const [h, s, l] = hexToHsl(safe);
  return [safe, hslToHex(h, s, l * 0.9), hslToHex(h, s, l * 1.14)];
}
