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
