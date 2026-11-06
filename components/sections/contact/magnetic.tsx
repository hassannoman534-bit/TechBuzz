"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useFinePointer } from "@/lib/use-fine-pointer";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { cn } from "@/lib/utils";

type MagneticProps = { children: ReactNode; strength?: number; className?: string };

const SPRING = { stiffness: 220, damping: 18, mass: 0.6 };

/**
 * Pulls its child a little toward the cursor and springs back on leave.
 * Motion values only (no React state per frame). Mouse devices only, off for reduced motion.
 */
export function Magnetic({ children, strength = 0.28, className }: MagneticProps) {
  const fine = useFinePointer();
  const reduce = useReducedMotionSafe();
  const on = fine && !reduce;
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), SPRING);
  const y = useSpring(useMotionValue(0), SPRING);

  const move = (e: PointerEvent<HTMLDivElement>): void => {
    if (!on || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const leave = (): void => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div ref={ref} onPointerMove={move} onPointerLeave={leave} style={{ x, y }} className={cn("inline-block", className)}>
      {children}
    </motion.div>
  );
}
