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
 * 2. The hero: everything sits on one centre axis. The headline is a liquid
 *    surface you can drag ink out of, the portrait rises underneath it.
 * 3. PerspectiveMessage carries the message through the camera on scroll.
 * 4. CeoSignoff closes with the second liquid surface.
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
  const [headlineSize, setHeadlineSize] = useState<number>(LIQUID.headlineMaxPx);

  // The headline is sized off the window height, not just the container width.
  // Width alone lets a wide, short window render a word tall enough to swallow
  // the portrait underneath it.
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
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-26%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.62], [1, 0]);

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: introDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    transition: reduce ? { duration: 0.01 } : { duration: 0.85, ease: EASE, delay },
  });

  return (
    <>
      <AnimatePresence>
        {!introDone && <LogoIntro key="intro" onDone={handleIntroDone} />}
      </AnimatePresence>

      <section
        ref={heroRef}
        className="relative isolate flex min-h-[100svh] flex-col items-center overflow-hidden bg-[#030712] pt-[clamp(5.5rem,11vh,7.5rem)]"
      >
        <motion.div
          className="relative z-10 mx-auto flex w-full max-w-[58rem] flex-col items-center px-[clamp(1.25rem,5vw,4rem)] pt-[clamp(1.5rem,5vh,3.5rem)] text-center"
          style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}
        >
          <h1 className="sr-only">{heading.srHeading}</h1>

          <motion.span className="flex items-center justify-center gap-4" {...fade(0)}>
            <span
              aria-hidden
              className="block h-px w-[clamp(1.25rem,3.5vw,2.75rem)] shrink-0"
              style={{
                background: "linear-gradient(90deg, rgba(201,194,255,0.05), rgba(201,194,255,0.5))",
              }}
            />
            <span className="font-footer-text text-[0.66rem] uppercase tracking-[0.32em] whitespace-nowrap text-white/45">
              {heading.eyebrow}
            </span>
            <span
              aria-hidden
              className="block h-px w-[clamp(1.25rem,3.5vw,2.75rem)] shrink-0"
              style={{
                background: "linear-gradient(90deg, rgba(201,194,255,0.5), rgba(201,194,255,0.05))",
              }}
            />
          </motion.span>

          <motion.p
            className="font-footer-text mt-[clamp(0.6rem,1.8vh,1rem)] max-w-sm text-[clamp(0.9rem,1.25vw,1.02rem)] leading-relaxed text-white/50"
            {...fade(0.2)}
          >
            {heading.sub}
          </motion.p>

          {/*
            Height is reserved here. LiquidText sizes itself from the rasterised
            word, which only exists after mount, so without a reservation the rest
            of the hero jumps down when it lands.
          */}
          <motion.div
            className="mt-[clamp(0.75rem,2.5vh,1.5rem)] w-full"
            style={{ minHeight: headlineSize * 1.6 }}
            {...fade(0.14)}
          >
            {family ? (
              <LiquidText
                text={heading.word}
                ariaLabel={heading.srHeading}
                tone="dark"
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
                  fontSize: headlineSize * 0.74,
                  fontWeight: 600,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.6,
                }}
              >
                {heading.word}
              </span>
            )}
          </motion.div>
        </motion.div>

        {/*
          The portrait takes whatever height is left under the type. Giving it a
          fixed start percentage instead is what put his face inside the letters
          on a short window.
        */}
        <div className="relative w-full min-h-0 flex-1">
          <CeoPortrait play={introDone} />
        </div>

      </section>

      <PerspectiveMessage />
      <CeoSignoff />
    </>
  );
}
