import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * The project brief.
 *
 * There is no backend of our own. A validated submission is POSTed to a Google
 * Apps Script web app (SITE.contactEndpoint, source in
 * docs/contact-apps-script.gs) that emails it to us and logs it to a Sheet.
 * Success is only shown once that endpoint confirms it. If the request fails the
 * brief stays in the form, with a link that opens it as an email instead, so
 * nothing the visitor typed is lost. With no endpoint configured, the form
 * falls back to that mailto hand-off alone.
 *
 * Arriving from a scope card (/contact?service=web&plan=web-2) pre-selects
 * the service and names the scope option in the brief, so nobody has to retype what
 * they just clicked.
 */

export interface ServiceOption {
  slug: string;
  title: string;
}

const BUDGETS = ['Under $10k', '$10k–25k', '$25k–50k', '$50k+', 'Not sure yet'];
const TIMELINES = ['As soon as possible', 'In 1–3 months', 'In 3–6 months', 'Flexible'];
const NOT_SURE = 'Not sure yet';
const SEND_TIMEOUT_MS = 15_000;

interface Fields {
  name: string;
  email: string;
  company: string;
  service: string;
  budget: string;
  timeline: string;
  message: string;
}

type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = {
  name: '',
  email: '',
  company: '',
  service: '',
  budget: '',
  timeline: '',
  message: '',
};

function validate(values: Fields): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = 'Tell us who you are.';
  if (!values.email.trim()) errors.email = 'We need an address to reply to.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
    errors.email = 'That address does not look right.';
  if (!values.service) errors.service = 'Pick the closest one.';
  if (values.message.trim().length < 10)
    errors.message = 'A sentence or two is enough to get started.';
  return errors;
}

/** Small line icons for the service cards, keyed by slug. */
const ICONS: Record<string, ReactNode> = {
  web: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="6" cy="6.8" r="0.8" fill="currentColor" />
    </>
  ),
  app: (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.5 18.5h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  ai: (
    <path
      d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  ),
  marketing: (
    <path
      d="M4 19.5h16M6.5 16V11M11 16V7.5M15.5 16v-5M20 16V5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  ),
  unsure: (
    <>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.6" r="0.9" fill="currentColor" />
    </>
  ),
};

export default function ContactForm({
  to,
  endpoint,
  services,
  plans,
}: {
  to: string;
  /** Apps Script web-app URL. Empty falls back to a mailto hand-off. */
  endpoint: string;
  services: ServiceOption[];
  /** scope option id → "Growth site (Web Development)" */
  plans: Record<string, string>;
}) {
  const [values, setValues] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [plan, setPlan] = useState<string>('');
  // Honeypot, and when the form appeared. Bots fill the one and submit
  // instantly; the endpoint drops both.
  const trap = useRef<HTMLInputElement>(null);
  const shownAt = useRef(Date.now());

  // Pre-fill from a pricing card link.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const slug = q.get('service');
    const match = services.find((s) => s.slug === slug);
    if (match) setValues((v) => ({ ...v, service: match.title }));
    const p = q.get('plan');
    if (p && plans[p]) setPlan(plans[p]);
  }, [services, plans]);

  const set = (key: keyof Fields) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (touched[key]) setErrors(validate({ ...values, [key]: value }));
  };

  const blur = (key: keyof Fields) => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate(values));
  };

  function mailtoHref(v: Fields) {
    const body = [
      'Name: ' + v.name,
      'Email: ' + v.email,
      v.company ? 'Company: ' + v.company : null,
      'Service: ' + v.service,
      plan ? 'Scope option: ' + plan : null,
      v.budget ? 'Budget: ' + v.budget : null,
      v.timeline ? 'Timeline: ' + v.timeline : null,
      '',
      v.message,
    ]
      .filter((line) => line !== null)
      .join('\n');

    const subject = encodeURIComponent('New project enquiry from ' + v.name);
    return 'mailto:' + to + '?subject=' + subject + '&body=' + encodeURIComponent(body);
  }

  async function send(v: Fields) {
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), SEND_TIMEOUT_MS);
    try {
      // text/plain keeps this a CORS "simple request": Apps Script cannot
      // answer the preflight that application/json would trigger.
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          ...v,
          plan,
          page: window.location.href,
          website: trap.current?.value ?? '',
          elapsedMs: Date.now() - shownAt.current,
        }),
        signal: abort.signal,
      });
      const reply = await res.json();
      if (!res.ok || !reply?.ok) throw new Error('rejected');
      setStatus('sent');
    } catch {
      setStatus('error');
    } finally {
      clearTimeout(timer);
    }
  }

  function submit() {
    if (status === 'sending') return;
    const found = validate(values);
    setErrors(found);
    setTouched({ name: true, email: true, service: true, message: true });

    if (Object.keys(found).length) {
      // Move focus to the first problem, so keyboard and screen-reader users
      // are not left guessing which field failed. Document order, not object
      // order: service comes first on the page.
      const order: (keyof Fields)[] = ['service', 'name', 'email', 'message'];
      const first = order.find((k) => found[k]);
      document.getElementById('field-' + first)?.focus();
      return;
    }

    setStatus('sending');
    if (endpoint) {
      void send(values);
    } else {
      window.location.href = mailtoHref(values);
      setTimeout(() => setStatus('sent'), 700);
    }
  }

  if (status === 'sent') {
    return (
      <div className="p-2 sm:p-4" role="status">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-[#eef4ff]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m5 12.5 4.5 4.5L19 7.5"
              stroke="#0060e6"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {endpoint ? (
          <>
            <h2 className="h3 mt-6 text-ink">Brief received.</h2>
            <p className="mt-3 text-ink-muted">
              Thank you, {values.name.trim().split(/\s+/)[0]}. We will reply to {values.email.trim()}{' '}
              within one working day.
            </p>
          </>
        ) : (
          <>
            <h2 className="h3 mt-6 text-ink">Your mail client should be open.</h2>
            <p className="mt-3 text-ink-muted">
              Send the email it drafted and we will reply within one working day. If nothing
              opened, write to{' '}
              <a href={'mailto:' + to} className="text-brand-text underline underline-offset-4">
                {to}
              </a>
              .
            </p>
          </>
        )}
        <button
          type="button"
          onClick={() => {
            setValues(EMPTY);
            setTouched({});
            setErrors({});
            setPlan('');
            setStatus('idle');
          }}
          className="btn btn--secondary mt-7"
        >
          Start another brief
        </button>
      </div>
    );
  }

  const bad = (key: keyof Fields) => Boolean(touched[key] && errors[key]);
  const describedBy = (key: keyof Fields) => (bad(key) ? 'err-' + key : undefined);
  const input = (key: keyof Fields) => 'cf-input' + (bad(key) ? ' cf-input--bad' : '');

  const options = [...services.map((s) => ({ key: s.slug, title: s.title })), { key: 'unsure', title: NOT_SURE }];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      noValidate
      className="space-y-8"
    >
      <fieldset aria-describedby={describedBy('service')}>
        <legend className="cf-legend">
          <span className="cf-step">1</span>
          What do you need?
        </legend>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {options.map((o, i) => (
            <label key={o.key} className="cf-choice">
              <input
                id={i === 0 ? 'field-service' : undefined}
                type="radio"
                name="service"
                value={o.title}
                checked={values.service === o.title}
                onChange={() => {
                  set('service')(o.title);
                  setTouched((t) => ({ ...t, service: true }));
                  setErrors(validate({ ...values, service: o.title }));
                }}
                className="sr-only"
              />
              <span className="cf-choice__icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  {ICONS[o.key]}
                </svg>
              </span>
              <span className="cf-choice__label">{o.title}</span>
              <span className="cf-choice__tick" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </label>
          ))}
        </div>
        {plan && (
          <p className="mt-3 flex items-center gap-2 text-[0.875rem] text-ink-muted">
            <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-brand-text">Scope</span>
            {plan}
            <button
              type="button"
              className="ml-1 text-ink-faint underline underline-offset-4 hover:text-ink"
              onClick={() => setPlan('')}
            >
              Remove
            </button>
          </p>
        )}
        {bad('service') && (
          <p id="err-service" className="cf-error">
            {errors.service}
          </p>
        )}
      </fieldset>

      <fieldset>
        <legend className="cf-legend">
          <span className="cf-step">2</span>
          Budget and timing <span className="cf-optional">Optional</span>
        </legend>
        <ChipGroup
          name="budget"
          label="Budget"
          items={BUDGETS}
          value={values.budget}
          onChange={set('budget')}
        />
        <ChipGroup
          name="timeline"
          label="When should it be live?"
          items={TIMELINES}
          value={values.timeline}
          onChange={set('timeline')}
        />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="cf-legend">
          <span className="cf-step">3</span>
          About you and the project
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="name" label="Your name" error={bad('name') ? errors.name : undefined}>
            <input
              id="field-name"
              type="text"
              autoComplete="name"
              className={input('name')}
              value={values.name}
              onChange={(e) => set('name')(e.target.value)}
              onBlur={blur('name')}
              aria-invalid={bad('name')}
              aria-describedby={describedBy('name')}
            />
          </Field>
          <Field id="email" label="Work email" error={bad('email') ? errors.email : undefined}>
            <input
              id="field-email"
              type="email"
              autoComplete="email"
              className={input('email')}
              value={values.email}
              onChange={(e) => set('email')(e.target.value)}
              onBlur={blur('email')}
              aria-invalid={bad('email')}
              aria-describedby={describedBy('email')}
            />
          </Field>
        </div>
        <Field id="company" label="Company or website" hint="Optional">
          <input
            id="field-company"
            type="text"
            autoComplete="organization"
            className={input('company')}
            value={values.company}
            onChange={(e) => set('company')(e.target.value)}
          />
        </Field>
        <Field
          id="message"
          label="What are you building?"
          hint={`${values.message.trim().length < 10 ? 'A sentence or two' : 'Thanks'}`}
          error={bad('message') ? errors.message : undefined}
        >
          <textarea
            id="field-message"
            rows={5}
            className={input('message') + ' resize-y'}
            placeholder="The goal, who it is for, anything that already exists, and any date it has to hit."
            value={values.message}
            onChange={(e) => set('message')(e.target.value)}
            onBlur={blur('message')}
            aria-invalid={bad('message')}
            aria-describedby={describedBy('message')}
          />
        </Field>
      </fieldset>

      <div className="cf-hp" aria-hidden="true">
        <label>
          Leave this field empty
          <input ref={trap} type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status === 'error' && (
        <p className="cf-alert" role="alert">
          That did not send, but your brief is still here. Try again, or{' '}
          <a href={mailtoHref(values)}>send it by email instead</a>.
        </p>
      )}

      <div className="flex flex-col gap-4 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xs text-[0.8125rem] text-ink-faint">
          {endpoint
            ? 'We reply within one working day.'
            : 'Opens your email app with this brief filled in. We reply within one working day.'}
        </p>
        {/* The label stays in place while sending, so the button keeps its
            width; the spinner covers it and the status line announces it. */}
        <button
          type="submit"
          data-loading={status === 'sending' ? '' : undefined}
          aria-busy={status === 'sending' || undefined}
          className="btn btn--primary btn--lg btn--split w-full sm:w-auto"
        >
          <span className="btn__label">Send brief</span>
          <span className="btn__cell" aria-hidden="true">
            <span className="btn__arrow">
              {[0, 1].map((k) => (
                <svg key={k} width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h13m0 0-5.5-5.5M18 12l-5.5 5.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ))}
            </span>
          </span>
          <span className="btn__spinner" aria-hidden="true" />
        </button>
      </div>
      <p className="sr-only" role="status">
        {status === 'sending'
          ? endpoint
            ? 'Sending your brief.'
            : 'Opening your mail client.'
          : ''}
      </p>
    </form>
  );
}

function ChipGroup({
  name,
  label,
  items,
  value,
  onChange,
}: {
  name: string;
  label: string;
  items: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-4" role="radiogroup" aria-label={label}>
      <p className="mb-2.5 text-[0.875rem] font-medium text-ink">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <label key={item} className="cf-chip">
            <input
              type="radio"
              name={name}
              value={item}
              checked={value === item}
              onChange={() => onChange(item)}
              className="sr-only"
            />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </div>
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
        htmlFor={'field-' + id}
        className="mb-2 flex items-baseline justify-between gap-3 text-[0.875rem] font-medium text-ink"
      >
        {label}
        {hint && <span className="text-[0.75rem] font-normal text-ink-faint">{hint}</span>}
      </label>
      {children}
      {error && (
        <p id={'err-' + id} className="cf-error">
          {error}
        </p>
      )}
    </div>
  );
}
