import { useEffect, useRef, useState } from 'react';
import { copyText } from '../lib/clipboard';

/**
 * Small "copy this address" button. Lives beside a mailto link rather than
 * replacing it: a mailto does nothing for anyone without a mail app set up,
 * which is a lot of people, and copying is the one thing that always works.
 */
export default function CopyEmail({ value, className = '' }: { value: string; className?: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    const ok = await copyText(value);
    setState(ok ? 'copied' : 'failed');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState('idle'), 2200);
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label={'Copy ' + value}
        className={
          'inline-flex items-center gap-2 rounded-full border border-line-strong bg-white px-3.5 py-1.5 text-[0.8125rem] font-medium text-ink transition-colors duration-[180ms] hover:border-sky ' +
          className
        }
      >
        {state === 'copied' ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m5 12.5 4.5 4.5L19 7.5" stroke="#0060e6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
            <path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        )}
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : 'Copy'}
      </button>
      <span className="sr-only" role="status">
        {state === 'copied' ? 'Email address copied' : state === 'failed' ? 'Copy failed' : ''}
      </span>
    </>
  );
}
