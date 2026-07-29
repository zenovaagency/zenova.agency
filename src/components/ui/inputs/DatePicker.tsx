'use client';
import { forwardRef, useState } from 'react';
import { Calendar, parseISO } from './Calendar';
import { Popover } from './Popover';

interface DatePickerProps {
  /** YYYY-MM-DD or null. */
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  clearable?: boolean;
  /** Display formatter — defaults to "Mon, Jan 5, 2026". */
  format?: (d: Date) => string;
  id?: string;
}

function defaultFormat(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="4" width="18" height="17" rx="3" />
    <path d="M3 9h18" />
    <path d="M8 2v4M16 2v4" />
  </svg>
);

const CaretIcon = () => (
  <svg
    className="zui-trigger__caret"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const _Trigger = forwardRef<
  HTMLButtonElement,
  {
    id?: string;
    open: boolean;
    disabled?: boolean;
    onClick: () => void;
    value: string | null;
    placeholder?: string;
    format: (d: Date) => string;
    clearable?: boolean;
    onClear?: () => void;
  }
>(function Trigger({ id, open, disabled, onClick, value, placeholder, format, clearable, onClear }, ref) {
  const parsed = parseISO(value);
  const hasValue = parsed !== null;
  return (
    <button
      ref={ref}
      id={id}
      type="button"
      className={`zui-trigger${open ? ' is-open' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-haspopup="dialog"
      aria-expanded={open}
    >
      <span className="zui-trigger__icon">
        <CalendarIcon />
      </span>
      <span className={`zui-trigger__value${hasValue ? '' : ' is-placeholder'}`}>
        {hasValue ? format(parsed as Date) : placeholder ?? 'Pick a date'}
      </span>
      {clearable && hasValue && (
        <button
          type="button"
          className="zui-trigger__clear"
          onClick={(e) => {
            e.stopPropagation();
            onClear?.();
          }}
          aria-label="Clear"
        >
          ×
        </button>
      )}
      <CaretIcon />
    </button>
  );
});

export function DatePicker({
  value,
  onChange,
  placeholder,
  min,
  max,
  disabled,
  clearable,
  format = defaultFormat,
  id,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger={
        <_Trigger
          id={id}
          open={open}
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          value={value}
          placeholder={placeholder}
          format={format}
          clearable={clearable}
          onClear={() => onChange(null)}
        />
      }
    >
      <Calendar
        value={value}
        min={min}
        max={max}
        onChange={(iso) => {
          onChange(iso);
          setOpen(false);
        }}
        onClear={
          clearable
            ? () => {
                onChange(null);
                setOpen(false);
              }
            : undefined
        }
      />
    </Popover>
  );
}
