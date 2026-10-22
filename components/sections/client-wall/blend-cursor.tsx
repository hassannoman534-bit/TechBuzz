"use client";

import { motion, type MotionValue } from "framer-motion";

export type BlendCursorState = "off" | "dot" | "tile";

type BlendCursorProps = {
  x: MotionValue<number>;
  y: MotionValue<number>;
  state: BlendCursorState;
  /** Show the arrow (the hovered logo links somewhere) */
  arrow: boolean;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Round cursor in difference blend mode: a white disc that inverts whatever is under it, so the
 * hovered logo turns dark and the tile around it turns light. Small dot between tiles, full disc on a
 * tile. The arrow is drawn in black inside the disc; black does nothing in difference mode, so the
 * arrow shows the page through the disc (it inverts too). Fixed position, transform only.
 */
export function BlendCursor({ x, y, state, arrow }: BlendCursorProps) {
  const scale = state === "tile" ? 1 : state === "dot" ? 0.12 : 0;
  return (
    <motion.div
      aria-hidden
      style={{ x, y, translateX: "-50%", translateY: "-50%", willChange: "transform" }}
      className="pointer-events-none fixed left-0 top-0 z-50 hidden mix-blend-difference md:block"
    >
      <motion.div
        initial={false}
        animate={{ scale }}
        transition={{ duration: state === "tile" ? 0.6 : 0.45, ease: EASE }}
        className="grid size-[clamp(5.5rem,7vw,7.5rem)] place-items-center rounded-full bg-white"
      >
        <motion.svg
          viewBox="0 0 24 24"
          className="size-[30%]"
          fill="none"
          stroke="#000"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ opacity: arrow && state === "tile" ? 1 : 0, rotate: arrow && state === "tile" ? 0 : -45 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <path d="M7 17 17 7M8 7h9v9" />
        </motion.svg>
      </motion.div>
    </motion.div>
  );
}
