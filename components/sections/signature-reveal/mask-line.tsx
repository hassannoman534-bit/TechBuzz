"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MaskLineProps = {
  children: ReactNode;
  progress: MotionValue<number>;
  /** Scroll-progress window in which this line rises into view */
  range: [number, number];
  className?: string;
};

/** A single line that rises out of an overflow mask. */
export function MaskLine({ children, progress, range, className }: MaskLineProps) {
  const y = useTransform(progress, range, ["105%", "0%"]);
  return (
    <span className={cn("block overflow-hidden pb-[0.08em]", className)}>
      <motion.span className="block will-change-transform" style={{ y }}>
        {children}
      </motion.span>
    </span>
  );
}
