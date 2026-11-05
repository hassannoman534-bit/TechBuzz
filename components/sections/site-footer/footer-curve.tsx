"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

type FooterCurveProps = {
  /** 0 → 1 as the footer is revealed */
  progress: MotionValue<number>;
  /** Background colour of the section above the footer, so the curve reads as its bottom edge */
  color?: string;
};

/* Feathers the arc: solid near the page, dissolving toward its rim (no rim line, no hard edge) */
const FEATHER = "radial-gradient(120% 100% at 50% 0%, #000 45%, transparent 100%)";

/**
 * The bottom edge of the page above, bulging down over the footer in a soft arc.
 * As the footer is revealed the arc flattens out (scaleY → 0), like the page letting go.
 * The arc is masked so it dissolves into the footer instead of cutting across it.
 * One element, transform only.
 */
export function FooterCurve({ progress, color = "#030712" }: FooterCurveProps) {
  const scaleY = useTransform(progress, [0, 0.85], [1, 0]);
  return (
    <motion.div
      aria-hidden
      style={{ scaleY, originY: 0, backgroundColor: color, maskImage: FEATHER, WebkitMaskImage: FEATHER, willChange: "transform" }}
      className="pointer-events-none absolute inset-x-[-10%] top-0 z-30 h-[clamp(90px,14vw,240px)] rounded-b-[50%]"
    />
  );
}
