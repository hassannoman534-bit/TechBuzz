"use client";

import { AnimatePresence, motion, useTransform, type MotionValue } from "framer-motion";
import type { TeamMemberData } from "./team-library";
import { GiantWord, type GiantWordLayer } from "./giant-word";
import { TeamPortrait } from "./team-portrait";
import { TILE_RADIUS } from "./team-tile";
import {
  EASE,
  LAYOUT_SPRING,
  ROLE_LIFT,
  ROLE_SCALE,
  SPOTLIGHT_BOX,
  SPOTLIGHT_BOX_H,
  TEXT_FONT,
  portraitLayoutId,
  type Pointer,
} from "./team-motion";

export type SpotlightPhase = "name" | "role";

type BackdropProps = {
  member: TeamMemberData;
  phase: SpotlightPhase;
  layer: GiantWordLayer;
  pointer: Pointer;
  nameTint: string;
  roleTint: string;
  /** Horizontal swipe offset (px); the word follows a little less than the photo */
  dragX: MotionValue<number>;
};

/**
 * Giant typography for the open member, in the same box as the portrait. Two instances run in
 * step: layer "fill" behind the photo and layer "outline" in front of it (knockout), so the
 * word reads in full. Lives inside the stage's AnimatePresence and propagates its exit, so the
 * letters leave upward while the portrait flies back.
 */
export function SpotlightBackdrop({ member, phase, layer, pointer, nameTint, roleTint, dragX }: BackdropProps) {
  const x = useTransform(() => pointer.x.get() * -12 + dragX.get() * 0.6);
  const y = useTransform(pointer.y, (v) => v * -7);
  const isRole = phase === "role";

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1, transition: { duration: 0.75 } }}
      style={{ ...SPOTLIGHT_BOX, x, zIndex: layer === "fill" ? 12 : 22 }}
    >
      <motion.div className="absolute inset-0" style={{ y }}>
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ y: isRole ? ROLE_LIFT : "0%" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <AnimatePresence propagate initial>
            {isRole ? (
              <GiantWord
                key={`role-${member.slug}`}
                text={member.short}
                variant="role"
                layer={layer}
                tint={roleTint}
                pointer={pointer}
                delay={0.12}
              />
            ) : (
              <GiantWord
                key={`name-${member.slug}`}
                text={member.display}
                variant="name"
                layer={layer}
                tint={nameTint}
                pointer={pointer}
                delay={0.22}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

type PortraitProps = {
  member: TeamMemberData;
  phase: SpotlightPhase;
  onToggle: () => void;
  pointer: Pointer;
  roleCue: string;
  /** Horizontal swipe offset (px) while the finger is down */
  dragX: MotionValue<number>;
};

/**
 * The open portrait. Rendered outside AnimatePresence on purpose: when it unmounts, the tile's
 * frame with the same layoutId takes over and flies back from here, with no ghost copy.
 */
export function SpotlightPortrait({ member, phase, onToggle, pointer, roleCue, dragX }: PortraitProps) {
  const px = useTransform(() => pointer.x.get() * 8 + dragX.get());
  const py = useTransform(pointer.y, (v) => v * 5);
  const isRole = phase === "role";

  return (
    <div className="pointer-events-none absolute z-20 flex items-center justify-center" style={SPOTLIGHT_BOX}>
      <motion.div className="relative flex h-full items-center justify-center" style={{ x: px, y: py }}>
        <motion.div
          initial={false}
          animate={{ y: isRole ? ROLE_LIFT : "0%", scale: isRole ? ROLE_SCALE : 1 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="relative"
        >
          <button
            type="button"
            data-team-portrait
            data-cursor="explore"
            aria-label={isRole ? `${member.name}. Show name` : `${member.name}. Show role`}
            onClick={onToggle}
            className="pointer-events-auto relative block cursor-pointer rounded-[18px] outline-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-[#7ce9ff]/80 focus-visible:ring-offset-4 focus-visible:ring-offset-[#030712]"
            style={{ height: `min(${SPOTLIGHT_BOX_H}, 87.5vw, 44rem)`, aspectRatio: "4 / 5" }}
          >
            <motion.div
              layoutId={portraitLayoutId(member.slug)}
              transition={LAYOUT_SPRING}
              className="absolute inset-0 overflow-hidden bg-[#0a0f1d]"
              style={{
                borderRadius: TILE_RADIUS + 4,
                containerType: "inline-size",
                boxShadow: "0 40px 90px -30px rgba(0,0,0,0.9)",
              }}
            >
              <TeamPortrait member={member} sizes="(max-width: 768px) 80vw, 40vw" priority />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ borderRadius: TILE_RADIUS + 4, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)" }}
              />
            </motion.div>
          </button>

          <AnimatePresence>
            {isRole ? null : (
              <motion.span
                key="cue"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay: 0.7 } }}
                exit={{ opacity: 0, y: -6, transition: { duration: 0.25 } }}
                className="pointer-events-none absolute left-0 right-0 top-full mt-4 flex flex-col items-center gap-2 whitespace-nowrap text-[0.66rem] uppercase tracking-[0.24em] text-white/60"
                style={{ fontFamily: TEXT_FONT }}
              >
                {roleCue}
                <span className="h-5 w-px bg-gradient-to-b from-white/50 to-white/0" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
