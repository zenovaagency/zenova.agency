'use client';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

export interface SegmentedOption<V extends string | number = string> {
  value: V;
  label: ReactNode;
  disabled?: boolean;
}

interface SegmentedControlProps<V extends string | number = string> {
  value: V;
  options: SegmentedOption<V>[];
  onChange: (value: V) => void;
  ariaLabel?: string;
}

export function SegmentedControl<V extends string | number = string>({
  value,
  options,
  onChange,
  ariaLabel,
}: SegmentedControlProps<V>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  const reposition = () => {
    const container = containerRef.current;
    if (!container) return;
    const active = container.querySelector<HTMLButtonElement>('[data-active="true"]');
    if (!active) {
      setPill(null);
      return;
    }
    const cRect = container.getBoundingClientRect();
    const aRect = active.getBoundingClientRect();
    setPill({ left: aRect.left - cRect.left, width: aRect.width });
  };

  useLayoutEffect(() => {
    reposition();
  }, [value]);

  useEffect(() => {
    const onResize = () => reposition();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="zui-segmented" role="tablist" aria-label={ariaLabel} ref={containerRef}>
      {pill && (
        <div
          className="zui-segmented__pill"
          style={{
            transform: `translateX(${pill.left - 3}px)`,
            width: pill.width,
          }}
        />
      )}
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            className={`zui-segmented__option${active ? ' is-selected' : ''}`}
            data-active={active}
            disabled={opt.disabled}
            onClick={() => onChange(opt.value)}
            role="tab"
            aria-selected={active}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
