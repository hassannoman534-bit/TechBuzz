"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { ceoMessage, EASE, PORTRAIT } from "./ceo-message.config";

const { portrait } = ceoMessage;

/** Bottom of the cutout dissolves into the page instead of ending on a hard edge. */
const FADE_MASK =
  "linear-gradient(to bottom, #000 0%, #000 44%, rgba(0,0,0,0.62) 68%, rgba(0,0,0,0.2) 85%, transparent 98%)";

type CeoPortraitProps = {
  /** Gates the entrance until the opening overlay is gone. */
  play: boolean;
};

/**
 * Phase 2 portrait. Travels in from the right and inward, then holds.
 *
 * Placement: the box starts below the navbar, not at the top of the viewport. The
 * navbar is fixed at top-0 and its pill reaches about 100px down, and with the
 * portrait running full height his hair landed at the same 100px, so the pill cut
 * straight across his head. The top inset is the clearance.
 *
 * The image is object-cover anchored top, so he fills the right side and the torso
 * bleeds off the bottom into the fade rather than being letterboxed with dead space
 * above his head. The silhouette mask below has to use the same cover/top framing
 * or the wash drifts off the subject.
 */
export function CeoPortrait({ play }: CeoPortraitProps): React.ReactElement {
  const reduce = useReducedMotionSafe();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const driftY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const driftOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <motion.div
      ref={ref}
      className="pointer-events-none absolute bottom-0 right-0 top-[40%] z-0 md:top-[clamp(5.5rem,11vh,7.5rem)] flex items-end justify-end overflow-hidden"
      style={
        reduce
          ? undefined
          : { y: driftY, opacity: driftOpacity, willChange: "transform, opacity" }
      }
    >
      <motion.div
        className="relative h-full w-[94vw] translate-x-[6%] md:w-[clamp(28rem,54vw,52rem)] md:translate-x-[2%]"
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
            sizes="(max-width: 768px) 94vw, 52rem"
            className="select-none object-cover object-top"
            style={{ filter: "contrast(1.06) saturate(0.82) brightness(0.92)" }}
          />

          {/*
            The wash is masked with the cutout itself, so it takes his silhouette.
            A plain overlay layer would paint its own rectangle and leave hard seams
            down the left edge and across the bottom. Framing must match the Image
            above: cover, anchored top.
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
              maskSize: "cover",
              WebkitMaskSize: "cover",
              maskPosition: "top",
              WebkitMaskPosition: "top",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
            }}
          />
        </div>

        {/*
          Edge vignettes. object-cover fills the box, so his shoulder meets the
          container edge as a hard vertical cut. These dissolve both sides into the
          page. The backdrop is already #030712, so they only hide the seam.
        */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-[26%]"
          style={{ background: "linear-gradient(to right, #030712, rgba(3,7,18,0))" }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-[14%]"
          style={{ background: "linear-gradient(to left, #030712, rgba(3,7,18,0))" }}
        />
      </motion.div>
    </motion.div>
  );
}
