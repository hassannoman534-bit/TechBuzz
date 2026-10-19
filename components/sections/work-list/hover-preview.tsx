"use client";

import Image from "next/image";
import { motion, type MotionValue } from "framer-motion";
import type { WorkListItem } from "./work-list.config";

type HoverPreviewProps = {
  items: WorkListItem[];
  /** Index of the row under the pointer (kept on the last row while closing) */
  index: number;
  active: boolean;
  /** Pointer position (viewport px), already spring-smoothed; two speeds give the lag between box and cursor */
  boxX: MotionValue<number>;
  boxY: MotionValue<number>;
  cursorX: MotionValue<number>;
  cursorY: MotionValue<number>;
  cursorLabel: string;
};

const EASE = [0.76, 0, 0.24, 1] as const;
const SCALE = {
  open: { scale: 1, transition: { duration: 0.4, ease: EASE } },
  closed: { scale: 0, transition: { duration: 0.4, ease: EASE } },
};

/**
 * The floating preview that follows the pointer over the list.
 * - Box: a window onto a vertical strip of all project previews. The strip slides to the
 *   hovered row (translateY = -index × 100%), so moving between rows scrolls the images.
 * - Cursor: a round "View" label that follows a little faster than the box, so the two
 *   separate slightly while moving and line up when the pointer rests.
 * Fixed position, transform only, pointer-events none (never blocks the links underneath).
 */
export function HoverPreview({ items, index, active, boxX, boxY, cursorX, cursorY, cursorLabel }: HoverPreviewProps) {
  const state = active ? "open" : "closed";
  return (
    <>
      <motion.div
        aria-hidden
        style={{ x: boxX, y: boxY, translateX: "-50%", translateY: "-50%", willChange: "transform" }}
        className="pointer-events-none fixed left-0 top-0 z-40 hidden md:block"
      >
        <motion.div
          variants={SCALE}
          initial="closed"
          animate={state}
          className="relative h-[clamp(15rem,22vw,22rem)] w-[clamp(17rem,25vw,25rem)] overflow-hidden rounded-[6px] shadow-[0_40px_90px_-30px_rgb(0_0_0/0.9)]"
        >
          <div
            className="absolute inset-x-0 top-0 h-full transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]"
            style={{ transform: `translateY(${-index * 100}%)` }}
          >
            {items.map((item) => (
              <div key={item.title} className="grid h-full w-full place-items-center" style={{ backgroundColor: item.color }}>
                <div className="relative h-[78%] w-[86%] overflow-hidden">
                  {item.image ? (
                    <Image src={item.image.src} alt="" fill sizes="25vw" className="object-cover" />
                  ) : (
                    <div className="grid size-full place-items-center bg-[radial-gradient(70%_70%_at_30%_25%,rgb(255_255_255/0.12),transparent_70%)] ring-1 ring-white/10">
                      <span className="px-4 text-center font-footer-display text-[clamp(1.1rem,1.6vw,1.5rem)] font-semibold tracking-[-0.03em] text-white/80">
                        {item.title}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        aria-hidden
        style={{ x: cursorX, y: cursorY, translateX: "-50%", translateY: "-50%", willChange: "transform" }}
        className="pointer-events-none fixed left-0 top-0 z-50 hidden md:block"
      >
        <motion.div
          variants={SCALE}
          initial="closed"
          animate={state}
          className="grid size-20 place-items-center rounded-full bg-[linear-gradient(140deg,#7b61ff,#5b7cff_60%,#22a8ff)] text-[0.85rem] font-medium text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_16px_40px_-12px_rgb(123_97_255/0.8)]"
        >
          {cursorLabel}
        </motion.div>
      </motion.div>
    </>
  );
}
