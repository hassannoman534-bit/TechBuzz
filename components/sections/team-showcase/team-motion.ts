"use client";

import { useEffect } from "react";
import { useMotionValue, useSpring, type MotionValue } from "framer-motion";

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Montserrat (giant words, names) and Inter (body). Inline styles: immune to the global h1-h6 rule. */
export const DISPLAY_FONT = "var(--font-montserrat), 'Helvetica Neue', Arial, sans-serif";
export const TEXT_FONT = "var(--font-inter), 'Helvetica Neue', Arial, sans-serif";

/** Brand text tints from the design system. */
export const NAME_TINT = "#c9c2ff";
export const ROLE_TINT = "#7ce9ff";

/** The shared morph between a slider tile and the centred photo. */
export const LAYOUT_SPRING = { type: "spring", stiffness: 170, damping: 26, mass: 0.9 } as const;

export const portraitLayoutId = (slug: string): string => `team-portrait-${slug}`;

export type Pointer = { x: MotionValue<number>; y: MotionValue<number> };

/**
 * Normalised pointer position (-1..1 on both axes), spring smoothed. Motion values only,
 * no React state per frame. Stays at 0 when disabled (touch or reduced motion).
 */
export function usePointer(enabled: boolean): Pointer {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 70, damping: 20, mass: 0.6 });
  const y = useSpring(rawY, { stiffness: 70, damping: 20, mass: 0.6 });

  useEffect(() => {
    if (!enabled) {
      rawX.set(0);
      rawY.set(0);
      return;
    }
    const onMove = (e: PointerEvent): void => {
      rawX.set((e.clientX / window.innerWidth) * 2 - 1);
      rawY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, rawX, rawY]);

  return { x, y };
}
