"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion, type MotionValue, type PanInfo } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { TeamMemberData } from "./team-library";
import { TeamTile } from "./team-tile";
import { EASE, GUTTER, TEXT_FONT } from "./team-motion";

type TeamRailProps = {
  members: TeamMemberData[];
  openIndex: number | null;
  onOpen: (index: number) => void;
  /** Track offset in px (0 = start, minX = end). Derived from page scroll by the stage. */
  x: MotionValue<number>;
  /** Reports the most negative offset (stage width minus track width) on layout changes. */
  onMeasure: (minX: number) => void;
  /** Moves the rail to an offset by scrolling the page (instant while dragging). */
  seek: (targetX: number, instant?: boolean) => void;
  hint: string;
  reduce: boolean;
};

const GAP = "clamp(0.6rem, 1.1vw, 1.1rem)";
const TILE_H = "clamp(12rem, min(44svh, 80vw), 26rem)";

/**
 * Horizontal team rail inside the pinned stage. The page scroll drives it (wheel, trackpad,
 * touch, keyboard), so it always moves with Lenis. Dragging, the arrow buttons, a sideways
 * trackpad swipe and keyboard focus all move it too, by scrolling the page to match.
 */
export function TeamRail({ members, openIndex, onOpen, x, onMeasure, seek, hint, reduce }: TeamRailProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggedRef = useRef(false);
  const panStartRef = useRef(0);
  const browsing = openIndex === null;

  // Track length -> stage height (resize only, never per frame).
  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const measure = (): void => onMeasure(Math.min(0, viewport.clientWidth - track.scrollWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    ro.observe(track);
    return () => ro.disconnect();
  }, [onMeasure]);

  const tileStep = (): number => {
    const first = trackRef.current?.querySelector<HTMLElement>("[data-team-slot]");
    return first ? first.offsetWidth : 240;
  };

  const step = (dir: 1 | -1): void => seek(x.get() - dir * tileStep() * 2.2);

  /** Keyboard focus: glide the focused tile into view (pointer focus is ignored, it would eat the click). */
  const onFocusTile = useCallback(
    (el: HTMLElement): void => {
      const viewport = viewportRef.current;
      if (!viewport || !el.matches(":focus-visible")) return;
      const v = viewport.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const margin = v.width * 0.08;
      if (r.left >= v.left + margin && r.right <= v.right - margin) return;
      seek(x.get() + (v.left + v.width / 2 - (r.left + r.width / 2)));
    },
    [seek, x],
  );

  // Sideways trackpad swipe / shift+wheel moves the rail. Vertical wheel is left to Lenis.
  useEffect(() => {
    const stage = viewportRef.current?.closest<HTMLElement>("[data-team-stage]");
    if (!stage || !browsing) return;
    const onWheel = (e: WheelEvent): void => {
      if (!e.shiftKey && Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      const dx = e.shiftKey ? e.deltaX || e.deltaY : e.deltaX;
      if (dx === 0) return;
      e.preventDefault();
      seek(x.get() - dx, true);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [browsing, seek, x]);

  const onPanStart = (): void => {
    draggedRef.current = true;
    panStartRef.current = x.get();
  };
  const onPan = (_: PointerEvent, info: PanInfo): void => seek(panStartRef.current + info.offset.x, true);
  const onPanEnd = (_: PointerEvent, info: PanInfo): void => {
    // Glide on from where the finger left (not x.get(), which can trail the scroll by a frame).
    if (!reduce) seek(panStartRef.current + info.offset.x + info.velocity.x * 0.35);
    // The click that ends a drag fires before this timeout, so it is ignored.
    window.setTimeout(() => {
      draggedRef.current = false;
    }, 0);
  };

  return (
    <>
      <div ref={viewportRef} className="absolute inset-x-0 top-1/2 z-10 -translate-y-1/2" style={{ touchAction: "pan-y" }}>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <motion.div
            ref={trackRef}
            onPanStart={browsing ? onPanStart : undefined}
            onPan={browsing ? onPan : undefined}
            onPanEnd={browsing ? onPanEnd : undefined}
            className="flex w-max transform-gpu cursor-grab select-none will-change-transform active:cursor-grabbing"
            style={{ x, gap: GAP, paddingInline: GUTTER, touchAction: "pan-y", ["--tile-h" as string]: TILE_H }}
          >
            {members.map((member, i) => (
              <div key={member.slug} data-team-slot className="shrink-0">
                <TeamTile
                  member={member}
                  index={i}
                  openIndex={openIndex}
                  onOpen={onOpen}
                  onFocusTile={onFocusTile}
                  wasDragged={() => draggedRef.current}
                />
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom bar: hint and arrows (browsing only) */}
      <motion.div
        initial={false}
        animate={{ opacity: browsing ? 1 : 0, y: browsing ? 0 : 12 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="absolute inset-x-0 z-20 flex items-center justify-between"
        style={{ bottom: "clamp(1.25rem, 5svh, 2.75rem)", paddingInline: GUTTER, pointerEvents: browsing ? "auto" : "none" }}
      >
        <span className="whitespace-nowrap text-[0.68rem] uppercase tracking-[0.22em] text-white/45" style={{ fontFamily: TEXT_FONT }}>
          {hint}
        </span>
        <div className="flex gap-2">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              aria-label={dir < 0 ? "Previous team members" : "Next team members"}
              tabIndex={browsing ? 0 : -1}
              data-cursor="magnetic"
              onClick={() => step(dir)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.04] text-white/75 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] transition-colors duration-300 hover:bg-white/[0.1] hover:text-white focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_1px_rgba(124,233,255,0.7)]"
            >
              {dir < 0 ? <ArrowLeft aria-hidden className="h-4 w-4" /> : <ArrowRight aria-hidden className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </motion.div>
    </>
  );
}
