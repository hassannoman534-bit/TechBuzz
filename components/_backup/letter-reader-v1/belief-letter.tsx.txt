"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useFinePointer } from "@/lib/use-fine-pointer";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { beliefLetter, LETTER_LIVE_ABOVE_PX, PAPER } from "./belief-letter.config";
import { EASE } from "./ceo-message.config";
import { LetterSheet } from "./letter-sheet";
import { StaticLetter } from "./static-letter";
import { useNarrowScreen } from "./use-narrow-screen";
import { useResolvedFont } from "./use-resolved-font";

/**
 * The belief letter, between the message stage and the sign off.
 *
 * The page reads idea, argument, object, signature. This is the object: the
 * sheet the message was transcribed from, warm paper on a cold page, the only
 * thing here anyone can pick up.
 *
 * Three render paths, in order of preference:
 *   1. the live sheet, for a fine pointer on a wide screen,
 *   2. the static letter, for reduced motion, for widths under the live
 *      threshold, and for a browser with no WebGL,
 *   3. the static letter again, if a context is lost at runtime.
 * Path two is real HTML with real text, so it is the accessible one and the
 * only one search engines read. The live sheet is a picture, so it carries the
 * same copy in a visually hidden block beneath it.
 *
 * The canvas is not mounted until the section is near. This page has already
 * been trimmed from three simultaneous WebGL contexts to two for exactly this
 * reason, and a third claimed from first paint for a sheet a page and a half
 * down would undo that.
 */
export function BeliefLetter(): React.ReactElement {
  const reduce = useReducedMotionSafe();
  const fine = useFinePointer();
  const narrow = useNarrowScreen(LETTER_LIVE_ABOVE_PX);
  const sectionRef = useRef<HTMLElement>(null);
  const [lost, setLost] = useState(false);
  const handleLost = useCallback(() => setLost(true), []);

  // All four faces are already loaded site wide. ctx.font cannot parse a CSS
  // variable, so each one is read off a probe before the sheet is painted.
  const display = useResolvedFont("--font-syne");
  const serif = useResolvedFont("--font-newsreader");
  const hand = useResolvedFont("--font-caveat");
  const ui = useResolvedFont("--font-inter-tight");
  const fontsReady = Boolean(display && serif && hand && ui);

  // Mounts a little before the section arrives and stays mounted after, so a
  // reader scrubbing the scrollbar across it does not thrash a GL context.
  const near = useInView(sectionRef, { margin: "40% 0px 40% 0px" });
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (near) setArmed(true);
  }, [near]);

  const inView = useInView(sectionRef, { once: true, margin: "-12% 0px" });
  /** Not once: this one has to go false again so the render loop can stop. */
  const onScreen = useInView(sectionRef, { margin: "0px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const live = !reduce && !narrow && !lost;

  // Drag state in a ref: the frame loop reads it, so turning the sheet never
  // re renders this section.
  const pointer = useRef({ x: 0, y: 0, active: false, hover: false });
  const start = useRef({ x: 0, y: 0 });
  const boxRef = useRef<HTMLDivElement>(null);

  const onDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // No rect read here on purpose. Measuring on press would force a layout at
    // the exact moment the frame loop is about to start writing transforms.
    if (!boxRef.current) return;
    start.current = { x: e.clientX, y: e.clientY };
    pointer.current.active = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointer.current.active) return;
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return;
    // Normalised against half the box, so a drag from the middle to an edge is
    // a full turn and the feel does not change with the sheet's size.
    pointer.current.x = ((e.clientX - start.current.x) / (box.width * 0.5)) * -1;
    pointer.current.y = (e.clientY - start.current.y) / (box.height * 0.5);
  }, []);

  const onUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    pointer.current.active = false;
    pointer.current.x = 0;
    pointer.current.y = 0;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: reduce ? { duration: 0.01 } : { duration: 0.8, ease: EASE, delay },
  });

  // The glow behind the sheet. It grounds the paper on the void so the sheet
  // does not look pasted onto the page.
  const glow = useTransform(scrollYProgress, [0, 0.5, 1], [0.25, 0.7, 0.25]);

  return (
    <section
      ref={sectionRef}
      className="relative z-0 w-full overflow-hidden bg-[#030712] px-[clamp(1.25rem,5vw,5.5rem)] pb-[clamp(2rem,5vh,4rem)] pt-[clamp(1.5rem,4.5vh,3.5rem)]"
      aria-labelledby="belief-letter-heading"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center text-center">
        <motion.span
          className="font-footer-text block text-[0.68rem] uppercase tracking-[0.3em] text-white/40"
          {...rise(0)}
        >
          {beliefLetter.eyebrow}
        </motion.span>

        <motion.h2
          id="belief-letter-heading"
          className="font-footer-display mt-3 text-[clamp(1.35rem,2.6vw,2.1rem)] font-medium tracking-[-0.02em] text-[#eef0f7]"
          {...rise(0.08)}
        >
          {beliefLetter.heading}
        </motion.h2>

        {/*
          Inline sizing, not Tailwind arbitrary values. This box decides whether
          the sheet fits above the fold on a short window, and arbitrary values
          have been dropped from this project's build before.

          Height first, width from the aspect: the sheet is portrait, so height
          is the scarce dimension and letting width lead made it overflow a
          laptop window. The ratio is a little wider than the paper so turning
          it never clips a corner.
        */}
        <motion.div
          className="relative mt-[clamp(1rem,3vh,2rem)]"
          style={{
            // Measured, not guessed. At 62svh the whole section came to 871px
            // and ran past the bottom of a 835px laptop window, so the sheet
            // was cut in half exactly where someone would reach to drag it.
            // 56svh brings the section to about 700 and leaves it room.
            height: "min(56svh, 32rem)",
            aspectRatio: "1 / 1.42",
            maxWidth: "86vw",
          }}
          {...rise(0.16)}
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              opacity: reduce ? 0.4 : glow,
              background:
                "radial-gradient(60% 50% at 50% 52%, rgba(201,163,74,0.2), rgba(123,97,255,0.08) 45%, rgba(3,7,18,0) 72%)",
              filter: "blur(18px)",
              transform: "scale(1.35)",
            }}
          />

          <div
            ref={boxRef}
            className="h-full w-full"
            style={{ cursor: live && fine ? "grab" : "default" }}
            onPointerDown={live ? onDown : undefined}
            onPointerMove={live ? onMove : undefined}
            onPointerUp={live ? onUp : undefined}
            onPointerCancel={live ? onUp : undefined}
            onPointerEnter={live && fine ? () => (pointer.current.hover = true) : undefined}
            onPointerLeave={
              live && fine
                ? () => {
                    pointer.current.hover = false;
                  }
                : undefined
            }
          >
            {live && fontsReady && armed ? (
              <div role="img" aria-label={beliefLetter.ariaLabel} className="h-full w-full">
                <LetterSheet
                  fonts={{ display: display!, serif: serif!, hand: hand!, ui: ui! }}
                  progress={scrollYProgress}
                  pointer={pointer}
                  onScreen={onScreen}
                  onLost={handleLost}
                />
              </div>
            ) : (
              <StaticLetter />
            )}
          </div>
        </motion.div>

        {/*
          Only on the live path. The static letter cannot be turned, and the
          first draft fell back to the place name here, which is already
          printed on the sheet itself two lines above.
        */}
        {live && (
          <motion.span
            className="font-footer-text mt-[clamp(1rem,2.5vh,1.6rem)] block text-[0.66rem] uppercase tracking-[0.26em] text-white/35"
            {...rise(0.3)}
          >
            {fine ? beliefLetter.cue : beliefLetter.cueTouch}
          </motion.span>
        )}

        {/*
          The live sheet is a texture, so its words do not exist as far as a
          screen reader or a crawler is concerned. This carries them. It is only
          rendered on the live path, because the static letter is already real
          text and a second copy would be read out twice.
        */}
        {live && fontsReady && armed && (
          <div className="sr-only">
            <p>{beliefLetter.label}</p>
            {beliefLetter.body.filter(Boolean).map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
            <p>
              {beliefLetter.signature}, {beliefLetter.place}
            </p>
          </div>
        )}
      </div>

      {/* Hairline close, matching the rest of the page's section joins. */}
      <span
        aria-hidden
        className="mx-auto mt-[clamp(1.25rem,3.5vh,2.5rem)] block h-px w-full max-w-md"
        style={{
          background: `linear-gradient(90deg, rgba(3,7,18,0), ${PAPER.goldSoft}55, rgba(3,7,18,0))`,
        }}
      />
    </section>
  );
}
