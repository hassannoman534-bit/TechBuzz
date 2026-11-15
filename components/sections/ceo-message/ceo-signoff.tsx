"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { LiquidText } from "@/components/ui/liquid-text";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { ceoMessage, EASE, LIQUID } from "./ceo-message.config";
import { useNarrowScreen } from "./use-narrow-screen";
import { useResolvedFont } from "./use-resolved-font";

const { signoff } = ceoMessage;

/**
 * The sign off, between the message stage and the footer.
 *
 * Second liquid surface on the page. It only animates while it is on screen:
 * useVisibleLoop inside LiquidText holds the render loop until an
 * IntersectionObserver says the canvas is in view, so sitting at the bottom of a
 * long page costs nothing until the reader arrives.
 *
 * The top padding is deliberately small. The stage above is a 300vh sticky
 * section whose last visible frame lands before its end, so anything set here
 * is added to a blank stretch the reader is already scrolling through. This
 * section stays centred: it is the one moment on the page that should sit on
 * the middle axis.
 */
export function CeoSignoff(): React.ReactElement {
  const reduce = useReducedMotionSafe();
  const ref = useRef<HTMLDivElement>(null);
  // Fires as soon as the block touches the viewport. A margin that waited for
  // it to be well inside held the whole section at zero opacity for another
  // 150px of scrolling, which read as part of the blank gap above it.
  const inView = useInView(ref, { once: true, margin: "0px" });
  const family = useResolvedFont(LIQUID.fontVar);
  const narrow = useNarrowScreen(LIQUID.liveAbovePx);

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
    transition: reduce ? { duration: 0.01 } : { duration: 0.75, ease: EASE, delay },
  });

  return (
    <section className="relative z-0 w-full bg-[#030712] px-[clamp(1.25rem,5vw,5.5rem)] pb-[clamp(5rem,14vh,9rem)] pt-[clamp(1rem,3vh,2.25rem)]">
      <div ref={ref} className="mx-auto flex w-full max-w-6xl flex-col items-center text-center">
        <motion.span
          aria-hidden
          className="block h-px w-16"
          style={{
            background:
              "linear-gradient(90deg, rgba(3,7,18,0), rgba(201,194,255,0.5), rgba(3,7,18,0))",
          }}
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={reduce ? { duration: 0.01 } : { duration: 0.65, ease: EASE }}
        />

        <motion.span
          className="font-footer-text mt-7 block text-[0.68rem] uppercase tracking-[0.3em] whitespace-nowrap text-white/45"
          {...rise(0.08)}
        >
          {signoff.salutation}
        </motion.span>

        <motion.div
          className="mt-2 w-full"
          style={{ minHeight: "clamp(5rem,15vw,12rem)" }}
          {...rise(0.16)}
        >
          {/*
            The canvas is not mounted until the sign off has been reached.

            A WebGL context is claimed the moment one exists, and a browser
            only keeps so many before it starts taking the oldest away. This
            page ran three at once from first paint, counting the navbar, for a
            surface sitting a full page below the fold. Waiting until it is in
            view keeps that down to two and makes a context loss less likely
            for the headline, which is the one people actually see.
          */}
          {family && inView ? (
            <LiquidText
              text={signoff.name}
              ariaLabel={`${signoff.name}, ${signoff.role}`}
              tone="dark"
              fontFamily={family}
              fontWeight={LIQUID.fontWeight}
              fontSize={200}
              color={LIQUID.ink}
              highlight={LIQUID.highlight}
              accentColor={LIQUID.accent}
              viscosity={LIQUID.viscosity}
              trailLength={LIQUID.trailLength}
              frozen={narrow}
            />
          ) : (
            <span
              className="font-footer-display block whitespace-nowrap text-[#eef0f7]"
              style={{ fontSize: "clamp(1.9rem,5.6vw,4.2rem)", fontWeight: 600, letterSpacing: "-0.03em" }}
            >
              {signoff.name}
            </span>
          )}
        </motion.div>

        <motion.span
          className="font-footer-text mt-1 block text-[0.7rem] uppercase tracking-[0.24em] whitespace-nowrap text-white/40"
          {...rise(0.24)}
        >
          {signoff.role}, {signoff.company}
        </motion.span>
      </div>
    </section>
  );
}
