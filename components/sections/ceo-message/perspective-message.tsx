"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { ceoMessage, EASE, STAGE } from "./ceo-message.config";

const { message } = ceoMessage;

function clamp(min: number, value: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Phase 3. The message rides a tilted plane through the camera as the page scrolls.
 *
 * Refactored from the Skiper reference. Four things had to change for this codebase:
 *  - no `ReactLenis root` wrapper, because SmoothScrollProvider already owns the root.
 *    A second root fights the first one and scrolling stops being smooth.
 *  - `w-full` instead of `w-screen`, which is 100vw and ignores the scrollbar, so it
 *    pushed the page sideways.
 *  - the bottom fade sits outside the transformed element. Opacity on a preserve-3d
 *    layer flattens the whole 3D context.
 *  - sizes that matter are inline styles, never Tailwind arbitrary values.
 */
export function PerspectiveMessage(): React.ReactElement {
  const reduce = useReducedMotionSafe();
  const targetRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState<number>(STAGE.travelMinPx);
  const [perspective, setPerspective] = useState<number>(STAGE.perspectivePx);

  // Travel scales with the viewport so the text clears the camera on a laptop and on
  // a phone. Measured on mount and on resize only, never per frame.
  useEffect(() => {
    const update = (): void => {
      setTravel(
        Math.round(
          clamp(STAGE.travelMinPx, window.innerHeight * STAGE.travelVhRatio, STAGE.travelMaxPx),
        ),
      );
      setPerspective(
        window.innerWidth <= STAGE.mobileMaxWidth ? STAGE.perspectivePxMobile : STAGE.perspectivePx,
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [travel, 0]);
  const transform = useMotionTemplate`rotateX(${STAGE.rotateXDeg}deg) translateY(${y}px) translateZ(${STAGE.translateZPx}px)`;
  const cueOpacity = useTransform(scrollYProgress, [0, 0.07], [1, 0]);

  // Reduced motion: the same words, read straight down, no tilt and no pinning.
  if (reduce) {
    return (
      <section className="relative z-0 w-full bg-[#030712] px-[clamp(1.25rem,6vw,8rem)] py-[clamp(5rem,14vh,9rem)]">
        <div className="mx-auto max-w-3xl space-y-[0.35em] text-center">
          {message.lines.map((line) => (
            <p
              key={line}
              className="font-footer-display text-[#c9c2ff]"
              style={{ fontSize: "clamp(1.35rem,3.6vw,2.6rem)", fontWeight: 600, lineHeight: 1.25 }}
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
      {/* One sticky window holds the cue, the stage and the fades, so nothing can
          reach outside this section and sit over the heading above it. */}
      <div className="sticky top-0 overflow-hidden" style={{ height: "100svh" }}>
        <div
          className="absolute inset-0 flex items-center justify-center px-[clamp(1.25rem,6vw,8rem)]"
          style={{ transformStyle: "preserve-3d", perspective: `${perspective}px` }}
        >
          <motion.div
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

        {/* Fades sit outside the 3D context so they never flatten it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-10"
          style={{
            height: "30vh",
            background: "linear-gradient(to top, rgba(3,7,18,0), #030712)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          style={{
            height: "55vh",
            background: "linear-gradient(to bottom, rgba(3,7,18,0), #030712)",
          }}
        />

        {/* Scroll cue, above the fades, gone as soon as the travel starts. */}
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
