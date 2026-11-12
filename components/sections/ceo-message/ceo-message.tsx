"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { KineticText } from "@/components/ui/kinetic-text";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { ceoMessage, EASE } from "./ceo-message.config";
import { LogoIntro } from "./logo-intro";
import { PerspectiveMessage } from "./perspective-message";

const { heading, signature } = ceoMessage;

/**
 * Message From CEO, in three phases.
 *
 * 1. LogoIntro holds the screen while the logo settles, then unmounts through
 *    AnimatePresence so nothing is left in the DOM behind the page.
 * 2. The heading rises once the overlay is gone. `introDone` gates it, so the
 *    characters are never spent while they are hidden under the overlay.
 * 3. PerspectiveMessage carries the message itself on scroll.
 */
export function CeoMessage(): React.ReactElement {
  const reduce = useReducedMotionSafe();
  const [introDone, setIntroDone] = useState(false);
  const handleIntroDone = useCallback(() => setIntroDone(true), []);

  return (
    <>
      <AnimatePresence>
        {!introDone && <LogoIntro key="intro" onDone={handleIntroDone} />}
      </AnimatePresence>

      <section className="relative flex min-h-[max(30rem,72svh)] items-center justify-center overflow-hidden bg-[#030712] px-[clamp(1.25rem,6vw,8rem)] pb-[clamp(3rem,8vh,6rem)] pt-[clamp(7rem,16vh,10rem)] md:min-h-[clamp(30rem,82svh,58rem)]">
        <div className="flex w-full max-w-5xl flex-col items-center text-center">
          <motion.span
            className="font-footer-text text-[0.68rem] uppercase tracking-[0.28em] whitespace-nowrap text-white/40"
            initial={{ opacity: 0, y: 8 }}
            animate={introDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={reduce ? { duration: 0.01 } : { duration: 0.7, ease: EASE }}
          >
            {heading.eyebrow}
          </motion.span>

          <KineticText
            text={heading.title}
            as="h1"
            play={introDone}
            delay={0.18}
            stagger={0.028}
            radius={120}
            lift={12}
            className="mt-[clamp(1rem,3vh,1.75rem)]"
            style={{
              fontSize: "clamp(2.3rem,7vw,5.75rem)",
              lineHeight: 1.04,
              letterSpacing: "-0.035em",
            }}
          />

          <motion.p
            className="font-footer-text mt-[clamp(1.25rem,3.5vh,2rem)] max-w-xl text-[clamp(0.95rem,1.4vw,1.1rem)] leading-relaxed text-white/55"
            initial={{ opacity: 0, y: 12 }}
            animate={introDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={
              reduce ? { duration: 0.01 } : { duration: 0.9, ease: EASE, delay: 0.75 }
            }
          >
            {heading.sub}
          </motion.p>
        </div>
      </section>

      <PerspectiveMessage />

      <section className="relative w-full bg-[#030712] px-[clamp(1.25rem,6vw,8rem)] pb-[clamp(6rem,16vh,10rem)] pt-[clamp(4rem,12vh,7rem)]">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <span
            aria-hidden
            className="block h-px w-20"
            style={{
              background:
                "linear-gradient(90deg, rgba(3,7,18,0), rgba(201,194,255,0.45), rgba(3,7,18,0))",
            }}
          />
          <span
            className="font-footer-display text-[clamp(1.1rem,2.2vw,1.5rem)] text-[#e7eaf3]"
            style={{ fontWeight: 600, letterSpacing: "-0.01em" }}
          >
            {signature.name}
          </span>
          <span className="font-footer-text text-[0.72rem] uppercase tracking-[0.24em] whitespace-nowrap text-white/40">
            {signature.role}, {signature.company}
          </span>
        </div>
      </section>
    </>
  );
}
