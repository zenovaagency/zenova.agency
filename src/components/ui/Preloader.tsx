import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './Preloader.css';

type Phase = 'entering' | 'loading' | 'ready' | 'exiting' | 'hidden';

const WORD = 'ZENOVA';

export function Preloader() {
  const [phase, setPhase] = useState<Phase>('entering');
  const [percent, setPercent] = useState(0);
  const [allLettersIn, setAllLettersIn] = useState(false);
  const rafRef = useRef(0);
  const mountedRef = useRef(true);

  const startLoading = useCallback(() => {
    setPhase('loading');
    const start = performance.now();
    const duration = 1400;

    const tick = (now: number) => {
      if (!mountedRef.current) return;
      const elapsed = now - start;
      const raw = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - raw, 3);
      setPercent(Math.round(eased * 100));

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPercent(100);
        setPhase('ready');
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const enterTimer = setTimeout(startLoading, 100);
    return () => {
      mountedRef.current = false;
      clearTimeout(enterTimer);
      cancelAnimationFrame(rafRef.current);
    };
  }, [startLoading]);

  /* Track when the last letter's animation completes */
  useEffect(() => {
    if (phase === 'hidden') return;
    const lastLetterDelay = 200 + (WORD.length - 1) * 80 + 700;
    const timer = setTimeout(() => setAllLettersIn(true), lastLetterDelay);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'ready') return;
    const timer = setTimeout(() => setPhase('exiting'), 500);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'exiting') return;
    const timer = setTimeout(() => setPhase('hidden'), 900);
    return () => clearTimeout(timer);
  }, [phase]);

  const letters = useMemo(() => WORD.split(''), []);
  const dots = [0, 1, 2];
  const litCount = percent >= 100 ? 3 : percent >= 66 ? 2 : percent >= 33 ? 1 : 0;

  if (phase === 'hidden') return null;

  return (
    <div
      className={`preloader${phase === 'exiting' ? ' is-exiting' : ''}`}
      aria-hidden={phase === 'exiting'}
    >
      <div className="preloader__grid" />
      <div className="preloader__accent-line" />

      <div className="preloader__stage">
        <div className={`preloader__wordmark${allLettersIn ? ' is-complete' : ''}`}>
          {letters.map((letter, i) => (
            <span
              key={i}
              className="preloader__letter"
              style={{ animationDelay: `${0.2 + i * 0.08}s` }}
            >
              <span className="preloader__letter-inner">{letter}</span>
            </span>
          ))}
        </div>

        <div className="preloader__slogan">
          One agency for everything modern
        </div>

        <div className="preloader__dot-row">
          {dots.map((i) => (
            <div
              key={i}
              className={`preloader__dot${i < litCount ? ' is-lit' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
