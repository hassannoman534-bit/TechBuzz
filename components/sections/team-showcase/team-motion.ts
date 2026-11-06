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

/** Top bar offset: clears the floating navbar at every height. */
export const TOP_BAR = "clamp(6.5rem, 16svh, 9rem)";
export const GUTTER = "clamp(1.25rem, 6vw, 6rem)";

/**
 * The box the open portrait and the giant word share (between the top bar and the bottom
 * cue), so the word is always centred on the photo and never collides with the chrome.
 */
const BOX_TOP = `calc(${TOP_BAR} + 2.75rem)`;
const BOX_BOTTOM = "clamp(4.75rem, 13svh, 7.5rem)";

export const SPOTLIGHT_BOX = { top: BOX_TOP, bottom: BOX_BOTTOM, left: 0, right: 0 } as const;

/** Height of that box (the stage is exactly one screen tall). */
export const SPOTLIGHT_BOX_H = `calc(100svh - ${BOX_TOP} - ${BOX_BOTTOM})`;

/** Lift and shrink of the portrait (and the word) while the designation card is showing. */
export const ROLE_LIFT = "-12%";
export const ROLE_SCALE = 0.76;

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
