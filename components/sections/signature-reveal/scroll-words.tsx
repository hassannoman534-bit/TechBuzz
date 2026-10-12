"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

type ScrollWordsProps = {
  text: string;
  progress: MotionValue<number>;
  /** Window in which the words rise in, one after another */
  range: [number, number];
  /** Window in which a light sweep passes across the finished line */
  sweep: [number, number];
  /** "muted" for supporting lines, "bright" for a quote over an image */
  tone?: "muted" | "bright";
  className?: string;
};

const TONES = {
  muted:
    "bg-[linear-gradient(100deg,var(--color-ink-muted)_40%,var(--color-ink)_50%,var(--color-ion-soft)_54%,var(--color-ink-muted)_64%)]",
  bright:
    "bg-[linear-gradient(100deg,var(--color-ink)_40%,#ffffff_50%,var(--color-ion-soft)_54%,var(--color-ink)_64%)]",
} as const;

/**
 * Subtitle reveal: each word rises out of a mask, staggered by scroll,
 * then a single soft light sweep travels across the line. Transform/opacity only.
 */
export function ScrollWords({ text, progress, range, sweep, tone = "muted", className }: ScrollWordsProps) {
  const words = text.split(" ");
  const span = range[1] - range[0];
  const step = span / (words.length + 2);
  const sweepStep = (sweep[1] - sweep[0]) / (words.length + 3);

  return (
    <p className={cn("relative flex flex-wrap justify-center gap-x-[0.28em]", className)} aria-label={text}>
      {words.map((word, i) => {
        const start = range[0] + i * step;
        return <Word key={`${word}-${i}`} word={word} progress={progress} range={[start, start + step * 3]} sweep={[sweep[0] + i * sweepStep, sweep[0] + (i + 4) * sweepStep]} gradient={TONES[tone]} />;
      })}
    </p>
  );
}

type WordProps = {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
  sweep: [number, number];
  gradient: string;
};

function Word({ word, progress, range, sweep, gradient }: WordProps) {
  const sweepPos = useTransform(progress, sweep, ["100% 0%", "0% 0%"]);
  const y = useTransform(progress, range, ["110%", "0%"]);
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-bottom">
      <motion.span
        style={{ y, opacity, backgroundPosition: sweepPos }}
        className={cn("inline-block bg-size-[300%_100%] bg-clip-text text-transparent will-change-transform", gradient)}
      >
        {word}
      </motion.span>
    </span>
  );
}
