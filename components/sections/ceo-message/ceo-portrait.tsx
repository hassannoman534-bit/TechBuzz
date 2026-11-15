"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useFinePointer } from "@/lib/use-fine-pointer";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { ceoMessage, EASE, PORTRAIT } from "./ceo-message.config";

const { portrait } = ceoMessage;

/**
 * Dissolves at both ends: he rises out of the dark rather than starting on a
 * hard edge, and sinks back into the page at the bottom.
 */
const FADE_MASK =
  "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 8%, #000 24%, #000 62%, rgba(0,0,0,0.6) 82%, transparent 98%)";

/** Resting wash. Takes his silhouette, not a rectangle. */
const BASE_WASH =
  "linear-gradient(200deg, rgba(123,97,255,0.5) 0%, rgba(91,124,255,0.26) 50%, rgba(3,7,18,0) 84%)";

/**
 * The band that runs down him on hover. Brand violet into ion blue, kept low:
 * at full strength the screen blend lifted his skin tone to teal, which reads
 * as a colour management fault rather than a designed effect.
 */
const SWEEP =
  "linear-gradient(180deg, rgba(123,97,255,0) 0%, rgba(123,97,255,0.3) 26%, rgba(34,168,255,0.27) 52%, rgba(44,245,176,0.12) 74%, rgba(3,7,18,0) 100%)";

/**
 * object-cover crops the sides of a landscape cutout in a portrait shaped box,
 * and a cutout cropped mid shoulder ends on a straight vertical line against
 * flat darkness, which looks like a mistake. These two gradients are painted
 * in the page colour over those edges, so the crop dissolves instead. Plain
 * background gradients rather than extra mask layers: mask-composite would do
 * the same job with more ways to go wrong across browsers.
 */
const EDGE_L = "linear-gradient(to right, #030712 0%, #030712 22%, rgba(3,7,18,0) 100%)";
const EDGE_R = "linear-gradient(to left, #030712 0%, #030712 22%, rgba(3,7,18,0) 100%)";

/** Silhouette mask, shared by every layer that has to take his shape. */
const SILHOUETTE = {
  maskImage: `url(${portrait.src})`,
  WebkitMaskImage: `url(${portrait.src})`,
  maskSize: "cover",
  WebkitMaskSize: "cover",
  maskPosition: "top",
  WebkitMaskPosition: "top",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
} as const;

type CeoPortraitProps = {
  /** Gates the entrance until the opening overlay is gone. */
  play: boolean;
};

/**
 * Hero portrait, right column.
 *
 * He travels in from the right, because the composition is a split now and the
 * type holds the left. The entrance is one transform on one element.
 *
 * Hover is three compositor-friendly changes and nothing else: he lifts a
 * little, a violet band descends through his silhouette, and a soft glow comes
 * up behind him. The band's mask never changes value. It sits on a still
 * parent while only the gradient inside it moves, because a mask-image that is
 * recomputed per frame repaints the whole layer, which is what made the footer
 * stutter.
 */
export function CeoPortrait({ play }: CeoPortraitProps): React.ReactElement {
  const reduce = useReducedMotionSafe();
  const fine = useFinePointer();
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const onEnter = useCallback(() => setHovered(true), []);
  const onLeave = useCallback(() => setHovered(false), []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const driftY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const driftOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  // Touch gets the resting state. The effect is a pointer affordance and
  // pointerenter fires on tap, which would latch it on with no way back.
  const active = fine && !reduce && hovered;
  const hoverTransition = { duration: PORTRAIT.hoverDurationS, ease: EASE };

  return (
    <motion.div
      ref={ref}
      /*
        overflow-hidden matters: the hover scale pushes the image about nine
        pixels past the box on each side, past where the edge softeners below
        reach, and those nine pixels are the raw cropped edge of his arm. It
        showed up as a bright vertical strip on hover and nowhere else.
      */
      className="absolute inset-0 z-0 overflow-hidden"
      style={
        reduce
          ? undefined
          : { y: driftY, opacity: driftOpacity, willChange: "transform, opacity" }
      }
    >
      {/* Glow behind him. Opacity only, and it never takes pointer events. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 54% 46%, rgba(123,97,255,0.28), rgba(3,7,18,0) 72%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: active ? 1 : 0 }}
        transition={hoverTransition}
      />

      <motion.div
        className="relative h-full w-full"
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        initial={
          reduce
            ? { opacity: 0 }
            : {
                opacity: 0,
                transform: `translateX(${PORTRAIT.fromX}) translateY(${PORTRAIT.fromY}) scale(${PORTRAIT.fromScale})`,
                filter: `blur(${PORTRAIT.fromBlurPx}px)`,
              }
        }
        animate={
          play
            ? reduce
              ? { opacity: 1 }
              : {
                  opacity: 1,
                  transform: "translateX(0%) translateY(0%) scale(1)",
                  filter: "blur(0px)",
                }
            : undefined
        }
        transition={{
          duration: reduce ? 0.4 : PORTRAIT.durationS,
          ease: EASE,
          delay: reduce ? 0 : PORTRAIT.delayS,
        }}
      >
        <motion.div
          className="absolute inset-0 isolate"
          style={{ maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }}
          animate={{ scale: active ? PORTRAIT.hoverScale : 1 }}
          transition={hoverTransition}
        >
          <Image
            src={portrait.src}
            alt={portrait.alt}
            fill
            priority
            sizes="(max-width: 1023px) 92vw, 46vw"
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
            style={{ mixBlendMode: "overlay", background: BASE_WASH, ...SILHOUETTE }}
          />

          {/*
            The descent. The mask sits here and never moves; the band inside is
            the only thing that animates, so this stays a transform and not a
            repaint.
          */}
          <span
            aria-hidden
            className="absolute inset-0 overflow-hidden"
            style={SILHOUETTE}
          >
            <motion.span
              className="absolute inset-x-0 block"
              style={{
                top: "-70%",
                height: "140%",
                background: SWEEP,
                mixBlendMode: "screen",
                willChange: "transform, opacity",
              }}
              initial={{ y: "0%", opacity: 0 }}
              animate={{
                y: active ? `${PORTRAIT.hoverSweep}%` : "0%",
                opacity: active ? 1 : 0,
              }}
              transition={hoverTransition}
            />
          </span>
        </motion.div>
      </motion.div>

      {/*
        Edge softeners. Outside the entrance wrapper on purpose: they must stay
        put while he travels in and while he scales on hover, or the crop they
        exist to hide slides out from under them.
      */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[14%]"
        style={{ background: EDGE_L }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[14%]"
        style={{ background: EDGE_R }}
      />
    </motion.div>
  );
}
