"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useMotionValue, useScroll, useTransform } from "framer-motion";
import { useLenis } from "lenis/react";
import { cn } from "@/lib/utils";
import { useFinePointer } from "@/lib/use-fine-pointer";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { beliefLetter, LETTER_LIVE_ABOVE_PX, PAPER } from "./belief-letter.config";
import { EASE } from "./ceo-message.config";
import { READER } from "./letter-reader.config";
import { LetterSheet, type RestFrame } from "./letter-sheet";
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
 *
 * ── The reader ──────────────────────────────────────────────────────────────
 *
 * Clicking the sheet opens it: the sheet comes forward until it owns the stage,
 * flattens square to the eye, and parks on its first line, and from there the
 * page's own scroll walks down it. See letter-reader.config.ts for why the read
 * is driven by a scroll runway rather than by capturing the wheel, and why that
 * runway is mounted on open rather than left in the markup.
 *
 * The stage is pinned with `position: sticky`, the same way the message stage
 * above it is. Two things about that are load bearing. The section itself must
 * not have `overflow: hidden` or the pin dies, which is why that class sits on
 * the stage inside it. And the runway may only be taken away while the whole
 * section is below the fold, because removing 150svh anywhere else moves the
 * page under the reader's hands.
 */

/*
  The faces this sheet paints, as the shorthand `useResolvedFont` waits on.
  Module scope so the arrays are stable across renders.

  Newsreader is declared as one upright variable file, so its italic is a
  synthesised oblique and asking for `italic 400` would wait out the timeout on
  every load for a face that is never going to arrive.
*/
const DISPLAY_FACE = ["600 1rem"] as const;
const SERIF_FACE = ["400 1rem"] as const;
const HAND_FACE = ["600 1rem"] as const;
const UI_FACE = ["400 1rem"] as const;

export function BeliefLetter(): React.ReactElement {
  const reduce = useReducedMotionSafe();
  const fine = useFinePointer();
  const narrow = useNarrowScreen(LETTER_LIVE_ABOVE_PX);
  const lenis = useLenis();

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLButtonElement>(null);

  const [lost, setLost] = useState(false);
  const handleLost = useCallback(() => setLost(true), []);

  // All four faces are already loaded site wide. ctx.font cannot parse a CSS
  // variable, so each one is read off a probe before the sheet is painted.
  const display = useResolvedFont("--font-syne", DISPLAY_FACE);
  const serif = useResolvedFont("--font-newsreader", SERIF_FACE);
  const hand = useResolvedFont("--font-caveat", HAND_FACE);
  const ui = useResolvedFont("--font-inter-tight", UI_FACE);
  const fontsReady = Boolean(display && serif && hand && ui);

  // Mounts a little before the section arrives and stays mounted after, so a
  // reader scrubbing the scrollbar across it does not thrash a GL context.
  const near = useInView(sectionRef, { margin: "40% 0px 40% 0px" });
  const [armedGl, setArmedGl] = useState(false);
  useEffect(() => {
    if (near) setArmedGl(true);
  }, [near]);

  const inView = useInView(sectionRef, { once: true, margin: "-12% 0px" });
  /** Not once: this one has to go false again so the render loop can stop. */
  const onScreen = useInView(sectionRef, { margin: "0px" });

  /** The old measure: the sheet's rise and turn as the section crosses. */
  const { scrollYProgress: ambient } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  /** The runway: 0 the moment the stage pins, 1 the moment it lets go. */
  const { scrollYProgress: read } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const live = !reduce && !narrow && !lost;
  const sheetLive = live && fontsReady && armedGl;
  const pinned = live && READER.enabled;
  const canRead = sheetLive && READER.enabled;

  const [reading, setReading] = useState(false);
  const [runway, setRunway] = useState(false);
  const focus = useMotionValue(0);

  /*
    Motion values are only put into `style` after mount.

    The server cannot resolve a motion value, so an element whose opacity comes
    from one renders a plain number on the server and a live value on the first
    client render, and React reports the pair as a hydration mismatch and gives
    up on patching that subtree. Before mount every style below is the same
    plain number the server wrote; after mount the values take over. The reader
    cannot be open before mount, so none of these is ever anything but its
    resting value at the moment of the swap.
  */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // The pointer handlers are created once and read state through a ref, so
  // turning the sheet never rebuilds them.
  const readingRef = useRef(false);
  useEffect(() => {
    readingRef.current = reading;
  }, [reading]);

  /*
    Where the sheet sits at rest, in CSS px relative to the stage.

    The sheet is drawn in a canvas that covers the whole stage, so something has
    to tell it which rectangle to occupy. That something is an empty slot left
    in the stage's own layout, which keeps the measured section heights this
    page was tuned around: the slot is still `min(56svh, 32rem)` tall, the
    heading still sits above it, and the sheet still lands exactly on it.

    Measured on resize only. A rect read inside the frame loop would force a
    layout every frame, at the exact moment the loop is about to write
    transforms.
  */
  const restFrame = useRef<RestFrame | null>(null);
  useEffect(() => {
    const slot = slotRef.current;
    const stage = stageRef.current;
    if (!slot || !stage) return;

    const measure = (): void => {
      const s = slot.getBoundingClientRect();
      const g = stage.getBoundingClientRect();
      restFrame.current = {
        h: s.height,
        cx: s.left - g.left + s.width * 0.5,
        cy: s.top - g.top + s.height * 0.5,
      };
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(slot);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [sheetLive]);

  const scrollToSection = useCallback(
    (duration: number): void => {
      const el = sectionRef.current;
      if (!el) return;
      if (lenis) {
        // The runway has just been added or taken away, so Lenis is told the
        // document changed height before it is asked to scroll inside it.
        lenis.resize();
        lenis.scrollTo(el, { duration });
        return;
      }
      window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top, behavior: "smooth" });
    },
    [lenis],
  );

  const openReader = useCallback((): void => {
    if (!canRead) return;
    setRunway(true);
    setReading(true);
  }, [canRead]);

  const closeReader = useCallback((): void => {
    setReading(false);
  }, []);

  /** One spring, retargeted. Interrupting a zoom reverses it from where it is. */
  useEffect(() => {
    const controls = animate(focus, reading ? 1 : 0, {
      type: "spring",
      ...(reading ? READER.enter : READER.exit),
    });
    return () => controls.stop();
  }, [focus, reading]);

  /** Opening pins the stage, so the whole runway is available for the read. */
  useEffect(() => {
    if (!reading) return;
    scrollToSection(READER.pinScrollS);
  }, [reading, scrollToSection]);

  /** Closing by hand puts the sheet back in the middle of the screen. */
  const closeAndRecentre = useCallback((): void => {
    closeReader();
    scrollToSection(READER.closeScrollS);
  }, [closeReader, scrollToSection]);

  useEffect(() => {
    if (!reading) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") closeAndRecentre();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeAndRecentre, reading]);

  /*
    The end of the read. The sheet is already back in its resting frame by here,
    because focus tapers off over the last stretch of the runway; this just puts
    the component's own state back in step so the cue reverts and the sheet can
    be opened again.
  */
  useEffect(() => {
    if (!reading) return;
    return read.on("change", (v) => {
      if (v >= READER.returnDone) setReading(false);
    });
  }, [read, reading]);

  /*
    Taking the runway away again, in the one place it is safe: with the entire
    section below the fold, where nothing above the viewport can move. Ambient
    progress hits zero exactly there, so this needs no rect of its own.
  */
  useEffect(() => {
    if (!runway || reading) return;
    return ambient.on("change", (v) => {
      if (v > 0.002) return;
      setRunway(false);
      lenis?.resize();
    });
  }, [ambient, lenis, reading, runway]);

  // Drag state in a ref: the frame loop reads it, so turning the sheet never
  // re renders this section.
  const pointer = useRef({ x: 0, y: 0, active: false, hover: false });
  const press = useRef({ x: 0, y: 0, moved: 0, down: false });

  const onDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    // No rect read here on purpose. Measuring on press would force a layout at
    // the exact moment the frame loop is about to start writing transforms.
    if (!boxRef.current) return;
    press.current = { x: e.clientX, y: e.clientY, moved: 0, down: true };
    // The sheet does not turn while it is being read: a turn would fight the
    // line the reader is on, and the type has to stay square to be legible.
    pointer.current.active = !readingRef.current;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!press.current.down) return;
    const dx = e.clientX - press.current.x;
    const dy = e.clientY - press.current.y;
    press.current.moved = Math.max(press.current.moved, Math.hypot(dx, dy));
    if (!pointer.current.active) return;
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return;
    // Normalised against half the box, so a drag from the middle to an edge is
    // a full turn and the feel does not change with the sheet's size.
    pointer.current.x = (dx / (box.width * 0.5)) * -1;
    pointer.current.y = dy / (box.height * 0.5);
  }, []);

  const settle = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    pointer.current.active = false;
    pointer.current.x = 0;
    pointer.current.y = 0;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  const onUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const tap = press.current.down && press.current.moved <= READER.clickSlopPx;
      press.current.down = false;
      settle(e);
      // A drag is a press and a release at almost the same point, so without
      // the slop test every turn of the sheet would also open the reader.
      if (!tap) return;
      if (readingRef.current) closeAndRecentre();
      else openReader();
    },
    [closeAndRecentre, openReader, settle],
  );

  const onCancel = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      press.current.down = false;
      settle(e);
    },
    [settle],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      if (readingRef.current) closeAndRecentre();
      else openReader();
    },
    [closeAndRecentre, openReader],
  );

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: reduce ? { duration: 0.01 } : { duration: 0.8, ease: EASE, delay },
  });

  // The glow behind the sheet. It grounds the paper on the void so the sheet
  // does not look pasted onto the page. It has nothing to ground once the sheet
  // fills the stage, so it leaves with the zoom.
  const glowBase = useTransform(ambient, [0, 0.5, 1], [0.25, 0.7, 0.25]);
  const glow = useTransform([glowBase, focus], ([g, f]: number[]) => g * (1 - f));
  /** Heading, eyebrow and cue hand the stage over to the letter. */
  const chrome = useTransform(focus, [0, 0.45], [1, 0]);
  const readCue = useTransform(focus, [0.55, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative z-0 w-full bg-[#030712]"
      /*
        The runway. Mounted only while the reader is open or still armed, so a
        visitor who never clicks the letter gets the page's original rhythm.
        Never `overflow: hidden` on this element: it is the pin's scroll
        ancestor, and hiding overflow here turns it into its own scroll box and
        the stage below stops sticking.
      */
      style={runway ? { height: `calc(100svh + ${READER.runwaySvh}svh)` } : undefined}
      aria-labelledby="belief-letter-heading"
    >
      <div
        ref={stageRef}
        className={cn(
          "relative w-full overflow-hidden px-[clamp(1.25rem,5vw,5.5rem)]",
          pinned
            ? // The top padding is clearance for the floating navbar. The stage
              // is pinned to the top of the viewport now, so the heading sits
              // under the navbar pill for the whole pin unless the column is
              // centred in the space below it rather than in the whole stage.
              "sticky top-0 flex flex-col items-center justify-center pb-[clamp(3.5rem,9vh,6rem)] pt-[clamp(5rem,11vh,7.5rem)]"
            : "pb-[clamp(2rem,5vh,4rem)] pt-[clamp(1.5rem,4.5vh,3.5rem)]",
        )}
        style={pinned ? { height: "100svh" } : undefined}
      >
        {/*
          The sheet's own layer, covering the stage so the mesh can be moved
          anywhere in it without ever resizing a drawing buffer. The entrance
          lives here rather than in the shader: fading and lifting this layer
          composites the canvas once on the GPU and leaves the sheet's own
          material alone.
        */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={reduce ? { duration: 0.01 } : { duration: 0.8, ease: EASE, delay: 0.16 }}
        >
          {sheetLive && (
            <LetterSheet
              fonts={{ display: display!, serif: serif!, hand: hand!, ui: ui! }}
              progress={ambient}
              pointer={pointer}
              rest={restFrame}
              focus={focus}
              read={read}
              onScreen={onScreen}
              onLost={handleLost}
            />
          )}
        </motion.div>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center text-center">
          <motion.div
            className="flex w-full flex-col items-center"
            style={{ opacity: mounted ? chrome : 1 }}
          >
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
          </motion.div>

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
            ref={slotRef}
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
                opacity: reduce ? 0.4 : mounted ? glow : 0.25,
                background:
                  "radial-gradient(60% 50% at 50% 52%, rgba(201,163,74,0.2), rgba(123,97,255,0.08) 45%, rgba(3,7,18,0) 72%)",
                filter: "blur(18px)",
                transform: "scale(1.35)",
              }}
            />

            {sheetLive ? (
              /*
                The sheet is a picture in a canvas behind this, so this is the
                whole of its interface: an empty control sitting exactly on it.
                A real button rather than a div with handlers, because the sheet
                had no keyboard path at all before, and the reader is now the
                only way to read it at a legible size.
              */
              <button
                ref={boxRef}
                type="button"
                aria-label={reading ? beliefLetter.closeLabel : beliefLetter.openLabel}
                aria-expanded={reading}
                className="block h-full w-full rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                style={{ cursor: reading ? "zoom-out" : fine ? "grab" : "pointer" }}
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onCancel}
                onKeyDown={onKeyDown}
                onPointerEnter={fine ? () => (pointer.current.hover = true) : undefined}
                onPointerLeave={
                  fine
                    ? () => {
                        pointer.current.hover = false;
                      }
                    : undefined
                }
              />
            ) : (
              <StaticLetter />
            )}
          </motion.div>

          {/*
            Only on the live path. The static letter cannot be turned, and the
            first draft fell back to the place name here, which is already
            printed on the sheet itself two lines above.
          */}
          {/*
            On the pinned path the cue is not in this column. The sheet is drawn
            by a canvas that covers the whole stage rather than by this box, so
            the scroll rise can carry it about 29px past the bottom of its slot,
            which is further than the cue's margin and put the two on top of
            each other. Out of flow and pinned to the foot of the stage, it
            cannot be reached whatever the sheet does. The static path keeps it
            here, where there is no canvas and no rise.
          */}
          {live && !pinned && (
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
          {sheetLive && (
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

        {/*
          Click anywhere to close, the way any other zoomed object on the web
          closes. It is only mounted while the reader is open, so it can never
          sit between a visitor and the rest of the page.
        */}
        {reading && (
          <button
            type="button"
            aria-label={beliefLetter.closeLabel}
            className="absolute inset-0 z-20 cursor-zoom-out bg-transparent outline-none"
            onClick={closeAndRecentre}
          />
        )}

        {/*
          Both cues share one slot at the foot of the stage and cross-fade, so
          they can never print over one another either.
        */}
        {pinned && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-[clamp(1rem,3.5vh,2.25rem)] z-30 grid place-items-center"
          >
            <motion.span
              className="font-footer-text col-start-1 row-start-1 block text-center text-[0.66rem] uppercase tracking-[0.26em] text-white/35"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={reduce ? { duration: 0.01 } : { duration: 0.8, ease: EASE, delay: 0.3 }}
            >
              <motion.span className="block" style={{ opacity: mounted ? chrome : 1 }}>
                {fine ? beliefLetter.cue : beliefLetter.cueTouch}
              </motion.span>
            </motion.span>
            <motion.span
              className="font-footer-text col-start-1 row-start-1 block text-center text-[0.66rem] uppercase tracking-[0.26em] text-white/35"
              style={{ opacity: mounted ? readCue : 0 }}
            >
              {beliefLetter.cueRead}
            </motion.span>
          </div>
        )}

        {/* Hairline close, matching the rest of the page's section joins. */}
        <motion.span
          aria-hidden
          className={cn(
            "block h-px w-full max-w-md",
            pinned
              ? "pointer-events-none absolute inset-x-0 bottom-0 mx-auto"
              : "mx-auto mt-[clamp(1.25rem,3.5vh,2.5rem)]",
          )}
          style={{
            background: `linear-gradient(90deg, rgba(3,7,18,0), ${PAPER.goldSoft}55, rgba(3,7,18,0))`,
            // `chrome` is 1 whenever the reader is shut, and the reader can only
            // open on the pinned path, so this needs no branch of its own.
            opacity: mounted ? chrome : 1,
          }}
        />
      </div>
    </section>
  );
}
