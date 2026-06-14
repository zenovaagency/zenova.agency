import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Hero } from '@/components/sections/Hero';
import { Marquee } from '@/components/sections/Marquee';
import { Services } from '@/components/sections/Services';
import { Process } from '@/components/sections/Process';
import { LiveProgress } from '@/components/sections/LiveProgress';
import { Work } from '@/components/sections/Work';
import Testimonials from '@/components/ui/testimonials-demo';
import { FAQ } from '@/components/sections/FAQ';
import { CTA } from '@/components/sections/CTA';
import { useReveal } from '@/hooks/useReveal';

interface HomeProps {
  rotateMs: number;
  showMarquee: boolean;
  showTestimonials: boolean;
}

export function Home({ rotateMs, showMarquee, showTestimonials }: HomeProps) {
  useReveal([showMarquee, showTestimonials]);
  const location = useLocation();

  useEffect(() => {
    const id = location.hash.replace(/^#/, '');
    if (!id) return;
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;
      const lenis = window.__lenis;
      if (lenis) {
        lenis.scrollTo(el, { offset: -80 });
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }, [location.key, location.hash]);

  return (
    <>
      <Hero rotateMs={rotateMs} />
      {showMarquee && <Marquee />}
      <Services />
      <Process />
      <LiveProgress />
      <Work />
      {showTestimonials && <Testimonials />}
      <FAQ />
      <CTA />
    </>
  );
}
