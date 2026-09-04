import { GradFlow } from 'gradflow';

/*
 * Animated hero background.
 *
 * The three colors are the light ramp of the site palette (paper,
 * sky-soft, sky). GradFlow's `animated` shader fills the whole canvas and
 * then applies a contrast-boosting curve, so any saturated brand blue in
 * the mix would sink the field below the ~8:1 the ink headline relies on;
 * the light ramp keeps every frame pale enough for `--color-ink` text.
 *
 * GradFlow pauses itself for reduced-motion users, hidden tabs, and
 * offscreen scrolls, and sizes its canvas to its parent element — Astro's
 * <astro-island> wrapper has no box of its own, so this component supplies
 * one that spans the absolutely-positioned .hero-bg holding the static
 * CSS fallback.
 */
export default function HeroGradient() {
  return (
    <div className="absolute inset-0">
      <GradFlow
        config={{
          type: 'animated',
          color1: '#f6f9ff',
          color2: '#bfe0ff',
          color3: '#6fb6ff',
          speed: 0.9,
          scale: 1.2,
          noise: 0.06,
        }}
      />
    </div>
  );
}
