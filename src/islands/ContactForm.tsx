import { useState, type ReactNode } from 'react';

const SERVICES = [
  'Web Development',
  'App Development',
  'AI Automation',
  'Digital Marketing',
  'Not sure yet',
];

const BUDGETS = ['Under 10k', '10k - 25k', '25k - 50k', '50k+', 'Not sure yet'];

interface Fields {
  name: string;
  email: string;
  service: string;
  budget: string;
  message: string;
}

type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = { name: '', email: '', service: '', budget: '', message: '' };

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

/**
 * Contact form.
 *
 * There is no backend on this project yet, so a validated submission opens the
 * reader's mail client with everything pre-filled. That is a real, working
 * outcome rather than a fake success toast. Swap `handoff` for a POST once an
 * endpoint exists; nothing else here needs to change.
 */
export default function ContactForm({ to }: { to: string }) {
  const [values, setValues] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const set = (key: keyof Fields) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (touched[key]) setErrors(validate({ ...values, [key]: value }));
  };

  const blur = (key: keyof Fields) => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate(values));
  };

  function handoff(v: Fields) {
    const body = [
      'Name: ' + v.name,
      'Email: ' + v.email,
      'Service: ' + v.service,
      v.budget ? 'Budget: ' + v.budget : null,
      '',
      v.message,
    ]
      .filter(Boolean)
      .join('\n');

    const subject = encodeURIComponent('New project enquiry from ' + v.name);
    window.location.href =
      'mailto:' + to + '?subject=' + subject + '&body=' + encodeURIComponent(body);
  }

  function submit() {
    const found = validate(values);
    setErrors(found);
    setTouched({ name: true, email: true, service: true, budget: true, message: true });

    if (Object.keys(found).length) {
      // Move focus to the first problem, so keyboard and screen-reader users
      // are not left guessing which field failed.
      const first = Object.keys(found)[0];
      document.getElementById('field-' + first)?.focus();
      return;
    }

    setStatus('sending');
    handoff(values);
    setTimeout(() => setStatus('sent'), 600);
  }

  if (status === 'sent') {
    return (
      <div className="card-tint p-8 sm:p-10" role="status">
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
        <h2 className="h3 mt-6 text-ink">Your mail client should be open.</h2>
        <p className="mt-3 text-ink-muted">
          If nothing happened, write to{' '}
          <a href={'mailto:' + to} className="text-brand-text underline underline-offset-4">
            {to}
          </a>{' '}
          and we will pick it up from there.
        </p>
        <button
          type="button"
          onClick={() => {
            setValues(EMPTY);
            setTouched({});
            setErrors({});
            setStatus('idle');
          }}
          className="mt-7 rounded-[10px] border border-line-strong px-5 py-3 text-[0.9375rem] font-medium text-ink transition-colors hover:border-sky"
        >
          Send another
        </button>
      </div>
    );
  }

  const base =
    'w-full rounded-[10px] border bg-white px-4 py-3.5 text-ink placeholder:text-ink-faint transition-[border-color,box-shadow] duration-[180ms] focus:outline-none focus:ring-2 focus:ring-brand/35 ';

  const ring = (key: keyof Fields) =>
    base +
    (errors[key] && touched[key]
      ? 'border-[#c8384f]'
      : 'border-line-strong focus:border-brand');

  const bad = (key: keyof Fields) => Boolean(touched[key] && errors[key]);
  const describedBy = (key: keyof Fields) => (bad(key) ? 'err-' + key : undefined);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      noValidate className="card-tint space-y-5 p-6 sm:p-9">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Your name" error={touched.name ? errors.name : undefined}>
          <input
            id="field-name"
            type="text"
            autoComplete="name"
            className={ring('name')}
            value={values.name}
            onChange={(e) => set('name')(e.target.value)}
            onBlur={blur('name')}
            aria-invalid={bad('name')}
            aria-describedby={describedBy('name')}
          />
        </Field>

        <Field id="email" label="Email" error={touched.email ? errors.email : undefined}>
          <input
            id="field-email"
            type="email"
            autoComplete="email"
            className={ring('email')}
            value={values.email}
            onChange={(e) => set('email')(e.target.value)}
            onBlur={blur('email')}
            aria-invalid={bad('email')}
            aria-describedby={describedBy('email')}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="service"
          label="What do you need?"
          error={touched.service ? errors.service : undefined}
        >
          <select
            id="field-service"
            className={ring('service')}
            value={values.service}
            onChange={(e) => set('service')(e.target.value)}
            onBlur={blur('service')}
            aria-invalid={bad('service')}
            aria-describedby={describedBy('service')}
          >
            <option value="">Select one</option>
            {SERVICES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        <Field id="budget" label="Budget" hint="Optional">
          <select
            id="field-budget"
            className={ring('budget')}
            value={values.budget}
            onChange={(e) => set('budget')(e.target.value)}
          >
            <option value="">Prefer not to say</option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        id="message"
        label="About the project"
        error={touched.message ? errors.message : undefined}
      >
        <textarea
          id="field-message"
          rows={5}
          className={ring('message') + ' resize-y'}
          placeholder="What are you building, and when does it need to be live?"
          value={values.message}
          onChange={(e) => set('message')(e.target.value)}
          onBlur={blur('message')}
          aria-invalid={bad('message')}
          aria-describedby={describedBy('message')}
        />
      </Field>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-brand-text px-6 py-4 font-medium text-white transition-[transform,background-color] duration-[180ms] ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:bg-[#0a52c4] disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
      >
        {status === 'sending' ? 'Opening your mail client...' : 'Send it'}
      </button>

      <p className="text-[0.8125rem] text-ink-faint">
        We reply to everything within one working day.
      </p>
    </form>
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
        <p id={'err-' + id} className="mt-2 text-[0.8125rem] text-[#c8384f]">
          {error}
        </p>
      )}
    </div>
  );
}
