import { forwardRef, useState } from 'react';
import { Popover } from './Popover';
import { TimePickerPanel } from './TimePickerPanel';

interface TimePickerProps {
  /** "HH:MM" in 24-hour internal format, or null. */
  value: string | null;
  onChange: (value: string | null) => void;
  /** Display + selection format. Default 12. */
  format?: '12' | '24';
  /** Minute step granularity (default 5). */
  minuteStep?: number;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  id?: string;
}

interface Parsed {
  h24: number;
  m: number;
}

function parseTime(value: string | null): Parsed | null {
  if (!value) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return { h24: h, m: min };
}

function formatInternal(h24: number, m: number): string {
  return `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatDisplay(h24: number, m: number, fmt: '12' | '24'): string {
  if (fmt === '24') return formatInternal(h24, m);
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15 14" />
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
    label: string | null;
    placeholder?: string;
    clearable?: boolean;
    onClear?: () => void;
  }
>(function Trigger({ id, open, disabled, onClick, label, placeholder, clearable, onClear }, ref) {
  const hasValue = label !== null;
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
        <ClockIcon />
      </span>
      <span className={`zui-trigger__value${hasValue ? '' : ' is-placeholder'}`}>
        {hasValue ? label : placeholder ?? 'Pick a time'}
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

export function TimePicker({
  value,
  onChange,
  format = '12',
  minuteStep = 5,
  placeholder,
  disabled,
  clearable,
  id,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const parsed = parseTime(value);
  const triggerLabel = parsed ? formatDisplay(parsed.h24, parsed.m, format) : null;

  // Live working values (default to noon when not set yet).
  const [h24, setH24] = useState<number>(parsed?.h24 ?? 12);
  const [minute, setMinute] = useState<number>(parsed ? Math.round(parsed.m / minuteStep) * minuteStep : 0);

  // When the popover opens, seed the working values from the current value.
  // Reconciled during render on the open transition, not in an effect.
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open && parsed) {
      setH24(parsed.h24);
      setMinute(Math.round(parsed.m / minuteStep) * minuteStep);
    }
  }

  const apply = () => {
    onChange(formatInternal(h24, minute));
    setOpen(false);
  };

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
          label={triggerLabel}
          placeholder={placeholder}
          clearable={clearable}
          onClear={() => onChange(null)}
        />
      }
    >
      <div className="zui-time">
        <TimePickerPanel
          h24={h24}
          minute={minute}
          onHour={setH24}
          onMinute={setMinute}
          format={format}
          minuteStep={minuteStep}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          {clearable ? (
            <button
              type="button"
              className="zui-calendar__footer-btn"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              Clear
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            className="zui-calendar__footer-btn"
            style={{ color: 'var(--accent-3)' }}
            onClick={apply}
          >
            Done
          </button>
        </div>
      </div>
    </Popover>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- time helpers colocated with the TimePicker input
export { formatInternal as formatTime24, parseTime };
