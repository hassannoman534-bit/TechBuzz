"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

type WrittenWordsProps = {
  text: string;
  progress: MotionValue<number>;
  /** Scroll window in which the line is "written", word by word, left to right */
  range: [number, number];
  className?: string;
};

/**
 * Handwritten quote: each word is uncovered left-to-right like a pen stroke, in reading order.
 * Words overlap slightly in time so the line flows instead of stepping. clip-path + opacity only.
 */
export function WrittenWords({ text, progress, range, className }: WrittenWordsProps) {
  const words = text.split(" ");
  const total = words.reduce((n, w) => n + w.length, 0);
  const span = range[1] - range[0];

  // Allocate each word time proportional to its length — long words take longer to "write".
  let cursor = range[0];
  const windows = words.map((w) => {
    const len = (w.length / total) * span;
    const win: [number, number] = [cursor, cursor + len * 1.35];
    cursor += len;
    return win;
  });

  return (
    <p className={cn("flex flex-wrap justify-center gap-x-[0.32em]", className)}>
      {words.map((word, i) => (
        <Stroke key={`${word}-${i}`} word={word} progress={progress} range={windows[i]} />
      ))}
    </p>
  );
}

type StrokeProps = { word: string; progress: MotionValue<number>; range: [number, number] };

function Stroke({ word, progress, range }: StrokeProps) {
  // Extra right padding inside the clip so swashes and descenders aren't cut mid-reveal.
  const clipPath = useTransform(progress, range, ["inset(-20% 100% -30% -6%)", "inset(-20% -12% -30% -6%)"]);
  const opacity = useTransform(progress, [range[0], range[0] + (range[1] - range[0]) * 0.25], [0, 1]);
  return (
    <motion.span aria-hidden style={{ clipPath, opacity }} className="inline-block will-change-[clip-path]">
      {word}
    </motion.span>
  );
}
