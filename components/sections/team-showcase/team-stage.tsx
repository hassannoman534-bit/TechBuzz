"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useMotionValue, useScroll, useTransform } from "framer-motion";
import { useLenis } from "lenis/react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { useFinePointer } from "@/lib/use-fine-pointer";
import type { TeamMemberData } from "./team-library";
import { TeamRail } from "./team-rail";
import { TeamRuler } from "./team-ruler";
import { SpotlightBackdrop, SpotlightPortrait, type SpotlightPhase } from "./team-spotlight";
import { TeamCard } from "./team-card";
import { EASE, GUTTER, NAME_TINT, ROLE_TINT, TEXT_FONT, TOP_BAR, usePointer } from "./team-motion";
import { useSpotlightSwipe } from "./use-spotlight-swipe";

type TeamStageProps = {
  members: TeamMemberData[];
  eyebrow: string;
  hint: string;
  roleCue: string;
};

/** Page scroll per pixel of rail travel (below 1 = the rail moves a little faster than the page). */
const SCROLL_RATIO = 0.8;

const expoOut = (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Our Team stage. A pinned section (one screen tall while it plays) whose page scroll moves the rail.
 *   Browse: scroll, swipe, drag or use the arrows; dimmed glass tiles light up on hover.
 *   Click 1: the tile morphs to the centre (layoutId), the others slide away, the first name rises
 *            in giant letters (filled behind the photo, outlined in front, so it always reads).
 *   Click 2: the name leaves, the designation wipes in, a glass card fades in below.
 *   Close (X or Esc): everything reverses back into the rail. Page scroll is paused while open.
 *   Centring: a click while the section is only partly on screen first glides the page (Lenis) to
 *            where the stage is fully pinned, then opens, so the spotlight is always centred.
 *   Switching: while open, a horizontal drag, a two finger trackpad swipe, the arrow keys or the
 *            small arrows move to the previous or next member without closing.
 */
export function TeamStage({ members, eyebrow, hint, roleCue }: TeamStageProps) {
  const reduce = useReducedMotionSafe();
  const fine = useFinePointer();
  const pointer = usePointer(fine && !reduce);
  const lenis = useLenis();

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openIndexRef = useRef<number | null>(null);
  useEffect(() => {
    openIndexRef.current = openIndex;
  }, [openIndex]);
  const busyRef = useRef(false);
  const lastSwitchRef = useRef(0);
  const dragX = useMotionValue(0);
  const [phase, setPhase] = useState<SpotlightPhase>("name");
  const [travel, setTravel] = useState(0);
  const lastOpenRef = useRef<number | null>(null);
  const wrapperRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Rail position comes from page scroll through the pinned wrapper.
  const minX = useMotionValue(0);
  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ["start start", "end end"] });
  const x = useTransform(() => scrollYProgress.get() * minX.get());

  const onMeasure = useCallback(
    (min: number): void => {
      minX.set(min);
      setTravel((t) => (Math.abs(t + min) < 1 ? t : -min));
    },
    [minX],
  );

  // The section grows after the rail is measured. Lenis caches the page's scroll limit and the
  // root element is h-full, so its own resize observer never sees this: re-measure explicitly,
  // or wheel and scrollTo stay clamped to the old page height.
  useEffect(() => {
    lenis?.resize();
  }, [lenis, travel]);

  /** Scrolls the page so the rail lands on targetX (clamped to the rail ends). */
  const seek = useCallback(
    (targetX: number, instant = false): void => {
      const wrapper = wrapperRef.current;
      const min = minX.get();
      if (!wrapper || min >= 0) return;
      const clamped = Math.max(min, Math.min(0, targetX));
      const top = wrapper.getBoundingClientRect().top + window.scrollY;
      const range = wrapper.offsetHeight - window.innerHeight;
      const target = top + (clamped / min) * range;
      if (lenis) {
        lenis.scrollTo(target, instant ? { immediate: true, force: true } : { duration: 1.1, easing: expoOut, force: true });
      } else {
        window.scrollTo({ top: target, behavior: instant || reduce ? "auto" : "smooth" });
      }
    },
    [lenis, minX, reduce],
  );

  const show = useCallback((index: number): void => {
    lastOpenRef.current = index;
    setPhase("name");
    setOpenIndex(index);
  }, []);

  /**
   * Opens a member. If the stage is not fully pinned yet (section only partly on screen), the
   * page first glides to the nearest pinned position. Outside the pinned range the rail sits at
   * its start or end, so it does not move; the spotlight then opens centred on screen.
   */
  const open = useCallback(
    (index: number): void => {
      const wrapper = wrapperRef.current;
      if (!wrapper || busyRef.current) return;
      const r = wrapper.getBoundingClientRect();
      const vh = window.innerHeight;
      const pinned = r.top <= 1 && r.bottom >= vh - 1;
      if (pinned) return show(index);
      const target = r.top > 0 ? window.scrollY + r.top : window.scrollY + r.bottom - vh;
      busyRef.current = true;
      const done = (): void => {
        // two frames: let the scroll event reach useScroll before the layout morph measures
        window.requestAnimationFrame(() =>
          window.requestAnimationFrame(() => {
            busyRef.current = false;
            show(index);
          }),
        );
      };
      if (lenis && !reduce) {
        lenis.scrollTo(target, { duration: 0.55, easing: expoOut, force: true, onComplete: done });
      } else {
        if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
        else window.scrollTo({ top: target, behavior: "auto" });
        done();
      }
    },
    [lenis, reduce, show],
  );

  /** Moves to the previous or next member while open (no close in between). */
  const navigate = useCallback(
    (dir: 1 | -1): void => {
      const current = openIndexRef.current;
      if (current === null) return;
      const next = current + dir;
      if (next < 0 || next >= members.length) return;
      const now = performance.now();
      if (now - lastSwitchRef.current < 320) return;
      lastSwitchRef.current = now;
      lastOpenRef.current = next;
      setOpenIndex(next);
    },
    [members.length],
  );

  /**
   * Closes. If the open member's slot is off screen (after switching), the rail first jumps so
   * that slot is centred; the other tiles are hidden at that moment, so the jump is invisible,
   * and the photo then flies back into a visible slot.
   */
  const close = useCallback((): void => {
    const index = openIndexRef.current;
    const stage = stageRef.current;
    const slot = index === null ? null : stage?.querySelectorAll<HTMLElement>("[data-team-slot]")[index];
    if (!slot) return setOpenIndex(null);
    const r = slot.getBoundingClientRect();
    const vw = window.innerWidth;
    const margin = vw * 0.08;
    if (r.left >= margin && r.right <= vw - margin) return setOpenIndex(null);
    seek(x.get() + (vw / 2 - (r.left + r.width / 2)), true);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => setOpenIndex(null)));
  }, [seek, x]);
  const togglePhase = useCallback((): void => setPhase((p) => (p === "name" ? "role" : "name")), []);

  // While open: page scroll paused (the stage stays pinned), Esc closes.
  useEffect(() => {
    if (openIndex === null) return;
    lenis?.stop();
    // Lock <body>, never <html>: <html> is h-full, so overflow:hidden on it turns it into its own
    // scroll box and breaks the pinned stage's sticky (the stage jumps off screen, page goes blank).
    // body overflow propagates to the viewport instead, so sticky keeps working.
    const body = document.body;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") navigate(1);
      else if (e.key === "ArrowLeft") navigate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      body.style.overflow = prev;
      lenis?.start();
    };
  }, [openIndex, close, navigate, lenis]);

  useSpotlightSwipe({ stageRef, enabled: openIndex !== null, dragX, onSwipe: navigate, reduce });

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
        ref={wrapperRef}
        aria-label="Our team"
        className="relative bg-[#030712]"
        style={{ height: `calc(100svh + ${Math.round(travel * SCROLL_RATIO)}px)` }}
      >
        <div
          ref={stageRef}
          data-team-stage
          className="sticky top-0 isolate overflow-clip bg-[#030712] text-white"
          style={{ height: "100svh", minHeight: "34rem", touchAction: openIndex === null ? undefined : "pan-y" }}
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
          <div data-team-chrome className="absolute inset-x-0 z-30 flex items-center justify-between" style={{ top: TOP_BAR, paddingInline: GUTTER }}>
            <span className="whitespace-nowrap text-[0.68rem] uppercase tracking-[0.22em] text-white/45" style={{ fontFamily: TEXT_FONT }}>
              ( {eyebrow} )
            </span>

            <TeamRuler count={members.length} progress={scrollYProgress} openIndex={openIndex} />

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
            <TeamRail
              members={members}
              openIndex={openIndex}
              onOpen={open}
              x={x}
              onMeasure={onMeasure}
              seek={seek}
              hint={hint}
              reduce={reduce}
            />

            {/* Filled word behind the photo */}
            <AnimatePresence>
              {member ? (
                <SpotlightBackdrop
                  key="word-fill"
                  layer="fill"
                  member={member}
                  phase={phase}
                  pointer={pointer}
                  dragX={dragX}
                  nameTint={NAME_TINT}
                  roleTint={ROLE_TINT}
                />
              ) : null}
            </AnimatePresence>

            {member ? (
              <SpotlightPortrait key={member.slug} member={member} phase={phase} onToggle={togglePhase} pointer={pointer} roleCue={roleCue} dragX={dragX} />
            ) : null}

            {/* Outlined copy in front of the photo */}
            <AnimatePresence>
              {member ? (
                <SpotlightBackdrop
                  key="word-outline"
                  layer="outline"
                  member={member}
                  phase={phase}
                  pointer={pointer}
                  dragX={dragX}
                  nameTint={NAME_TINT}
                  roleTint={ROLE_TINT}
                />
              ) : null}
            </AnimatePresence>

            <AnimatePresence>
              {member && openIndex !== null && phase === "role" ? (
                <TeamCard key={`card-${member.slug}`} member={member} index={openIndex} total={members.length} />
              ) : null}
            </AnimatePresence>

            {/* Previous / next while open (swipe, trackpad and arrow keys do the same) */}
            <AnimatePresence>
              {member && openIndex !== null ? (
                <motion.div
                  key="switch"
                  data-team-chrome
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay: 0.45 } }}
                  exit={{ opacity: 0, y: 12, transition: { duration: 0.25 } }}
                  className="absolute z-30 flex gap-2"
                  style={{ right: GUTTER, bottom: "clamp(1.25rem, 5svh, 2.75rem)" }}
                >
                  {([-1, 1] as const).map((dir) => {
                    const disabled = dir < 0 ? openIndex === 0 : openIndex === members.length - 1;
                    return (
                      <button
                        key={dir}
                        type="button"
                        aria-label={dir < 0 ? "Previous team member" : "Next team member"}
                        data-cursor="magnetic"
                        disabled={disabled}
                        onClick={() => navigate(dir)}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.04] text-white/75 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] transition-[background-color,color,opacity] duration-300 hover:bg-white/[0.1] hover:text-white focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_1px_rgba(124,233,255,0.7)] disabled:pointer-events-none disabled:opacity-30"
                      >
                        {dir < 0 ? <ArrowLeft aria-hidden className="h-4 w-4" /> : <ArrowRight aria-hidden className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </LayoutGroup>
        </div>
      </section>
    </MotionConfig>
  );
}
