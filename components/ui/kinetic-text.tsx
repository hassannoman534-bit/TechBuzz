"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { useFinePointer } from "@/lib/use-fine-pointer";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";

export type KineticTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

export type KineticTextProps = {
  /** The line to render. Split per word, then per character. */
  text: string;
  /** Element to render. Defaults to h1. */
  as?: KineticTag;
  className?: string;
  /**
   * Styles for the wrapper. Set the font size here, not with a Tailwind class:
   * Tailwind preflight resets heading sizes to inherit, so an unsized h1 renders
   * at body size.
   */
  style?: React.CSSProperties;
  /** Gates the entrance. Set it true when the opening sequence is done. */
  play?: boolean;
  /** Seconds before the first character rises. */
  delay?: number;
  /** Seconds between characters. */
  stagger?: number;
  /** Font stack for the characters, applied inline so the global h1 to h6 rule cannot win. */
  fontFamily?: string;
  fontWeight?: number;
  /** Resting colour and the colour a character reaches under the pointer. */
  color?: string;
  hoverColor?: string;
  /** How far from a character the pointer starts to affect it, in pixels. */
  radius?: number;
  /** How far a character lifts at full strength, in pixels. */
  lift?: number;
  /**
   * Animate the weight axis under the pointer. Needs a variable font: the project
   * currently loads Outfit at 500 and 600 only, so this is off by default.
   */
  variableWeight?: false | [number, number];
};

const EASE = [0.22, 1, 0.36, 1] as const;

type CharCell = {
  char: string;
  /** Index across the whole line, so the stagger runs left to right through words. */
  index: number;
};

/**
 * One character. Holds its own motion values so the pointer effect never touches
 * React state, which would re-render the whole line on every pointer move.
 */
function KineticChar({
  cell,
  play,
  reduce,
  interactive,
  pointerX,
  strength,
  delay,
  stagger,
  fontFamily,
  fontWeight,
  color,
  hoverColor,
  radius,
  lift,
  variableWeight,
}: {
  cell: CharCell;
  play: boolean;
  reduce: boolean;
  interactive: boolean;
  pointerX: MotionValue<number>;
  strength: MotionValue<number>;
  delay: number;
  stagger: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  hoverColor: string;
  radius: number;
  lift: number;
  variableWeight: false | [number, number];
}): React.ReactElement {
  const ref = useRef<HTMLSpanElement>(null);
  const centre = useMotionValue(0);

  // Measure the character's centre in viewport coordinates. Vertical scrolling does
  // not change it, so it only needs a refresh on resize or a font swap.
  useEffect(() => {
    if (!interactive) return;
    const node = ref.current;
    if (!node) return;

    const measure = (): void => {
      const rect = node.getBoundingClientRect();
      centre.set(rect.left + rect.width / 2);
    };

    measure();
    window.addEventListener("resize", measure);
    const fonts = document.fonts as FontFaceSet | undefined;
    void fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [centre, interactive]);

  // Proximity, 0 far away and 1 directly under the pointer.
  const proximity = useTransform<number, number>(
    [pointerX, strength, centre],
    ([x, s, c]: number[]) => {
      if (s === 0) return 0;
      const distance = Math.abs(x - c);
      return s * Math.max(0, 1 - distance / radius);
    },
  );

  const y = useTransform(proximity, [0, 1], [0, -lift]);
  const scale = useTransform(proximity, [0, 1], [1, 1.14]);
  const tint = useTransform(proximity, [0, 1], [color, hoverColor]);
  const weight = useTransform(
    proximity,
    [0, 1],
    variableWeight ? [variableWeight[0], variableWeight[1]] : [fontWeight, fontWeight],
  );
  const variation = useMotionTemplate`"wght" ${weight}`;

  const resting = reduce || !play;

  return (
    <span
      aria-hidden
      className="inline-block overflow-hidden"
      // Padding and a matching negative margin keep descenders out of the mask edge.
      style={{ paddingBlock: "0.16em", marginBlock: "-0.16em" }}
    >
      <motion.span
        className="inline-block will-change-transform"
        initial={{ y: "115%", opacity: 0 }}
        animate={play ? { y: "0%", opacity: 1 } : { y: "115%", opacity: 0 }}
        transition={
          reduce
            ? { duration: 0.01 }
            : { duration: 0.95, ease: EASE, delay: delay + cell.index * stagger }
        }
      >
        <motion.span
          ref={ref}
          className="inline-block"
          style={{
            fontFamily,
            fontWeight,
            y: interactive && !resting ? y : undefined,
            scale: interactive && !resting ? scale : undefined,
            color: interactive && !resting ? tint : color,
            fontVariationSettings: variableWeight && interactive && !resting ? variation : undefined,
          }}
        >
          {cell.char}
        </motion.span>
      </motion.span>
    </span>
  );
}

/**
 * Kinetic heading.
 *
 * Two behaviours in one component:
 *  1. An entrance: every character rises out of its own mask, left to right. This is
 *     what the page uses when the opening overlay unmounts.
 *  2. A pointer pass: characters near the cursor lift, grow and warm in colour. This
 *     is the Magic UI Kinetic Text idea, which is hover only and therefore cannot
 *     carry a reveal on its own.
 *
 * Characters carry their font inline. The site has an unlayered
 * `h1…h6 { font-family: var(--font-syne) }` rule in globals.css that beats any
 * Tailwind font class on the heading element itself.
 */
export function KineticText({
  text,
  as = "h1",
  className,
  style,
  play = true,
  delay = 0,
  stagger = 0.03,
  fontFamily = "var(--font-footer-display)",
  fontWeight = 600,
  color = "#e7eaf3",
  hoverColor = "#c9c2ff",
  radius = 110,
  lift = 10,
  variableWeight = false,
}: KineticTextProps): React.ReactElement {
  const reduce = useReducedMotionSafe();
  const fine = useFinePointer();
  const interactive = fine && !reduce;

  const pointerX = useMotionValue(0);
  const strength = useMotionValue(0);

  // Words keep their characters together so a word never breaks across lines.
  const words = useMemo(() => {
    let index = 0;
    return text.split(" ").map((word) => ({
      key: `${word}-${index}`,
      cells: Array.from(word).map((char) => ({ char, index: index++ }) as CharCell),
    }));
  }, [text]);

  const handleMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!interactive) return;
      pointerX.set(event.clientX);
    },
    [interactive, pointerX],
  );

  const handleEnter = useCallback(() => {
    if (!interactive) return;
    animate(strength, 1, { duration: 0.35, ease: EASE });
  }, [interactive, strength]);

  const handleLeave = useCallback(() => {
    if (!interactive) return;
    animate(strength, 0, { duration: 0.5, ease: EASE });
  }, [interactive, strength]);

  const Tag = as;

  return (
    <Tag
      aria-label={text}
      className={cn("inline-block", className)}
      style={style}
      onPointerMove={handleMove}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
    >
      {words.map((word, wordIndex) => (
        <span key={word.key} className="inline-block whitespace-nowrap">
          {word.cells.map((cell) => (
            <KineticChar
              key={`${cell.char}-${cell.index}`}
              cell={cell}
              play={play}
              reduce={reduce}
              interactive={interactive}
              pointerX={pointerX}
              strength={strength}
              delay={delay}
              stagger={stagger}
              fontFamily={fontFamily}
              fontWeight={fontWeight}
              color={color}
              hoverColor={hoverColor}
              radius={radius}
              lift={lift}
              variableWeight={variableWeight}
            />
          ))}
          {wordIndex < words.length - 1 ? <span aria-hidden>&nbsp;</span> : null}
        </span>
      ))}
    </Tag>
  );
}
