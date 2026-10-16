import { useEffect, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { copyText } from '../lib/clipboard';

const SERVICES = [
  'Web Development',
  'App Development',
  'AI Automation',
  'Digital Marketing',
  'Not sure yet',
];

// Values are what lands in the email; labels are what the reader sees.
const BUDGETS = [
  { value: 'Under 10k', label: 'Under $10k' },
  { value: '10k - 25k', label: '$10k – $25k' },
  { value: '25k - 50k', label: '$25k – $50k' },
  { value: '50k+', label: '$50k+' },
  { value: 'Not sure yet', label: 'Not sure yet' },
];

/**
 * Sentence openers for the message box. A blank textarea is the hardest part
 * of any contact form; a half-written sentence is much easier to finish.
 */
const STARTERS = [
  { label: 'What we are building', text: 'We are building ' },
  { label: 'The goal', text: 'The goal is ' },
  { label: 'Our deadline', text: 'It needs to be live by ' },
  { label: 'What exists today', text: 'Right now we have ' },
];

interface Fields {
  name: string;
  email: string;
  service: string;
  budget: string;
  message: string;
}

type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = { name: '', email: '', service: '', budget: '', message: '' };

// Required fields, in the order they appear on screen. Errors move focus to the
// first of these that has one, so this order has to match the markup.
const ORDER: (keyof Fields)[] = ['service', 'message', 'name', 'email'];

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

function compose(v: Fields, to: string) {
  const body = [
    'Name: ' + v.name.trim(),
    'Email: ' + v.email.trim(),
    'Service: ' + v.service,
    v.budget ? 'Budget: ' + v.budget : null,
    '',
    v.message.trim(),
  ]
    .filter((line) => line !== null)
    .join('\n');

  const subject = 'New project enquiry from ' + v.name.trim();
  const href =
    'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

  return { subject, body, href };
}

/**
 * Contact form.
 *
 * There is no backend on this project yet, so a validated submission opens the
 * reader's mail client with everything pre-filled. That is a real, working
 * outcome rather than a fake success toast — but it only works for people who
 * have a mail app, so the confirmation also offers "copy the brief" and a link
 * to open the draft again. Swap `handoff` for a POST once an endpoint exists;
 * nothing else here needs to change.
 */
export default function ContactForm({ to }: { to: string }) {
  const [values, setValues] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [copied, setCopied] = useState<'idle' | 'copied' | 'failed'>('idle');

  const messageRef = useRef<HTMLTextAreaElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  // Move focus to the confirmation so a screen reader announces it and a
  // keyboard user is not left on a button that no longer exists.
  useEffect(() => {
    if (status === 'sent') doneRef.current?.focus();
  }, [status]);

  const required = Object.keys(validate(values)).length;
  const answered = 4 - required;

  const set = (key: keyof Fields) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (touched[key]) setErrors(validate({ ...values, [key]: value }));
  };

  const blur = (key: keyof Fields) => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate(values));
  };

  function addStarter(text: string) {
    const current = values.message;
    const next = current && !current.endsWith('\n') ? current + '\n' + text : current + text;
    // Commit the new value before touching the caret: a deferred reset would
    // fire after the reader has started typing and throw the cursor backwards.
    flushSync(() => set('message')(next));
    const el = messageRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(next.length, next.length);
  }

  function submit() {
    const found = validate(values);
    setErrors(found);
    setTouched({ name: true, email: true, service: true, budget: true, message: true });

    const first = ORDER.find((k) => found[k]);
    if (first) {
      // Move focus to the first problem, so keyboard and screen-reader users
      // are not left guessing which field failed.
      document.getElementById('field-' + first)?.focus();
      return;
    }

    setStatus('sending');
    window.location.href = compose(values, to).href;
    timers.current.push(window.setTimeout(() => setStatus('sent'), 600));
  }

  async function copyBrief() {
    const { subject, body } = compose(values, to);
    const ok = await copyText('To: ' + to + '\nSubject: ' + subject + '\n\n' + body);
    setCopied(ok ? 'copied' : 'failed');
    timers.current.push(window.setTimeout(() => setCopied('idle'), 2400));
  }

  if (status === 'sent') {
    const { href } = compose(values, to);
    return (
      <div className="card-tint card-static p-7 sm:p-10" role="status">
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
        <h2 ref={doneRef} tabIndex={-1} className="h3 mt-6 text-ink outline-none">
          One last step: press send.
        </h2>
        <p className="mt-3 max-w-md text-ink-muted">
          We opened a draft to{' '}
          <span className="font-medium text-ink">{to}</span> with your brief filled in. Nothing
          reaches us until you send it from your mail app — then we reply within one working day.
        </p>

        <dl className="mt-6 grid gap-x-6 gap-y-3 rounded-[var(--radius-sm)] border border-line bg-white/70 p-5 text-[0.9375rem] sm:grid-cols-[auto_1fr]">
          <dt className="text-ink-faint">From</dt>
          <dd className="text-ink">
            {values.name.trim()} · {values.email.trim()}
          </dd>
          <dt className="text-ink-faint">Needs</dt>
          <dd className="text-ink">
            {values.service}
            {values.budget ? ' · ' + values.budget : ''}
          </dd>
        </dl>

        <p className="mt-6 text-[0.9375rem] text-ink-muted">
          No draft appeared? That usually means no mail app is set up on this device.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={copyBrief}
            className="inline-flex items-center gap-2 rounded-[10px] bg-brand-text px-5 py-3 text-[0.9375rem] font-medium text-white transition-colors duration-[180ms] hover:bg-[#0a52c4]"
          >
            {copied === 'copied'
              ? 'Copied — paste it into an email'
              : copied === 'failed'
                ? 'Copy failed — select the text above'
                : 'Copy my brief'}
          </button>
          <a
            href={href}
            className="rounded-[10px] border border-line-strong bg-white px-5 py-3 text-[0.9375rem] font-medium text-ink transition-colors duration-[180ms] hover:border-sky"
          >
            Open the draft again
          </a>
          <button
            type="button"
            onClick={() => {
              setStatus('idle');
              setCopied('idle');
            }}
            className="px-2 py-3 text-[0.9375rem] font-medium text-brand-text underline decoration-sky decoration-1 underline-offset-[5px] hover:decoration-brand"
          >
            Edit my brief
          </button>
        </div>
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
      noValidate
      className="card-tint card-static overflow-hidden"
    >
      {/* Progress. Decorative: the count beside the button says the same thing
          in words, so assistive tech does not need the bar. */}
      <div className="h-1 w-full bg-line/70" aria-hidden="true">
        <div
          className="h-full bg-gradient-to-r from-brand to-blush transition-[width] duration-[400ms] ease-[var(--ease-out-expo)]"
          style={{ width: (answered / 4) * 100 + '%' }}
        />
      </div>

      <div className="space-y-10 p-6 sm:p-9">
        {/* 01 — service */}
        <Group
          n="01"
          radios
          legend="What do you need?"
          error={touched.service ? errors.service : undefined}
          errorId="err-service"
        >
          <Chips
            name="service"
            firstId="field-service"
            options={SERVICES.map((s) => ({ value: s, label: s }))}
            value={values.service}
            onChange={(v) => {
              set('service')(v);
              setTouched((t) => ({ ...t, service: true }));
            }}
            invalid={bad('service')}
            describedBy={describedBy('service')}
          />
        </Group>

        {/* 02 — budget */}
        <Group n="02" radios legend="Roughly what budget?" hint="Optional">
          <Chips
            name="budget"
            options={BUDGETS}
            value={values.budget}
            onChange={set('budget')}
          />
          <p className="mt-3 text-[0.8125rem] text-ink-faint">
            Helps us suggest the right shape of project. Skip it if you would rather talk first.
          </p>
        </Group>

        {/* 03 — message */}
        <Group
          n="03"
          legend="Tell us about the project"
          htmlFor="field-message"
          error={touched.message ? errors.message : undefined}
          errorId="err-message"
        >
          <textarea
            id="field-message"
            ref={messageRef}
            rows={5}
            className={ring('message') + ' resize-y'}
            placeholder="What are you building, and when does it need to be live?"
            value={values.message}
            onChange={(e) => set('message')(e.target.value)}
            onBlur={blur('message')}
            aria-invalid={bad('message')}
            aria-describedby={describedBy('message')}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[0.8125rem] text-ink-faint">Stuck? Start with</span>
            {STARTERS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => addStarter(s.text)}
                className="rounded-full border border-dashed border-line-strong bg-white/60 px-3 py-1.5 text-[0.8125rem] text-ink-muted transition-colors duration-[180ms] hover:border-sky hover:text-ink"
              >
                + {s.label}
              </button>
            ))}
          </div>
        </Group>

        {/* 04 — contact details */}
        <Group n="04" legend="How do we reach you?">
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
        </Group>

        <div className="border-t border-line pt-7">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <button
              type="submit"
              disabled={status === 'sending'}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-brand-text px-7 py-4 font-medium text-white shadow-[0_2px_4px_rgb(11_53_88/0.10),0_10px_24px_rgb(0_96_230/0.22)] transition-[transform,background-color] duration-[180ms] ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:bg-[#0a52c4] disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
            >
              {status === 'sending' ? 'Opening your mail app...' : 'Send my brief'}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 12h13m0 0-5.5-5.5M18 12l-5.5 5.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <p className="text-[0.8125rem] tabular-nums text-ink-faint">
              {answered === 4 ? 'All set' : answered + ' of 4 required answered'}
            </p>
          </div>
          <p className="mt-4 max-w-md text-[0.8125rem] text-ink-faint">
            This opens your email app with the brief filled in — nothing is sent until you press
            send there. We reply to everything within one working day.
          </p>
        </div>
      </div>
    </form>
  );
}

/**
 * A numbered question block.
 *
 * `radios` renders a fieldset + legend, which is what gives a screen reader the
 * question when it lands on a chip. `htmlFor` renders a real <label> for a
 * block that holds one control. With neither it is just a headed section whose
 * inputs carry their own labels.
 */
function Group({
  n,
  legend,
  hint,
  radios,
  htmlFor,
  error,
  errorId,
  children,
}: {
  n: string;
  legend: string;
  hint?: string;
  radios?: boolean;
  htmlFor?: string;
  error?: string;
  errorId?: string;
  children: ReactNode;
}) {
  const heading = (
    <span className="flex items-baseline gap-3">
      <span className="mono tabular-nums text-ink-faint">{n}</span>
      <span className="text-[1.0625rem] font-medium tracking-[-0.01em] text-ink">{legend}</span>
      {hint && <span className="text-[0.75rem] font-normal text-ink-faint">{hint}</span>}
    </span>
  );

  const body = (
    <>
      {children}
      {error && (
        <p id={errorId} className="mt-3 text-[0.8125rem] text-[#c8384f]">
          {error}
        </p>
      )}
    </>
  );

  if (radios) {
    return (
      <fieldset>
        <legend className="mb-4 p-0">{heading}</legend>
        {body}
      </fieldset>
    );
  }

  return (
    <div>
      {htmlFor ? (
        <label htmlFor={htmlFor} className="mb-4 block">
          {heading}
        </label>
      ) : (
        <p className="mb-4">{heading}</p>
      )}
      {body}
    </div>
  );
}

/** Radio buttons drawn as tap-friendly chips. Native inputs, so arrow keys work. */
function Chips({
  name,
  firstId,
  options,
  value,
  onChange,
  invalid,
  describedBy,
}: {
  name: string;
  /** Id for the first radio, so a validation error has somewhere to send focus. */
  firstId?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((opt, i) => (
        <label key={opt.value} className="relative cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt.value}
            id={i === 0 ? firstId : undefined}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            aria-describedby={describedBy}
            className="peer sr-only"
          />
          <span
            className={
              'inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-[0.9375rem] transition-colors duration-[180ms] peer-checked:border-brand-text peer-checked:bg-brand-text peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand ' +
              (invalid
                ? 'border-[#c8384f] bg-white text-ink'
                : 'border-line-strong bg-white text-ink hover:border-sky')
            }
          >
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
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
