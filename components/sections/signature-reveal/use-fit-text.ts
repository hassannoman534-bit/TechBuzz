"use client";

import { useLayoutEffect, type RefObject } from "react";

type FitOptions = {
  /** Fraction of the available width the text may use */
  fill?: number;
  /** Upper bound in px so it doesn't become absurd on ultra-wide screens */
  maxPx?: number;
};

/**
 * Sizes a single-line element so it always fits its container, whatever font is loaded.
 * Measures layout width (offsetWidth ignores transforms, so in-flight animation doesn't skew it).
 * Runs on mount, container resize and font load only.
 */
export function useFitText(ref: RefObject<HTMLElement | null>, { fill = 0.92, maxPx = 300 }: FitOptions = {}): void {
  useLayoutEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    const REF_PX = 100;
    const fit = (): void => {
      const cs = getComputedStyle(parent);
      const available = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      el.style.fontSize = `${REF_PX}px`;
      const natural = el.offsetWidth;
      if (!natural) return;
      el.style.fontSize = `${Math.min(maxPx, (REF_PX * available * fill) / natural)}px`;
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(parent);
    void document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [ref, fill, maxPx]);
}
