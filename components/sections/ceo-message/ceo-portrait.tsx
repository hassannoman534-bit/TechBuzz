"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { ceoMessage, EASE, PORTRAIT } from "./ceo-message.config";

const { portrait } = ceoMessage;

/** Bottom of the cutout dissolves into the page instead of ending on a hard edge. */
const FADE_MASK =
  "linear-gradient(to bottom, #000 0%, #000 40%, rgba(0,0,0,0.6) 66%, rgba(0,0,0,0.18) 84%, transparent 97%)";

type CeoPortraitProps = {
  /** Gates the entrance until the opening overlay is gone. */
  play: boolean;
};

/**
 * Phase 2 portrait. Travels in from the right and inward, then holds.
 *
 * On scroll it drifts up and dissolves, so the hero hands over to the message
 * stage rather than cutting. The bottom edge is masked at rest, which is what
 * blends the cutout into #030712 as the page moves under it.
 *
 * The photo is warm and the site is violet, so two blend layers cool it into the
 * palette. They sit inside the masked wrapper, so they are shaped by the cutout
 * and never show as a rectangle.
 */
export function CeoPortrait({ play }: CeoPortraitProps): React.ReactElement {
  const reduce = useReducedMotionSafe();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const driftY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  const driftOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <motion.div
      ref={ref}
      aria-hidden={false}
      className="pointer-events-none absolute bottom-0 right-0 top-0 z-0 flex items-end justify-end overflow-hidden"
      style={
        reduce
          ? undefined
          : { y: driftY, opacity: driftOpacity, willChange: "transform, opacity" }
      }
    >
      <motion.div
        className="relative h-[66%] w-[92vw] translate-x-[6%] md:h-full md:w-[clamp(26rem,52vw,46rem)] md:translate-x-0"
        initial={
          reduce
            ? { opacity: 0 }
            : {
                opacity: 0,
                transform: `translateX(${PORTRAIT.fromX}) scale(${PORTRAIT.fromScale})`,
                filter: `blur(${PORTRAIT.fromBlurPx}px)`,
              }
        }
        animate={
          play
            ? reduce
              ? { opacity: 1 }
              : { opacity: 1, transform: "translateX(0%) scale(1)", filter: "blur(0px)" }
            : undefined
        }
        transition={{
          duration: reduce ? 0.4 : PORTRAIT.durationS,
          ease: EASE,
          delay: reduce ? 0 : PORTRAIT.delayS,
        }}
      >
        <div
          className="absolute inset-0 isolate"
          style={{ maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }}
        >
          <Image
            src={portrait.src}
            alt={portrait.alt}
            fill
            priority
            sizes="(max-width: 768px) 92vw, 46rem"
            className="select-none object-contain object-bottom"
            style={{ filter: "contrast(1.06) saturate(0.82) brightness(0.92)" }}
          />

          {/*
            The wash is masked with the cutout itself, so it takes his silhouette.
            A plain overlay layer would paint its own rectangle and leave hard seams
            down the left edge and across the bottom.
          */}
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              mixBlendMode: "overlay",
              background:
                "linear-gradient(205deg, rgba(123,97,255,0.6) 0%, rgba(91,124,255,0.32) 48%, rgba(3,7,18,0) 82%)",
              maskImage: `url(${portrait.src})`,
              WebkitMaskImage: `url(${portrait.src})`,
              maskSize: "contain",
              WebkitMaskSize: "contain",
              maskPosition: "bottom",
              WebkitMaskPosition: "bottom",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
