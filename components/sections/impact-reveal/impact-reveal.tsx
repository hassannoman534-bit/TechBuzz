"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { ProofChip } from "./proof-chip";
import { impactRevealContent, type ImpactRevealContent } from "./impact-reveal.config";

/* ── Scroll timeline (pinned progress 0 → 1) ──────────────────────────────── */
const T = {
  flood: [0, 0.2], // circle grows until it fills the screen
  surface: [0.14, 0.22], // soft colour wash fades in on the light surface
  eyebrowIn: [0.14, 0.2],
  reveal: [0.1, 0.17], // word + cards only appear once the light covers the screen
  track: [0.1, 0.84], // giant word travels right → left
  eyebrowOut: [0.76, 0.8],
  set: [0.79, 0.93], // circle sets back below the horizon
  cta: [0.86, 0.95],
} as const;

/** Light disc occupies 72% of the element's radius; the rest is its halo. */
const DISC = 0.72;

type Ease = (t: number) => number;
const inOutCubic: Ease = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const outCubic: Ease = (t) => 1 - (1 - t) ** 3;
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const seg = (p: number, [a, b]: readonly [number, number], e: Ease = inOutCubic): number =>
  e(Math.min(1, Math.max(0, (p - a) / (b - a))));

type Geo = { W: number; H: number; trackW: number };

type ImpactRevealProps = {
  content?: ImpactRevealContent;
  /** Section height in vh. Scroll distance = length − 100. */
  length?: number;
  className?: string;
};

export function ImpactReveal({ content = impactRevealContent, length = 520, className }: ImpactRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLHeadingElement>(null);
  const reduce = useReducedMotion();

  /* Progress: approach (section entering) + pinned. Both spring-smoothed for wheel input. */
  const spring = { stiffness: 170, damping: 34, mass: 0.35, restDelta: 0.0002 };
  const { scrollYProgress: enterRaw } = useScroll({ target: sectionRef, offset: ["start end", "start start"] });
  const { scrollYProgress: pinRaw } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const enterSmooth = useSpring(enterRaw, spring);
  const pinSmooth = useSpring(pinRaw, spring);
  const one = useMotionValue(1);
  const enter: MotionValue<number> = reduce ? one : enterSmooth;
  const p: MotionValue<number> = reduce ? one : pinSmooth;

  /* Geometry — measured on mount/resize/font load only */
  const geo = useRef<Geo>({ W: 1440, H: 900, trackW: 4000 });
  const revision = useMotionValue(0);
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const word = wordRef.current;
    if (!stage || !word) return;
    const measure = (): void => {
      geo.current = { W: stage.clientWidth, H: stage.clientHeight, trackW: word.offsetWidth };
      revision.set(revision.get() + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    ro.observe(word);
    void document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [revision]);

  /* Circle: rises with the approach, floods the screen, then sets. Transform-only. */
  const circle = useTransform([enter, p, revision], ([e, v]: number[]) => {
    const { W, H } = geo.current;
    const min = Math.min(W, H);
    const D = Math.hypot(W, H) / DISC + 4; // element size whose disc covers the viewport at scale 1
    const seed = min * 0.06; // the point of light that appears at the centre
    const full = D * DISC;
    // Exponential growth reads as a constant-speed zoom from a point, not a slow start and a sudden burst.
    const grow = (k: number): number => seed * (full / seed) ** k;
    let d: number;
    if (v <= 0) {
      d = lerp(0, seed, outCubic(seg(e, [0.55, 1], (t) => t)));
    } else if (v < T.set[0]) {
      d = grow(seg(v, T.flood));
    } else {
      const k = seg(v, T.set);
      d = k < 1 ? grow(1 - k) * (1 - k * k) : 0; // collapses back into the centre
    }
    return { D, s: d / full, cy: 0 };
  });
  const circleSize = useTransform(circle, (c) => c.D);
  const circleScale = useTransform(circle, (c) => c.s);
  const circleY = useTransform(circle, (c) => c.cy - c.D / 2);
  const circleX = useTransform(circle, (c) => -c.D / 2);
  const circleOpacity = useTransform(p, [T.set[1] - 0.03, T.set[1]], [1, 0]);

  const surface = useTransform(p, [T.surface[0], T.surface[1], T.set[0], T.set[0] + 0.04], [0, 1, 1, 0]);

  /* Word track */
  const trackX = useTransform([p, revision], ([v]: number[]) => {
    const { W, trackW } = geo.current;
    const k = seg(v, T.track, (t) => t); // linear: reads like a camera pan
    return lerp(W * 0.7, -(trackW + W * 0.02), k);
  });
  const trackOpacity = useTransform(p, [T.reveal[0], T.reveal[1], T.set[0] - 0.01, T.set[0] + 0.025], [0, 1, 1, 0]);
  const eyebrowOpacity = useTransform(p, [T.eyebrowIn[0], T.eyebrowIn[1], T.eyebrowOut[0], T.eyebrowOut[1]], [0, 1, 1, 0]);

  /* CTA on the dark, after the light sets */
  const ctaOpacity = useTransform(p, [T.cta[0], T.cta[1]], [0, 1]);
  const ctaY = useTransform(p, [T.cta[0], T.cta[1]], [40, 0]);
  const horizon = useTransform(p, [T.set[0] + 0.04, T.set[1]], [0, 1]);

  const { stats, cta } = content;
  const trackSpan = T.track[1] - T.track[0];
  const topLane = stats.filter((s) => s.lane === "top");
  const bottomLane = stats.filter((s) => s.lane === "bottom");
  const chipFor = (stat: (typeof stats)[number]) => {
    const pc = T.track[0] + trackSpan * (stat.at / 100) * 0.92;
    return <ChipSlot key={stat.label} stat={stat} trackX={trackX} geo={geo} revision={revision} progress={p} countRange={[pc - 0.07, pc + 0.03]} />;
  };

  return (
    <section
      ref={sectionRef}
      data-atmo="cta"
      aria-labelledby="impact-cta-heading"
      className={cn("relative isolate", className)}
      style={{ height: reduce ? "auto" : `${length}vh` }}
    >
      {/* Accessible content (the animated version is decorative) */}
      <ul className="sr-only">
        {stats.map((s) => (
          <li key={s.label}>{`${s.label}: ${s.prefix ?? ""}${s.value}${s.suffix ?? ""} ${s.caption}`}</li>
        ))}
      </ul>

      <div ref={stageRef} className={cn("top-0 h-svh overflow-hidden", reduce ? "relative" : "sticky")}>
        {/* The light */}
        <motion.div
          aria-hidden
          style={{ width: circleSize, height: circleSize, x: circleX, y: circleY, scale: circleScale, opacity: circleOpacity }}
          className="pointer-events-none absolute left-1/2 top-1/2 rounded-full will-change-transform bg-[radial-gradient(closest-side,#f8f7ff_0%,#f3f1fd_44%,#ebe7fb_62%,#ddd6fd_70%,rgb(205_196_255/0.9)_71.6%,rgb(180_166_255/0.42)_73%,rgb(155_239_255/0.16)_80%,transparent_100%)]"
        />

        {/* Soft colour wash once the light fills the screen — lilac, ice and a touch of rose; no edges */}
        <motion.div
          aria-hidden
          style={{ opacity: surface }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_55%_at_12%_18%,rgb(196_184_255/0.55),transparent),radial-gradient(40%_50%_at_88%_82%,rgb(178_240_255/0.55),transparent),radial-gradient(30%_35%_at_78%_14%,rgb(255_214_232/0.35),transparent)]"
        />

        {/* Eyebrow */}
        <motion.p
          style={{ opacity: eyebrowOpacity }}
          className="absolute inset-x-0 top-[calc(var(--nav-offset,5.5rem)+2svh)] text-center font-signature-serif text-[0.8rem] uppercase tracking-[0.24em] text-[#4b5070]"
        >
          {content.eyebrow}
        </motion.p>

        {/*
          Safe area below the navbar and eyebrow, split into three rows that can never overlap:
          [ top card lane ] [ the word ] [ bottom card lane ]
        */}
        <motion.div
          style={{ opacity: trackOpacity }}
          className="absolute inset-x-0 bottom-[3svh] top-[calc(var(--nav-offset,5.5rem)+2svh+2.75rem)] flex flex-col justify-center gap-[clamp(0.75rem,3svh,2.25rem)] [--lane:clamp(6.5rem,17svh,9rem)]"
        >
          <div className="relative h-(--lane) shrink-0">{topLane.map(chipFor)}</div>

          <motion.div style={{ x: trackX }} className="w-max shrink-0 will-change-transform">
            {/* A div, not a heading, so global h1–h6 styles can never resize or wrap it */}
            <div
              ref={wordRef}
              aria-hidden
              className="m-0 whitespace-nowrap p-0 font-impact text-[clamp(4rem,min(19svh,15vw),13.5rem)] font-extralight leading-[1.02] tracking-[-0.02em] text-[#11142a] portrait:text-[min(15svh,30vw)]"
            >
              {content.word}
            </div>
          </motion.div>

          <div className="relative h-(--lane) shrink-0">{bottomLane.map(chipFor)}</div>
        </motion.div>

        {/* Horizon glow left behind when the light sets */}
        <motion.div
          aria-hidden
          style={{ opacity: horizon }}
          className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(110vw,1300px)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgb(123_97_255/0.22),rgb(123_97_255/0.08)_45%,rgb(34_216_255/0.04)_70%,transparent)]"
        />

        {/* CTA */}
        <motion.div
          style={{ opacity: ctaOpacity, y: ctaY }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 pt-[var(--nav-offset,5.5rem)] text-center"
        >
          <p className="font-signature-serif text-[0.8rem] uppercase tracking-[0.24em] text-ink-muted">{cta.eyebrow}</p>
          <h2
            id="impact-cta-heading"
            className="mt-5 max-w-[16ch] font-signature text-[clamp(2.4rem,6vw,5.5rem)] font-extrabold leading-[0.98] tracking-[-0.04em] text-ink"
          >
            {cta.headline}
          </h2>
          <p className="mt-6 max-w-[46ch] font-signature text-[clamp(1rem,1.3vw,1.2rem)] leading-relaxed text-ink-muted">{cta.body}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={cta.primary.href}
              className="group relative inline-flex items-center gap-2 rounded-full bg-[linear-gradient(100deg,#f8f7ff,#ddd6fd_60%,#c9f4ff)] px-7 py-3.5 font-signature text-[0.95rem] font-semibold text-[#0b0e1f] shadow-[0_10px_40px_-10px_rgb(180_166_255/0.7)] transition-transform duration-300 ease-out hover:scale-[1.03]"
            >
              {cta.primary.label}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </Link>
            {cta.secondary && (
              <Link
                href={cta.secondary.href}
                className="inline-flex items-center rounded-full px-7 py-3.5 font-signature text-[0.95rem] font-medium text-ink shadow-[inset_0_0_0_1px_rgb(255_255_255/0.16)] transition-colors duration-300 hover:bg-white/5"
              >
                {cta.secondary.label}
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── A proof chip riding its lane with its own parallax speed ─────────────── */
type ChipSlotProps = {
  stat: ImpactRevealContent["stats"][number];
  trackX: MotionValue<number>;
  geo: React.RefObject<Geo>;
  revision: MotionValue<number>;
  progress: MotionValue<number>;
  countRange: [number, number];
};

function ChipSlot({ stat, trackX, geo, revision, progress, countRange }: ChipSlotProps) {
  // Screen x = where this point of the word is, scaled by the chip's own speed for depth.
  const x = useTransform([trackX, revision], ([t]: number[]) => t * stat.speed + geo.current.trackW * (stat.at / 100));
  const y = useTransform(progress, [countRange[0] - 0.1, countRange[1] + 0.1], stat.lane === "top" ? [6, -6] : [-6, 6]);
  const opacity = useTransform(progress, [countRange[0] - 0.06, countRange[0]], [0, 1]);
  return (
    <motion.div
      style={{ x, y, opacity }}
      className={cn(
        "absolute left-0 will-change-transform [@media(max-height:720px)]:scale-[0.86]",
        stat.lane === "top" ? "bottom-0 origin-bottom-left" : "top-0 origin-top-left",
      )}
    >
      <ProofChip stat={stat} progress={progress} range={countRange} />
    </motion.div>
  );
}
