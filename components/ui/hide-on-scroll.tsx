"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

type HideOnScrollProps = {
  children: ReactNode;
  className?: string;
  /** Always fully shown above this scroll position (px) */
  topZone?: number;
  /** Extra distance past its own height, so shadows/glows leave the screen too (px) */
  overshoot?: number;
};

/**
 * Fixed header that rides with the scroll: scrolling down pushes it up pixel for pixel until it
 * is gone; scrolling up pulls it back the same way. When scrolling stops halfway, it settles to
 * fully shown or fully hidden. Transform only, no React re-renders while scrolling.
 */
export function HideOnScroll({ children, className, topZone = 80, overshoot = 24 }: HideOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const hidden = useMotionValue(0); // px pushed up
  const idle = useRef<number | undefined>(undefined);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? y;
    const max = (ref.current?.offsetHeight ?? 80) + overshoot;
    if (y <= topZone) {
      hidden.set(Math.max(0, Math.min(hidden.get(), y)));
    } else {
      hidden.set(Math.max(0, Math.min(max, hidden.get() + (y - prev))));
    }
    window.clearTimeout(idle.current);
    idle.current = window.setTimeout(() => {
      const h = hidden.get();
      if (h > 0 && h < max) animate(hidden, h > max / 2 ? max : 0, { duration: 0.35, ease: [0.22, 1, 0.36, 1] });
    }, 140);
  });

  useEffect(() => () => window.clearTimeout(idle.current), []);

  const smooth = useSpring(hidden, { stiffness: 520, damping: 46, mass: 0.5 });
  const y = useTransform(smooth, (v) => -v);

  return (
    <motion.div ref={ref} style={{ y, willChange: "transform" }} className={cn("fixed inset-x-0 top-0 z-50", className)}>
      {children}
    </motion.div>
  );
}
