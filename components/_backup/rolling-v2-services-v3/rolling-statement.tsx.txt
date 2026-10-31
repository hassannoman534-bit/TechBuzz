"use client";

import { Fragment, useCallback, useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { rollingStatementContent, type RollingStatementContent } from "./rolling-statement.config";

/** Drum radius: a share of the viewport height, capped in line heights so small type still rolls on phones */
const DRUM = 0.3;
const DRUM_LINES = 3.4;
/** Per line camera distance; lower = stronger widening of tilted lines */
const PERSPECTIVE = 1400;
/** Lines fade out over this many radians before they roll out of sight */
const EDGE_FADE = 0.38;
const HALF_PI = Math.PI / 2;

type RollingStatementProps = {
  content?: RollingStatementContent;
  className?: string;
};

/**
 * The statement rolls over an invisible drum as you scroll: lines come up from below folded flat,
 * straighten out in the middle of the screen and fold away at the top, bunching at both edges like
 * text printed on a cylinder.
 *
 * Driven by Lenis: one callback per Lenis frame writes transform and opacity straight to each line
 * (no React state, no layout reads while scrolling; line positions are measured once and on resize).
 */
export function RollingStatement({ content = rollingStatementContent, className }: RollingStatementProps) {
  const reduce = useReducedMotionSafe();
  const sectionRef = useRef<HTMLElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const geo = useRef({ centers: [] as number[], top: 0, bottom: 0, vh: 0, radius: 0 });
  const idle = useRef(false);
  const live = useRef(false);

  /* Line centres in page coordinates (offsets ignore transforms, so this is the flat layout) */
  const measure = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    geo.current = {
      centers: lineRefs.current.map((el) => (el ? top + el.offsetTop + el.offsetHeight / 2 : 0)),
      top,
      bottom: top + section.offsetHeight,
      vh: window.innerHeight,
      radius: Math.min(window.innerHeight * DRUM, (lineRefs.current[0]?.offsetHeight ?? 0) * DRUM_LINES || Infinity),
    };
    idle.current = false;
  }, []);

  const render = useCallback((scroll: number) => {
    const { centers, top, bottom, vh, radius } = geo.current;
    if (!live.current || !vh) return;

    // Far from the viewport: hide everything once, then skip work until it comes back.
    const near = scroll + vh * 2 > top && scroll - vh < bottom;
    if (!near) {
      if (!idle.current) {
        lineRefs.current.forEach((el) => el && (el.style.opacity = "0"));
        idle.current = true;
      }
      return;
    }
    idle.current = false;

    const mid = scroll + vh / 2;
    lineRefs.current.forEach((el, i) => {
      if (!el) return;
      const s = centers[i] - mid; // flat distance from the screen centre
      const angle = s / radius; // position on the drum
      const away = Math.abs(angle);
      if (away >= HALF_PI) {
        el.style.opacity = "0";
        return;
      }
      const shift = radius * Math.sin(angle) - s; // pull the line onto the drum
      el.style.opacity = String(Math.min(1, (HALF_PI - away) / EDGE_FADE));
      el.style.transform = `perspective(${PERSPECTIVE}px) translate3d(0,${shift.toFixed(2)}px,0) rotateX(${(-angle).toFixed(4)}rad)`;
    });
  }, []);

  const lenis = useLenis((l) => render(l.scroll), [render]);

  useEffect(() => {
    if (reduce) return;
    const section = sectionRef.current;
    if (!section) return;
    live.current = true;

    const refresh = (): void => {
      measure();
      render(lenis ? lenis.scroll : window.scrollY);
    };
    refresh();

    // Fonts and the pinned sections above can shift the layout after mount.
    const ro = new ResizeObserver(refresh);
    ro.observe(section);
    ro.observe(document.body);
    window.addEventListener("resize", refresh);
    void document.fonts?.ready.then(refresh);

    // Fallback when Lenis is not running
    const onScroll = (): void => render(window.scrollY);
    if (!lenis) window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      live.current = false;
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

  return (
    <section
      ref={sectionRef}
      data-atmo="intro"
      className={cn(
        "relative overflow-x-clip bg-[#030712] px-[clamp(1.25rem,6vw,8rem)] text-white",
        reduce ? "py-[clamp(5rem,14vh,9rem)]" : "py-[38svh]",
        className,
      )}
    >
      <h2 className="sr-only">{content.sentence}</h2>
      <p
        aria-hidden
        className="mx-auto flex flex-col items-center text-center font-signature text-[min(9.2vw,12.5svh,7rem)] font-extrabold leading-[0.94] tracking-[-0.055em]"
      >
        {content.lines.map((line, i) => (
          <span
            key={i}
            ref={(el) => {
              lineRefs.current[i] = el;
            }}
            className={cn("block whitespace-nowrap", !reduce && "opacity-0 will-change-transform")}
          >
            {renderLine(line)}
          </span>
        ))}
      </p>
    </section>
  );
}

/** "*word*" becomes italic */
function renderLine(line: string) {
  return line.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") ? (
      <em key={i} className="pr-[0.04em] italic">
        {part.slice(1, -1)}
      </em>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
