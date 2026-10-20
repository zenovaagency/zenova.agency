/**
 * Image viewer — the behaviour behind components/ui/ImageViewer.astro.
 *
 * Any element with [data-viewer] opens the page's one viewer dialog with the
 * image named by its data attributes:
 *
 *   data-viewer-src   the largest available rendition
 *   data-viewer-alt   used as the caption and the image's alt text
 *   data-viewer-w/h   natural size, so the layout is right before it loads
 *
 * The image opens fitted to the screen, whole and uncropped. From there it
 * zooms with the wheel, a pinch, a double-click or double-tap (about the
 * pointer), the toolbar or + / − / 0, and pans by dragging or with the arrow
 * keys. Panning is clamped so an edge never pulls away from the frame, and an
 * image smaller than the frame stays centred.
 *
 * Geometry is one transform on the <img>: translate(x, y) scale(s) with the
 * origin at the top left. Continuous input (wheel, drag, pinch) writes it
 * directly; discrete steps (buttons, keys, double-click) add a short eased
 * transition via .is-easing so they glide instead of jumping.
 */
import { lockScroll } from './scroll';

const MAX_ZOOM = 4;
const STEP = 1.6;
const PAN_KEY = 80;
const CLOSE_MS = 320;

export function initViewer() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-iv]');
  if (!dialog || dialog.dataset.ready) return;
  dialog.dataset.ready = '';

  const stage = dialog.querySelector<HTMLElement>('[data-iv-stage]')!;
  const img = dialog.querySelector<HTMLImageElement>('[data-iv-img]')!;
  const caption = dialog.querySelector<HTMLElement>('[data-iv-caption]')!;
  const level = dialog.querySelector<HTMLElement>('[data-iv-level]')!;
  const zoomIn = dialog.querySelector<HTMLButtonElement>('[data-iv-in]')!;
  const zoomOut = dialog.querySelector<HTMLButtonElement>('[data-iv-out]')!;
  const fitBtn = dialog.querySelector<HTMLButtonElement>('[data-iv-fit]')!;
  const closeBtn = dialog.querySelector<HTMLButtonElement>('[data-iv-close]')!;

  let natW = 1;
  let natH = 1;
  let fit = 1;
  let scale = 1;
  let x = 0;
  let y = 0;
  let trigger: HTMLElement | null = null;
  let closing = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const stageSize = () => ({ w: stage.clientWidth, h: stage.clientHeight });
  const maxScale = () => Math.max(fit * MAX_ZOOM, 1.5);
  const atFit = () => Math.abs(scale - fit) < 0.001;

  /** Keep the image covering the frame when it is bigger, centred when not. */
  const clamp = () => {
    const { w, h } = stageSize();
    const iw = natW * scale;
    const ih = natH * scale;
    x = iw <= w ? (w - iw) / 2 : Math.min(0, Math.max(w - iw, x));
    y = ih <= h ? (h - ih) / 2 : Math.min(0, Math.max(h - ih, y));
  };

  const render = (ease = false) => {
    clamp();
    img.classList.toggle('is-easing', ease);
    img.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    level.textContent = atFit() ? 'Fit' : `${Math.round(scale * 100)}%`;
    zoomOut.disabled = atFit();
    zoomIn.disabled = scale >= maxScale() - 0.001;
    fitBtn.disabled = atFit();
    stage.classList.toggle('is-zoomed', !atFit());
  };

  const measure = () => {
    const { w, h } = stageSize();
    fit = Math.min(w / natW, h / natH, 1);
  };

  /** Zoom to `next`, keeping the point (cx, cy) of the stage still. */
  const zoomTo = (next: number, cx?: number, cy?: number, ease = false) => {
    const { w, h } = stageSize();
    const px = cx ?? w / 2;
    const py = cy ?? h / 2;
    const target = Math.min(maxScale(), Math.max(fit, next));
    x = px - (px - x) * (target / scale);
    y = py - (py - y) * (target / scale);
    scale = target;
    render(ease);
  };

  const reset = (ease = false) => {
    measure();
    scale = fit;
    render(ease);
  };

  const local = (e: { clientX: number; clientY: number }) => {
    const r = stage.getBoundingClientRect();
    return { cx: e.clientX - r.left, cy: e.clientY - r.top };
  };

  // --- Open / close -----------------------------------------------------
  const open = async (from: HTMLElement) => {
    const src = from.dataset.viewerSrc;
    if (!src) return;
    trigger = from;
    window.clearTimeout(closing);

    natW = Number(from.dataset.viewerW) || 1600;
    natH = Number(from.dataset.viewerH) || 1000;
    const alt = from.dataset.viewerAlt ?? '';
    caption.textContent = alt;
    img.alt = alt;
    img.width = natW;
    img.height = natH;

    if (!dialog.open) {
      dialog.showModal();
      lockScroll(true);
    }
    requestAnimationFrame(() => dialog.classList.add('is-open'));
    reset();

    if (img.getAttribute('src') !== src) {
      dialog.classList.add('is-loading');
      img.src = src;
      await img.decode().catch(() => {});
    }
    dialog.classList.remove('is-loading');
  };

  const close = () => {
    if (!dialog.open) return;
    dialog.classList.remove('is-open');
    window.clearTimeout(closing);
    closing = window.setTimeout(() => {
      dialog.close();
      lockScroll(false);
      trigger?.focus({ preventScroll: true });
    }, reduced ? 0 : CLOSE_MS);
  };

  document.addEventListener('click', (e) => {
    const from = (e.target as Element | null)?.closest<HTMLElement>('[data-viewer]');
    if (!from) return;
    e.preventDefault();
    open(from);
  });

  closeBtn.addEventListener('click', close);
  // Escape is native to <dialog>; it is caught so the close can animate.
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });

  // --- Toolbar and keys -------------------------------------------------
  zoomIn.addEventListener('click', () => zoomTo(scale * STEP, undefined, undefined, true));
  zoomOut.addEventListener('click', () => zoomTo(scale / STEP, undefined, undefined, true));
  fitBtn.addEventListener('click', () => reset(true));

  dialog.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLButtonElement && (e.key === 'Enter' || e.key === ' ')) return;
    const pan = (dx: number, dy: number) => {
      x += dx;
      y += dy;
      render(true);
    };
    switch (e.key) {
      case '+':
      case '=':
        zoomTo(scale * STEP, undefined, undefined, true);
        break;
      case '-':
      case '_':
        zoomTo(scale / STEP, undefined, undefined, true);
        break;
      case '0':
        reset(true);
        break;
      case 'ArrowLeft':
        pan(PAN_KEY, 0);
        break;
      case 'ArrowRight':
        pan(-PAN_KEY, 0);
        break;
      case 'ArrowUp':
        pan(0, PAN_KEY);
        break;
      case 'ArrowDown':
        pan(0, -PAN_KEY);
        break;
      default:
        return;
    }
    e.preventDefault();
  });

  // --- Wheel ------------------------------------------------------------
  stage.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const { cx, cy } = local(e);
      // Trackpad pinch arrives as ctrl+wheel with small deltas; a mouse
      // wheel as large ones. One exponential curve suits both.
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      zoomTo(scale * Math.exp(-delta * (e.ctrlKey ? 0.01 : 0.0018)), cx, cy);
    },
    { passive: false },
  );

  // --- Drag, pinch, double-tap -----------------------------------------
  const pointers = new Map<number, { x: number; y: number }>();
  let pinchDist = 0;
  let moved = 0;
  let lastTap = 0;
  let lastTapAt = { cx: 0, cy: 0 };

  const spread = () => {
    const [a, b] = [...pointers.values()];
    return {
      d: Math.hypot(a.x - b.x, a.y - b.y),
      cx: (a.x + b.x) / 2,
      cy: (a.y + b.y) / 2,
    };
  };

  stage.addEventListener('pointerdown', (e) => {
    stage.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved = 0;
    if (pointers.size === 2) pinchDist = spread().d;
    stage.classList.add('is-dragging');
  });

  stage.addEventListener('pointermove', (e) => {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    moved += Math.abs(dx) + Math.abs(dy);

    if (pointers.size === 2) {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const s = spread();
      if (pinchDist > 0) {
        const { cx, cy } = local({ clientX: s.cx, clientY: s.cy });
        zoomTo(scale * (s.d / pinchDist), cx, cy);
      }
      pinchDist = s.d;
      return;
    }

    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (atFit()) return;
    x += dx;
    y += dy;
    render();
  });

  const lift = (e: PointerEvent) => {
    if (!pointers.delete(e.pointerId)) return;
    if (pointers.size < 2) pinchDist = 0;
    if (pointers.size === 0) stage.classList.remove('is-dragging');
    if (e.type !== 'pointerup' || moved > 6 || pointers.size > 0) return;

    const { cx, cy } = local(e);
    const now = performance.now();
    const near = Math.hypot(cx - lastTapAt.cx, cy - lastTapAt.cy) < 30;
    if (now - lastTap < 320 && near) {
      lastTap = 0;
      if (atFit()) zoomTo(Math.max(fit * 2.5, Math.min(1, maxScale())), cx, cy, true);
      else reset(true);
      return;
    }
    lastTap = now;
    lastTapAt = { cx, cy };

    // A single tap beside a fitted image closes, like clicking a backdrop.
    if (atFit() && e.target === stage) {
      window.setTimeout(() => {
        if (lastTap === now) close();
      }, 320);
    }
  };

  stage.addEventListener('pointerup', lift);
  stage.addEventListener('pointercancel', lift);

  window.addEventListener('resize', () => {
    if (!dialog.open) return;
    const wasFit = atFit();
    measure();
    if (wasFit) scale = fit;
    else scale = Math.max(fit, scale);
    render();
  });
}
