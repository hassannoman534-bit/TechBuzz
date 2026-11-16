"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { LiquidText } from "@/components/ui/liquid-text";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { ceoMessage, EASE, LIQUID } from "./ceo-message.config";
import { CeoPortrait } from "./ceo-portrait";
import { CeoSignoff } from "./ceo-signoff";
import { LogoIntro } from "./logo-intro";
import { PerspectiveMessage } from "./perspective-message";
import { useNarrowScreen } from "./use-narrow-screen";
import { useResolvedFont } from "./use-resolved-font";

const { heading } = ceoMessage;

/**
 * Message From CEO.
 *
 * 1. LogoIntro holds the screen, then unmounts through AnimatePresence.
 * 2. The hero is a split: the line of copy and the liquid word sit hard left in
 *    one column, the portrait travels in from the right in the other.
 * 3. PerspectiveMessage carries the message through the camera on scroll.
 * 4. CeoSignoff closes with the second liquid surface.
 *
 * Why two columns rather than one centre axis: the centred draft stacked the
 * word and the portrait on the same vertical line, so the only thing keeping
 * his face out of the letters was a height calculation, and it broke on any
 * window the calculation had not been tuned for. Separate columns cannot
 * collide at any width. Below lg they stack, copy first.
 *
 * The hero reserves the top of the viewport for the navbar, which is fixed at
 * top-0 and runs about 100px down.
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
  /** Below lg the two columns stack, and the portrait takes the leftover height. */
  const stacked = useNarrowScreen(1023);
  const [headlineSize, setHeadlineSize] = useState<number>(LIQUID.headlineMaxPx);

  // The word also shrinks to fit its column, so this is only the ceiling. It is
  // read off the window height so a short window never gets a word taller than
  // the space above the fold.
  useEffect(() => {
    const update = (): void => {
      const h = window.innerHeight * LIQUID.headlineVhRatio;
      setHeadlineSize(Math.round(Math.min(LIQUID.headlineMaxPx, Math.max(LIQUID.headlineMinPx, h))));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  // Gone well before it can reach the navbar pill. The earlier draft held the
  // copy at part opacity long enough for the line to sit across the pill.
  const copyOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: introDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
    transition: reduce ? { duration: 0.01 } : { duration: 0.85, ease: EASE, delay },
  });

  return (
    <>
      <AnimatePresence>
        {!introDone && <LogoIntro key="intro" onDone={handleIntroDone} />}
      </AnimatePresence>

      <section
        ref={heroRef}
        className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[#030712] pt-[clamp(5.5rem,11vh,7.5rem)]"
      >
        <div className="relative mx-auto flex w-full max-w-[102rem] min-h-0 flex-1 flex-col gap-[clamp(1rem,3vh,2.5rem)] px-[clamp(1.25rem,5vw,5rem)] pb-[clamp(1rem,3vh,2.5rem)] lg:flex-row lg:items-center lg:gap-[clamp(1.5rem,3vw,3.5rem)]">
          {/* Left column: the copy owns its own width, so nothing centres it. */}
          <motion.div
            className="relative z-10 w-full shrink-0 text-left lg:w-[54%]"
            style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}
          >
            <h1 className="sr-only">{heading.srHeading}</h1>

            {/*
              Centred over the word rather than ranged left with it. The column
              is the word's own box, so centring inside the column puts the line
              across the middle of "Belief" instead of above its first letter.
            */}
            <motion.p
              className="font-footer-text mx-auto max-w-[46ch] text-center text-[clamp(0.92rem,1.2vw,1.06rem)] leading-relaxed text-white/55"
              {...fade(0)}
            >
              {heading.sub}
            </motion.p>

            {/*
              Height is reserved here. LiquidText sizes itself from the rasterised
              word, which only exists after mount, so without a reservation the rest
              of the hero jumps down when it lands.

              The reservation tracks the column width, not the height ceiling.
              The ceiling is what the word is allowed to reach on a tall window;
              the word actually renders at whatever fits the column, which on a
              phone is a third of that, and reserving the ceiling there left a
              screen of dead space under the headline.
            */}
            <motion.div
              className="mt-[clamp(0.4rem,1.4vh,1rem)] w-full"
              style={{ minHeight: "clamp(4.5rem, 21vw, 15rem)" }}
              {...fade(0.12)}
            >
              {family ? (
                <LiquidText
                  text={heading.word}
                  ariaLabel={heading.srHeading}
                  tone="dark"
                  align="left"
                  fontFamily={family}
                  fontWeight={LIQUID.fontWeight}
                  fontSize={headlineSize}
                  color={LIQUID.ink}
                  highlight={LIQUID.highlight}
                  accentColor={LIQUID.accent}
                  viscosity={LIQUID.viscosity}
                  trailLength={LIQUID.trailLength}
                  frozen={narrow}
                />
              ) : (
                <span
                  className="font-footer-display block whitespace-nowrap text-[#eef0f7]"
                  style={{
                    // Shown only until the font resolves, which happens behind
                    // the opening overlay. Clamped by viewport width so it
                    // cannot run wider than its column in that moment.
                    fontSize: `clamp(2rem, 13vw, ${Math.round(headlineSize * 0.62)}px)`,
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
              className="mt-[clamp(0.25rem,1.2vh,0.9rem)] block h-px w-[clamp(4rem,12vw,9rem)] origin-left"
              style={{
                background: "linear-gradient(90deg, rgba(201,194,255,0.55), rgba(201,194,255,0))",
              }}
              initial={{ scaleX: 0 }}
              animate={introDone ? { scaleX: 1 } : { scaleX: 0 }}
              transition={reduce ? { duration: 0.01 } : { duration: 1.1, ease: EASE, delay: 0.4 }}
            />
          </motion.div>

          {/*
            Right column. On lg it is a sized box of its own; below lg it takes
            whatever height is left under the copy. Either way it is a sibling of
            the type, never an overlay on top of it.
          */}
          {/*
            Inline height, not a Tailwind arbitrary value: this one decides
            whether he fits above the fold, and arbitrary values have been
            dropped from this project's build before.

            Stacked, the height is left to flex-1. It must not be set to 100%
            on an inner wrapper: a flex item sized by flex-grow has a computed
            height of auto, so a percentage child resolves against nothing and
            collapses to zero. That is exactly what happened, and the portrait
            disappeared on phones while every desktop width looked right.
          */}
          <div
            className="relative w-full min-h-0 flex-1 lg:flex-none lg:w-[46%]"
            style={stacked ? undefined : { height: "min(82svh, 48rem)" }}
          >
            <CeoPortrait play={introDone} />
          </div>
        </div>
      </section>

      <PerspectiveMessage />
      <CeoSignoff />
    </>
  );
}
