"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { KineticText } from "@/components/ui/kinetic-text";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { ceoMessage, EASE } from "./ceo-message.config";
import { CeoPortrait } from "./ceo-portrait";
import { LogoIntro } from "./logo-intro";
import { PerspectiveMessage } from "./perspective-message";
import { SignatureReveal } from "./signature-reveal";

const { heading, signature } = ceoMessage;

/**
 * Message From CEO, in three phases.
 *
 * 1. LogoIntro holds the screen, then unmounts through AnimatePresence so nothing
 *    is left in the DOM behind the page.
 * 2. The hero: the heading writes itself in from the left while the portrait comes
 *    in from the right, and the signature is laid down under the name. `introDone`
 *    gates all of it, so nothing is spent while it is hidden under the overlay.
 * 3. PerspectiveMessage carries the message through the camera on scroll.
 */
export function CeoMessage(): React.ReactElement {
  const reduce = useReducedMotionSafe();
  const [introDone, setIntroDone] = useState(false);
  const handleIntroDone = useCallback(() => setIntroDone(true), []);

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: introDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
    transition: reduce
      ? { duration: 0.01 }
      : { duration: 0.8, ease: EASE, delay },
  });

  return (
    <>
      <AnimatePresence>
        {!introDone && <LogoIntro key="intro" onDone={handleIntroDone} />}
      </AnimatePresence>

      <section className="relative isolate flex min-h-[max(44rem,94svh)] items-start overflow-hidden bg-[#030712] md:min-h-[clamp(34rem,92svh,60rem)] md:items-center">
        <CeoPortrait play={introDone} />

        {/* Scrim: keeps the copy legible over the photo. Heavier on phones, where
            the portrait sits behind the text instead of beside it. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] md:hidden"
          style={{
            // Phones stack: copy on top, portrait under it. A sideways scrim here
            // would sit over the whole photo and flatten him into a smudge.
            background:
              "linear-gradient(to bottom, #030712 0%, #030712 44%, rgba(3,7,18,0.45) 62%, rgba(3,7,18,0.04) 78%, rgba(3,7,18,0.88) 100%)",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] hidden md:block"
          style={{
            background:
              "linear-gradient(to right, #030712 16%, rgba(3,7,18,0.72) 44%, rgba(3,7,18,0) 72%)",
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-[88rem] px-[clamp(1.25rem,6vw,8rem)] pb-[clamp(3rem,8vh,6rem)] pt-[clamp(8rem,18vh,11rem)]">
          <div className="max-w-[44rem] text-left">
            <motion.span
              className="font-footer-text block text-[0.68rem] uppercase tracking-[0.28em] whitespace-nowrap text-white/40"
              {...fade(0)}
            >
              {heading.eyebrow}
            </motion.span>

            <KineticText
              text={heading.title}
              as="h1"
              play={introDone}
              delay={0.16}
              stagger={0.026}
              radius={120}
              lift={12}
              className="mt-[clamp(0.9rem,2.6vh,1.5rem)]"
              style={{
                fontSize: "clamp(2.1rem,6.2vw,5rem)",
                lineHeight: 1.04,
                letterSpacing: "-0.035em",
              }}
            />

            <SignatureReveal
              play={introDone}
              delay={0.9}
              className="mt-[clamp(1.1rem,3vh,1.9rem)]"
            />

            <motion.span
              className="font-footer-text mt-3 block text-[0.7rem] uppercase tracking-[0.24em] whitespace-nowrap text-white/40"
              {...fade(1.5)}
            >
              {signature.role}, {signature.company}
            </motion.span>

            <motion.p
              className="font-footer-text mt-[clamp(1.4rem,3.6vh,2.2rem)] max-w-md text-[clamp(0.95rem,1.4vw,1.08rem)] leading-relaxed text-white/55"
              {...fade(1.7)}
            >
              {heading.sub}
            </motion.p>
          </div>
        </div>
      </section>

      <PerspectiveMessage />

      {/* Breathing room so the stage never butts into the footer dissolve. */}
      <div aria-hidden className="w-full bg-[#030712]" style={{ height: "clamp(4rem,12vh,8rem)" }} />
    </>
  );
}
