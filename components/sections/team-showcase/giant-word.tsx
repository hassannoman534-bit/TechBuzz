"use client";

import { motion, useTransform, type Variants } from "framer-motion";
import { DISPLAY_FONT, EASE, type Pointer } from "./team-motion";

export type GiantWordVariant = "name" | "role";

type GiantWordProps = {
  text: string;
  variant: GiantWordVariant;
  tint: string;
  pointer: Pointer;
  /** Seconds before the first letter moves */
  delay?: number;
};

/**
 * Splits a designation into one or two rows of similar length (like "HOUSE OF / GUCCI").
 * A name always stays on one row.
 */
function toRows(text: string, variant: GiantWordVariant): string[] {
  const clean = text.toUpperCase().replace(/\s+/g, " ").trim();
  const words = clean.split(" ");
  if (variant === "name" || words.length === 1 || clean.length <= 11) return [clean];

  let best: string[] = [clean];
  let bestScore = Number.POSITIVE_INFINITY;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const score = Math.max(a.length, b.length);
    if (score < bestScore) {
      bestScore = score;
      best = [a, b];
    }
  }
  return best;
}

/** Font size that fits the longest row across the stage and the row count into the height. */
function fontSizeFor(rows: string[]): string {
  const longest = Math.max(...rows.map((r) => r.length), 1);
  const heightCap = rows.length === 1 ? 34 : 23;
  const widthFit = 90 / (longest * 0.8);
  return `min(${heightCap}svh, ${widthFit.toFixed(2)}vw, calc(4svh + 16vw), 19rem)`;
}

/** Per-letter custom data: its order in the word and the word's start delay. */
type Stagger = { i: number; d: number };

const nameLetter: Variants = {
  hidden: { y: "108%" },
  shown: ({ i, d }: Stagger) => ({ y: "0%", transition: { duration: 1.05, ease: EASE, delay: d + i * 0.045 } }),
  gone: ({ i }: Stagger) => ({ y: "-108%", transition: { duration: 0.6, ease: EASE, delay: i * 0.025 } }),
};

const roleLetter: Variants = {
  hidden: { y: "40%", clipPath: "inset(100% 0% 0% 0%)" },
  shown: ({ i, d }: Stagger) => ({
    y: "0%",
    clipPath: "inset(0% 0% 0% 0%)",
    transition: { duration: 0.95, ease: EASE, delay: d + i * 0.03 },
  }),
  gone: ({ i }: Stagger) => ({
    y: "-40%",
    clipPath: "inset(0% 0% 100% 0%)",
    transition: { duration: 0.55, ease: EASE, delay: i * 0.02 },
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

/** One masked letter. Each letter drifts at its own depth against the pointer. */
function Letter({ char, order, delay, depth, variants, pointer }: LetterProps) {
  const x = useTransform(pointer.x, (v) => v * depth * -34);
  const y = useTransform(pointer.y, (v) => v * depth * -18);

  if (char === " ") return <span aria-hidden style={{ width: "0.3em" }} />;

  return (
    <motion.span aria-hidden className="relative block will-change-transform" style={{ x, y }}>
      <span className="block overflow-hidden" style={{ paddingBlock: "0.06em", marginBlock: "-0.06em" }}>
        <motion.span className="block transform-gpu" custom={{ i: order, d: delay } satisfies Stagger} variants={variants}>
          {char}
        </motion.span>
      </span>
    </motion.span>
  );
}

/**
 * Massive spaced-out word behind the open portrait. Letters rise through masks (name) or are
 * wiped in with a clip-path (designation), leave upward, and float with mouse parallax.
 * Must be a direct child of AnimatePresence so "gone" runs on exit.
 */
export function GiantWord({ text, variant, tint, pointer, delay = 0 }: GiantWordProps) {
  const rows = toRows(text, variant);
  const variants = variant === "name" ? nameLetter : roleLetter;
  let order = 0;

  return (
    <motion.div
      aria-hidden
      initial="hidden"
      animate="shown"
      exit="gone"
      className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center portrait:justify-start portrait:pt-40"
      style={{ gap: "0.02em", fontSize: fontSizeFor(rows) }}
    >
      {rows.map((row) => (
        <div
          key={row}
          className="flex select-none justify-between whitespace-nowrap font-extrabold uppercase"
          style={{
            width: "min(94vw, 1760px)",
            fontFamily: DISPLAY_FONT,
            lineHeight: 0.86,
            letterSpacing: "-0.02em",
            color: tint,
            justifyContent: row.replace(/\s/g, "").length < 2 ? "center" : "space-between",
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
                depth={0.55 + ((current * 37) % 10) / 11}
                variants={variants}
                pointer={pointer}
              />
            );
          })}
        </div>
      ))}
    </motion.div>
  );
}
