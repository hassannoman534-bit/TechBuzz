"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { LiquidText } from "@/components/ui/liquid-text";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { BeliefLetter } from "./belief-letter";
import { ceoMessage, EASE, LIQUID } from "./ceo-message.config";
import { CeoFigure } from "./ceo-figure";
import { CeoSignoff } from "./ceo-signoff";
import { HeroEnvironment } from "./hero-environment";
import { HERO_WORD, PARALLAX } from "./hero-scene.config";
import { LogoIntro } from "./logo-intro";
import { PerspectiveMessage } from "./perspective-message";
import { useNarrowScreen } from "./use-narrow-screen";
import { useResolvedFont } from "./use-resolved-font";

const { heading } = ceoMessage;

/**
 * Message From CEO.
 *
 * 1. LogoIntro holds the screen, then unmounts through AnimatePresence.
 * 2. The hero is a three layer scene: a ridgeline environment at the back, the
 *    liquid word held left in the middle, the full body cutout in front on the
 *    right. Each layer gets its own scroll speed.
 * 3. PerspectiveMessage carries the message through the camera on scroll.
 * 4. BeliefLetter lands it as an object: the sheet it was written on.
 * 5. CeoSignoff closes with the second liquid surface.
 *
 * The hero used to be two columns side by side. That existed to stop the word
 * and the portrait colliding, because an early centred draft had put his face
 * in the middle of the letters. The scene makes that collision the point: the
 * word is centred and he stands in front of it, crossing its last letter, so
 * what used to be a layout fault is now the thing that says which of the two
 * is nearer. The rule that replaced the columns is the overlap being chosen
 * and bounded, not avoided.
 *
 * Depth comes from travel, not from a CSS perspective. Nearer layers move
 * further as the hero scrolls, and gain a little scale while the word recedes,
 * which reads as the camera pushing in. A perspective here would also put a
 * projective warp on the one thing on this page that must not have one: the
 * type further down already had to be rebuilt once because Chrome shears text
 * under exactly that transform.
 *
 * Everything is transform and opacity driven by motion values, so no React
 * state runs during a scroll, and the page's existing Lenis stays the only
 * smooth scroll instance on the site.
 *
 * The visible headline is a canvas, so the real <h1> is screen reader only. A
 * page whose only heading is an image is invisible to search.
 */
export function CeoMessage(): React.ReactElement {
  const reduce = useReducedMotionSafe();
  const heroRef = useRef<HTMLElement>(null);
  const [introDone, setIntroDone] = useState(false);
  const handleIntroDone = useCallback(() => setIntroDone(true), []);
  const family = useResolvedFont(LIQUID.fontVar);
  const narrow = useNarrowScreen(LIQUID.liveAbovePx);
  /** Below lg the scene recomposes: shorter figure, word moved into the top half. */
  const stacked = useNarrowScreen(1023);
  const [wordSize, setWordSize] = useState<number>(HERO_WORD.maxPx);

  // LiquidText shrinks the word again to fit its box, so this is the ceiling
  // only. It tracks window height so a short window never gets a word taller
  // than the room above the fold.
  useEffect(() => {
    const update = (): void => {
      const h = window.innerHeight * HERO_WORD.vhRatio;
      setWordSize(Math.round(Math.min(HERO_WORD.maxPx, Math.max(HERO_WORD.minPx, h))));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Mobile runs the same scene at about a third of the travel: the full
  // distances move the figure out of the composition before the hero is done.
  const k = stacked ? PARALLAX.mobileScale : 1;
  const pct = (v: number): string => `${v * k}%`;

  const envY = useTransform(scrollYProgress, [0, 1], ["0%", pct(PARALLAX.environment.y)]);
  const envScale = useTransform(scrollYProgress, [0, 1], [1, PARALLAX.environment.scale]);
  const wordY = useTransform(scrollYProgress, [0, 1], ["0%", pct(PARALLAX.word.y)]);
  const wordScale = useTransform(scrollYProgress, [0, 1], [1, PARALLAX.word.scale]);
  const figY = useTransform(scrollYProgress, [0, 1], ["0%", pct(PARALLAX.figure.y)]);
  const figScale = useTransform(scrollYProgress, [0, 1], [1, PARALLAX.figure.scale]);
  const kickerY = useTransform(scrollYProgress, [0, 1], ["0%", pct(PARALLAX.kicker.y)]);
  // Gone well before it can reach the navbar pill. An earlier draft held it at
  // part opacity long enough for the line to sit across the pill.
  const kickerOpacity = useTransform(scrollYProgress, [0, PARALLAX.kicker.fadeBy], [1, 0]);

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: introDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
    transition: reduce ? { duration: 0.01 } : { duration: 0.85, ease: EASE, delay },
  });

  /** Reduced motion gets the whole composition, just without the travel. */
  const layer = (y: unknown, scale: unknown) =>
    reduce ? undefined : { y, scale, willChange: "transform" };

  return (
    <>
      <AnimatePresence>
        {!introDone && <LogoIntro key="intro" onDone={handleIntroDone} />}
      </AnimatePresence>

      <section
        ref={heroRef}
        className="relative isolate min-h-[100svh] overflow-hidden bg-[#030712]"
      >
        {/* ── Layer 1, farthest ─────────────────────────────────────────── */}
        <motion.div
          className="absolute inset-0 z-0"
          style={layer(envY, envScale) as React.CSSProperties}
        >
          <HeroEnvironment />
        </motion.div>

        {/* ── Layer 2, the word, plus the kicker that leads into it ─────── */}
        <div
          /*
            Top anchored while stacked, centred once the scene is side by side.
            A Tailwind breakpoint rather than the stacked boolean: this one
            decides where the word lands on first paint, and the boolean is
            only correct after the first client measurement.
          */
          className="absolute inset-0 z-10 flex items-start px-[clamp(1.25rem,5vw,5rem)] pt-[clamp(5.5rem,11vh,7.5rem)] lg:items-center"
        >
          <div
            className="mx-auto w-full"
            style={{
              maxWidth: `${stacked ? HERO_WORD.boxWidthPctMobile : HERO_WORD.boxWidthPct}%`,
              transform: `translateY(${
                stacked ? HERO_WORD.offsetYPctMobile : HERO_WORD.offsetYPct
              }%)`,
            }}
          >
            <h1 className="sr-only">{heading.srHeading}</h1>

            <motion.p
              className="font-footer-text mx-auto max-w-[46ch] text-center text-[clamp(0.92rem,1.2vw,1.06rem)] leading-relaxed text-white/55"
              style={reduce ? undefined : { y: kickerY, opacity: kickerOpacity }}
              {...fade(0)}
            >
              {heading.sub}
            </motion.p>

            {/*
              Height is reserved. LiquidText sizes itself from the rasterised
              word, which only exists after mount, and this column is centred
              on the hero, so without a reservation the whole thing re centres
              the moment the canvas lands.

              The reservation tracks width, not the height ceiling. The ceiling
              is what the word may reach on a tall window; it actually renders
              at whatever fits the box, which on a phone is a fraction of that.
            */}
            <motion.div
              className="mt-[clamp(0.4rem,1.4vh,1rem)] w-full"
              style={{
                minHeight: "clamp(4.5rem, 21vw, 15rem)",
                ...(layer(wordY, wordScale) as React.CSSProperties),
              }}
              {...fade(0.12)}
            >
              {family ? (
                <LiquidText
                  text={heading.word}
                  ariaLabel={heading.srHeading}
                  tone="dark"
                  align="center"
                  fontFamily={family}
                  fontWeight={LIQUID.fontWeight}
                  fontSize={wordSize}
                  color={LIQUID.ink}
                  highlight={LIQUID.highlight}
                  accentColor={LIQUID.accent}
                  viscosity={LIQUID.viscosity}
                  trailLength={LIQUID.trailLength}
                  frozen={narrow}
                />
              ) : (
                <span
                  className="font-footer-display block whitespace-nowrap text-center text-[#eef0f7]"
                  style={{
                    // Shown only until the font resolves, which happens behind
                    // the opening overlay. Clamped by viewport width so it
                    // cannot run wider than its box in that moment.
                    fontSize: `clamp(2rem, 13vw, ${Math.round(wordSize * 0.62)}px)`,
                    fontWeight: 600,
                    letterSpacing: "-0.04em",
                    lineHeight: 1.6,
                  }}
                >
                  {heading.word}
                </span>
              )}
            </motion.div>

            <motion.span
              aria-hidden
              className="mx-auto mt-[clamp(0.25rem,1.2vh,0.9rem)] block h-px w-[clamp(4rem,12vw,9rem)] origin-center"
              style={{
                background: "linear-gradient(90deg, rgba(201,194,255,0.55), rgba(201,194,255,0))",
              }}
              initial={{ scaleX: 0 }}
              animate={introDone ? { scaleX: 1 } : { scaleX: 0 }}
              transition={reduce ? { duration: 0.01 } : { duration: 1.1, ease: EASE, delay: 0.4 }}
            />
          </div>
        </div>

        {/* ── Layer 3, nearest ──────────────────────────────────────────── */}
        {/*
          pointer-events-none matters. This wrapper is inset-0, so it covers the
          whole hero at z-20 and was eating every pointer event over the word
          underneath it, which killed the liquid hover. The figure inside turns
          events back on for its own box so its sweep still works.
        */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-20"
          style={layer(figY, figScale) as React.CSSProperties}
        >
          <CeoFigure play={introDone} stacked={stacked} />
        </motion.div>

        {/*
          The hand off. The hero ends on the page colour it started in, so the
          next section begins without a visible seam. It sits above every layer
          so the figure's feet and the ridgeline both sink into it.
        */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30"
          style={{
            height: "clamp(4rem, 14vh, 10rem)",
            background: "linear-gradient(to top, #030712 22%, rgba(3,7,18,0))",
          }}
        />
      </section>

      <PerspectiveMessage />
      <BeliefLetter />
      <CeoSignoff />
    </>
  );
}
