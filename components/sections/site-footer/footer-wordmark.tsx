"use client";

import { useLayoutEffect, useRef } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";

type FooterWordmarkProps = {
  text: string;
  /** 0 → 1 as the footer is revealed */
  progress: MotionValue<number>;
  /** Progress window in which the letters rise, one after another */
  range?: [number, number];
};

const LINE = 0.82; // line-height (em)
const PAD = 0.05; // bottom padding inside each letter mask (em)
/** Vertical stretch limits. Width is always edge to edge; height stretches into the free space. */
const STRETCH_MIN = 0.8;
const STRETCH_MAX = 1.5;

/**
 * Giant lowercase wordmark.
 * - Width: the visible ink runs exactly from the left edge to the right edge (side bearings of
 *   the first and last glyph are measured and trimmed, so there is no optical gap).
 * - Height: the word is stretched vertically (scaleY, origin bottom) to fill the space left under
 *   the glass card, and the layout reserves that space so nothing overlaps.
 * - Letters rise out of a mask on reveal; hovering crossfades the word into glass (opacity only).
 */
export function FooterWordmark({ text, progress, range = [0.3, 0.92] }: FooterWordmarkProps) {
  const ref = useRef<HTMLDivElement>(null);
  const letters = Array.from(text);

  useLayoutEffect(() => {
    const el = ref.current;
    const wrap = el?.parentElement;
    const host = el?.closest<HTMLElement>("[data-footer-panel]");
    const content = host?.querySelector<HTMLElement>("[data-footer-content]");
    if (!el || !wrap) return;
    const ctx = document.createElement("canvas").getContext("2d");

    const fit = (): void => {
      const cs = getComputedStyle(wrap);
      const availW = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);

      // 1. Measure at 100px: box width plus the empty side bearings of the first and last glyph.
      el.style.fontSize = "100px";
      el.style.transform = "";
      el.style.marginTop = "0px";
      el.style.marginLeft = "0px";
      const natural = el.scrollWidth;
      if (!natural || availW <= 0) return;

      let lead = 0;
      let tail = 0;
      const glyphs = el.querySelectorAll<HTMLElement>("[data-glyph]");
      const last = glyphs[glyphs.length - 1];
      if (ctx && glyphs.length) {
        const ecs = getComputedStyle(el);
        ctx.font = `${ecs.fontWeight} 100px ${ecs.fontFamily}`;
        const first = ctx.measureText(letters[0] ?? "");
        lead = Math.max(0, -first.actualBoundingBoxLeft);
        const end = ctx.measureText(letters[letters.length - 1] ?? "");
        const lastBox = last?.getBoundingClientRect().width ?? end.width;
        tail = lastBox - end.actualBoundingBoxRight; // may be negative (ink past the box)
      }
      const ink = natural - lead - tail;
      const size = (100 * availW) / ink;
      const k = size / 100;
      el.style.fontSize = `${size}px`;
      el.style.marginLeft = `${-lead * k}px`;

      // 2. Stretch vertically into the space under the card.
      if (host && content) {
        const card = content.firstElementChild as HTMLElement | null;
        const used = parseFloat(getComputedStyle(content).paddingTop) + (card?.offsetHeight ?? 0);
        const availH = host.clientHeight - used - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        const h = size * (LINE + PAD);
        const s = Math.min(STRETCH_MAX, Math.max(STRETCH_MIN, availH / h));
        el.style.transform = `scaleY(${s.toFixed(4)})`;
        el.style.marginTop = `${(s - 1) * h}px`; // reserve (or release) the stretched height in layout
      }
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    if (host) ro.observe(host);
    if (content?.firstElementChild) ro.observe(content.firstElementChild);
    void document.fonts?.ready.then(fit);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const step = (range[1] - range[0]) / (letters.length + 3);

  return (
    <div
      ref={ref}
      aria-hidden
      className="group/word flex w-max origin-bottom select-none whitespace-nowrap font-footer-display font-semibold leading-[0.82] tracking-[-0.045em]"
    >
      {/* Glass rim: inner edge + soft inner glow traced from the glyph silhouette (alpha mask),
          so overlapping font contours never show. Rasterised once, then only faded. */}
      <svg aria-hidden width="0" height="0" className="absolute">
        <filter id="tb-glass-rim" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="erode" radius="1.4" result="inner" />
          <feComposite in="SourceAlpha" in2="inner" operator="out" result="edge" />
          <feMorphology in="SourceAlpha" operator="erode" radius="6" result="deep" />
          <feComposite in="SourceAlpha" in2="deep" operator="out" result="band" />
          <feGaussianBlur in="band" stdDeviation="7" result="bandBlur" />
          <feComposite in="bandBlur" in2="SourceAlpha" operator="in" result="glow" />
          <feFlood floodColor="#ffffff" floodOpacity="0.55" />
          <feComposite in2="edge" operator="in" result="edgeLit" />
          <feFlood floodColor="#b9a8ff" floodOpacity="0.28" />
          <feComposite in2="glow" operator="in" result="glowLit" />
          <feMerge>
            <feMergeNode in="glowLit" />
            <feMergeNode in="edgeLit" />
          </feMerge>
        </filter>
      </svg>
      {letters.map((ch, i) => (
        <Letter key={`${ch}-${i}`} ch={ch} index={i} progress={progress} range={[range[0] + i * step, range[0] + i * step + step * 4]} />
      ))}
    </div>
  );
}

type LetterProps = { ch: string; index: number; progress: MotionValue<number>; range: [number, number] };

/**
 * Hover is a pure crossfade between pre-rendered layers (solid, frosted fill, lit rim).
 * Only opacity and transform animate, both on the compositor, so it never repaints the
 * giant glyphs and stays smooth at any size.
 */
const FADE = "[transition-property:opacity] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] [will-change:opacity]";
const SOLID = `block text-[#f4f3ff] ${FADE} group-hover/word:opacity-0`;
const GLASS = [
  "pointer-events-none absolute inset-0 block bg-clip-text text-transparent opacity-0",
  "bg-[linear-gradient(175deg,rgb(255_255_255/0.40)_0%,rgb(255_255_255/0.10)_26%,rgb(255_255_255/0.035)_52%,rgb(123_97_255/0.22)_80%,rgb(34_216_255/0.14)_100%)]",
  FADE,
  "group-hover/word:opacity-100",
].join(" ");
const RIM = `pointer-events-none absolute inset-0 block text-white opacity-0 [filter:url(#tb-glass-rim)] ${FADE} group-hover/word:opacity-100`;

function Letter({ ch, index, progress, range }: LetterProps) {
  const y = useTransform(progress, range, ["102%", "0%"]);
  const glyph = ch === " " ? " " : ch;
  const delay = { transitionDelay: `${index * 40}ms` };
  return (
    // clip-path instead of overflow-hidden: clips only the bottom (for the rise), so glyph ink
    // that pokes past the box sideways or lifts on hover is never cut.
    <span data-glyph className="inline-block pb-[0.05em] [clip-path:inset(-30%_-30%_0_-30%)]">
      <motion.span style={{ y }} className="inline-block will-change-transform">
        <span className="relative inline-block transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[5%]">
          <span className={SOLID} style={delay}>{glyph}</span>
          <span aria-hidden className={GLASS} style={delay}>{glyph}</span>
          <span aria-hidden className={RIM} style={delay}>{glyph}</span>
        </span>
      </motion.span>
    </span>
  );
}
