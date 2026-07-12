import {
  cloneElement,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

interface PopoverProps {
  /**
   * The element that toggles the popover. Must accept a ref so we can anchor
   * the floating panel. A `<button>` or `<div>` works.
   */
  trigger: ReactElement;
  /** Whether the popover is open. Controlled. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The popover content. */
  children: ReactNode;
  /** Optional pixel offset between trigger and panel (default 6). */
  offset?: number;
  /** Match the trigger width on the panel (default false). */
  matchTriggerWidth?: boolean;
  /** Optional className appended to the floating panel. */
  className?: string;
}

interface Position {
  top: number;
  left: number;
  width?: number;
  origin: 'top' | 'bottom';
}

/**
 * Lightweight popover. Renders the panel via createPortal anchored to the
 * trigger. Closes on outside click + Escape.
 */
export function Popover({
  trigger,
  open,
  onOpenChange,
  children,
  offset = 6,
  matchTriggerWidth = false,
  className,
}: PopoverProps) {
  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<Position | null>(null);

  // Inject our ref into whatever the consumer passed.
  if (!isValidElement(trigger)) {
    throw new Error('Popover: `trigger` must be a valid React element.');
  }
  // Merge our anchor ref with whatever ref the consumer already put on the
  // trigger. Reading `trigger.ref` and writing the forwarded ref's `.current`
  // is the intent here, so the ref/immutability rules are disabled locally.
  /* eslint-disable react-hooks/refs, react-hooks/immutability */
  const triggerWithRef = cloneElement(trigger as ReactElement<{ ref?: (el: HTMLElement | null) => void }>, {
    ref: (el: HTMLElement | null) => {
      triggerRef.current = el;
      const original = (trigger as { ref?: unknown }).ref;
      if (typeof original === 'function') original(el);
      else if (original && typeof original === 'object') (original as { current: HTMLElement | null }).current = el;
    },
  });
  /* eslint-enable react-hooks/refs, react-hooks/immutability */

  const compute = () => {
    const t = triggerRef.current;
    const p = panelRef.current;
    if (!t || !p) return;
    const r = t.getBoundingClientRect();
    const ph = p.offsetHeight;
    const pw = matchTriggerWidth ? r.width : Math.max(p.offsetWidth, r.width);
    const spaceBelow = window.innerHeight - r.bottom;
    const placeAbove = spaceBelow < ph + offset + 8 && r.top > ph + offset + 8;
    const top = placeAbove ? r.top - ph - offset : r.bottom + offset;
    let left = r.left;
    // Keep within viewport (8px margin).
    if (left + pw > window.innerWidth - 8) left = Math.max(8, window.innerWidth - pw - 8);
    if (left < 8) left = 8;
    setPosition({
      top,
      left,
      width: matchTriggerWidth ? r.width : undefined,
      origin: placeAbove ? 'bottom' : 'top',
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      // Genuine layout effect: position is derived from DOM measurement in
      // compute(); clearing it on close keeps the next open hidden until
      // re-measured. Not the mirror-a-prop anti-pattern the rule targets.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPosition(null);
      return;
    }
    compute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => compute();
    const onScroll = () => compute();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      onOpenChange(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onOpenChange]);

  return (
    <>
      {triggerWithRef}
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={panelRef}
            className={`zui-popover${className ? ' ' + className : ''}`}
            role="dialog"
            style={{
              top: position?.top ?? -9999,
              left: position?.left ?? -9999,
              width: position?.width,
              transformOrigin: position?.origin === 'bottom' ? 'bottom left' : 'top left',
              visibility: position ? 'visible' : 'hidden',
            }}
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  );
}
