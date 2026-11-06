"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useMotionValue } from "framer-motion";
import { X } from "lucide-react";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { useFinePointer } from "@/lib/use-fine-pointer";
import type { TeamMemberData } from "./team-library";
import { TeamRail } from "./team-rail";
import { TeamRuler } from "./team-ruler";
import { SpotlightBackdrop, SpotlightPortrait, type SpotlightPhase } from "./team-spotlight";
import { TeamCard } from "./team-card";
import { EASE, NAME_TINT, ROLE_TINT, TEXT_FONT, usePointer } from "./team-motion";

type TeamStageProps = {
  members: TeamMemberData[];
  eyebrow: string;
  hint: string;
  roleCue: string;
};

const GUTTER = "clamp(1.25rem, 6vw, 6rem)";
const TOP = "clamp(5.5rem, 13svh, 7.5rem)";

/**
 * Our Team stage (one screen tall).
 *   Browse: draggable rail of dimmed glass tiles.
 *   Click 1: the tile morphs to the centre (layoutId), the others slide away, the first name
 *            rises behind the photo in giant masked letters.
 *   Click 2: the name leaves, the designation wipes in, a glass card fades in below.
 *   Close (X or Esc): everything reverses back into the rail.
 */
export function TeamStage({ members, eyebrow, hint, roleCue }: TeamStageProps) {
  const reduce = useReducedMotionSafe();
  const fine = useFinePointer();
  const pointer = usePointer(fine && !reduce);

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<SpotlightPhase>("name");
  const lastOpenRef = useRef<number | null>(null);
  const stageRef = useRef<HTMLElement>(null);

  const x = useMotionValue(0);
  const minX = useMotionValue(0);

  const open = useCallback((index: number): void => {
    lastOpenRef.current = index;
    setPhase("name");
    setOpenIndex(index);
  }, []);

  const close = useCallback((): void => setOpenIndex(null), []);
  const togglePhase = useCallback((): void => setPhase((p) => (p === "name" ? "role" : "name")), []);

  // Esc closes.
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, close]);

  // Focus: into the spotlight on open, back to the same tile on close.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const id = window.requestAnimationFrame(() => {
      if (openIndex !== null) {
        stage.querySelector<HTMLElement>("[data-team-portrait]")?.focus({ preventScroll: true });
      } else if (lastOpenRef.current !== null) {
        const slug = members[lastOpenRef.current]?.slug;
        if (slug) stage.querySelector<HTMLElement>(`[data-team-tile="${slug}"]`)?.focus({ preventScroll: true });
        lastOpenRef.current = null;
      }
    });
    return () => window.cancelAnimationFrame(id);
  }, [openIndex, members]);

  const member = openIndex === null ? null : members[openIndex];
  const browsing = openIndex === null;

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={stageRef}
        data-team-stage
        aria-label="Our team"
        className="relative isolate overflow-clip bg-[#030712] text-white"
        style={{ height: "100svh", minHeight: "34rem" }}
      >
        {/* Ambient glow, tinted by phase */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          initial={false}
          animate={{ opacity: browsing ? 0.35 : 0.9 }}
          transition={{ duration: 1, ease: EASE }}
          style={{
            background: `radial-gradient(60% 55% at 50% 50%, ${phase === "role" && !browsing ? "rgba(34,168,255,0.16)" : "rgba(123,97,255,0.16)"}, transparent 70%)`,
            transition: "background 0.9s ease",
          }}
        />

        {/* Top bar */}
        <div className="absolute inset-x-0 z-30 flex items-center justify-between" style={{ top: TOP, paddingInline: GUTTER }}>
          <span className="whitespace-nowrap text-[0.68rem] uppercase tracking-[0.22em] text-white/45" style={{ fontFamily: TEXT_FONT }}>
            ( {eyebrow} )
          </span>

          <TeamRuler count={members.length} x={x} minX={minX} openIndex={openIndex} />

          <div className="flex h-11 w-11 items-center justify-center">
            <AnimatePresence>
              {member ? (
                <motion.button
                  key="close"
                  type="button"
                  aria-label="Close and back to the team"
                  data-cursor="magnetic"
                  onClick={close}
                  initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.6, ease: EASE, delay: 0.25 } }}
                  exit={{ opacity: 0, scale: 0.6, rotate: 90, transition: { duration: 0.3, ease: EASE } }}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)] transition-colors duration-300 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_1px_rgba(124,233,255,0.8)]"
                >
                  <X aria-hidden className="h-5 w-5" />
                </motion.button>
              ) : (
                <motion.span
                  key="count"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.5, delay: 0.3 } }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  className="whitespace-nowrap text-[0.68rem] uppercase tabular-nums tracking-[0.22em] text-white/45"
                  style={{ fontFamily: TEXT_FONT }}
                >
                  {String(members.length).padStart(2, "0")}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <LayoutGroup id="team">
          <TeamRail members={members} openIndex={openIndex} onOpen={open} x={x} minX={minX} hint={hint} reduce={reduce} />

          <AnimatePresence>
            {member ? (
              <SpotlightBackdrop
                key="backdrop"
                member={member}
                phase={phase}
                pointer={pointer}
                nameTint={NAME_TINT}
                roleTint={ROLE_TINT}
              />
            ) : null}
          </AnimatePresence>

          {member ? (
            <SpotlightPortrait key={member.slug} member={member} phase={phase} onToggle={togglePhase} pointer={pointer} roleCue={roleCue} />
          ) : null}

          <AnimatePresence>
            {member && openIndex !== null && phase === "role" ? (
              <TeamCard key={`card-${member.slug}`} member={member} index={openIndex} total={members.length} />
            ) : null}
          </AnimatePresence>
        </LayoutGroup>
      </section>
    </MotionConfig>
  );
}
