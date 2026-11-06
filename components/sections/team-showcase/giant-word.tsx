"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useTransform, type Variants } from "framer-motion";
import { DISPLAY_FONT, EASE, type Pointer } from "./team-motion";

export type GiantWordVariant = "name" | "role";
/** "fill" sits behind the portrait, "outline" is the same word in front of it (knockout). */
export type GiantWordLayer = "fill" | "outline";

type GiantWordProps = {
  text: string;
  variant: GiantWordVariant;
  layer: GiantWordLayer;
  tint: string;
  pointer: Pointer;
  /** Seconds before the first letter moves */
  delay?: number;
};

type Fit = { rows: string[]; size: number };

const TRACKING = -0.02; // em
const LINE = 0.9; // line height, em
const MAX_SIZE = 288; // px (18rem)
const WIDTH_USE = 0.9; // share of the box width a row may take

/** Every way to set the text: one row, or (designations) two rows split at a word break. */
function candidates(text: string, variant: GiantWordVariant): string[][] {
  const words = text.split(" ");
  const out: string[][] = [[text]];
  if (variant === "role") {
    for (let i = 1; i < words.length; i++) out.push([words.slice(0, i).join(" "), words.slice(i).join(" ")]);
  }
  return out;
}

let canvas: HTMLCanvasElement | null = null;

/**
 * Measures the real glyph widths (canvas, with the loaded Montserrat) and picks the row split
 * and font size that fill the box without ever cutting a letter.
 */
async function fit(el: HTMLElement, text: string, variant: GiantWordVariant): Promise<Fit> {
  const family = getComputedStyle(el).fontFamily;
  try {
    await document.fonts.load(`800 100px ${family}`, text);
  } catch {
    // Measure with whatever is available; the fallback metrics are close enough.
  }
  canvas ??= document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const boxW = el.clientWidth * WIDTH_USE;
  const boxH = el.clientHeight;
  const width = (row: string): number => {
    if (!ctx) return row.length * 80;
    ctx.font = `800 100px ${family}`;
    return ctx.measureText(row).width + (row.length - 1) * TRACKING * 100;
  };

  let best: Fit = { rows: [text], size: 0 };
  for (const rows of candidates(text, variant)) {
    const widest = Math.max(...rows.map(width), 1);
    const byWidth = (boxW / widest) * 100;
    const byHeight = (boxH * (rows.length === 1 ? 0.34 : 0.27)) / (LINE * (rows.length === 1 ? 1 : 0.86));
    const size = Math.floor(Math.min(byWidth, byHeight, MAX_SIZE));
    if (size > best.size * 1.04) best = { rows, size };
  }
  return best;
}

/** Per-letter custom data: its order in the word and the word's start delay. */
type Stagger = { i: number; d: number };

const nameLetter: Variants = {
  hidden: { y: "110%" },
  shown: ({ i, d }: Stagger) => ({ y: "0%", transition: { duration: 1.05, ease: EASE, delay: d + i * 0.05 } }),
  gone: ({ i }: Stagger) => ({ y: "-110%", transition: { duration: 0.6, ease: EASE, delay: i * 0.025 } }),
};

const roleLetter: Variants = {
  hidden: { y: "45%", clipPath: "inset(100% 0% 0% 0%)" },
  shown: ({ i, d }: Stagger) => ({
    y: "0%",
    clipPath: "inset(0% 0% 0% 0%)",
    transition: { duration: 0.95, ease: EASE, delay: d + i * 0.03 },
  }),
  gone: ({ i }: Stagger) => ({
    y: "-45%",
    clipPath: "inset(0% 0% 100% 0%)",
    transition: { duration: 0.5, ease: EASE, delay: i * 0.018 },
  }),
};

type LetterProps = {
  char: string;
  order: number;
  delay: number;
  depth: number;
  variants: Variants;
  pointer: Pointer;
};

/** One masked letter that drifts at its own depth against the pointer. */
function Letter({ char, order, delay, depth, variants, pointer }: LetterProps) {
  const x = useTransform(pointer.x, (v) => v * depth * -26);
  const y = useTransform(pointer.y, (v) => v * depth * -14);

  if (char === " ") return <span aria-hidden className="block" style={{ width: "0.28em" }} />;

  return (
    <motion.span aria-hidden className="relative block will-change-transform" style={{ x, y }}>
      <span className="block overflow-hidden" style={{ paddingBlock: "0.08em", marginBlock: "-0.08em", paddingInline: "0.04em", marginInline: "-0.04em" }}>
        <motion.span className="block transform-gpu" custom={{ i: order, d: delay } satisfies Stagger} variants={variants}>
          {char}
        </motion.span>
      </span>
    </motion.span>
  );
}

/**
 * Giant word for the open member. Fills its parent box (the same box as the portrait), centred
 * on the portrait. Letters rise through masks (name) or wipe in (designation), leave upward, and
 * drift with the pointer. Rendered twice: a filled copy behind the photo and an outlined copy in
 * front, so the whole word always reads, even where the photo covers it.
 * Must be a direct child of AnimatePresence so "gone" runs on exit.
 */
export function GiantWord({ text, variant, layer, tint, pointer, delay = 0 }: GiantWordProps) {
  const ref = useRef<HTMLDivElement>(null);
  const clean = text.toUpperCase().replace(/\s+/g, " ").trim();
  const [layout, setLayout] = useState<Fit | null>(null);

  // Measure on mount and on resize only (never per frame).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let alive = true;
    const run = (): void => {
      void fit(el, clean, variant).then((next) => {
        if (!alive) return;
        setLayout((prev) =>
          prev && prev.size === next.size && prev.rows.join("|") === next.rows.join("|") ? prev : next,
        );
      });
    };
    run();
    const ro = new ResizeObserver(run);
    ro.observe(el);
    return () => {
      alive = false;
      ro.disconnect();
    };
  }, [clean, variant]);

  const variants = variant === "name" ? nameLetter : roleLetter;
  let order = 0;

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0" style={{ fontFamily: DISPLAY_FONT }}>
      {layout ? (
        <motion.div initial="hidden" animate="shown" exit="gone" className="absolute inset-0 flex flex-col items-center justify-center">
          {layout.rows.map((row) => (
            <div
              key={row}
              className="flex select-none justify-center whitespace-nowrap font-extrabold uppercase"
              style={{
                fontSize: layout.size,
                lineHeight: LINE,
                letterSpacing: `${TRACKING}em`,
                color: layer === "fill" ? tint : "transparent",
                WebkitTextStroke: layer === "outline" ? `max(1.25px, 0.011em) ${tint}` : undefined,
              }}
            >
              {Array.from(row).map((char, i) => {
                const current = order++;
                return (
                  <Letter
                    key={`${char}-${i}`}
                    char={char}
                    order={current}
                    delay={delay}
                    depth={0.6 + ((current * 37) % 10) / 12}
                    variants={variants}
                    pointer={pointer}
                  />
                );
              })}
            </div>
          ))}
        </motion.div>
      ) : null}
    </div>
  );
}
