"use client";

import { useCallback, useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { rollingStatementContent, type RollingStatementContent } from "./rolling-statement.config";

/** Cylinder radius in line heights (smaller = rounder, more lines on the curve) */
const RADIUS_LINES = 2.4;
/** Cap on the radius as a share of the viewport height */
const RADIUS_MAX_VH = 0.3;
/** Camera distance used to shrink lines as they turn away (depth only, no skew, so letters never slant) */
const CAMERA = 1100;
/** Lines on the far side of the curve fade by cos(angle)^SHADE */
const SHADE = 0.9;
/** Minimum pinned scroll, in viewport heights */
const MIN_PIN_VH = 0.8;
const HALF_PI = Math.PI / 2;

type RollingStatementProps = {
  content?: RollingStatementContent;
  className?: string;
};

/**
 * The statement is printed on a cylinder that turns as you scroll. The stage pins in the middle of
 * the screen; lines roll up from under the drum, face you flat at the centre, then roll away over
 * the top, shrinking and fading with depth.
 *
 * Driven by Lenis: one callback per Lenis frame writes transform and opacity straight to each line.
 * No React state, no layout reads while scrolling (sizes are measured on mount and resize).
 */
export function RollingStatement({ content = rollingStatementContent, className }: RollingStatementProps) {
  const reduce = useReducedMotionSafe();
  const sectionRef = useRef<HTMLElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const geo = useRef({ top: 0, vh: 0, lineH: 0, radius: 0, pin: 0, speed: 1 });
  const live = useRef(false);

  const measure = useCallback(() => {
    const section = sectionRef.current;
    const first = lineRefs.current[0];
    if (!section || !first) return;
    const vh = window.innerHeight;
    const lineH = first.offsetHeight;
    const radius = Math.min(lineH * RADIUS_LINES, vh * RADIUS_MAX_VH);
    const travel = Math.PI * radius + (content.lines.length - 1) * lineH; // first line in -> last line out
    const pin = Math.max(travel - vh, vh * MIN_PIN_VH);
    section.style.height = `${pin + vh}px`;
    const top = section.getBoundingClientRect().top + window.scrollY;
    // The roll starts when the stage is half in view and ends when it is half out.
    geo.current = { top, vh, lineH, radius, pin, speed: travel / (pin + vh) };
  }, [content.lines.length]);

  const render = useCallback((scroll: number) => {
    const { top, vh, lineH, radius, speed } = geo.current;
    if (!live.current || !vh) return;
    const turned = (scroll - top + vh * 0.5) * speed; // how far the drum has turned, in px of text
    lineRefs.current.forEach((el, i) => {
      if (!el) return;
      const angle = (HALF_PI * radius + i * lineH - turned) / radius; // + below centre, - above
      if (Math.abs(angle) >= HALF_PI) {
        el.style.opacity = "0";
        return;
      }
      const cos = Math.cos(angle);
      const y = radius * Math.sin(angle);
      const depth = CAMERA / (CAMERA + radius * (1 - cos)); // 1 at the front, smaller towards the edges
      el.style.opacity = String(Math.pow(cos, SHADE));
      // rotateX without perspective = clean vertical fold (cos); depth scale makes it read as a cylinder
      el.style.transform = `translate3d(0,${y.toFixed(2)}px,0) scale(${depth.toFixed(4)}) rotateX(${(-angle).toFixed(4)}rad)`;
    });
  }, []);

  const lenis = useLenis((l) => render(l.scroll), [render]);

  useEffect(() => {
    const section = sectionRef.current;
    if (reduce || !section) return;
    live.current = true;

    const refresh = (): void => {
      measure();
      render(lenis ? lenis.scroll : window.scrollY);
    };
    refresh();

    const ro = new ResizeObserver(refresh);
    ro.observe(document.body);
    window.addEventListener("resize", refresh);
    void document.fonts?.ready.then(refresh);

    // Fallback when Lenis is not running
    const onScroll = (): void => render(window.scrollY);
    if (!lenis) window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      live.current = false;
      section.style.height = "";
      lineRefs.current.forEach((el) => {
        if (!el) return;
        el.style.opacity = "";
        el.style.transform = "";
      });
      ro.disconnect();
      window.removeEventListener("resize", refresh);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduce, lenis, measure, render]);

  const text =
    "font-footer-display text-[min(8.6vw,11.5svh,6.75rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-white";

  if (reduce) {
    return (
      <section data-atmo="intro" className={cn("bg-[#030712] px-[clamp(1.25rem,6vw,8rem)] py-[clamp(5rem,14vh,9rem)]", className)}>
        <h2 className="sr-only">{content.sentence}</h2>
        <p aria-hidden className={cn(text, "flex flex-col items-center text-center")}>
          {content.lines.map((line, i) => (
            <span key={i} className="block whitespace-nowrap">
              {line}
            </span>
          ))}
        </p>
      </section>
    );
  }

  return (
    <section ref={sectionRef} data-atmo="intro" className={cn("relative h-[220vh] bg-[#030712]", className)}>
      <h2 className="sr-only">{content.sentence}</h2>
      <div className="sticky top-0 h-svh overflow-hidden">
        <p aria-hidden className={cn(text, "absolute inset-x-0 top-1/2 -translate-y-1/2 text-center")}>
          {content.lines.map((line, i) => (
            <span
              key={i}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              className={cn("block whitespace-nowrap opacity-0 will-change-transform", i > 0 && "absolute inset-x-0 top-0")}
            >
              {line}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
