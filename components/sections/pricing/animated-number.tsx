"use client";

import { useEffect, useRef } from "react";
import { animate, useMotionValue } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";

type AnimatedNumberProps = {
  value: number;
  /** Formats the in-between values (default: $1,234) */
  format?: (n: number) => string;
  className?: string;
};

const fmt = (n: number): string => `$${Math.round(n).toLocaleString("en-US")}`;

/** A number that counts smoothly to its new value. Writes text through a ref, no re-renders per frame. */
export function AnimatedNumber({ value, format = fmt, className }: AnimatedNumberProps) {
  const reduce = useReducedMotionSafe();
  const ref = useRef<HTMLSpanElement>(null);
  const mv = useMotionValue(value);

  useEffect(() => {
    const unsub = mv.on("change", (v) => {
      if (ref.current) ref.current.textContent = format(v);
    });
    return unsub;
  }, [mv, format]);

  useEffect(() => {
    if (reduce) {
      mv.jump(value);
      if (ref.current) ref.current.textContent = format(value);
      return;
    }
    const controls = animate(mv, value, { duration: 0.7, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [value, reduce, mv, format]);

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
