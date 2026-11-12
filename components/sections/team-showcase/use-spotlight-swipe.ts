"use client";

import { useEffect, useRef, type RefObject } from "react";
import { animate, type MotionValue } from "framer-motion";

type Options = {
  /** The pinned stage; gestures are read on it while a member is open */
  stageRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  /** Follows the finger (px), springs back to 0 on release; the spotlight reads it */
  dragX: MotionValue<number>;
  /** -1 = previous member, 1 = next member */
  onSwipe: (dir: 1 | -1) => void;
  reduce: boolean;
};

/** A drag counts as a swipe past this distance (px) or this speed (px/s). */
const DIST = 70;
const SPEED = 450;
/** The portrait follows the finger at this fraction (rubber band). */
const FOLLOW = 0.35;
/** Horizontal trackpad distance (px) that triggers one switch. */
const WHEEL_STEP = 60;
/** Quiet time (ms) that ends one trackpad gesture, so momentum never skips several people. */
const WHEEL_IDLE = 180;

/**
 * Horizontal swipe on the open spotlight: mouse or touch drag, or a two finger trackpad swipe.
 * Swipe left = next member, swipe right = previous. Motion values and refs only, nothing
 * re-renders per frame. A drag never counts as a click on the portrait (capture-phase guard).
 */
export function useSpotlightSwipe({ stageRef, enabled, dragX, onSwipe, reduce }: Options): void {
  const onSwipeRef = useRef(onSwipe);
  useEffect(() => {
    onSwipeRef.current = onSwipe;
  }, [onSwipe]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !enabled) return;

    let id: number | null = null;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastT = 0;
    let vx = 0;
    let horizontal: boolean | null = null;
    let suppressClick = false;

    const settle = (): void => {
      if (reduce) dragX.set(0);
      else animate(dragX, 0, { type: "spring", stiffness: 260, damping: 30 });
    };

    const down = (e: PointerEvent): void => {
      if (e.button !== 0 || id !== null) return;
      const t = e.target as HTMLElement | null;
      // The chrome (top bar, previous / next arrows) keeps its own clicks
      if (t?.closest("[data-team-chrome]")) return;
      id = e.pointerId;
      startX = lastX = e.clientX;
      startY = e.clientY;
      lastT = e.timeStamp;
      vx = 0;
      horizontal = null;
    };

    const move = (e: PointerEvent): void => {
      if (e.pointerId !== id) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (horizontal === null && Math.hypot(dx, dy) > 6) horizontal = Math.abs(dx) > Math.abs(dy);
      if (!horizontal) return;
      const dt = Math.max(1, e.timeStamp - lastT);
      vx = ((e.clientX - lastX) / dt) * 1000;
      lastX = e.clientX;
      lastT = e.timeStamp;
      if (!reduce) dragX.set(dx * FOLLOW);
    };

    const up = (e: PointerEvent): void => {
      if (e.pointerId !== id) return;
      id = null;
      if (!horizontal) return;
      suppressClick = true;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > DIST || Math.abs(vx) > SPEED) onSwipeRef.current(dx < 0 ? 1 : -1);
      settle();
      window.setTimeout(() => {
        suppressClick = false;
      }, 0);
    };

    const cancel = (e: PointerEvent): void => {
      if (e.pointerId !== id) return;
      id = null;
      settle();
    };

    // The click that ends a drag fires right after pointerup: swallow it once.
    const click = (e: MouseEvent): void => {
      if (!suppressClick) return;
      e.stopPropagation();
      e.preventDefault();
      suppressClick = false;
    };

    // Two finger trackpad swipe (and shift + wheel). One switch per gesture.
    let acc = 0;
    let fired = false;
    let idle: number | undefined;
    const wheel = (e: WheelEvent): void => {
      const dx = e.shiftKey ? e.deltaX || e.deltaY : e.deltaX;
      if (!e.shiftKey && Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        acc = 0;
        fired = false;
      }, WHEEL_IDLE);
      if (fired) return;
      acc += dx;
      if (Math.abs(acc) >= WHEEL_STEP) {
        fired = true;
        onSwipeRef.current(acc > 0 ? 1 : -1);
      }
    };

    stage.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    stage.addEventListener("click", click, true);
    stage.addEventListener("wheel", wheel, { passive: false });
    return () => {
      stage.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      stage.removeEventListener("click", click, true);
      stage.removeEventListener("wheel", wheel);
      window.clearTimeout(idle);
      dragX.set(0);
    };
  }, [stageRef, enabled, dragX, reduce]);
}
