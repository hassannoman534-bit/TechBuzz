"use client";

import { useEffect, useState, type RefObject } from "react";

export interface ElementSize {
  width: number;
  height: number;
}

/**
 * Pixel ratio ceiling for the liquid canvas.
 *
 * The fragment shader evaluates the field six times per pixel, each looping over
 * the trail, so cost scales with the square of this number. 1.6 keeps the rim of
 * the type clean while cutting the pixel count by about a third against a full
 * 2x. Raise it if the surface looks soft on a retina display and the frame
 * budget allows.
 */
export const LIQUID_MAX_DPR = 1.6;

export function defaultMaxDpr(): number {
  if (typeof window === "undefined") return 1;
  return Math.min(LIQUID_MAX_DPR, window.devicePixelRatio || 1);
}

/**
 * Sizes the backing store to the CSS box and returns the ratio actually used,
 * which the shader needs to map gl_FragCoord back into CSS pixels.
 */
export function sizeCanvas(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number,
  maxDpr: number,
): number {
  const dpr = Math.max(1, Math.min(maxDpr, window.devicePixelRatio || 1));
  const w = Math.max(1, Math.round(cssWidth * dpr));
  const h = Math.max(1, Math.round(cssHeight * dpr));
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  return dpr;
}

/**
 * Observed size of an element, rounded to whole pixels.
 *
 * Rounding plus the identity bail below matter: ResizeObserver fires on
 * sub-pixel changes, and setting state on every one of those would rebuild the
 * distance field on a loop.
 */
export function useElementSize(ref: RefObject<HTMLElement | null>): ElementSize {
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const read = (width: number, height: number): void => {
      const w = Math.round(width);
      const h = Math.round(height);
      setSize((prev) => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
    };

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) read(rect.width, rect.height);
    });
    observer.observe(el);
    const rect = el.getBoundingClientRect();
    read(rect.width, rect.height);

    return () => observer.disconnect();
  }, [ref]);

  return size;
}
