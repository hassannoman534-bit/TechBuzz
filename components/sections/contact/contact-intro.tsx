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

  return (
    <div className="flex flex-col">
      <h1 className="text-white">
        <span className="sr-only">{content.heading}</span>
        <span
          aria-hidden
          className="-mb-[0.14em] block overflow-hidden pb-[0.14em] font-footer-display text-[clamp(3.4rem,15vw,5.5rem)] font-medium leading-[0.95] tracking-[-0.05em] md:text-[clamp(4.5rem,8.4vw,9.5rem)]"
        >
          {words.map((w, i) => (
            <span key={`${w}-${i}`}>
              <motion.span
                className="inline-block will-change-transform"
                style={{ transformOrigin: "0% 100%" }}
                initial={reduce ? false : { y: "105%", rotate: 3, opacity: 0, filter: "blur(10px)" }}
                animate={{ y: "0%", rotate: 0, opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.3, ease: EASE, delay: 0.25 + i * 0.09 }}
              >
                {w}
              </motion.span>
              {i < words.length - 1 && " "}
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
