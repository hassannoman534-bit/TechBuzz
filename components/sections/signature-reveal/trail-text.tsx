"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

type TrailTextProps = {
  children: string;
  /** Horizontal offset in px; the trail stretches behind the direction of travel and collapses at 0. */
  x: MotionValue<number>;
  /** 0 → 1 multiplier for the ghost copies (fade them once the word has landed). */
  trail: MotionValue<number>;
  opacity?: MotionValue<number>;
  className?: string;
};

const GHOSTS = [
  { spread: 0.1, alpha: 0.32 },
  { spread: 0.22, alpha: 0.18 },
  { spread: 0.36, alpha: 0.08 },
] as const;

/** Text that slides in with a stacked motion-trail (the "ghost letters" in the reference). */
export function TrailText({ children, x, trail, opacity, className }: TrailTextProps) {
  return (
    <span className={cn("relative inline-block", className)}>
      {GHOSTS.map((g, i) => (
        <Ghost key={i} x={x} trail={trail} spread={g.spread} alpha={g.alpha}>
          {children}
        </Ghost>
      ))}
      <motion.span className="relative inline-block will-change-transform" style={{ x, opacity }}>
        {children}
      </motion.span>
    </span>
  );
}

type GhostProps = {
  children: string;
  x: MotionValue<number>;
  trail: MotionValue<number>;
  spread: number;
  alpha: number;
};

function Ghost({ children, x, trail, spread, alpha }: GhostProps) {
  const gx = useTransform(x, (v) => v * (1 + spread));
  const go = useTransform(trail, (t) => t * alpha);
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-0 inline-block will-change-transform"
      style={{ x: gx, opacity: go }}
    >
      {children}
    </motion.span>
  );
}
