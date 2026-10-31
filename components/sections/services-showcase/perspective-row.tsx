"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";

/*
 * Perspective scroll timeline for one row, as a share of the row's trip through the viewport
 * (0 = row top touches the viewport bottom, 1 = row bottom leaves the viewport top).
 * Rows enter tilted back, pushed outward, enlarged, blurred and dark, settle flat in the middle
 * band, then tilt forward and fan out again on the way up.
 */
const T = [0, 0.36, 0.64, 1];
const ROTATE_X = [26, 0, 0, -26]; // deg
const ROTATE_Z = [4, 0, 0, -4]; // deg, mirrored per column
const SHIFT_X = [16, 0, 0, 16]; // % of card width, outward
const SCALE = [1.16, 1, 1, 1.16];
const BLUR = [9, 0, 0, 9]; // px
const SHADE = [0.75, 0, 0, 0.75]; // dark veil
const FADE = [0, 1, 1, 0];
const FADE_T = [0, 0.16, 0.84, 1];

type PerspectiveRowProps = {
  /** Exactly the cards of this row, left to right (1 or 2) */
  children: ReactNode[];
};

/** A 2 column row whose cards share one scroll progress, with the vanishing point at the row centre. */
export function PerspectiveRow({ children }: PerspectiveRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <div
      ref={ref}
      className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-x-[clamp(0.9rem,2.6vw,2.75rem)] [perspective:1100px]"
    >
      {children.map((child, i) => (
        <PerspectiveCell key={i} progress={scrollYProgress} side={i === 0 ? -1 : 1} still={reduce}>
          {child}
        </PerspectiveCell>
      ))}
    </div>
  );
}

type PerspectiveCellProps = {
  progress: MotionValue<number>;
  side: -1 | 1;
  still: boolean;
  children: ReactNode;
};

function PerspectiveCell({ progress, side, still, children }: PerspectiveCellProps) {
  const rotateX = useTransform(progress, T, ROTATE_X);
  const rotateZ = useTransform(progress, T, ROTATE_Z.map((v) => v * side));
  const x = useTransform(progress, T, SHIFT_X.map((v) => `${v * side}%`));
  const scale = useTransform(progress, T, SCALE);
  const blur = useTransform(progress, T, BLUR);
  const filter = useTransform(blur, (b) => (b < 0.25 ? "none" : `blur(${b.toFixed(1)}px)`));
  const shade = useTransform(progress, T, SHADE);
  const opacity = useTransform(progress, FADE_T, FADE);

  if (still) return <div className="relative">{children}</div>;

  return (
    <motion.div style={{ rotateX, rotateZ, x, scale, filter, opacity }} className="relative origin-center will-change-transform">
      {children}
      {/* dark veil, opacity only */}
      <motion.div aria-hidden style={{ opacity: shade }} className="pointer-events-none absolute -inset-1 bg-[#030712]" />
    </motion.div>
  );
}
