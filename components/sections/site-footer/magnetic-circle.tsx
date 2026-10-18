"use client";

import Link from "next/link";
import { useRef, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

type MagneticCircleProps = {
  href: string;
  label: string;
  /** Footer reveal progress: the circle rolls in from the right as the footer opens */
  progress: MotionValue<number>;
  /** Disables the magnetic pull (reduced motion / touch is handled automatically) */
  still?: boolean;
  className?: string;
};

const PULL = 0.35; // how far the circle follows the cursor
const LABEL_PULL = 0.18; // the label follows a little further, for depth
const SPRING = { stiffness: 170, damping: 14, mass: 0.35 };

/**
 * Big round call-to-action that sits on the divider line.
 * Magnetic: it leans toward the cursor and springs back on leave.
 * Hover: a darker fill rises from the bottom. Transform only.
 */
export function MagneticCircle({ href, label, progress, still = false, className }: MagneticCircleProps) {
  const rect = useRef<DOMRect | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);
  const lx = useTransform(sx, (v) => v * (LABEL_PULL / PULL));
  const ly = useTransform(sy, (v) => v * (LABEL_PULL / PULL));

  const enterX = useTransform(progress, [0.25, 0.95], ["45%", "0%"]);
  const enterRotate = useTransform(progress, [0.25, 0.95], [40, 0]);

  const onEnter = (e: PointerEvent<HTMLAnchorElement>): void => {
    rect.current = e.currentTarget.getBoundingClientRect();
  };
  const onMove = (e: PointerEvent<HTMLAnchorElement>): void => {
    if (still || e.pointerType !== "mouse") return;
    const r = rect.current ?? e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * PULL);
    y.set((e.clientY - (r.top + r.height / 2)) * PULL);
  };
  const onLeave = (): void => {
    rect.current = null;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div style={{ x: enterX, rotate: enterRotate, willChange: "transform" }} className={cn("pointer-events-none", className)}>
      <motion.div style={{ x: sx, y: sy, willChange: "transform" }}>
        <Link
          href={href}
          onPointerEnter={onEnter}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          className="group pointer-events-auto relative grid size-[5.75rem] md:size-[clamp(6.75rem,10.5vw,10.5rem)] place-items-center overflow-hidden rounded-full bg-[linear-gradient(140deg,#7b61ff,#5b7cff_60%,#22a8ff)] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_24px_60px_-18px_rgb(123_97_255/0.75)] outline-none [isolation:isolate] focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-4 focus-visible:ring-offset-[#0a0b22]"
        >
          {/* rising fill */}
          <span
            aria-hidden
            className="absolute inset-x-[-15%] top-full -z-10 aspect-square rounded-[45%] bg-[#4b3fd8] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-[88%] group-focus-visible:-translate-y-[88%]"
          />
          <motion.span style={{ x: lx, y: ly }} className="relative px-3 text-center text-[0.75rem] md:text-[clamp(0.8rem,1vw,1rem)] font-medium leading-tight">
            {label}
          </motion.span>
        </Link>
      </motion.div>
    </motion.div>
  );
}
