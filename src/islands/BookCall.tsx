import { useEffect, useRef, useState, type ReactNode } from 'react';
import { lockScroll } from '../lib/scroll';
import { EASE, reducedMotion } from '../lib/motion';

const SERVICES = [
  'Web Development',
  'App Development',
  'AI Automation',
  'Digital Marketing',
  'Not sure yet',
];

const MORNING = ['09:00', '10:30', '11:30'];
const AFTERNOON = ['14:00', '15:30', '17:00'];
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Booking horizon: today through three whole months ahead.
const MONTHS_AHEAD = 3;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type FieldKey = 'name' | 'email' | 'topic';
type SlotKey = FieldKey | 'date' | 'time';
type Errors = Partial<Record<SlotKey, string>>;

const pad = (n: number) => String(n).padStart(2, '0');
const dateKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function validate(
  v: { name: string; email: string; topic: string },
  d: string | null,
  t: string | null,
): Errors {
  const found: Errors = {};
  if (!v.name.trim()) found.name = 'Tell us who you are.';
  if (!v.email.trim()) found.email = 'We need an address to confirm the booking.';
  else if (!EMAIL_RE.test(v.email.trim())) found.email = 'That address does not look right.';
  if (!v.topic) found.topic = 'Pick the closest one.';
  if (!d) found.date = 'Pick a day for the call.';
  if (!t) found.time = 'Pick a time that suits you.';
  return found;
}

/** Leading `null` pads for a Monday-first grid, then one cell per day. */
function calendarDays(y: number, m: number) {
  const lead = (new Date(y, m, 1).getDay() + 6) % 7;
  const count = new Date(y, m + 1, 0).getDate();
  const n = new Date();
  const todayKey = dateKey(n.getFullYear(), n.getMonth(), n.getDate());

  const cells: (null | {
    y: number;
    m: number;
    d: number;
    key: string;
    past: boolean;
    isToday: boolean;
    label: string;
  })[] = Array.from({ length: lead }, () => null);

  for (let d = 1; d <= count; d++) {
    const key = dateKey(y, m, d);
    cells.push({
      y,
      m,
      d,
      key,
      past: key < todayKey,
      isToday: key === todayKey,
      label: new Date(y, m, d).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    });
  }
  return cells;
}

/**
 * "Book a call" trigger + modal.
 *
 * Confirmation-only by design: there is no backend, so a valid submit shows
 * the booking summary and stops there. No mail client is opened and nothing
 * is sent — the copy on the confirmation card stays honest about that.
 *
 * The panel is a flex column capped at the viewport height: the header and
 * the confirm footer stay pinned while the middle scrolls, so the button is
 * reachable without scrolling on any screen. Desktop splits into a details
 * column and a schedule column to keep the panel short.
 */
export default function BookCall() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'form' | 'booked'>('form');
  const [submitted, setSubmitted] = useState(false);

  const [values, setValues] = useState({ name: '', email: '', topic: '', notes: '' });
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [errors, setErrors] = useState<Errors>({});
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [viewed, setViewed] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });

  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const now = new Date();
  const today = dateKey(now.getFullYear(), now.getMonth(), now.getDate());
  const delta = (viewed.y - now.getFullYear()) * 12 + (viewed.m - now.getMonth());

  const fieldErrors = submitted ? validate(values, date, time) : errors;
  const bad = (key: SlotKey) => {
    if (!fieldErrors[key]) return false;
    if (key === 'date' || key === 'time') return submitted;
    return Boolean(touched[key]);
  };

  function openModal() {
    returnFocus.current = document.activeElement as HTMLElement | null;
    const n = new Date();
    setViewed({ y: n.getFullYear(), m: n.getMonth() });
    setStatus('form');
    setSubmitted(false);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setErrors({});
    // Reset only after a completed booking; a half-filled form survives a
    // mid-flow close so the visitor can pick up where they left off.
    if (status === 'booked') {
      setValues({ name: '', email: '', topic: '', notes: '' });
      setDate(null);
      setTime(null);
      setTouched({});
      setSubmitted(false);
    }
    returnFocus.current?.focus();
    returnFocus.current = null;
  }

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', onKey);

    // Entrance runs on GSAP's ticker (rAF-driven) rather than CSS keyframes:
    // a frozen Web-Animations timeline would otherwise leave the panel stuck
    // at its hidden first frame.
    if (!reducedMotion()) {
      import('gsap').then(({ gsap }) => {
        gsap.fromTo(
          panelRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.22, ease: EASE, clearProps: 'transform' },
        );
        gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.18 });
      });
    }

    return () => {
      lockScroll(false);
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function trapTab(e: React.KeyboardEvent) {
    if (e.key !== 'Tab' || !panelRef.current) return;
    const els = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!els.length) return;
    const first = els[0];
    const last = els[els.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function submit() {
    const found = validate(values, date, time);
    setErrors(found);
    setTouched({ name: true, email: true, topic: true });
    setSubmitted(true);

    if (Object.keys(found).length) {
      const order: SlotKey[] = ['name', 'email', 'topic', 'date', 'time'];
      const first = order.find((k) => found[k]);
      if (first === 'date' || first === 'time') gridRef.current?.focus();
      else document.getElementById('bc-field-' + first)?.focus();
      return;
    }
    setStatus('booked');
  }

  const set = (key: FieldKey) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (touched[key]) setErrors(validate({ ...values, [key]: value }, date, time));
  };

  const blur = (key: FieldKey) => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate(values, date, time));
  };

  function pickDate(y: number, m: number, d: number) {
    setDate(dateKey(y, m, d));
    setTime(null);
    setErrors((e) => ({ ...e, date: undefined, time: undefined }));
  }

  // Slots earlier than right now are gone when the call would be today.
  const slotGone = (slot: string) => {
    if (date !== today) return false;
    return slot <= pad(now.getHours()) + ':' + pad(now.getMinutes());
  };

  const summary = (() => {
    if (!date || !time) return '';
    const [y, m, d] = date.split('-').map(Number);
    const nice = new Date(y, m - 1, d).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    return nice + ' · ' + time;
  })();

  const base =
    'w-full rounded-[10px] border bg-white px-4 py-3 text-ink placeholder:text-ink-faint transition-[border-color,box-shadow] duration-[180ms] focus:outline-none focus:ring-2 focus:ring-brand/35 ';
  const ring = (key: FieldKey) =>
    base + (bad(key) ? 'border-[#c8384f]' : 'border-line-strong focus:border-brand');

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-2.5 rounded-[10px] bg-brand-text px-6 py-[15px] font-medium text-white transition-[transform,background-color] duration-[180ms] ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:bg-[#0a52c4]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3.5 9.5h17M8 2.8v4M16 2.8v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        Book a call
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div
            ref={backdropRef}
            className="fixed inset-0 bg-ink/45 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          <div
            className="flex min-h-full px-4 py-8 sm:px-8"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="bc-title"
              tabIndex={-1}
              onKeyDown={trapTab}
              className="relative m-auto flex max-h-[calc(100dvh-4rem)] w-full max-w-[760px] flex-col rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-lg)] outline-none"
            >
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-[10px] text-ink-muted transition-colors duration-[180ms] hover:bg-[#eef4ff] hover:text-ink"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>

              {status === 'booked' ? (
                <div role="status" className="min-h-0 overflow-y-auto p-6 sm:p-9">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-[#eef4ff]">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="m5 12.5 4.5 4.5L19 7.5" stroke="#0060e6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h2 className="h3 mt-6 text-ink">You&rsquo;re booked in.</h2>
                  <p className="mt-4 text-ink-muted">
                    <span className="font-medium text-ink">{summary}</span>
                    <br />
                    {values.topic} — 30 minutes.
                  </p>
                  <p className="mt-3 text-[0.9375rem] text-ink-muted">
                    We&rsquo;ll confirm by email at <span className="text-ink">{values.email}</span>.
                    If the slot needs to move, just reply to that note.
                  </p>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-7 rounded-[10px] bg-brand-text px-6 py-[15px] font-medium text-white transition-[transform,background-color] duration-[180ms] ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:bg-[#0a52c4]"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="border-b border-line py-5 pl-5 pr-16 sm:py-6 sm:pl-8">
                    <p className="mono text-ink-faint">Book a call</p>
                    <h2 id="bc-title" className="h3 mt-2 text-ink">
                      Pick a 30-minute slot.
                    </h2>
                  </div>

                  <form
                    noValidate
                    onSubmit={(e) => {
                      e.preventDefault();
                      submit();
                    }}
                    className="flex min-h-0 flex-1 flex-col"
                  >
                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
                      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
                        {/* Details column */}
                        <div className="space-y-4">
                          <Field
                            id="bc-field-name"
                            label="Your name"
                            error={bad('name') ? fieldErrors.name : undefined}
                          >
                            <input
                              id="bc-field-name"
                              type="text"
                              autoComplete="name"
                              className={ring('name')}
                              value={values.name}
                              onChange={(e) => set('name')(e.target.value)}
                              onBlur={blur('name')}
                              aria-invalid={bad('name')}
                              aria-describedby={bad('name') ? 'bc-err-name' : undefined}
                            />
                          </Field>

                          <Field
                            id="bc-field-email"
                            label="Email"
                            error={bad('email') ? fieldErrors.email : undefined}
                          >
                            <input
                              id="bc-field-email"
                              type="email"
                              autoComplete="email"
                              className={ring('email')}
                              value={values.email}
                              onChange={(e) => set('email')(e.target.value)}
                              onBlur={blur('email')}
                              aria-invalid={bad('email')}
                              aria-describedby={bad('email') ? 'bc-err-email' : undefined}
                            />
                          </Field>

                          <Field
                            id="bc-field-topic"
                            label="What should we talk about?"
                            error={bad('topic') ? fieldErrors.topic : undefined}
                          >
                            <select
                              id="bc-field-topic"
                              className={ring('topic')}
                              value={values.topic}
                              onChange={(e) => set('topic')(e.target.value)}
                              onBlur={blur('topic')}
                              aria-invalid={bad('topic')}
                              aria-describedby={bad('topic') ? 'bc-err-topic' : undefined}
                            >
                              <option value="">Select one</option>
                              {SERVICES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </Field>

                          <Field id="bc-field-notes" label="Notes" hint="Optional">
                            <textarea
                              id="bc-field-notes"
                              rows={2}
                              className={base + 'border-line-strong focus:border-brand resize-y'}
                              placeholder="Anything we should prepare?"
                              value={values.notes}
                              onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
                            />
                          </Field>
                        </div>

                        {/* Schedule column */}
                        <div className="space-y-5">
                          <div>
                            <div className="flex items-center justify-between">
                              <p className="mono text-ink-faint">Pick a day</p>
                              <p className="text-[0.875rem] font-medium tabular-nums text-ink">
                                {MONTHS[viewed.m]} {viewed.y}
                              </p>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() =>
                                  setViewed((v) =>
                                    v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 },
                                  )
                                }
                                disabled={delta <= 0}
                                aria-label="Previous month"
                                className="grid h-9 w-9 place-items-center rounded-full border border-line-strong text-ink transition-colors duration-[180ms] hover:border-sky disabled:pointer-events-none disabled:opacity-40"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                  <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setViewed((v) =>
                                    v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 },
                                  )
                                }
                                disabled={delta >= MONTHS_AHEAD}
                                aria-label="Next month"
                                className="grid h-9 w-9 place-items-center rounded-full border border-line-strong text-ink transition-colors duration-[180ms] hover:border-sky disabled:pointer-events-none disabled:opacity-40"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                  <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                            </div>

                            <div
                              ref={gridRef}
                              tabIndex={-1}
                              className="mt-3 rounded-[10px] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
                            >
                              <div className="grid grid-cols-7 gap-1" aria-hidden="true">
                                {WEEKDAYS.map((w) => (
                                  <span key={w} className="mono grid h-7 place-items-center text-ink-faint">
                                    {w}
                                  </span>
                                ))}
                              </div>
                              <div className="grid grid-cols-7 gap-1">
                                {calendarDays(viewed.y, viewed.m).map((cell, i) =>
                                  cell === null ? (
                                    <span key={'pad-' + i} aria-hidden="true" />
                                  ) : (
                                    <button
                                      key={cell.key}
                                      type="button"
                                      disabled={cell.past}
                                      aria-pressed={date === cell.key}
                                      aria-label={cell.label}
                                      onClick={() => pickDate(cell.y, cell.m, cell.d)}
                                      className={
                                        'grid h-9 place-items-center rounded-[10px] text-[0.875rem] tabular-nums transition-colors duration-[180ms] ' +
                                        (date === cell.key
                                          ? 'bg-brand-text text-white'
                                          : cell.past
                                            ? 'text-ink-faint/50'
                                            : 'text-ink hover:bg-[#eef4ff]') +
                                        (cell.isToday && date !== cell.key
                                          ? ' ring-1 ring-inset ring-brand/40'
                                          : '')
                                      }
                                    >
                                      {cell.d}
                                    </button>
                                  ),
                                )}
                              </div>
                            </div>
                            {bad('date') && (
                              <p className="mt-2 text-[0.8125rem] text-[#c8384f]" role="alert">
                                {fieldErrors.date}
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="mono text-ink-faint">Pick a time</p>
                            <div className="mt-3 space-y-3">
                              {(
                                [
                                  ['Morning', MORNING],
                                  ['Afternoon', AFTERNOON],
                                ] as const
                              ).map(([label, slots]) => (
                                <div key={label}>
                                  <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-ink-faint">
                                    {label}
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {slots.map((slot) => {
                                      const gone = slotGone(slot);
                                      const active = time === slot;
                                      return (
                                        <button
                                          key={slot}
                                          type="button"
                                          disabled={gone}
                                          aria-pressed={active}
                                          onClick={() => {
                                            setTime(slot);
                                            setErrors((e) => ({ ...e, time: undefined }));
                                          }}
                                          className={
                                            'rounded-full border px-3.5 py-1.5 text-[0.875rem] tabular-nums transition-colors duration-[180ms] ' +
                                            (active
                                              ? 'border-brand-text bg-brand-text text-white'
                                              : gone
                                                ? 'border-line bg-white text-ink-faint/50'
                                                : 'border-line-strong bg-white text-ink hover:border-sky')
                                          }
                                        >
                                          {slot}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                            {bad('time') && (
                              <p className="mt-2 text-[0.8125rem] text-[#c8384f]" role="alert">
                                {fieldErrors.time}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-4 sm:px-8">
                      <p className="min-w-0 flex-1 truncate text-[0.8125rem] text-ink-faint">
                        {date && time ? summary : 'Pick a day and time to continue'}
                      </p>
                      <button
                        type="submit"
                        className="shrink-0 rounded-[10px] bg-brand-text px-6 py-3 font-medium text-white transition-[transform,background-color] duration-[180ms] ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:bg-[#0a52c4]"
                      >
                        Confirm booking
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 flex items-baseline justify-between gap-3 text-[0.875rem] font-medium text-ink"
      >
        {label}
        {hint && <span className="text-[0.75rem] font-normal text-ink-faint">{hint}</span>}
      </label>
      {children}
      {error && (
        <p id={id.replace('field-', 'err-')} className="mt-2 text-[0.8125rem] text-[#c8384f]">
          {error}
        </p>
      )}
    </div>
  );
}