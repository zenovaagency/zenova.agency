import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { motion } from "motion/react";
import { useContent } from "@/admin/store";

function splitIntoColumns<T>(items: T[], columnCount: number): T[][] {
  const columns: T[][] = Array.from({ length: columnCount }, () => []);
  items.forEach((item, index) => {
    columns[index % columnCount].push(item);
  });
  return columns;
}

export const Testimonials = () => {
  const [content] = useContent();

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
    <section className="bg-background my-20 relative">
      <div className="container z-10 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
        >
          <SectionHeader
            align="center"
            eyebrow="Testimonials"
            title={
              <>
                What our users <span style={{ color: 'var(--fg-dim)' }}>say.</span>
              </>
            }
            sub="See what our customers have to say about us."
          />
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
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
