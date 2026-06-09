import { useEffect, useState } from 'react';
import { NeonButton } from '@/components/ui/NeonButton';
import { GhostButton } from '@/components/ui/GhostButton';
import { Icon } from '@/components/icons/Icon';
import { useBrand } from '@/admin/store';

interface ContactDetail {
  icon: keyof typeof Icon;
  label: string;
  value: string;
  href?: string;
}

export function ContactPage() {
  const [brand] = useBrand();
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true }) ?? window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const email = brand?.contactEmail ?? 'hello@zenova.bd';
  const phone = brand?.phone ?? '+1 (555) 123-4567';
  const address = brand?.address ?? '123 Atlantic Ave, Brooklyn, NY 11201';

  const details: ContactDetail[] = [
    { icon: 'Mail', label: 'Email', value: email, href: `mailto:${email}` },
    { icon: 'Phone', label: 'Phone', value: phone, href: `tel:${phone.replace(/\s/g, '')}` },
    { icon: 'MapPin', label: 'Address', value: address },
    // { icon: 'Clock', label: 'Response time', value: '< 24 hours' },
  ];

  return (
    <section className="contact-page">

      <div className="contact-inner">
        <div className="contact-card">
          <div className="contact-accent-line" />

          {submitted ? (
            <div className="contact-success">
              <div className="contact-success__icon">
                <div className="contact-success__icon-ring" />
                <div className="contact-success__icon-ring" />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="contact-success__title">Message received</h2>
              <p className="contact-success__text">
                Thanks for reaching out. We&rsquo;ll be in touch shortly.
              </p>
            </div>
          ) : (
            <div className="contact-layout">
              <div className="contact-details">
                <h2 className="contact-heading">
                  Get in{' '}
                  <span className="gradient-text">touch</span>
                </h2>
                <p className="contact-sub">
                  We&rsquo;ll get back to you within 24 hours. No pitch decks, no pressure &mdash; just a genuine conversation.
                </p>

                <div className="contact-details__list">
                  {details.map((d) => (
                    <div key={d.label} className="contact-detail-card">
                      <span className="contact-detail-card__icon">
                        {Icon[d.icon]({ size: 20 })}
                      </span>
                      <div className="contact-detail-card__body">
                        <span className="contact-detail-card__label">{d.label}</span>
                        {d.href ? (
                          <a href={d.href} className="contact-detail-card__value">
                            {d.value}
                          </a>
                        ) : (
                          <span className="contact-detail-card__value">{d.value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="contact-form-col">
                <form
                  className="contact-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                >
                  <div className="contact-field">
                    <label className="contact-field__label">Name</label>
                    <input
                      className="contact-field__input"
                      type="text"
                      placeholder="Your name"
                      required
                      autoComplete="name"
                    />
                  </div>

                  <div className="contact-field">
                    <label className="contact-field__label">Email</label>
                    <input
                      className="contact-field__input"
                      type="email"
                      placeholder="you@company.com"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="contact-field">
                    <label className="contact-field__label">Message</label>
                    <textarea
                      className="contact-field__input"
                      rows={5}
                      placeholder="Tell us about your project, idea, or challenge&hellip;"
                      required
                      style={{ resize: 'none' }}
                    />
                  </div>

                  <div className="contact-form__footer">
                    <a href={`mailto:${email}?subject=Book%20a%2030-minute%20call`} className="contact-form__book-link">
                      <GhostButton text="Book 30 min call" size="sm" />
                    </a>
                    <NeonButton text="Send message" size="sm" />
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
