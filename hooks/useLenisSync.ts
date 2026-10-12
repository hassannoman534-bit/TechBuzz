"use client";

import { useEffect } from "react";
import { useLenis } from "lenis/react";

/**
 * Keeps Framer Motion's useScroll accurate when Lenis drives scrolling.
 * Lenis intercepts wheel/touch events and animates scroll itself, so the
 * native window scroll position only updates when Lenis ticks. This hook
 * dispatches a synthetic "scroll" event on every Lenis frame so that
 * Framer Motion's ScrollMotionValues stay in sync.
 */
export function useLenisSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    function onScroll() {
      window.dispatchEvent(new Event("scroll", { bubbles: false }));
    }

    lenis.on("scroll", onScroll);
    return () => {
      lenis.off("scroll", onScroll);
    };
  }, [lenis]);
}
