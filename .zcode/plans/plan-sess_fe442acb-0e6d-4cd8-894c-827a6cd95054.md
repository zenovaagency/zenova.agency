## Switch the hero background to the given blue CSS gradient

**Goal:** Use your exact 4-layer blue/white `background` spec (blue glow at top center #5E91F9, pale corner washes #C8DDF8/#6E97F9, white base) as the hero background, replacing the GradFlow canvas hero.

**Why the rest of the hero changes with it:** this palette is a *light* background — the current hero's white text, plum veil, and dark fallback were designed for the dark aurora and would be unreadable on white. The text must go back to the site's ink-on-light treatment.

### 1. `src/components/home/Hero.astro` — rewrite
- Replace the GradFlowBg island + `.hero-fallback` + `.hero-veil` with a single `.hero-bg` div carrying your background verbatim (all four layers, exact stops, white base). No canvas → no hydration, no pointer interaction, works with JS disabled.
- Headline back to `text-ink` (ink #0b3558 on the light field), sub-copy `text-ink-soft`, CTAs back to default `primary` + `ghost` variants (they were `light`/white-on-dark).
- Keep: centered layout (badge, headline, sub, CTA row, scroll cue all centered), the scroll-cue animation, and the SplitType reveal attributes.
- Remove the now-dead veil/fallback CSS and their comments.

### 2. `src/islands/GradFlowBg.tsx` — delete
Nothing else references it (cards were reverted earlier; hero no longer uses it). The `gradflow` npm package stays installed — say the word if you want it uninstalled too.

### 3. Verify
- `astro check` (expect 0 errors).
- Home page renders: zero islands, `.hero-bg` present with the exact gradient string, other pages still 200.

**Not touched:** cards, cards.css, data files — everything stays as it was after the earlier revert.