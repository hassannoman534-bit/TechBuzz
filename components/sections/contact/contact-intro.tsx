"use client";

import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { ContactChannels } from "./contact-channels";
import { LiveStatus } from "./live-status";
import type { ContactContent } from "./contact.config";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Left column: the heading (words rise out of a mask and clear from a soft blur), one line,
 * the studio's live status and the direct lines.
 */
export function ContactIntro({ content }: { content: ContactContent }) {
  const reduce = useReducedMotionSafe();
  const words = content.heading.split(" ");
  let letterIndex = 0;

  return (
    <div className="flex flex-col">
      <h1 className="text-white">
        <span className="sr-only">{content.heading}</span>
        <span
          aria-hidden
          className="group/h -mb-[0.16em] block pb-[0.16em] font-footer-display text-[clamp(3.4rem,15vw,5.5rem)] font-medium leading-[0.95] tracking-[-0.05em] md:text-[clamp(4.5rem,8.4vw,9.5rem)]"
          style={{ perspective: "900px" }}
        >
          {words.map((w, wi) => (
            <span key={`${w}-${wi}`} className="inline-block whitespace-nowrap">
              {Array.from(w).map((ch, ci) => {
                const n = letterIndex++;
                return (
                  <motion.span
                    key={ci}
                    className="inline-block will-change-transform"
                    style={{ transformOrigin: "50% 100% -0.4em" }}
                    initial={reduce ? false : { opacity: 0, y: "0.55em", rotateX: -85 }}
                    animate={{ opacity: 1, y: "0em", rotateX: 0 }}
                    transition={{ duration: 1.25, ease: EASE, delay: 0.2 + n * 0.045 }}
                  >
                    {/* hover: a slow wave runs through the letters */}
                    <span
                      className="inline-block transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/h:-translate-y-[0.08em] motion-reduce:transition-none"
                      style={{ transitionDelay: `${n * 28}ms` }}
                    >
                      {ch}
                    </span>
                  </motion.span>
                );
              })}
              {wi < words.length - 1 && <span className="inline-block w-[0.2em]" />}
            </span>
          ))}
        </span>
      </h1>

      <motion.p
        className="mt-[clamp(1.25rem,3svh,2rem)] max-w-[30ch] text-[clamp(1.05rem,1.35vw,1.3rem)] leading-[1.5] text-white/80"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.6 }}
      >
        {content.sub}
      </motion.p>

      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: EASE, delay: 0.8 }}
        className="mt-[clamp(1.25rem,3svh,2rem)]"
      >
        <LiveStatus hours={content.hours} />
      </motion.div>

      <div className="mt-[clamp(1.5rem,4svh,3rem)]">
        <ContactChannels channels={content.channels} delay={0.85} />
      </div>
    </div>
  );
}
