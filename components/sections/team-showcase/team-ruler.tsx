"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { EASE, TEXT_FONT } from "./team-motion";

type TeamRulerProps = {
  count: number;
  /** Rail progress, 0 (start) to 1 (end) */
  progress: MotionValue<number>;
  openIndex: number | null;
};

const RULER_W = 220;

/**
 * Tick ruler with a small square marker (as in the reference): follows the rail while
 * browsing, jumps to the open member's tick otherwise. Desktop only.
 */
export function TeamRuler({ count, progress, openIndex }: TeamRulerProps) {
  const browseLeft = useTransform(progress, (p) => Math.min(1, Math.max(0, p)) * RULER_W);
  const openLeft = openIndex === null ? 0 : (openIndex / Math.max(1, count - 1)) * RULER_W;
  const left = useMotionValue(0);

  // One marker value: tracks the rail while browsing, glides to the open member otherwise.
  useEffect(() => {
    if (openIndex === null) {
      const settle = animate(left, browseLeft.get(), { duration: 0.7, ease: EASE });
      const unsubscribe = browseLeft.on("change", (v) => {
        settle.stop();
        left.set(v);
      });
      return () => {
        settle.stop();
        unsubscribe();
      };
    }
    const glide = animate(left, openLeft, { duration: 0.7, ease: EASE });
    return () => glide.stop();
  }, [openIndex, openLeft, browseLeft, left]);

  return (
    <div aria-hidden className="relative hidden items-center gap-4 md:flex" style={{ fontFamily: TEXT_FONT }}>
      <span className="w-6 text-right text-[0.62rem] tabular-nums tracking-[0.14em] text-white/40">01</span>
      <div className="relative flex h-3 items-center justify-between" style={{ width: RULER_W }}>
        {Array.from({ length: count }, (_, i) => (
          <span
            key={i}
            className="h-full w-px transition-colors duration-500"
            style={{ background: openIndex === i ? "rgba(124,233,255,0.9)" : "rgba(255,255,255,0.22)" }}
          />
        ))}
        <motion.span
          className="absolute top-1/2 h-4 w-6 -translate-x-1/2 -translate-y-1/2 rounded-[3px] border border-white/70"
          style={{ left }}
        />
      </div>
      <span className="w-6 text-[0.62rem] tabular-nums tracking-[0.14em] text-white/40">{String(count).padStart(2, "0")}</span>
    </div>
  );
}
