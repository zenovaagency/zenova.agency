"use client";
import React from "react";
import { motion } from "motion/react";

export interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
}

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-background"
      >
        {new Array(2).fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, image, name, role }, i) => (
              <div
                className="p-10 rounded-3xl border max-w-xs md:max-w-sm w-full bg-[var(--card)]"
                key={i}
              >
                <div>{text}</div>
                <div className="flex items-center gap-2 mt-10">
                  <img
                    width={32}
                    height={32}
                    src={image}
                    alt={name}
                    className="h-8 w-8 rounded-full"
                  />
                  <div className="flex flex-col">
                    <div className="font-medium tracking-tight leading-4 text-sm">
                      {name}
                    </div>
                    <div className="leading-4 opacity-60 tracking-tight text-xs">
                      {role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};
