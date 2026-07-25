import { useEffect, useState } from 'react';

interface RotatingWordsProps {
  words: string[];
  intervalMs?: number;
}

type Phase = 'in' | 'out';

export function RotatingWords({ words, intervalMs = 2400 }: RotatingWordsProps) {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('in');

  useEffect(() => {
    const cycle = setInterval(() => {
      setPhase('out');
      setTimeout(() => {
        setIdx((i) => (i + 1) % words.length);
        setPhase('in');
      }, 400);
    }, intervalMs);
    return () => clearInterval(cycle);
  }, [words.length, intervalMs]);

  const anim =
    phase === 'in'
      ? 'word-in .6s cubic-bezier(.2,.7,.2,1) both'
      : 'word-out .4s cubic-bezier(.4,0,1,.6) both';

  return (
    <span className="rotating-words">
      {/* invisible sizers reserve the rendered width of the widest word so layout doesn't jump */}
      {words.map((w, i) => (
        <span key={`sizer-${i}`} aria-hidden className="rotating-words__sizer">
          {w}
        </span>
      ))}
      <span key={idx + phase} className="rotating-words__word" style={{ animation: anim }}>
        <span className="rotating-words__fill gradient-text">{words[idx]}</span>
      </span>
    </span>
  );
}
