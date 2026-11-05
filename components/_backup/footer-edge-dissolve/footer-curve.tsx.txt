"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

type FooterCurveProps = {
  /** 0 → 1 as the footer is revealed */
  progress: MotionValue<number>;
  /** Background colour of the section above the footer, so the curve reads as its bottom edge */
  color?: string;
};

/**
 * The bottom edge of the page above, bulging down over the footer in a soft arc.
 * As the footer is revealed the arc flattens out (scaleY → 0), like the page letting go.
 * One element, transform only.
 */
export function FooterCurve({ progress, color = "#030712" }: FooterCurveProps) {
  const scaleY = useTransform(progress, [0, 0.85], [1, 0]);
  return (
    <motion.div
      aria-hidden
      style={{ scaleY, originY: 0, backgroundColor: color, willChange: "transform" }}
      className="pointer-events-none absolute inset-x-[-10%] top-0 z-30 h-[clamp(70px,11vw,190px)] rounded-b-[50%] shadow-[0_2px_0_rgb(123_97_255/0.55),0_10px_40px_-6px_rgb(123_97_255/0.45),0_40px_90px_-20px_rgb(0_0_0/0.8)]"
    />
  );
}
