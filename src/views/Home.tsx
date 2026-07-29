'use client';
import { lazy, Suspense, useEffect } from 'react';
import { useLocation } from '@/lib/router';
import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';
import { Process } from '@/components/sections/Process';

const Work = lazy(() => import('@/components/sections/Work').then((m) => ({ default: m.Work })));
const Testimonials = lazy(() => import('@/components/ui/testimonials-demo').then((m) => ({ default: m.Testimonials })));
const FAQ = lazy(() => import('@/components/sections/FAQ').then((m) => ({ default: m.FAQ })));
const CTA = lazy(() => import('@/components/sections/CTA').then((m) => ({ default: m.CTA })));

interface HomeProps {
  rotateMs: number;
  showMarquee: boolean;
  showTestimonials: boolean;
}

function SectionSkeleton({ minHeight = 400 }: { minHeight?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        minHeight,
        width: '100%',
        contain: 'strict',
      }}
    />
  );
}

export function Home({ rotateMs, showTestimonials }: HomeProps) {
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
      <Services />
      <Process />
      <Suspense fallback={<SectionSkeleton minHeight={700} />}>
        <Work />
      </Suspense>
      {showTestimonials && (
        <Suspense fallback={<SectionSkeleton minHeight={600} />}>
          <Testimonials />
        </Suspense>
      )}
      <Suspense fallback={<SectionSkeleton minHeight={500} />}>
        <FAQ />
      </Suspense>
      <Suspense fallback={<SectionSkeleton minHeight={360} />}>
        <CTA />
      </Suspense>
    </>
  );
}
