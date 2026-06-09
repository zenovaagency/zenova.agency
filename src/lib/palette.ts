import type { Palette } from '@/types/tweaks';

export const PALETTES: Record<string, Palette> = {
  'Teal / Purple': ['#35CEBC', '#A837D1', '#D06AEA'],
  'Blue / Violet': ['#3a5bff', '#6d4cff', '#a855f7'],
  'Cyan / Lime': ['#06b6d4', '#10b981', '#a3e635'],
  'Amber / Rose': ['#f59e0b', '#f43f5e', '#ec4899'],
  'Mint / Indigo': ['#2dd4bf', '#06b6d4', '#818cf8'],
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
