"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { ceoMessage, STAGE } from "./ceo-message.config";

const { message } = ceoMessage;

function clamp(min: number, value: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Phase 3. The message rides a tilted plane and travels all the way through.
 *
 * The block starts below and near the camera and keeps going until it has passed
 * the vanishing point entirely, so every line completes its run. The previous
 * draft stopped with the block centred, which left the last line half finished and
 * let the section drag the leftover text upward as it unpinned. The exit padding
 * and the late fade below are what fix that: by the time the stage lets go, it is
 * empty.
 *
 * Refactored from the Skiper reference. What had to change for this codebase:
 *  - no `ReactLenis root` wrapper. SmoothScrollProvider already owns the root and
 *    a second one fights it.
 *  - `w-full`, not `w-screen`, which is 100vw and ignores the scrollbar.
 *  - the fades and the stage opacity sit outside the preserve-3d element. Opacity
 *    on that layer flattens the whole 3D context.
 *  - sizes that matter are inline styles, never Tailwind arbitrary values.
 */
export function PerspectiveMessage(): React.ReactElement {
  const reduce = useReducedMotionSafe();
  const targetRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState<number>(STAGE.travelMinPx);
  const [exit, setExit] = useState<number>(-STAGE.travelMinPx);
  const [mid, setMid] = useState<number>(-STAGE.travelMinPx / 3);
  const [perspective, setPerspective] = useState<number>(STAGE.perspectivePx);

  // Geometry is read on mount and on resize only, never per frame.
  useEffect(() => {
    const node = blockRef.current;

    const update = (): void => {
      const vh = window.innerHeight;
      setTravel(Math.round(clamp(STAGE.travelMinPx, vh * STAGE.travelVhRatio, STAGE.travelMaxPx)));
      const blockHeight = node?.offsetHeight ?? vh * 0.5;
      // Far enough that the final line clears the vanishing point.
      setExit(-Math.round(blockHeight + vh * STAGE.exitPadVhRatio));
      setMid(-Math.round(blockHeight * 0.4));
      setPerspective(
        window.innerWidth <= STAGE.mobileMaxWidth ? STAGE.perspectivePxMobile : STAGE.perspectivePx,
      );
    };

    update();
    window.addEventListener("resize", update);
    const observer = node ? new ResizeObserver(update) : null;
    if (node && observer) observer.observe(node);
    return () => {
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const y = useTransform(scrollYProgress, [0, STAGE.readableUntil, 1], [travel, mid, exit]);
  const transform = useMotionTemplate`rotateX(30deg) translateY(${y}px) translateZ(10px)`;
  const cueOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);
  const stageOpacity = useTransform(scrollYProgress, [STAGE.fadeStart, 1], [1, 0]);

  // Reduced motion: the same words, read straight down, no tilt and no pinning.
  if (reduce) {
    return (
      <section className="relative z-0 w-full bg-[#030712] px-[clamp(1.25rem,6vw,8rem)] py-[clamp(5rem,14vh,9rem)]">
        <div className="mx-auto max-w-3xl space-y-[0.35em] text-center">
          {message.lines.map((line) => (
            <p
              key={line}
              className="font-footer-display text-[#c9c2ff]"
              style={{ fontSize: "clamp(1.3rem,3.6vw,2.6rem)", fontWeight: 600, lineHeight: 1.25 }}
            >
              {line}
            </p>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={targetRef}
      className="relative z-0 w-full bg-[#030712]"
      style={{ height: `${STAGE.heightVh}vh` }}
    >
      <div className="sticky top-0 overflow-hidden" style={{ height: "100svh" }}>
        {/* Opacity lives here, on a plain layer, so the 3D context below stays 3D. */}
        <motion.div className="absolute inset-0" style={{ opacity: stageOpacity }}>
          <div
            className="absolute inset-0 flex items-center justify-center px-[clamp(1.25rem,6vw,8rem)]"
            style={{ transformStyle: "preserve-3d", perspective: `${perspective}px` }}
          >
            <motion.div
              ref={blockRef}
              className="w-full max-w-4xl text-center will-change-transform"
              style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden", transform }}
            >
              {message.lines.map((line) => (
                <p
                  key={line}
                  className="font-footer-display"
                  style={{
                    fontSize: "clamp(1.3rem,4.4vw,3.5rem)",
                    fontWeight: 600,
                    lineHeight: 1.18,
                    letterSpacing: "-0.02em",
                    color: "#c9c2ff",
                  }}
                >
                  {line}
                </p>
              ))}
            </motion.div>
          </div>
        </motion.div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-10"
          style={{ height: "30vh", background: "linear-gradient(to top, rgba(3,7,18,0), #030712)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          style={{ height: "52vh", background: "linear-gradient(to bottom, rgba(3,7,18,0), #030712)" }}
        />

        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-[clamp(2rem,7vh,4.5rem)] z-20 flex justify-center"
          style={{ opacity: cueOpacity }}
        >
          <span className="grid justify-items-center gap-3">
            <span
              className="block h-12 w-px"
              style={{
                background: "linear-gradient(to bottom, rgba(3,7,18,0), rgba(201,194,255,0.55))",
              }}
            />
            <span className="font-footer-text text-[0.68rem] uppercase tracking-[0.28em] whitespace-nowrap text-white/40">
              {ceoMessage.heading.cue}
            </span>
          </span>
        </motion.div>
      </div>
    </section>
  );
}
