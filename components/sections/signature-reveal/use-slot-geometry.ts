"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";

export type SlotGeometry = {
  /** Stage (viewport) size */
  W: number;
  H: number;
  /** Ink bounds of the bracketed letter glyph (the real outline, not the line box), relative to stage centre */
  ix: number;
  iy: number;
  iw: number;
  ih: number;
};

let canvas: HTMLCanvasElement | null = null;

/** Measures the actual painted outline of a single glyph using canvas text metrics. */
function measureInk(el: HTMLElement): { left: number; top: number; width: number; height: number } | null {
  const text = el.textContent ?? "";
  if (!text) return null;
  canvas ??= document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const cs = getComputedStyle(el);
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const m = ctx.measureText(text);
  const box = el.getBoundingClientRect();

  // Baseline position inside the line box: half-leading + font ascent.
  const lineHeight = parseFloat(cs.lineHeight) || box.height;
  const fontAscent = m.fontBoundingBoxAscent;
  const fontDescent = m.fontBoundingBoxDescent;
  const baseline = box.top + (lineHeight - (fontAscent + fontDescent)) / 2 + fontAscent;

  return {
    left: box.left - m.actualBoundingBoxLeft,
    top: baseline - m.actualBoundingBoxAscent,
    width: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
    height: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent,
  };
}

/**
 * Measures where the bracketed letter's real glyph sits inside the pinned stage.
 * Runs on mount, resize and font load only — never on scroll.
 * `revision` ticks after every measure so dependent transforms recompute without a re-render.
 */
export function useSlotGeometry(
  stageRef: RefObject<HTMLElement | null>,
  letterRef: RefObject<HTMLElement | null>,
): { geo: RefObject<SlotGeometry>; revision: MotionValue<number> } {
  const geo = useRef<SlotGeometry>({ W: 1440, H: 900, ix: 0, iy: 0, iw: 100, ih: 100 });
  const revision = useMotionValue(0);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const letter = letterRef.current;
    if (!stage || !letter) return;

    const measure = (): void => {
      const s = stage.getBoundingClientRect();
      const ink = measureInk(letter);
      const l = ink ?? (() => {
        const b = letter.getBoundingClientRect();
        return { left: b.left, top: b.top, width: b.width, height: b.height };
      })();
      geo.current = {
        W: s.width,
        H: s.height,
        ix: l.left + l.width / 2 - (s.left + s.width / 2),
        iy: l.top + l.height / 2 - (s.top + s.height / 2),
        iw: l.width,
        ih: l.height,
      };
      revision.set(revision.get() + 1);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    ro.observe(letter);
    void document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [stageRef, letterRef, revision]);

  return { geo, revision };
}
