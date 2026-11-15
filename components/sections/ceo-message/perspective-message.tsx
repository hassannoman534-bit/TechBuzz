"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MotionValue } from "framer-motion";
import { motion, useScroll, useTransform } from "framer-motion";
import { useFinePointer } from "@/lib/use-fine-pointer";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { ceoMessage, EASE, STAGE } from "./ceo-message.config";

const { message } = ceoMessage;

/** Shared type for the message, so the moving block and the flat fallback match. */
const LINE_STYLE = {
  fontSize: "clamp(0.95rem,4vw,2.3rem)",
  fontWeight: 600,
  lineHeight: 1.38,
  letterSpacing: "-0.015em",
  color: "#c9c2ff",
} as const;

/** An empty line in the config is a stanza break. */
const BREAK_STYLE = { height: "0.75em" } as const;

/** Where a line sits in the block, measured once and on resize. */
type LineBox = { top: number; height: number };

function clamp(min: number, value: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

type LineProps = {
  line: string;
  /** Static offset of this line's centre from the block's centre, in px. */
  offset: number;
  progress: MotionValue<number>;
  /** Maps scroll progress to the block's travel, in px. */
  travelAt: (p: number) => number;
  viewport: number;
  hoverable: boolean;
};

/**
 * One line of the message, with its own depth.
 *
 * The projection is done here rather than by a CSS perspective on the parent:
 *   v = how far below the focal line this line currently sits
 *   m = f / (f - v)          the same projection a lens does, along Y only
 *   scale = m, and the line is pushed out to v * m so the gaps open up as
 *   things come closer, which is what actually sells the depth.
 *
 * Both are affine, so the browser applies them exactly and re-rasterises the
 * glyphs at their new size. A CSS perspective instead warps a rasterised layer
 * and shears the type (see STAGE).
 */
function MessageLine({
  line,
  offset,
  progress,
  travelAt,
  viewport,
  hoverable,
}: LineProps): React.ReactElement {
  const lens = viewport * STAGE.lensVhRatio;
  const focus = viewport * STAGE.focusVhRatio - viewport / 2;

  const magnify = useTransform(progress, (p) => {
    const v = travelAt(p) + offset - focus;
    // Guard the pole: as v approaches the lens the projection blows up.
    const m = lens / Math.max(lens * 0.38, lens - v);
    return clamp(STAGE.scaleMin, m, STAGE.scaleMax);
  });

  const shift = useTransform(progress, (p) => {
    const v = travelAt(p) + offset - focus;
    const m = clamp(STAGE.scaleMin, lens / Math.max(lens * 0.38, lens - v), STAGE.scaleMax);
    return v * (m - 1);
  });

  // Distance dissolves the far lines instead of shrinking them to a speck.
  const opacity = useTransform(magnify, (m) =>
    clamp(0, (m - STAGE.scaleMin) / (STAGE.fadeBelowScale - STAGE.scaleMin), 1),
  );

  return (
    <motion.p
      className="font-footer-display"
      /*
        Origin stays at the centre. Every line's box is the full width of the
        block, so scaling about its own centre is scaling about the block's
        centreline, which is what a real lens does: the left edges fan out
        evenly and the block stays on the page's centre. Anchoring at the left
        edge instead kept the left edges stacked but grew everything rightward,
        and the whole message drifted off centre.
      */
      style={{ ...LINE_STYLE, scale: magnify, y: shift, opacity }}
    >
      {/*
        Hover lives on an inner span so it cannot fight the depth transform on
        the paragraph. Colour and a glow only: letter-spacing would reflow the
        line, and the line is being scaled every frame already.
      */}
      <motion.span
        className="inline-block"
        initial={false}
        whileHover={
          hoverable
            ? { color: "#ffffff", textShadow: "0 0 26px rgba(123,97,255,0.55)", x: 6 }
            : undefined
        }
        transition={{ duration: 0.35, ease: EASE }}
      >
        {line}
      </motion.span>
    </motion.p>
  );
}

/** Flat version: same words, read straight down. Reduced motion and no-JS. */
function FlatLines(): React.ReactElement {
  return (
    <>
      {message.lines.map((line, i) =>
        line === "" ? (
          <span key={`break-${i}`} aria-hidden className="block" style={BREAK_STYLE} />
        ) : (
          <p key={`${i}-${line}`} className="font-footer-display" style={LINE_STYLE}>
            {line}
          </p>
        ),
      )}
    </>
  );
}

/**
 * Phase 3. The message travels down a tunnel and passes the camera.
 *
 * The block translates as one element so the scroll stays cheap, and every line
 * then adds its own scale and offset on top. Lines near the camera are large and
 * widely spaced, lines far away are small, dim and tightly packed.
 *
 * Refactored from the Skiper reference. What had to change for this codebase:
 *  - no `ReactLenis root` wrapper. SmoothScrollProvider already owns the root and
 *    a second one fights it.
 *  - `w-full`, not `w-screen`, which is 100vw and ignores the scrollbar.
 *  - the stage opacity sits on a plain layer above the moving block.
 *  - sizes that matter are inline styles, never Tailwind arbitrary values.
 *  - the lines are left aligned and the block is only as wide as its longest
 *    line, so it still sits on the centre of the page. Centred lines of unequal
 *    length give a ragged silhouette on both edges; a left aligned block in a
 *    full width box drifts off centre and leaves a hole down the right.
 */
export function PerspectiveMessage(): React.ReactElement {
  const reduce = useReducedMotionSafe();
  const fine = useFinePointer();
  const targetRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Array<HTMLElement | null>>([]);

  const [travel, setTravel] = useState<number>(STAGE.travelMinPx);
  const [exit, setExit] = useState<number>(-STAGE.travelMinPx);
  const [mid, setMid] = useState<number>(-STAGE.travelMinPx / 3);
  const [viewport, setViewport] = useState<number>(900);
  const [boxes, setBoxes] = useState<LineBox[]>([]);
  const [blockHeight, setBlockHeight] = useState<number>(0);

  // Geometry is read on mount and on resize only, never per frame.
  useEffect(() => {
    const node = blockRef.current;

    const update = (): void => {
      const vh = window.innerHeight;
      setViewport(vh);
      setTravel(Math.round(clamp(STAGE.travelMinPx, vh * STAGE.travelVhRatio, STAGE.travelMaxPx)));
      const h = node?.offsetHeight ?? vh * 0.5;
      setBlockHeight(h);
      // Far enough that the final line clears the camera entirely.
      setExit(-Math.round(h + vh * STAGE.exitPadVhRatio));
      setMid(-Math.round(h * 0.4));
      setBoxes(
        lineRefs.current.map((el) => ({
          top: el?.offsetTop ?? 0,
          height: el?.offsetHeight ?? 0,
        })),
      );
    };

    update();
    window.addEventListener("resize", update);
    const observer = node ? new ResizeObserver(update) : null;
    if (node && observer) observer.observe(node);
    return () => {
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  // The block's own travel, shared by every line so they stay in formation.
  const travelAt = useCallback(
    (p: number): number => {
      const r = STAGE.readableUntil;
      return p <= r
        ? travel + (mid - travel) * (p / r)
        : mid + (exit - mid) * ((p - r) / (1 - r));
    },
    [travel, mid, exit],
  );

  const y = useTransform(scrollYProgress, travelAt);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);
  const stageOpacity = useTransform(scrollYProgress, [STAGE.fadeStart, 1], [1, 0]);

  const rendered = useMemo(
    () =>
      message.lines.map((line, i) => {
      if (line === "") {
        return (
          <span
            key={`break-${i}`}
            aria-hidden
            ref={(el) => {
              lineRefs.current[i] = el;
            }}
            className="block"
            style={BREAK_STYLE}
          />
        );
      }
        const box = boxes[i];
      const offset = box ? box.top + box.height / 2 - blockHeight / 2 : 0;
      return (
        <span
          key={`${i}-${line}`}
          ref={(el) => {
            lineRefs.current[i] = el;
          }}
          className="block"
        >
          <MessageLine
            line={line}
            offset={offset}
            progress={scrollYProgress}
            travelAt={travelAt}
            viewport={viewport}
            hoverable={fine}
          />
        </span>
      );
      }),
    [boxes, blockHeight, scrollYProgress, travelAt, viewport, fine],
  );

  if (reduce) {
    return (
      <section className="relative z-0 w-full bg-[#030712] px-[clamp(1.25rem,6vw,8rem)] py-[clamp(4rem,11vh,7rem)]">
        <div className="mx-auto w-fit text-left" style={{ maxWidth: `${STAGE.measureRem}rem` }}>
          <FlatLines />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={targetRef}
      className="relative z-0 w-full bg-[#030712]"
      style={{ height: `${STAGE.heightVh}vh` }}
    >
      <div className="sticky top-0 overflow-hidden" style={{ height: "100svh" }}>
        <motion.div className="absolute inset-0" style={{ opacity: stageOpacity }}>
          <div className="absolute inset-0 flex items-center justify-center px-[clamp(1.25rem,6vw,8rem)]">
            {/*
              One transform for the whole block, then one per line on top. No
              will-change on the lines: measured both ways on a 4x throttled
              CPU and the frame cost was identical, so promotion buys nothing
              here, and a promoted layer is rasterised once and then scaled,
              which blurs the type at the sizes this reaches. Letting the lines
              repaint keeps every one of them sharp for free.
            */}
            <motion.div
              ref={blockRef}
              className="w-fit text-left"
              style={{ maxWidth: `${STAGE.measureRem}rem`, y }}
            >
              {rendered}
            </motion.div>
          </div>
        </motion.div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-10"
          style={{ height: "22vh", background: "linear-gradient(to top, rgba(3,7,18,0), #030712)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          style={{ height: "42vh", background: "linear-gradient(to bottom, rgba(3,7,18,0), #030712)" }}
        />

        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-[clamp(2rem,7vh,4.5rem)] z-20 flex justify-center"
          style={{ opacity: cueOpacity }}
        >
          <span className="grid justify-items-center gap-3">
            <span
              className="block h-12 w-px"
              style={{
                background: "linear-gradient(to bottom, rgba(3,7,18,0), rgba(201,194,255,0.55))",
              }}
            />
            <span className="font-footer-text text-[0.68rem] uppercase tracking-[0.28em] whitespace-nowrap text-white/40">
              {ceoMessage.heading.cue}
            </span>
          </span>
        </motion.div>
      </div>
    </section>
  );
}
