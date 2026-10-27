import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import ContactForm, { type ServiceOption } from './ContactForm';

/**
 * The right-hand panel on /contact: two ways in, as tabs.
 *
 *   Send a brief       the project form (POSTed to SITE.contactEndpoint, see ContactForm)
 *   Book a 30-min call Calendly, inline
 *
 * Calendly's script is third-party, so it is loaded only when the call tab is
 * first opened — never on page load. Until a Calendly URL is configured
 * (SITE.calendlyUrl), the tab offers email instead of a broken embed.
 *
 * /contact#book opens straight onto the call tab; switching tabs keeps the
 * hash in step, so the CTA's "Book a 30-min call" link lands correctly.
 * Tabs follow the WAI-ARIA pattern: arrow keys move between them.
 */

type Tab = 'brief' | 'book';

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (opts: { url: string; parentElement: HTMLElement }) => void;
    };
  }
}

const SCRIPT = 'https://assets.calendly.com/assets/external/widget.js';

function loadCalendly(): Promise<void> {
  if (window.Calendly) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`);
  return new Promise((resolve, reject) => {
    const s = existing ?? document.createElement('script');
    s.addEventListener('load', () => resolve(), { once: true });
    s.addEventListener('error', () => reject(new Error('Calendly failed to load')), { once: true });
    if (!existing) {
      s.src = SCRIPT;
      s.async = true;
      document.head.append(s);
    }
  });
}

export default function ContactPanel({
  to,
  calendlyUrl,
  endpoint,
  services,
  plans,
}: {
  to: string;
  calendlyUrl: string;
  endpoint: string;
  services: ServiceOption[];
  plans: Record<string, string>;
}) {
  const [tab, setTab] = useState<Tab>('brief');
  const [calendly, setCalendly] = useState<'idle' | 'loading' | 'ready' | 'failed'>('idle');
  const embed = useRef<HTMLDivElement>(null);
  const tabs = useRef<Record<Tab, HTMLButtonElement | null>>({ brief: null, book: null });

  const select = useCallback((next: Tab, focus = false) => {
    setTab(next);
    const hash = next === 'book' ? '#book' : '';
    if (location.hash !== hash) history.replaceState(null, '', location.pathname + location.search + hash);
    if (focus) tabs.current[next]?.focus();
  }, []);

  // Deep link, and links elsewhere on the page that point at #book.
  useEffect(() => {
    const sync = () => {
      if (location.hash === '#book') setTab('book');
    };
    sync();
    addEventListener('hashchange', sync);
    return () => removeEventListener('hashchange', sync);
  }, []);

  // Load and mount Calendly the first time the call tab is shown.
  useEffect(() => {
    if (tab !== 'book' || !calendlyUrl || calendly !== 'idle') return;
    setCalendly('loading');
    loadCalendly()
      .then(() => {
        if (!embed.current || !window.Calendly) throw new Error('no widget');
        const url = new URL(calendlyUrl);
        url.searchParams.set('hide_gdpr_banner', '1');
        url.searchParams.set('primary_color', '0060e6');
        window.Calendly.initInlineWidget({ url: url.toString(), parentElement: embed.current });
        setCalendly('ready');
      })
      .catch(() => setCalendly('failed'));
  }, [tab, calendlyUrl, calendly]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      const next: Tab =
        e.key === 'Home' ? 'brief' : e.key === 'End' ? 'book' : tab === 'brief' ? 'book' : 'brief';
      select(next, true);
    }
  };

  const mailtoCall =
    'mailto:' +
    to +
    '?subject=' +
    encodeURIComponent('A 30-minute call') +
    '&body=' +
    encodeURIComponent('Hi Zenova,\n\nTwo or three times that suit me for a 30-minute call (with time zone):\n\n- \n- \n\nWhat it is about:\n');

  return (
    <div className="cp" id="book">
      <div className="cp-tabs" role="tablist" aria-label="How to get in touch" onKeyDown={onKey}>
        {(
          [
            ['brief', 'Send a brief'],
            ['book', 'Book a 30-min call'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            ref={(el) => {
              tabs.current[key] = el;
            }}
            id={`cp-tab-${key}`}
            role="tab"
            type="button"
            aria-selected={tab === key}
            aria-controls={`cp-panel-${key}`}
            tabIndex={tab === key ? 0 : -1}
            className="cp-tab"
            onClick={() => select(key)}
          >
            {label}
          </button>
        ))}
        <span className="cp-tabs__thumb" data-at={tab} aria-hidden="true" />
      </div>

      <div
        id="cp-panel-brief"
        role="tabpanel"
        aria-labelledby="cp-tab-brief"
        hidden={tab !== 'brief'}
        className="cp-panel"
      >
        <ContactForm to={to} endpoint={endpoint} services={services} plans={plans} />
      </div>

      <div
        id="cp-panel-book"
        role="tabpanel"
        aria-labelledby="cp-tab-book"
        hidden={tab !== 'book'}
        className="cp-panel"
      >
        {calendlyUrl && calendly !== 'failed' ? (
          <>
            <p className="text-ink-muted">
              Pick a time for a 30-minute video call about your project. No pitch deck, and no
              obligation.
            </p>
            <div className="cp-embed" ref={embed}>
              {calendly !== 'ready' && (
                <p className="cp-embed__loading" role="status">
                  Loading the calendar…
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="cp-fallback">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[#eef4ff] text-brand-text">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
                <path d="M3.5 9.5h17M8 2.8v4M16 2.8v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="h3 mt-6 text-ink">
              {calendly === 'failed' ? 'The calendar did not load.' : 'Book a 30-minute call by email.'}
            </h2>
            <p className="mt-3 max-w-md text-ink-muted">
              Send us two or three times that suit you, with your time zone, and we will confirm one
              within a working day.
            </p>
            <a href={mailtoCall} className="btn btn--primary btn--lg mt-7">
              <span className="btn__label">Email two times that suit you</span>
            </a>
            <p className="mt-4 text-[0.875rem] text-ink-faint">
              Or write to{' '}
              <a href={'mailto:' + to} className="text-brand-text underline underline-offset-4">
                {to}
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
