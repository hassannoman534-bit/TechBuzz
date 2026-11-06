"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion, type MotionValue } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { TeamMemberData } from "./team-library";
import { TeamTile } from "./team-tile";
import { EASE, TEXT_FONT } from "./team-motion";

type TeamRailProps = {
  members: TeamMemberData[];
  openIndex: number | null;
  onOpen: (index: number) => void;
  /** Track offset (px, 0 = start). Owned by the stage so the ruler can read it. */
  x: MotionValue<number>;
  /** Most negative allowed offset (track width minus stage width), kept up to date here. */
  minX: MotionValue<number>;
  hint: string;
  reduce: boolean;
};

const GUTTER = "clamp(1.25rem, 6vw, 6rem)";
const GAP = "clamp(0.6rem, 1.1vw, 1.1rem)";
const TILE_H = "clamp(12rem, min(44svh, 80vw), 26rem)";
const GLIDE = { type: "spring", stiffness: 140, damping: 28, mass: 0.9 } as const;

/**
 * Horizontal team slider. Drag (mouse or touch, vertical page scroll still works on touch),
 * arrow buttons, or Tab through the tiles. Never listens to the wheel, so Lenis keeps the page.
 */
export function TeamRail({ members, openIndex, onOpen, x, minX, hint, reduce }: TeamRailProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggedRef = useRef(false);
  const [bounds, setBounds] = useState({ left: 0, right: 0 });

  // Keep the drag bounds in sync with the layout (resize only, never per frame).
  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const measure = (): void => {
      const left = Math.min(0, viewport.clientWidth - track.scrollWidth);
      minX.set(left);
      setBounds((b) => (b.left === left ? b : { left, right: 0 }));
      if (x.get() < left) x.set(left);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    ro.observe(track);
    return () => ro.disconnect();
  }, [minX, x]);

  const glideTo = useCallback(
    (target: number): void => {
      const clamped = Math.max(minX.get(), Math.min(0, target));
      if (reduce) x.set(clamped);
      else animate(x, clamped, GLIDE);
    },
    [minX, reduce, x],
  );

  const step = (dir: 1 | -1): void => {
    const first = trackRef.current?.querySelector<HTMLElement>("[data-team-slot]");
    const width = first ? first.offsetWidth : 240;
    glideTo(x.get() - dir * width * 2.2);
  };

  /** Keyboard focus: glide the focused tile into view (the stage uses overflow: clip, so it never scrolls natively). */
  const onFocusTile = useCallback(
    (el: HTMLElement): void => {
      const viewport = viewportRef.current;
      // Keyboard only: a tap or click also focuses the tile, and moving it then would swallow the click.
      if (!viewport || !el.matches(":focus-visible")) return;
      const v = viewport.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const margin = v.width * 0.08;
      if (r.left >= v.left + margin && r.right <= v.right - margin) return;
      glideTo(x.get() + (v.left + v.width / 2 - (r.left + r.width / 2)));
    },
    [glideTo, x],
  );

  const browsing = openIndex === null;

  return (
    <>
      <div ref={viewportRef} className="absolute inset-x-0 top-1/2 z-10 -translate-y-1/2">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <motion.div
            ref={trackRef}
            drag={browsing ? "x" : false}
            dragConstraints={bounds}
            dragElastic={0.06}
            dragTransition={{ power: 0.28, timeConstant: 280, bounceStiffness: 260, bounceDamping: 34 }}
            onDragStart={() => {
              draggedRef.current = true;
            }}
            onDragEnd={() => {
              // The click that ends a drag fires before this timeout, so it is ignored.
              window.setTimeout(() => {
                draggedRef.current = false;
              }, 0);
            }}
            className="flex w-max transform-gpu cursor-grab will-change-transform active:cursor-grabbing"
            style={{ x, gap: GAP, paddingInline: GUTTER, ["--tile-h" as string]: TILE_H }}
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
