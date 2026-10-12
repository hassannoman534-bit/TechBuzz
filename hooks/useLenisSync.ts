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

    // Re-entrancy guard: dispatching a native "scroll" event synchronously
    // re-enters Lenis's own onNativeScroll handler, which re-emits "scroll" —
    // without this flag that feedback loop recurses until the call stack
    // overflows ("Maximum call stack size exceeded") during fast scrolling.
    // Framer still receives exactly one synthetic scroll event per Lenis frame.
    let dispatching = false;
    function onScroll() {
      if (dispatching) return;
      dispatching = true;
      try {
        window.dispatchEvent(new Event("scroll", { bubbles: false }));
      } finally {
        dispatching = false;
      }
    }

    lenis.on("scroll", onScroll);
    return () => {
      lenis.off("scroll", onScroll);
    };
  }, [lenis]);
}
