"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";

/**
 * Reading progress for an article.
 *
 * scaleX on a promoted bar, so the browser never lays anything out while
 * scrolling. Fixed to the viewport and sits under the navbar's z-50. Under
 * reduced motion the bar is not rendered at all: it exists only to animate.
 */
export function ReadingProgress() {
  const reduce = useReducedMotionSafe();
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.4,
    restDelta: 0.001,
  });

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[2px] origin-left bg-[linear-gradient(90deg,#7b61ff,#22d8ff)]"
      style={{ scaleX: width }}
    />
  );
}
