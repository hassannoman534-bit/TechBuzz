"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useAnimationFrame, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

type JellyPlaneProps = {
  /** Renders the full-size content; called once per slice (index 0 is the accessible copy) */
  render: (slice: number) => ReactNode;
  /** 0 → 1: how "liquid" the plane is right now (driven by the scroll scene) */
  energy: MotionValue<number>;
  /** Spring-smoothed scroll velocity (px/s). An under-damped spring makes it wobble and settle */
  velocity: MotionValue<number>;
  slices: number;
  className?: string;
};

const TAU = Math.PI * 2;
const V_MAX = 2600;

/**
 * DOM-only liquid plane.
 * The content is cut into vertical slices. Each slice is moved and sheared (translateY + skewY)
 * so that its left and right edges sit exactly on a travelling wave. Neighbouring slices meet
 * edge to edge, so the outline reads as one smooth curve, like a sheet of water.
 * Transform only, one rAF loop, no React re-renders. Goes completely flat (identity) at rest.
 */
export function JellyPlane({ render, energy, velocity, slices, className }: JellyPlaneProps) {
  const root = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLDivElement | null)[]>([]);
  const size = useRef({ w: 1, h: 1 });
  const flat = useRef(false);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = (): void => {
      // layout size (ignores the parent's scale transform)
      size.current = { w: el.offsetWidth || 1, h: el.offsetHeight || 1 };
      el.style.setProperty("--jw", `${size.current.w}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useAnimationFrame((t) => {
    const e = energy.get();
    const v = Math.max(-1, Math.min(1, velocity.get() / V_MAX));
    const amp = 4.2 * e + 3.2 * Math.abs(v); // % of height
    const bowl = 7 * v; // centre lags behind the scroll
    if (amp < 0.02 && Math.abs(bowl) < 0.02) {
      if (!flat.current) {
        items.current.forEach((n) => n && (n.style.transform = "translate3d(0,0,0)"));
        flat.current = true;
      }
      return;
    }
    flat.current = false;

    const { w, h } = size.current;
    const sliceW = w / slices;
    const phase = t / 620;
    // wave height (in px) at horizontal position u ∈ [0,1]
    const wave = (u: number): number => {
      const travelling = amp * Math.sin(TAU * 1.15 * u - phase);
      const swell = amp * 0.45 * Math.sin(TAU * 0.5 * u + phase * 0.6);
      const sag = bowl * (1 - 4 * (u - 0.5) * (u - 0.5));
      return ((travelling + swell + sag) / 100) * h;
    };

    for (let i = 0; i < slices; i++) {
      const n = items.current[i];
      if (!n) continue;
      const left = wave(i / slices);
      const right = wave((i + 1) / slices);
      const mid = (left + right) / 2;
      const skew = (Math.atan2(right - left, sliceW) * 180) / Math.PI;
      n.style.transform = `translate3d(0,${mid.toFixed(2)}px,0) skewY(${skew.toFixed(3)}deg)`;
    }
  });

  return (
    <div ref={root} className={cn("relative size-full rounded-[inherit]", className)}>
      {Array.from({ length: slices }, (_, i) => (
        <div
          key={i}
          ref={(n) => {
            items.current[i] = n;
          }}
          aria-hidden={i > 0 || undefined}
          className={cn(
            "absolute inset-y-0 overflow-hidden will-change-transform",
            i === 0 && "rounded-l-[inherit]",
            i === slices - 1 && "rounded-r-[inherit]",
          )}
          // 2px overlap on each side: neighbours cover each other's anti-aliased edges, so no seams
          style={{
            left: i === 0 ? "0%" : `calc(${(i / slices) * 100}% - 2px)`,
            width: `calc(${100 / slices}% + ${i === 0 || i === slices - 1 ? 2 : 4}px)`,
            zIndex: i % 2,
          }}
        >
          {/* Full-size content, shifted so this slice shows its own part */}
          <div
            className="absolute inset-y-0"
            style={{ width: "var(--jw, 100%)", left: i === 0 ? "0px" : `calc(var(--jw, 0px) * ${-i / slices} + 2px)` }}
          >
            {render(i)}
          </div>
        </div>
      ))}
    </div>
  );
}
