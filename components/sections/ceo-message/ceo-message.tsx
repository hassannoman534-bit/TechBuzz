"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
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
 * 1. LogoIntro holds the screen, then unmounts through AnimatePresence.
 * 2. The hero: heading writes in from the left, portrait comes in from the right,
 *    signature is laid down under the name. `introDone` gates all of it.
 * 3. PerspectiveMessage carries the message through the camera on scroll.
 *
 * The hero reserves the top of the viewport for the navbar, which is fixed at
 * top-0 and about 100px tall, and centres its content in what is left. Without
 * that reserve the pill cuts across the portrait's head and crowds the eyebrow.
 */
export function CeoMessage(): React.ReactElement {
  const reduce = useReducedMotionSafe();
  const heroRef = useRef<HTMLElement>(null);
  const [introDone, setIntroDone] = useState(false);
  const handleIntroDone = useCallback(() => setIntroDone(true), []);

  // Copy leaves a touch faster than the portrait, which reads as depth.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.62], [1, 0]);

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: introDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
    transition: reduce ? { duration: 0.01 } : { duration: 0.8, ease: EASE, delay },
  });

  return (
    <>
      <AnimatePresence>
        {!introDone && <LogoIntro key="intro" onDone={handleIntroDone} />}
      </AnimatePresence>

      <section
        ref={heroRef}
        className="relative isolate flex min-h-[100svh] items-start overflow-hidden bg-[#030712] pt-[clamp(5.5rem,11vh,7.5rem)] md:items-center"
      >
        <CeoPortrait play={introDone} />

        {/* Scrims keep the copy legible over the photo. Phones stack, so theirs runs
            top to bottom; desktop sits side by side, so theirs runs left to right. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] md:hidden"
          style={{
            background:
              "linear-gradient(to bottom, #030712 0%, #030712 30%, rgba(3,7,18,0.72) 44%, rgba(3,7,18,0.3) 58%, rgba(3,7,18,0.02) 74%, rgba(3,7,18,0.9) 100%)",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] hidden md:block"
          style={{
            background:
              "linear-gradient(100deg, #030712 14%, rgba(3,7,18,0.78) 40%, rgba(3,7,18,0.12) 66%, rgba(3,7,18,0) 80%)",
          }}
        />

        <motion.div
          className="relative z-10 mx-auto w-full max-w-[102rem] px-[clamp(1.25rem,5vw,5.5rem)] pb-[clamp(5rem,12vh,8rem)]"
          style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}
        >
          <div className="max-w-[42rem] text-left">
            <motion.span className="flex items-center gap-4" {...fade(0)}>
              <span
                aria-hidden
                className="block h-px w-[clamp(1.5rem,4vw,3rem)] shrink-0"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(201,194,255,0.55), rgba(201,194,255,0.08))",
                }}
              />
              <span className="font-footer-text text-[0.68rem] uppercase tracking-[0.3em] whitespace-nowrap text-white/45">
                {heading.eyebrow}
              </span>
            </motion.span>

            <KineticText
              text={heading.title}
              as="h1"
              play={introDone}
              delay={0.16}
              stagger={0.026}
              radius={120}
              lift={12}
              className="mt-[clamp(1rem,2.8vh,1.6rem)]"
              style={{
                fontSize: "clamp(2.1rem,6vw,4.75rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.038em",
              }}
            />

            <div className="mt-[clamp(1.2rem,3.2vh,2rem)] flex flex-wrap items-end gap-x-7 gap-y-3">
              <SignatureReveal play={introDone} delay={0.9} />
              <motion.span
                className="font-footer-text pb-1 text-[0.7rem] uppercase tracking-[0.24em] whitespace-nowrap text-white/40"
                {...fade(1.2)}
              >
                {signature.role}
              </motion.span>
            </div>

            <motion.p
              className="font-footer-text mt-[clamp(1.3rem,3.4vh,2rem)] max-w-sm text-[clamp(0.95rem,1.35vw,1.06rem)] leading-relaxed text-white/50"
              {...fade(1.45)}
            >
              {heading.sub}
            </motion.p>
          </div>
        </motion.div>

        {/* Hero scroll cue, matching the one on the stage below. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute bottom-[clamp(2.25rem,5.5vh,3.75rem)] left-[clamp(1.25rem,5vw,5.5rem)] z-10 flex items-center gap-3"
          {...fade(1.75)}
        >
          <span
            className="block h-px w-10"
            style={{
              background: "linear-gradient(90deg, rgba(201,194,255,0.5), rgba(3,7,18,0))",
            }}
          />
          <span className="font-footer-text text-[0.62rem] uppercase tracking-[0.28em] whitespace-nowrap text-white/30">
            {heading.cue}
          </span>
        </motion.div>
      </section>

      <PerspectiveMessage />

      <div aria-hidden className="w-full bg-[#030712]" style={{ height: "clamp(4rem,12vh,8rem)" }} />
    </>
  );
}
