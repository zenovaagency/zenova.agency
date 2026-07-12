import { type FormEvent, useEffect, useState } from 'react';
import { NeonButton } from '@/components/ui/NeonButton';
import { GhostButton } from '@/components/ui/GhostButton';
import { Icon } from '@/components/icons/Icon';
import { useBrand } from '@/admin/store';
import { submitContact } from '@/lib/contact';
import { scrollToTop } from '@/lib/scroll';
import './ContactPage.css';

interface ContactDetail {
  icon: keyof typeof Icon;
  label: string;
  value: string;
  href?: string;
}

export function ContactPage() {
  const [brand] = useBrand();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState(''); // bots fill hidden fields; humans don't
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    scrollToTop();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    setError(null);
    setSending(true);
    try {
      await submitContact({
        name: name.trim(),
        email: emailValue.trim(),
        message: message.trim(),
        company_website: honeypot,
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setSending(false);
    }
  };

  const email = brand?.contactEmail ?? 'hello@zenova.bd';
  const phone = brand?.phone ?? '+1 (555) 123-4567';
  const address = brand?.address ?? '123 Atlantic Ave, Brooklyn, NY 11201';
  const locations = brand?.locations ?? [];

  const details: ContactDetail[] = [
    { icon: 'Mail', label: 'Email', value: email, href: `mailto:${email}` },
    { icon: 'Phone', label: 'Phone', value: phone, href: `tel:${phone.replace(/\s/g, '')}` },
    { icon: 'MapPin', label: 'Address', value: address },
  ];

  return (
    <section className="ct-split">
      <div className="ct-intro">
        <div className="ct-kicker mono reveal">
          <span className="ct-kicker__tick" />
          Contact — replies within 24h
        </div>

        <h1 className="ct-title display reveal reveal-blur reveal-d1">
          Let&rsquo;s
          <br />
          talk<span className="gradient-text">.</span>
        </h1>

        <p className="ct-sub reveal reveal-d2">
          No pitch decks, no pressure &mdash; just a genuine conversation about what you&rsquo;re building.
        </p>

        <div className="ct-details reveal reveal-d3">
          {details.map((d) => (
            <div key={d.label} className="ct-detail">
              <span className="ct-detail__icon">{Icon[d.icon]({ size: 18 })}</span>
              <span className="ct-detail__label mono">{d.label}</span>
              {d.href ? (
                <a href={d.href} className="ct-detail__value">
                  {d.value}
                </a>
              ) : (
                <span className="ct-detail__value">{d.value}</span>
              )}
            </div>
          ))}
        </div>

        {locations.length > 0 && (
          <div className="ct-locations">
            {locations.map((loc) => (
              <div key={loc.id} className="ct-location">
                <span className="ct-location__city">{loc.city}</span>
                <span className="ct-location__meta mono">
                  {loc.tz}
                  {loc.detail ? ` · ${loc.detail}` : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ct-pane reveal reveal-d2">
        <div className="ct-pane__tag mono">Form / 01</div>

        {submitted ? (
          <div className="ct-success">
            <div className="ct-success__icon">
              <span className="ct-success__ring" />
              <span className="ct-success__ring" />
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent-1)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="ct-success__title display">Message received</h2>
            <p className="ct-success__text">Thanks for reaching out. We&rsquo;ll be in touch shortly.</p>
          </div>
        ) : (
          <form className="ct-form" onSubmit={handleSubmit} noValidate>
            <div className="ct-field">
              <label className="ct-field__label mono" htmlFor="ct-name">
                Name
              </label>
              <input
                id="ct-name"
                className="ct-field__input"
                type="text"
                placeholder="Your name"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={sending}
              />
            </div>

            <div className="ct-field">
              <label className="ct-field__label mono" htmlFor="ct-email">
                Email
              </label>
              <input
                id="ct-email"
                className="ct-field__input"
                type="email"
                placeholder="you@company.com"
                required
                autoComplete="email"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                disabled={sending}
              />
            </div>

            <div className="ct-field">
              <label className="ct-field__label mono" htmlFor="ct-message">
                Message
              </label>
              <textarea
                id="ct-message"
                className="ct-field__input ct-field__input--area"
                rows={6}
                placeholder="Tell us about your project, idea, or challenge&hellip;"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sending}
              />
            </div>

            {/* Honeypot: off-screen, non-tabbable, hidden from assistive tech. */}
            <input
              className="ct-hp"
              type="text"
              name="company_website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />

            {error && (
              <p className="ct-form__error" role="alert">
                {error}
              </p>
            )}

            <div className="ct-form__footer">
              <a href={`mailto:${email}?subject=Book%20a%2030-minute%20call`} className="ct-form__book">
                <GhostButton text="Book 30 min call" size="sm" />
              </a>
              <NeonButton
                text={sending ? 'Sending…' : 'Send message'}
                size="sm"
                type="submit"
                disabled={sending}
              />
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
