"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";

export type PortfolioHeroContent = {
  /** One big heading, 2 to 3 words */
  heading: string;
};

export const portfolioHeroV2: PortfolioHeroContent = {
  heading: "Work That Talks.",
};

type PortfolioHeroProps = { content?: PortfolioHeroContent; className?: string };

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Portfolio opening: one big centred heading. On load each letter rises out of its own
 * mask with a slight tilt that settles, word after word. Transform only, plays once.
 */
export function PortfolioHeroV2({ content = portfolioHeroV2, className }: PortfolioHeroProps) {
  const reduce = useReducedMotionSafe();
  const words = content.heading.split(" ");
  let letterIndex = 0;

  return (
    <section
      aria-label={content.heading}
      className={cn("relative flex min-h-[58svh] items-end justify-center overflow-hidden bg-[#030712] px-4 pb-[clamp(2.5rem,7vh,5rem)] pt-36 text-white", className)}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_45%_at_50%_65%,rgb(123_97_255/0.10),transparent_70%)]" />

      <h1 className="relative text-center font-footer-display text-[clamp(3.25rem,12.5vw,13rem)] font-bold leading-[0.9] tracking-[-0.055em]">
        <span className="sr-only">{content.heading}</span>
        <span aria-hidden className="inline-flex flex-wrap justify-center gap-x-[0.22em]">
          {words.map((word, w) => (
            <span key={`${word}-${w}`} className="inline-flex whitespace-nowrap">
              {Array.from(word).map((ch) => {
                const i = letterIndex++;
                return (
                  <span key={i} className="inline-block overflow-hidden pb-[0.1em] align-bottom">
                    <motion.span
                      className="inline-block will-change-transform"
                      initial={reduce ? false : { y: "115%", rotate: 8 }}
                      animate={{ y: "0%", rotate: 0 }}
                      transition={{ duration: 1.1, ease: EASE, delay: 0.15 + i * 0.035 + w * 0.06 }}
                      style={{ transformOrigin: "0% 100%" }}
                    >
                      {ch}
                    </motion.span>
                  </span>
                );
              })}
            </span>
          ))}
        </span>
      </h1>
    </section>
  );
}
