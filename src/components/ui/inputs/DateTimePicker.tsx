'use client';
import { forwardRef, useState } from 'react';
import { Calendar, parseISO } from './Calendar';
import { Popover } from './Popover';
import { TimePickerPanel } from './TimePickerPanel';

interface DateTimePickerProps {
  /** ISO-8601 datetime string, or null. */
  value: string | null;
  onChange: (value: string | null) => void;
  format?: '12' | '24';
  minuteStep?: number;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  id?: string;
}

interface Bits {
  date: string; // YYYY-MM-DD
  hour: number; // 0-23
  minute: number;
}

function parse(value: string | null): Bits | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return { date: `${yyyy}-${mm}-${dd}`, hour: d.getHours(), minute: d.getMinutes() };
}

function compose(bits: Bits): string {
  const d = parseISO(bits.date)!;
  d.setHours(bits.hour, bits.minute, 0, 0);
  return d.toISOString();
}

function formatPreview(bits: Bits, fmt: '12' | '24'): string {
  const d = parseISO(bits.date);
  if (!d) return '';
  d.setHours(bits.hour, bits.minute);
  const date = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  if (fmt === '24') return `${date} · ${String(bits.hour).padStart(2, '0')}:${String(bits.minute).padStart(2, '0')}`;
  const period = bits.hour >= 12 ? 'PM' : 'AM';
  const h12 = bits.hour % 12 === 0 ? 12 : bits.hour % 12;
  return `${date} · ${h12}:${String(bits.minute).padStart(2, '0')} ${period}`;
}

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

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="4" width="18" height="17" rx="3" />
    <path d="M3 9h18" />
    <path d="M8 2v4M16 2v4" />
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
  const hasValue = label !== null && label.length > 0;
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
        {hasValue ? label : placeholder ?? 'Pick date & time'}
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

export function DateTimePicker({
  value,
  onChange,
  format = '12',
  minuteStep = 5,
  placeholder,
  disabled,
  clearable,
  id,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const incoming = parse(value);
  const [bits, setBits] = useState<Bits>(
    incoming ?? {
      date: new Date().toISOString().slice(0, 10),
      hour: 12,
      minute: 0,
    },
  );

  const triggerLabel = incoming ? formatPreview(incoming, format) : null;

  const setDate = (date: string) => setBits((b) => ({ ...b, date }));
  const setHour = (h: number) => setBits((b) => ({ ...b, hour: h }));
  const setMinute = (m: number) => setBits((b) => ({ ...b, minute: m }));

  const apply = () => {
    onChange(compose(bits));
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
      <div className="zui-datetime">
        <div className="zui-datetime__split" style={{ flexWrap: 'wrap' }}>
          <Calendar value={bits.date} onChange={setDate} showFooter={false} />
          <div
            style={{
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              minWidth: 220,
            }}
          >
            <TimePickerPanel
              h24={bits.hour}
              minute={bits.minute}
              onHour={setHour}
              onMinute={setMinute}
              format={format}
              minuteStep={minuteStep}
            />
            <button
              type="button"
              className="zui-calendar__footer-btn"
              style={{ color: 'var(--accent-3)', alignSelf: 'flex-end' }}
              onClick={apply}
            >
              Done →
            </button>
          </div>
        </div>
      </div>
    </Popover>
  );
}
