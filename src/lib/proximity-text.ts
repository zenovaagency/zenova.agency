/**
 * Cursor-reactive headline.
 *
 * Letters near a fine pointer thicken and lift slightly, then settle back as
 * it moves on — a magnifier for type. Thickening uses -webkit-text-stroke,
 * not font-weight: a weight change alters glyph widths and would reflow the
 * line under the cursor; a stroke does not move a single pixel of layout.
 * Serif accent letters (Instrument Serif has no weight axis) shift toward
 * brand blue instead.
 *
 * Accessibility: the original text is kept in an sr-only copy and the
 * letter spans are aria-hidden, so a screen reader reads one heading, not
 * thirty letters. The entrance is a per-word blur-in; under reduced motion
 * and on touch the headline is left exactly as rendered.
 */
const RADIUS = 130;

export function mountProximityText(el: HTMLElement, area: HTMLElement) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Keep the accessible copy, then rebuild the visible text as spans.
  const label = el.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const sr = document.createElement('span');
  sr.className = 'sr-only';
  sr.textContent = label;

  const visual = document.createElement('span');
  visual.setAttribute('aria-hidden', 'true');
  visual.className = 'pt-visual';
  visual.append(...Array.from(el.childNodes).map((n) => n.cloneNode(true)));

  const chars: HTMLElement[] = [];
  let word = 0;
  const wrap = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      for (const part of (node.textContent ?? '').split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) {
          frag.append(document.createTextNode(' '));
          continue;
        }
        const w = document.createElement('span');
        w.className = 'pt-word';
        w.style.setProperty('--i', String(word++));
        for (const ch of part) {
          const c = document.createElement('span');
          c.className = 'pt-char';
          c.textContent = ch;
          w.append(c);
          chars.push(c);
        }
        frag.append(w);
      }
      node.parentNode?.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName !== 'BR') {
      Array.from(node.childNodes).forEach(wrap);
    }
  };
  Array.from(visual.childNodes).forEach(wrap);

  el.replaceChildren(sr, visual);
  el.dataset.ptReady = '';
  if (!reduced) el.classList.add('pt-enter');

  if (!fine || reduced) return;

  const serif = new Set(chars.filter((c) => c.closest('em')));
  let centres: { x: number; y: number }[] = [];
  const measure = () => {
    centres = chars.map((c) => {
      const r = c.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
  };

  let px = -9999;
  let py = -9999;
  let frame = 0;
  const paint = () => {
    frame = 0;
    chars.forEach((c, i) => {
      const p = centres[i];
      const d = Math.hypot(px - p.x, py - p.y);
      const k = Math.max(0, 1 - d / RADIUS);
      const e = k * k * (3 - 2 * k); // smoothstep falloff
      c.style.setProperty('--k', e.toFixed(3));
      if (serif.has(c)) c.dataset.serif = '';
    });
  };

  area.addEventListener('pointerenter', measure);
  addEventListener('resize', measure, { passive: true });
  addEventListener('scroll', measure, { passive: true });
  area.addEventListener('pointermove', (e) => {
    if (!centres.length) measure();
    px = e.clientX;
    py = e.clientY;
    if (!frame) frame = requestAnimationFrame(paint);
  });
  area.addEventListener('pointerleave', () => {
    px = py = -9999;
    if (!frame) frame = requestAnimationFrame(paint);
  });
}
