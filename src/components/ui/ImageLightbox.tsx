'use client';
import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ProjectImage } from '@/data/projects';
import { Icon } from '@/components/icons/Icon';

interface ImageLightboxProps {
  images: ProjectImage[];
  index: number | null;
  onIndex: (next: number | null) => void;
}

const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function ImageLightbox({ images, index, onIndex }: ImageLightboxProps) {
  const open = index !== null && images.length > 0;
  const stripRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const safeIndex = open ? Math.min(Math.max(index!, 0), images.length - 1) : 0;
  const current = open ? images[safeIndex] : undefined;

  const close = useCallback(() => onIndex(null), [onIndex]);
  const prev = useCallback(() => {
    if (!open) return;
    onIndex(safeIndex === 0 ? images.length - 1 : safeIndex - 1);
  }, [open, onIndex, safeIndex, images.length]);
  const next = useCallback(() => {
    if (!open) return;
    onIndex(safeIndex === images.length - 1 ? 0 : safeIndex + 1);
  }, [open, onIndex, safeIndex, images.length]);

  // Remember the element that had focus before opening so we can restore it.
  useEffect(() => {
    if (open) {
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
    }
  }, [open]);

  // Focus the close button when opened; restore focus when closed.
  useEffect(() => {
    if (open) {
      closeRef.current?.focus();
    } else if (lastFocusedRef.current && 'focus' in lastFocusedRef.current) {
      lastFocusedRef.current.focus();
    }
  }, [open]);

  // Keyboard handling: Escape, arrows, and Tab focus trap.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      } else if (e.key === 'Tab') {
        const dialog = closeRef.current?.closest('.lb') as HTMLElement | null;
        if (!dialog) return;
        const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS));
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, prev, next]);

  useEffect(() => {
    if (!open) return;
    const el = stripRef.current?.querySelector<HTMLElement>(`[data-strip-idx="${safeIndex}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [open, safeIndex]);

  if (typeof document === 'undefined' || !open) return null;

  return createPortal(
    <div
      className="lb is-open"
      role="dialog"
      aria-modal="true"
      aria-label="Project images"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="lb__top">
        <div className="lb__counter" aria-live="polite" aria-atomic="true">
          {`${safeIndex + 1} / ${images.length}`}
        </div>
        <button
          ref={closeRef}
          type="button"
          className="lb__close"
          onClick={close}
          aria-label="Close image viewer"
        >
          <Icon.X size={18} />
        </button>
      </div>

      <div
        className="lb__stage"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {images.length > 1 && (
          <button
            type="button"
            className="lb__nav lb__nav--prev"
            onClick={prev}
            aria-label="Previous image"
          >
            <Icon.Chevron size={18} dir="left" />
          </button>
        )}
        <div
          className="lb__img-wrap"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          {current?.src && (
            <img
              key={current.src}
              src={current.src}
              alt={current.alt ?? ''}
              className="lb__img"
            />
          )}
        </div>
        {images.length > 1 && (
          <button
            type="button"
            className="lb__nav lb__nav--next"
            onClick={next}
            aria-label="Next image"
          >
            <Icon.Chevron size={18} dir="right" />
          </button>
        )}
      </div>

      {current?.caption && <div className="lb__caption">{current.caption}</div>}

      {images.length > 1 && (
        <div className="lb__strip" ref={stripRef}>
          {images.map((img, i) => (
            <button
              key={img.src + i}
              type="button"
              data-strip-idx={i}
              className={`lb__strip-item${i === safeIndex ? ' is-active' : ''}`}
              onClick={() => onIndex(i)}
              aria-label={`Go to image ${i + 1}`}
              aria-current={i === safeIndex}
            >
              <img src={img.src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}
