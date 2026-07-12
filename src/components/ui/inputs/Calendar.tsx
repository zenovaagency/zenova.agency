import { useState } from 'react';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface CalendarProps {
  /** Date as YYYY-MM-DD, or null for empty. */
  value: string | null;
  onChange: (iso: string) => void;
  /** Min selectable date (YYYY-MM-DD). */
  min?: string;
  /** Max selectable date (YYYY-MM-DD). */
  max?: string;
  /** Show the today/clear footer (default true). */
  showFooter?: boolean;
  /** Optional callback when the Today/Clear footer buttons fire. */
  onClear?: () => void;
}

function parseISO(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatISO(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function Calendar({ value, onChange, min, max, showFooter = true, onClear }: CalendarProps) {
  const today = new Date();
  const selected = parseISO(value);
  const [cursor, setCursor] = useState<Date>(startOfMonth(selected ?? today));

  // Re-anchor to the selected month when the value changes externally.
  // Reconciled during render, not in an effect, to avoid a cascading re-render.
  const [syncedValue, setSyncedValue] = useState(value);
  if (syncedValue !== value) {
    setSyncedValue(value);
    if (selected) setCursor(startOfMonth(selected));
  }

  const minDate = parseISO(min) ?? null;
  const maxDate = parseISO(max) ?? null;

  // Build the 6-row grid covering the current month + leading/trailing days.
  const firstWeekday = cursor.getDay();
  const days: Array<{ date: Date; otherMonth: boolean }> = [];
  const gridStart = new Date(cursor);
  gridStart.setDate(1 - firstWeekday);
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push({ date: d, otherMonth: d.getMonth() !== cursor.getMonth() });
  }

  const isDisabled = (d: Date) => {
    if (minDate && d < minDate) return true;
    if (maxDate && d > maxDate) return true;
    return false;
  };

  return (
    <div className="zui-calendar">
      <div className="zui-calendar__head">
        <div className="zui-calendar__title">
          {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
        </div>
        <div className="zui-calendar__nav">
          <button
            type="button"
            className="zui-calendar__nav-btn"
            onClick={() => setCursor(addMonths(cursor, -1))}
            aria-label="Previous month"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            className="zui-calendar__nav-btn"
            onClick={() => setCursor(addMonths(cursor, 1))}
            aria-label="Next month"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
      <div className="zui-calendar__weekdays">
        {WEEKDAY_LABELS.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className="zui-calendar__grid" role="grid">
        {days.map(({ date, otherMonth }, i) => {
          const isSel = selected ? isSameDay(date, selected) : false;
          const isToday = isSameDay(date, today);
          const disabled = isDisabled(date);
          return (
            <button
              key={i}
              type="button"
              role="gridcell"
              className={`zui-calendar__day${otherMonth ? ' is-other-month' : ''}${
                isToday ? ' is-today' : ''
              }${isSel ? ' is-selected' : ''}`}
              onClick={() => onChange(formatISO(date))}
              disabled={disabled}
              aria-selected={isSel}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      {showFooter && (
        <div className="zui-calendar__footer">
          <button
            type="button"
            className="zui-calendar__footer-btn"
            onClick={() => {
              const t = new Date();
              setCursor(startOfMonth(t));
              onChange(formatISO(t));
            }}
          >
            Today
          </button>
          <button
            type="button"
            className="zui-calendar__footer-btn"
            onClick={() => {
              if (onClear) onClear();
            }}
            style={{ visibility: onClear ? 'visible' : 'hidden' }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- date helpers colocated with the Calendar input
export { formatISO, parseISO };
