"use client";

import { useRef } from "react";
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
import { MaskLine } from "./mask-line";
import { ScrollWords } from "./scroll-words";
import { WrittenWords } from "./written-words";
import { BrandIntro } from "./brand-intro";
import { useFitText } from "./use-fit-text";
import { TrailText } from "./trail-text";
import { useSlotGeometry, type SlotGeometry } from "./use-slot-geometry";
import {
  signatureRevealContent,
  type SignatureImage,
  type SignatureRevealContent,
} from "./signature-reveal.config";

/* ── Scroll timeline (0 → 1 across the pinned section) ───────────────────── */
const T = {
  grow: [0, 0.22],
  brandSweep: [0.02, 0.11],
  brandOut: [0.1, 0.15],
  quote: [0.14, 0.26],
  quoteOut: [0.3, 0.33],
  word: [0.32, 0.5],
  shrink: [0.32, 0.52],
  crossfade: [0.34, 0.44],
  morph: [0.52, 0.58],
  tint: [0.58, 0.66],
  lockup: [0.62, 0.72],
  subtitle: [0.66, 0.78],
  sweep: [0.76, 0.88],
  settled: 0.8,
  exit: [0.88, 1],
} as const;

/** Visual corner radius of the frame before it starts morphing (px on screen). */
const CARD_RADIUS = 28;

/* ── Easing + piecewise interpolation (pure, allocation-free) ─────────────── */
type Ease = (t: number) => number;
const outCubic: Ease = (t) => 1 - (1 - t) ** 3;
const inOutCubic: Ease = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const linear: Ease = (t) => t;

function piecewise(p: number, stops: readonly number[], values: readonly number[], eases: readonly Ease[]): number {
  if (p <= stops[0]) return values[0];
  for (let i = 1; i < stops.length; i++) {
    if (p <= stops[i]) {
      const t = (p - stops[i - 1]) / (stops[i] - stops[i - 1] || 1);
      const e = eases[i - 1] ?? linear;
      return values[i - 1] + (values[i] - values[i - 1]) * e(t);
    }
  }
  return values[values.length - 1];
}

type FrameState = {
  bigW: number;
  bigH: number;
  x: number;
  y: number;
  sx: number;
  sy: number;
  innerX: number;
  innerY: number;
  radius: string;
};

/**
 * The frame is laid out ONCE at its full size and only ever transformed (translate + scale),
 * so scrolling never triggers layout or repaints the image. The inner layer counter-scales so
 * the image keeps its proportions (object-fit: cover behaviour) while the outer shape changes.
 */
function frameAt(p: number, g: SlotGeometry): FrameState {
  const ratio = g.H > g.W ? 9 / 16 : 16 / 9;
  const fit = (maxW: number, maxH: number): [number, number] => {
    const w = Math.min(maxW, maxH * ratio);
    return [w, w / ratio];
  };
  const [bigW, bigH] = fit(g.W * 0.9, g.H * 0.74);
  const [startW, startH] = fit(g.W * 0.46, g.H * 0.42);

  const stops = [0, T.grow[1], T.shrink[0], T.shrink[1]];
  const ease = [outCubic, linear, inOutCubic];
  // Visual size and centre — lands exactly on the measured outline of the letter.
  const w = piecewise(p, stops, [startW, bigW, bigW, g.iw], ease);
  const h = piecewise(p, stops, [startH, bigH, bigH, g.ih], ease);
  const cx = piecewise(p, stops, [0, 0, 0, g.ix], ease);
  const cy = piecewise(p, stops, [g.H * 0.16, g.H * 0.03, g.H * 0.03, g.iy], ease);

  const sx = w / bigW;
  const sy = h / bigH;
  const cover = Math.max(sx, sy);
  const zoom = piecewise(p, [0, T.grow[1]], [1.18, 1], [outCubic]);

  // Corner radius: a constant on-screen 28px card, morphing into a full ellipse (= the letter's bowl).
  const t = piecewise(p, [T.shrink[0] + 0.04, T.shrink[1]], [0, 1], [inOutCubic]);
  const rx = Math.min(bigW / 2, CARD_RADIUS / sx + (bigW / 2 - CARD_RADIUS / sx) * t);
  const ry = Math.min(bigH / 2, CARD_RADIUS / sy + (bigH / 2 - CARD_RADIUS / sy) * t);

  return {
    bigW,
    bigH,
    x: cx - bigW / 2,
    y: cy - bigH / 2,
    sx,
    sy,
    innerX: (cover * zoom) / sx,
    innerY: (cover * zoom) / sy,
    radius: `${rx}px / ${ry}px`,
  };
}

/* ── Component ────────────────────────────────────────────────────────────── */
type SignatureRevealProps = {
  content?: SignatureRevealContent;
  /** Section height in vh. Scroll distance = length − 100. */
  length?: number;
  className?: string;
};

export function SignatureReveal({ content = signatureRevealContent, length = 600, className }: SignatureRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLSpanElement>(null);
  const wordRef = useRef<HTMLHeadingElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  // Smooths stepped mouse-wheel input so every scroll tick glides instead of jumping.
  const smooth = useSpring(scrollYProgress, { stiffness: 170, damping: 34, mass: 0.35, restDelta: 0.0002 });
  // Separate progress for the approach (section scrolling into view) — drives the logo reveal.
  const { scrollYProgress: enterProgress } = useScroll({ target: sectionRef, offset: ["start 0.85", "start start"] });
  const enterSmooth = useSpring(enterProgress, { stiffness: 170, damping: 34, mass: 0.35, restDelta: 0.0002 });
  const staticProgress = useMotionValue<number>(T.settled);
  const staticEnter = useMotionValue<number>(1);
  const enter: MotionValue<number> = reduce ? staticEnter : enterSmooth;
  const p: MotionValue<number> = reduce ? staticProgress : smooth;

  useFitText(wordRef, { fill: 0.92, maxPx: 300 });
  const { geo, revision } = useSlotGeometry(stageRef, letterRef);

  /* Frame — one combined transform keeps every value in sync per frame */
  const frame = useTransform([p, revision], ([v]: number[]) => frameAt(v, geo.current));
  const frameW = useTransform(frame, (f) => f.bigW);
  const frameH = useTransform(frame, (f) => f.bigH);
  const x = useTransform(frame, (f) => f.x);
  const y = useTransform(frame, (f) => f.y);
  const scaleX = useTransform(frame, (f) => f.sx);
  const scaleY = useTransform(frame, (f) => f.sy);
  const innerX = useTransform(frame, (f) => f.innerX);
  const innerY = useTransform(frame, (f) => f.innerY);
  const radius = useTransform(frame, (f) => f.radius);

  const detailOpacity = useTransform(p, [T.crossfade[0], T.crossfade[1]], [0, 1]);
  const hairline = useTransform(p, [T.shrink[0], T.shrink[0] + 0.06], [1, 0]);
  const quoteOpacity = useTransform(p, [T.quoteOut[0], T.quoteOut[1]], [1, 0]);
  const scrimOpacity = useTransform(p, [T.quote[0], T.quote[0] + 0.04, T.quoteOut[0], T.quoteOut[1]], [0, 1, 1, 0]);
  const frameOpacity = useTransform(p, [T.morph[0], T.morph[1]], [1, 0]);

  /* Letter: image-filled glyph takes over from the frame, then tints to the brand gradient */
  const imageLetterOpacity = useTransform(p, [T.morph[0], T.morph[1]], [0, 1]);
  const tintOpacity = useTransform(p, [T.tint[0], T.tint[1]], [0, 1]);

  /* Word */
  const travel = useTransform([p, revision], ([v]: number[]) =>
    piecewise(v, [T.word[0], T.word[1]], [geo.current.W * 0.75, 0], [inOutCubic]),
  );
  const leftX = useTransform(travel, (t) => -t);
  const rightX = travel;
  const parenTravel = useTransform([p, revision], ([v]: number[]) =>
    piecewise(v, [T.word[0], T.word[1] - 0.02], [geo.current.W * 0.5, 0], [inOutCubic]),
  );
  const parenLeftX = useTransform(parenTravel, (t) => -t);
  const wordOpacity = useTransform(p, [T.word[0], T.word[0] + 0.05], [0, 1]);
  const trail = useTransform(p, [T.word[0], T.word[1] - 0.03, T.word[1]], [1, 1, 0]);

  /* Intro + exit */
  const introOpacity = useTransform(p, [0, 0.14], [1, 0]);
  const introY = useTransform(p, [0, 0.18], ["0vh", "-10vh"]);
  const contentOpacity = useTransform(p, [T.exit[0], T.exit[1]], [1, 0]);
  const contentY = useTransform(p, [T.exit[0], T.exit[1]], ["0vh", "-8vh"]);
  const glowOpacity = useTransform(p, [T.exit[0] - 0.04, T.exit[0] + 0.06, 1], [0, 1, 0.7]);
  const glowScale = useTransform(p, [T.exit[0] - 0.04, 1], [0.6, 1.15]);

  const { word, image, detailImage } = content;

  return (
    <section
      ref={sectionRef}
      data-atmo="intro"
      aria-label={`${word.before}${word.letter}${word.after}`}
      className={cn("relative isolate", className)}
      style={{ height: reduce ? "100svh" : `${length}vh` }}
    >
      <div ref={stageRef} className="sticky top-0 h-svh overflow-hidden">
        {content.quote && <p className="sr-only">{content.quote}</p>}

        {/* Intro line */}
        <motion.p
          style={{ opacity: introOpacity, y: introY }}
          className="absolute inset-x-0 top-[13svh] z-20 mx-auto max-w-[34ch] px-6 text-center font-signature text-[clamp(0.95rem,1.25vw,1.15rem)] font-medium leading-snug tracking-[-0.01em] text-ink"
        >
          {content.intro}
        </motion.p>

        {/* Word + lockup */}
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="absolute inset-0 flex flex-col items-center justify-center px-[4vw] pt-[var(--nav-offset,5.5rem)]"
        >
          <div className="mb-[clamp(1.25rem,4svh,3rem)] flex flex-col items-center text-center text-ink">
            <MaskLine progress={p} range={[T.lockup[0], T.lockup[0] + 0.06]} className="mb-[0.9rem] font-signature text-[0.6875rem] font-medium uppercase leading-none tracking-[0.22em] text-ink-muted">
              {content.eyebrow}
            </MaskLine>
            <MaskLine progress={p} range={[T.lockup[0] + 0.015, T.lockup[1] - 0.02]} className="font-signature-serif text-[clamp(1.375rem,2.1vw,2rem)] font-normal leading-[1.1] tracking-[-0.015em]">
              {content.serifLines[0]}
            </MaskLine>
            <MaskLine progress={p} range={[T.lockup[0] + 0.03, T.lockup[1]]} className="font-signature-serif text-[clamp(1.375rem,2.1vw,2rem)] font-normal leading-[1.1] tracking-[-0.015em]">
              {content.serifLines[1]}
            </MaskLine>
          </div>

          <h2
            ref={wordRef}
            aria-hidden
            className="flex w-max items-baseline whitespace-nowrap font-signature text-[13vw] font-extrabold leading-[0.8] tracking-[-0.05em] text-ink"
          >
            <TrailText x={leftX} trail={trail} opacity={wordOpacity}>{word.before}</TrailText>
            <motion.span style={{ x: parenLeftX, opacity: wordOpacity }} className="inline-block font-normal will-change-transform">(</motion.span>
            <span className="relative inline-block">
              {/* Glyph filled with the orb — appears exactly where the frame lands */}
              <motion.span
                ref={letterRef}
                style={{ opacity: imageLetterOpacity, backgroundImage: `url(${detailImage.src})` }}
                className="inline-block bg-cover bg-center bg-clip-text text-transparent"
              >
                {word.letter}
              </motion.span>
              {/* Same glyph in the brand gradient, fading over it */}
              <motion.span style={{ opacity: tintOpacity }} className="absolute inset-0 inline-block text-spectrum">
                {word.letter}
              </motion.span>
            </span>
            <motion.span style={{ x: parenTravel, opacity: wordOpacity }} className="inline-block font-normal will-change-transform">)</motion.span>
            <TrailText x={rightX} trail={trail} opacity={wordOpacity}>{word.after}</TrailText>
          </h2>

          <ScrollWords
            text={content.subtitle}
            progress={p}
            range={[T.subtitle[0], T.subtitle[1]]}
            sweep={[T.sweep[0], T.sweep[1]]}
            className="mt-[clamp(2rem,6.5svh,4.5rem)] max-w-[30ch] font-signature text-[clamp(1.05rem,1.5vw,1.375rem)] font-medium leading-snug tracking-[-0.01em]"
          />
        </motion.div>

        {/* Frame: card → full-bleed → ellipse on the letter. Transform-only. */}
        <motion.div
          aria-hidden
          style={{ width: frameW, height: frameH, x, y, scaleX, scaleY, borderRadius: radius, opacity: frameOpacity }}
          className="absolute left-1/2 top-1/2 z-10 overflow-hidden bg-void [contain:layout_paint]"
        >
          <motion.div style={{ scaleX: innerX, scaleY: innerY }} className="absolute inset-0 will-change-transform">
            <FrameImage image={image} />
            <motion.div style={{ opacity: detailOpacity }} className="absolute inset-0">
              <FrameImage image={detailImage} />
            </motion.div>
          </motion.div>

          {/* Hairline edge for the card phase (fades before the shape morphs) */}
          <motion.div
            style={{ opacity: hairline }}
            className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]"
          />

          <BrandIntro
            logo={content.logo}
            enter={enter}
            progress={p}
            sweep={[T.brandSweep[0], T.brandSweep[1]]}
            out={[T.brandOut[0], T.brandOut[1]]}
          />

          {content.quote && (
            <>
              <motion.div
                style={{ opacity: scrimOpacity }}
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_50%,rgb(3_7_18/0.45),transparent)]"
              />
              <motion.div style={{ opacity: quoteOpacity }} className="absolute inset-0 grid place-items-center px-[6%]">
                <WrittenWords
                  text={content.quote}
                  progress={p}
                  range={[T.quote[0], T.quote[1]]}
                  className="max-w-[18ch] -rotate-2 font-signature-hand text-[clamp(2.25rem,5vw,4.75rem)] font-medium leading-[1.02] text-ink [text-shadow:0_2px_24px_rgb(3_7_18/0.6)]"
                />
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Exit bloom — hands off to the next section */}
        <motion.div
          aria-hidden
          style={{ opacity: glowOpacity, scale: glowScale }}
          className="pointer-events-none absolute inset-x-[-20%] bottom-[-45%] h-[90%] bg-[radial-gradient(closest-side,rgb(123_97_255/0.32),rgb(34_216_255/0.08)_55%,transparent)]"
        />
      </div>
    </section>
  );
}

/* ── Image (pre-optimised static WebP; art-directed by orientation) ───────── */
function FrameImage({ image }: { image: SignatureImage }) {
  return (
    <picture>
      {image.srcMobile && <source media="(orientation: portrait)" srcSet={image.srcMobile} />}
      {/* eslint-disable-next-line @next/next/no-img-element -- pre-optimised static asset, art-directed via <picture> */}
      <img
        src={image.src}
        alt={image.alt}
        decoding="async"
        draggable={false}
        className="absolute inset-0 h-full w-full select-none object-cover"
      />
    </picture>
  );
}
