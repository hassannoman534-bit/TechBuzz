"use client";

import { useEffect, useRef, type RefObject } from "react";

export interface VisibleLoopOptions {
  /** Set false to keep the loop stopped, e.g. reduced motion or no WebGL2. */
  enabled?: boolean;
  /** Start a little before the element scrolls in, so the first frame is warm. */
  rootMargin?: string;
}

/**
 * A requestAnimationFrame loop that only runs while the element is on screen and
 * the tab is in the foreground.
 *
 * This is the whole performance story for LiquidText. The fragment shader loops
 * over the trail for every pixel, so a canvas left running off screen is pure
 * waste, and this page carries two of them on top of the WebGL navbar. The
 * observer stops them the moment they leave the viewport.
 *
 * `frame` is held in a ref so a caller passing a new closure each render does not
 * tear the loop down and build it again.
 */
export function useVisibleLoop(
  ref: RefObject<HTMLElement | null>,
  frame: (dt: number) => void,
  options?: VisibleLoopOptions,
): void {
  const enabled = options?.enabled ?? true;
  const rootMargin = options?.rootMargin ?? "140px";
  const frameRef = useRef(frame);

  useEffect(() => {
    frameRef.current = frame;
  }, [frame]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let raf = 0;
    let last = 0;
    let running = false;
    let visible = false;

    const tick = (now: number): void => {
      if (!running) return;
      // Clamped: after a tab switch or a long task the gap can be seconds, and
      // feeding that to the spring integrator throws the trail off screen.
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      frameRef.current(dt);
      raf = requestAnimationFrame(tick);
    };

    const start = (): void => {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(tick);
    };

    const stop = (): void => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const sync = (): void => {
      if (visible && document.visibilityState === "visible") start();
      else stop();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries.some((e) => e.isIntersecting);
        sync();
      },
      { rootMargin },
    );
    observer.observe(el);
    document.addEventListener("visibilitychange", sync);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      stop();
    };
  }, [ref, enabled, rootMargin]);
}
