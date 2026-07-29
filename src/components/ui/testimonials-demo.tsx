import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DEFAULT_CONTENT, useContent } from "@/admin/store";
import { JsonLd } from "@/seo/JsonLd";
import { SITE } from "@/seo/seo-data";

function splitIntoColumns<T>(items: T[], columnCount: number): T[][] {
  const columns: T[][] = Array.from({ length: columnCount }, () => []);
  items.forEach((item, index) => {
    columns[index % columnCount].push(item);
  });
  return columns;
}

export const Testimonials = () => {
  const [content] = useContent();
  const raw = content.testimonialsSection;
  const header = raw?.eyebrow || raw?.title || raw?.titleAccent || raw?.sub
    ? raw!
    : DEFAULT_CONTENT.testimonialsSection!;

  const testimonials = content.testimonials.map((t) => ({
    text: t.quote,
    image:
      t.image ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=${encodeURIComponent(t.tone)}&color=fff`,
    name: t.name,
    role: t.role,
  }));

  const doubledTestimonials = [...testimonials, ...testimonials];
  const [firstColumn, secondColumn, thirdColumn] = splitIntoColumns(doubledTestimonials, 3);

  return (
    <section id="testimonials" className="sec" aria-label="Client testimonials">
      {/*
        Review nodes carry NO ratingValue and there is deliberately no
        AggregateRating: the testimonials are quotes, not scored reviews, so
        any number here would be invented. Google treats fabricated review
        markup as a structured-data violation, and an answer engine that
        quotes an invented "4.9/5" back to a user is worse than one that
        quotes the testimonial itself. Attribution + text is the honest set.
      */}
      <JsonLd
        data={content.testimonials.map((t) => ({
          '@context': 'https://schema.org',
          '@type': 'Review',
          reviewBody: t.quote,
          author: { '@type': 'Person', name: t.name, jobTitle: t.role },
          itemReviewed: {
            '@type': 'Organization',
            '@id': `${SITE.url}/#organization`,
            name: SITE.name,
            // The @id already merges this into the full Organization node, but
            // repeating url keeps each Review self-describing for a consumer
            // that reads one block in isolation.
            url: `${SITE.url}/`,
          },
        }))}
      />
      <div className="container z-10 mx-auto">
        <SectionHeader
          align="center"
          eyebrow={header.eyebrow}
          title={
            <>
              {header.title}
              {header.titleAccent && (
                <>
                  <br />
                  <span style={{ color: 'var(--fg-dim)' }}>{header.titleAccent}</span>
                </>
              )}
            </>
          }
          sub={header.sub}
        />

        <div className="reveal reveal-d1 flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden md:block"
            duration={17}
          />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
