"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { ceoMessage, EASE, PORTRAIT } from "./ceo-message.config";

const { portrait } = ceoMessage;

/**
 * Dissolves at both ends: he rises out of the dark rather than starting on a
 * hard edge, and sinks back into the page at the bottom.
 */
const FADE_MASK =
  "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 8%, #000 24%, #000 62%, rgba(0,0,0,0.6) 82%, transparent 98%)";

type CeoPortraitProps = {
  /** Gates the entrance until the opening overlay is gone. */
  play: boolean;
};

/**
 * Hero portrait, centred under the liquid headline.
 *
 * The composition is symmetric now, so the entrance rises and comes inward
 * instead of travelling in from the right. A sideways move reads as off balance
 * when everything else is centred on the same axis.
 *
 * The box starts at 42% so the type above it sits on clean darkness. The navbar
 * is fixed at top-0 and runs about 100px down, and nothing here reaches it.
 */
export function CeoPortrait({ play }: CeoPortraitProps): React.ReactElement {
  const reduce = useReducedMotionSafe();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const driftY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const driftOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <motion.div
      ref={ref}
      className="pointer-events-none absolute bottom-0 left-1/2 top-[56%] z-0 flex w-[min(92vw,40rem)] -translate-x-1/2 items-end justify-center overflow-hidden"
      style={
        reduce
          ? undefined
          : { y: driftY, opacity: driftOpacity, willChange: "transform, opacity" }
      }
    >
      <motion.div
        className="relative h-full w-full"
        initial={
          reduce
            ? { opacity: 0 }
            : {
                opacity: 0,
                transform: `translateY(${PORTRAIT.fromY}) scale(${PORTRAIT.fromScale})`,
                filter: `blur(${PORTRAIT.fromBlurPx}px)`,
              }
        }
        animate={
          play
            ? reduce
              ? { opacity: 1 }
              : { opacity: 1, transform: "translateY(0%) scale(1)", filter: "blur(0px)" }
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
            sizes="(max-width: 768px) 92vw, 40rem"
            className="select-none object-cover object-top"
            style={{ filter: "contrast(1.04) saturate(0.86)" }}
          />

          {/*
            The wash is masked with the cutout itself, so it takes his silhouette.
            A plain overlay would paint its own rectangle and leave hard seams.
            Framing must match the Image above: cover, anchored top.
          */}
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              mixBlendMode: "overlay",
              background:
                "linear-gradient(200deg, rgba(123,97,255,0.58) 0%, rgba(91,124,255,0.3) 50%, rgba(3,7,18,0) 84%)",
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
      </motion.div>
    </motion.div>
  );
}
