import SplitType from 'split-type';
import { motion } from './scroll';
import { DUR, EASE } from './motion';

// The real GSAP type, so gsap.utils.toArray<T>() keeps its type argument.
type Gsap = (typeof import('gsap'))['gsap'];

/**
 * Wires the three scroll-entry treatments used across the page:
 *
 *   [data-reveal]  fade-up 24px + scale 0.98 -> 1, fires once
 *   [data-split]   headline line-mask reveal (SplitType)
 *   [data-count]   number count-up
 *
 * Under reduced motion each one is set straight to its final state.
 */
export async function initReveals() {
  const { gsap, reduced } = await motion();

  revealBlocks(gsap, reduced);
  countUps(gsap, reduced);
  await splitHeadlines(gsap, reduced);
}

function revealBlocks(gsap: Gsap, reduced: boolean) {
  const els = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  if (!els.length) return;

  if (reduced) {
    gsap.set(els, { opacity: 1, y: 0, scale: 1, clearProps: 'willChange' });
    return;
  }

  els.forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 24, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: DUR.section,
        ease: EASE,
        delay: Number(el.dataset.revealDelay ?? 0),
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        // will-change is a promise to the compositor, not a decoration.
        // Release it the moment the animation is done.
        onComplete: () => {
          el.style.willChange = 'auto';
        },
      },
    );
  });
}

/**
 * Splits a headline into lines, wraps each in an overflow-hidden block, and
 * slides the inner span up from below.
 *
 * Waits on `document.fonts.ready` first — splitting before the webfont lands
 * measures the fallback metrics and breaks lines in the wrong places.
 */
async function splitHeadlines(gsap: Gsap, reduced: boolean) {
  const els = gsap.utils.toArray<HTMLElement>('[data-split]');
  if (!els.length) return;

  if (document.fonts?.ready) await document.fonts.ready;

  els.forEach((el) => {
    const play = () => {
      const split = new SplitType(el, { types: 'lines', lineClass: 'split-line' });
      const inners = (split.lines ?? []).map((line) => {
        const inner = document.createElement('span');
        inner.className = 'split-inner';
        while (line.firstChild) inner.appendChild(line.firstChild);
        line.appendChild(inner);
        return inner;
      });

      el.dataset.splitReady = 'true';

      if (reduced) {
        gsap.set(inners, { y: '0%' });
        return split;
      }

      gsap.fromTo(
        inners,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: DUR.hero,
          ease: EASE,
          stagger: 0.08,
          delay: Number(el.dataset.splitDelay ?? 0),
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          onComplete: () => inners.forEach((i) => (i.style.willChange = 'auto')),
        },
      );
      return split;
    };

    let split = play();

    // Re-splitting on a width change keeps line breaks honest. The reveal has
    // already played by then, so the new lines are placed at their end state.
    let last = window.innerWidth;
    let timer: number;
    window.addEventListener('resize', () => {
      if (window.innerWidth === last) return; // ignore mobile URL-bar resizes
      last = window.innerWidth;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        split.revert();
        split = play();
        gsap.set(el.querySelectorAll('.split-inner'), { yPercent: 0 });
      }, 180);
    });
  });
}

/**
 * Counts a number up on entry. Reads the finished string from the markup
 * (e.g. "<1.2s", "3.4x", "73%") so the non-JS render is already correct and
 * the prefix/suffix survive.
 */
function countUps(gsap: Gsap, reduced: boolean) {
  const els = gsap.utils.toArray<HTMLElement>('[data-count]');
  if (!els.length || reduced) return;

  els.forEach((el) => {
    const raw = (el.textContent ?? '').trim();
    const match = raw.match(/^([^\d]*)([\d.,]+)(.*)$/s);
    if (!match) return;

    const [, prefix, digits, suffix] = match;
    const target = parseFloat(digits.replace(/,/g, ''));
    if (!Number.isFinite(target)) return;

    const decimals = (digits.split('.')[1] ?? '').length;
    const obj = { n: 0 };

    gsap.to(obj, {
      n: target,
      duration: 0.9,
      ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => {
        el.textContent = `${prefix}${obj.n.toFixed(decimals)}${suffix}`;
      },
      onComplete: () => {
        el.textContent = raw; // restore the exact authored string
      },
    });
  });
}
