"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";

export type PageHeroContent = {
  /** Small label above the heading, e.g. "Careers" (optional) */
  eyebrow?: string;
  /** The heading, one string per line (2 lines reads best) */
  lines: string[];
  /** One liner under the heading */
  sub: string;
};

type PageHeroProps = {
  content: PageHeroContent;
  className?: string;
  /** Optional extra content under the one liner (a button, a link) */
  children?: ReactNode;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Simple page opening: a big centred heading on two lines with a one liner under it.
 * Each line is a mask; its words rise out of it one after another with a slight tilt that
 * settles. The one liner follows softly once the heading has landed. Plays once on load,
 * transform and opacity only.
 */
export function PageHero({ content, className, children }: PageHeroProps) {
  const reduce = useReducedMotionSafe();
  const lineCount = content.lines.length;
  const subDelay = 0.55 + lineCount * 0.14;

  return (
    <section
      className={cn(
        "relative flex min-h-[max(30rem,72svh)] md:min-h-[clamp(30rem,82svh,58rem)] items-center justify-center overflow-hidden bg-[#030712] px-[clamp(1.25rem,6vw,8rem)] pb-[clamp(3rem,8vh,6rem)] pt-[clamp(7rem,16vh,10rem)] text-white",
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_40%_at_50%_55%,rgb(123_97_255/0.09),transparent_70%)]" />

      <div className="relative mx-auto flex max-w-[min(100%,78rem)] flex-col items-center text-center">
        {content.eyebrow && (
          <motion.p
            className="mb-[clamp(1.25rem,3vh,2rem)] text-[0.72rem] font-medium uppercase tracking-[0.22em] text-white/45"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.1 }}
          >
            {content.eyebrow}
          </motion.p>
        )}

        <h1 className="font-footer-display text-[clamp(2.75rem,13vw,5rem)] md:text-[clamp(3.5rem,6.7vw,8.25rem)] font-medium leading-[1.02] tracking-[-0.045em]">
          <span className="sr-only">{content.lines.join(" ")}</span>
          {content.lines.map((line, l) => {
            const words = line.split(" ");
            return (
              <span key={`${line}-${l}`} aria-hidden className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
                {words.map((word, w) => (
                  <span key={`${word}-${w}`}>
                    <motion.span
                      className="inline-block will-change-transform"
                      style={{ transformOrigin: "0% 100%" }}
                      initial={reduce ? false : { y: "112%", rotate: 4 }}
                      animate={{ y: "0%", rotate: 0 }}
                      transition={{ duration: 1.35, ease: EASE, delay: 0.2 + l * 0.14 + w * 0.05 }}
                    >
                      {word}
                    </motion.span>
                    {w < words.length - 1 && " "}
                  </span>
                ))}
              </span>
            );
          })}
        </h1>

        <motion.p
          className="mt-[clamp(1.25rem,3.5vh,2.25rem)] max-w-[46ch] text-balance text-[clamp(1rem,1.3vw,1.4rem)] leading-[1.45] text-white/60"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: EASE, delay: subDelay }}
        >
          {content.sub}
        </motion.p>

        {children && (
          <motion.div
            className="mt-[clamp(1.75rem,4vh,2.75rem)]"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: EASE, delay: subDelay + 0.15 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
}
