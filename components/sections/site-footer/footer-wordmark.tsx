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

const LINE = 0.82; // line-height
const PAD = 0.05; // bottom padding (em) inside each letter mask

/**
 * Giant lowercase wordmark. Fills the footer's width exactly, but never taller than the
 * space left under the glass card (so short screens never push it off the bottom).
 * Letters rise out of a mask as the footer is revealed; hovering turns the word to glass.
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

    const fit = (): void => {
      const cs = getComputedStyle(wrap);
      const availW = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      el.style.fontSize = "100px";
      const natural = el.scrollWidth;
      if (!natural) return;
      let size = (100 * availW) / natural;
      if (host && content) {
        // Intrinsic height of the content (its top padding + the card). The block itself is flex-1,
        // so its own height would include the free space. offsetHeight ignores the drift transform.
        const card = content.firstElementChild as HTMLElement | null;
        const used = parseFloat(getComputedStyle(content).paddingTop) + (card?.offsetHeight ?? 0);
        const availH = host.clientHeight - used - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        size = Math.min(size, Math.max(48, availH / (LINE + PAD)));
      }
      el.style.fontSize = `${size}px`;
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    if (host) ro.observe(host);
    if (content) ro.observe(content);
    void document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [text]);

  const step = (range[1] - range[0]) / (letters.length + 3);

  return (
    <div
      ref={ref}
      aria-hidden
      className="group/word flex w-max select-none whitespace-nowrap font-footer-display font-semibold leading-[0.82] tracking-[-0.045em]"
    >
      {/* Glass rim: an inner edge + soft inner glow traced from the glyph silhouette.
          Built from the alpha mask, so overlapping font contours never show. */}
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

/** Solid fill that fades to a frosted gradient on hover, with a sheen sliding down. */
const FILL = [
  "block bg-clip-text text-[#f4f3ff]",
  "bg-[linear-gradient(175deg,rgb(255_255_255/0.42)_0%,rgb(255_255_255/0.10)_24%,rgb(255_255_255/0.035)_50%,rgb(123_97_255/0.22)_80%,rgb(34_216_255/0.14)_100%)]",
  "bg-[length:100%_160%] bg-[position:0_100%]",
  "[transition-property:color,background-position] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
  "group-hover/word:text-[rgb(244_243_255/0.03)] group-hover/word:bg-[position:0_0]",
].join(" ");

/** Rim layer: the same glyph, drawn only as its lit edge, faded in on hover. */
const RIM = "pointer-events-none absolute inset-0 block text-white opacity-0 transition-opacity duration-300 [filter:url(#tb-glass-rim)] group-hover/word:opacity-100 motion-reduce:transition-none";

function Letter({ ch, index, progress, range }: LetterProps) {
  const y = useTransform(progress, range, ["102%", "0%"]);
  const glyph = ch === " " ? " " : ch;
  const delay = { transitionDelay: `${index * 35}ms` };
  return (
    <span className="inline-block overflow-hidden pb-[0.05em]">
      <motion.span style={{ y }} className="inline-block will-change-transform">
        <span className="relative inline-block transform-gpu transition-[translate] duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] hover:-translate-y-[6%] motion-reduce:transition-none">
          <span className={FILL} style={delay}>{glyph}</span>
          <span aria-hidden className={RIM} style={delay}>{glyph}</span>
        </span>
      </motion.span>
    </span>
  );
}
