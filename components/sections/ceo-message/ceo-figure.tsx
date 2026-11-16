"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useFinePointer } from "@/lib/use-fine-pointer";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { ceoMessage, EASE } from "./ceo-message.config";
import { FIGURE } from "./hero-scene.config";

/**
 * The foreground layer: the full body cutout, standing to the right.
 *
 * This replaces the cropped portrait the split hero used. The new asset is a
 * real alpha cutout trimmed to his silhouette, which removes most of what the
 * old component existed to work around. There are no edge softeners painted in
 * the page colour and no object-cover: the figure has clean edges of its own,
 * so the box is sized to the asset's exact ratio and the image simply fills it.
 *
 * What is kept from the portrait is the lighting work, because it is what stops
 * a man in a dark suit from disappearing into a near black page: a violet wash
 * masked to his silhouette, a rim down his lit side, and a glow pooled under
 * him so he is standing on the scene rather than pasted over it. The hover
 * sweep is carried over unchanged in behaviour, including the rule that its
 * mask never changes value, only the gradient inside it moves.
 */

/** Resting wash. Masked to his shape, never a rectangle. */
const BASE_WASH =
  "linear-gradient(200deg, rgba(123,97,255,0.42) 0%, rgba(91,124,255,0.2) 48%, rgba(3,7,18,0) 82%)";

/** The band that runs down him on hover. */
const SWEEP =
  "linear-gradient(180deg, rgba(123,97,255,0) 0%, rgba(123,97,255,0.3) 26%, rgba(34,168,255,0.27) 52%, rgba(44,245,176,0.12) 74%, rgba(3,7,18,0) 100%)";

/** Rim down the key side, so the suit keeps an edge against the page. */
const RIM =
  "linear-gradient(100deg, rgba(168,150,255,0.34) 0%, rgba(168,150,255,0.05) 14%, rgba(3,7,18,0) 34%)";

/** Shared silhouette mask. The asset is alpha, so this is exact. */
const SILHOUETTE = {
  maskImage: `url(${FIGURE.src})`,
  WebkitMaskImage: `url(${FIGURE.src})`,
  maskSize: "100% 100%",
  WebkitMaskSize: "100% 100%",
  maskPosition: "center",
  WebkitMaskPosition: "center",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
} as const;

type CeoFigureProps = {
  /** Gates the entrance until the opening overlay is gone. */
  play: boolean;
  /** Stacked layout runs a shorter figure nearer the edge. */
  stacked: boolean;
};

export function CeoFigure({ play, stacked }: CeoFigureProps): React.ReactElement {
  const reduce = useReducedMotionSafe();
  const fine = useFinePointer();
  const [hovered, setHovered] = useState(false);
  const onEnter = useCallback(() => setHovered(true), []);
  const onLeave = useCallback(() => setHovered(false), []);

  // Touch gets the resting state: pointerenter fires on tap and would latch
  // the sweep on with no way back.
  const active = fine && !reduce && hovered;
  const hoverTransition = { duration: FIGURE.hoverDurationS, ease: EASE };

  const heightVh = stacked ? FIGURE.heightVhMobile : FIGURE.heightVh;
  const rightPct = stacked ? FIGURE.rightPctMobile : FIGURE.rightPct;

  return (
    <motion.div
      className="absolute bottom-0 z-20"
      style={{
        right: `${rightPct}%`,
        // Height drives it: a standing person is read by height. Width comes
        // from the asset's own ratio so the box matches the artwork exactly,
        // which is what lets the silhouette mask line up without a fudge.
        height: `${heightVh * 100}svh`,
        aspectRatio: `${FIGURE.intrinsicW} / ${FIGURE.intrinsicH}`,
      }}
      initial={
        reduce
          ? { opacity: 0 }
          : { opacity: 0, x: FIGURE.fromX, scale: FIGURE.fromScale }
      }
      animate={
        play
          ? reduce
            ? { opacity: 1 }
            : { opacity: 1, x: "0%", scale: 1 }
          : undefined
      }
      transition={{
        duration: reduce ? 0.4 : FIGURE.durationS,
        ease: EASE,
        delay: reduce ? 0 : FIGURE.delayS,
      }}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      {/* Glow pooled behind and under him. Grounds the figure on the ridgeline. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -z-10"
        style={{
          left: "-34%",
          right: "-34%",
          bottom: "-6%",
          top: "22%",
          background:
            "radial-gradient(52% 46% at 50% 76%, rgba(123,97,255,0.26), rgba(3,7,18,0) 72%)",
        }}
        initial={{ opacity: 0.55 }}
        animate={{ opacity: active ? 1 : 0.55 }}
        transition={hoverTransition}
      />

      <motion.div
        className="relative h-full w-full isolate"
        animate={{ scale: active ? FIGURE.hoverScale : 1 }}
        transition={hoverTransition}
      >
        <Image
          src={FIGURE.src}
          alt={ceoMessage.portrait.alt}
          fill
          priority
          sizes="(max-width: 1023px) 60vw, 34vw"
          className="select-none object-contain object-bottom"
          style={{ filter: "contrast(1.05) saturate(0.9)" }}
        />

        {/* Wash and rim, both taking his shape rather than a box. */}
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ mixBlendMode: "overlay", background: BASE_WASH, ...SILHOUETTE }}
        />
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ mixBlendMode: "screen", background: RIM, ...SILHOUETTE }}
        />

        {/*
          The descent. The mask sits on this still parent and never changes;
          only the band inside it moves, so this stays a transform rather than
          a per frame repaint of the whole layer.
        */}
        <span aria-hidden className="absolute inset-0 overflow-hidden" style={SILHOUETTE}>
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
            animate={{ y: active ? `${FIGURE.hoverSweep}%` : "0%", opacity: active ? 1 : 0 }}
            transition={hoverTransition}
          />
        </span>
      </motion.div>
    </motion.div>
  );
}
