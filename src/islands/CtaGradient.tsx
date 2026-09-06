import { GradFlow } from 'gradflow';
import { useEffect, useRef, useState } from 'react';

export default function CtaGradient() {
  const host = useRef<HTMLDivElement>(null);
  const [canvasVersion, setCanvasVersion] = useState(0);

  useEffect(() => {
    const element = host.current;
    if (!element) return;

    // GradFlow measures its parent only on mount and window resize. The CTA
    // changes size via scroll, so remount its WebGL canvas after that motion
    // settles instead of broadcasting a synthetic window resize to every
    // ScrollTrigger on the page.
    let timer: number | undefined;
    const observer = new ResizeObserver(() => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => setCanvasVersion((version) => version + 1), 140);
    });

    observer.observe(element);
    return () => {
      observer.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={host} className="absolute inset-0">
      <GradFlow
        key={canvasVersion}
        className="cta-gradient__canvas"
        config={{
          type: 'aurora',
          color1: '#102d72',
          color2: '#1479d1',
          color3: '#003b9f',
          speed: 1.95,
          scale: 2.25,
          noise: 0.2,
        }}
      />
    </div>
  );
}
