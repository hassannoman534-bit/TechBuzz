"use client";

import { motion } from "framer-motion";
import type { TeamMemberData } from "./team-library";
import { TeamPortrait } from "./team-portrait";
import { EASE, LAYOUT_SPRING, TEXT_FONT, portraitLayoutId } from "./team-motion";

type TeamTileProps = {
  member: TeamMemberData;
  index: number;
  /** Index of the open member, or null while browsing */
  openIndex: number | null;
  onOpen: (index: number) => void;
  onFocusTile: (el: HTMLElement) => void;
  /** True while (or right after) the rail is being dragged, so a drag never counts as a click */
  wasDragged: () => boolean;
};

export const TILE_RADIUS = 14;

/**
 * One slider tile: a dimmed glass frame with the portrait. Hover brings the colour back and
 * shows the name. When this member opens, the frame (layoutId) flies to the stage and an
 * empty slot of the same size stays behind; the other tiles slide out to their side.
 */
export function TeamTile({ member, index, openIndex, onOpen, onFocusTile, wasDragged }: TeamTileProps) {
  const isOpen = openIndex === index;
  const away = openIndex !== null && !isOpen;
  const side = openIndex === null ? 0 : index < openIndex ? -1 : 1;
  const distance = openIndex === null ? 0 : Math.abs(index - openIndex);

  return (
    <motion.div
      className="relative shrink-0"
      style={{ height: "var(--tile-h)", aspectRatio: "4 / 5" }}
      initial={false}
      animate={
        away
          ? { x: `${side * (120 + Math.min(distance, 6) * 18)}%`, opacity: 0, scale: 0.94 }
          : { x: "0%", opacity: 1, scale: 1 }
      }
      transition={{
        duration: away ? 0.75 : 0.9,
        ease: EASE,
        delay: away ? Math.min(distance, 8) * 0.025 : 0.12 + Math.min(distance, 8) * 0.03,
      }}
    >
      {isOpen ? null : (
        <button
          type="button"
          data-cursor="explore"
          data-team-tile={member.slug}
          aria-label={`${member.name}, ${member.role}`}
          tabIndex={openIndex === null ? 0 : -1}
          onFocus={(e) => onFocusTile(e.currentTarget)}
          onClick={() => {
            if (!wasDragged()) onOpen(index);
          }}
          className="group absolute inset-0 block cursor-pointer select-none outline-none [-webkit-tap-highlight-color:transparent]"
        >
          <motion.div
            layoutId={portraitLayoutId(member.slug)}
            transition={LAYOUT_SPRING}
            className="absolute inset-0 overflow-hidden bg-[#0a0f1d]"
            style={{ borderRadius: TILE_RADIUS, containerType: "inline-size" }}
          >
            <div className="absolute inset-0 scale-[1.02] grayscale brightness-50 transition-[filter,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] group-hover:grayscale-0 group-hover:brightness-100 group-focus-visible:grayscale-0 group-focus-visible:brightness-100">
              <TeamPortrait member={member} sizes="(max-width: 768px) 40vw, 22vw" priority={index < 4} />
            </div>

            {/* Glass: top sheen, inner rim, bottom shade for the caption */}
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.07] via-transparent to-black/60" />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 transition-[box-shadow] duration-500 group-hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)] group-focus-visible:shadow-[inset_0_0_0_1px_rgba(124,233,255,0.7)]"
              style={{ borderRadius: TILE_RADIUS, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}
            />
          </motion.div>

          <span
            className="pointer-events-none absolute inset-x-3 bottom-3 flex translate-y-2 items-baseline justify-between gap-3 whitespace-nowrap opacity-0 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
            style={{ fontFamily: TEXT_FONT }}
          >
            <span className="truncate text-[0.8rem] font-medium text-white">{member.name}</span>
            <span className="truncate text-[0.62rem] uppercase tracking-[0.16em] text-white/60">{member.short}</span>
          </span>
        </button>
      )}
    </motion.div>
  );
}
