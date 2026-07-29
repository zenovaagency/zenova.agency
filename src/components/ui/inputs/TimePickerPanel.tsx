'use client';
import { useEffect, useRef } from 'react';

/** Shared scroll-snap column used by TimePicker and DateTimePicker. */
export function ScrollCol({
  items,
  selected,
  onPick,
  ariaLabel,
}: {
  items: number[];
  selected: number;
  onPick: (v: number) => void;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const el = node.querySelector<HTMLButtonElement>(`[data-v="${selected}"]`);
    if (!el) return;
    node.scrollTo({ top: el.offsetTop - node.clientHeight / 2 + el.clientHeight / 2 });
  }, [selected]);

  return (
    <div className="zui-time__scroll" ref={ref} aria-label={ariaLabel} role="listbox">
      <div style={{ height: 53 }} />
      {items.map((v) => (
        <button
          key={v}
          type="button"
          data-v={v}
          role="option"
          aria-selected={v === selected}
          className={`zui-time__scroll-item${v === selected ? ' is-selected' : ''}`}
          onClick={() => onPick(v)}
        >
          {String(v).padStart(2, '0')}
        </button>
      ))}
      <div style={{ height: 53 }} />
    </div>
  );
}

interface TimePickerPanelProps {
  h24: number;
  minute: number;
  onHour: (h24: number) => void;
  onMinute: (m: number) => void;
  format: '12' | '24';
  minuteStep: number;
  /** Hide the large preview readout (DateTimePicker renders its own). */
  hidePreview?: boolean;
}

export function TimePickerPanel({
  h24,
  minute,
  onHour,
  onMinute,
  format,
  minuteStep,
  hidePreview,
}: TimePickerPanelProps) {
  const period: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
  const previewH = format === '12' ? (h24 % 12 === 0 ? 12 : h24 % 12) : h24;

  const hours12 = Array.from({ length: 12 }, (_, i) => i + 1);
  const hours24 = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from(
    { length: Math.floor(60 / minuteStep) },
    (_, i) => i * minuteStep,
  );

  const setHourFromCol = (v: number) => {
    if (format === '12') {
      const isPM = period === 'PM';
      onHour((v % 12) + (isPM ? 12 : 0));
    } else {
      onHour(v);
    }
  };

  const setPeriod = (p: 'AM' | 'PM') => {
    if (format === '24' || p === period) return;
    onHour(p === 'PM' ? (h24 % 12) + 12 : h24 % 12);
  };

  return (
    <>
      {!hidePreview && (
        <div className="zui-time__display">
          <span className="zui-time__part">{String(previewH).padStart(2, '0')}</span>
          <span className="zui-time__sep">:</span>
          <span className="zui-time__part">{String(minute).padStart(2, '0')}</span>
          {format === '12' && (
            <span className="zui-time__part" style={{ fontSize: 18, marginLeft: 8 }}>
              {period}
            </span>
          )}
        </div>
      )}

      <div className={`zui-time__cols zui-time__cols--${format}`}>
        <div className="zui-time__col">
          <span className="zui-time__col-label">Hour</span>
          <ScrollCol
            items={format === '12' ? hours12 : hours24}
            selected={previewH}
            onPick={setHourFromCol}
            ariaLabel="Hour"
          />
        </div>
        <div className="zui-time__col">
          <span className="zui-time__col-label">Min</span>
          <ScrollCol items={minutes} selected={minute} onPick={onMinute} ariaLabel="Minute" />
        </div>
        {format === '12' && (
          <div className="zui-time__col">
            <span className="zui-time__col-label">Period</span>
            <div className="zui-time__ampm" style={{ flexDirection: 'column', flex: 1 }}>
              <button
                type="button"
                className={`zui-time__ampm-btn${period === 'AM' ? ' is-selected' : ''}`}
                onClick={() => setPeriod('AM')}
              >
                AM
              </button>
              <button
                type="button"
                className={`zui-time__ampm-btn${period === 'PM' ? ' is-selected' : ''}`}
                onClick={() => setPeriod('PM')}
              >
                PM
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
