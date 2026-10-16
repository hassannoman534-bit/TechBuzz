"use client";

import { useState, type CSSProperties } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { ArrowDown } from "lucide-react";
import type { PortfolioIntroContent } from "./portfolio-intro.config";

type ReelCardProps = {
  content: PortfolioIntroContent;
  progress: MotionValue<number>;
  /** Extra copies rendered for the liquid slices: hidden from assistive tech */
  decorative?: boolean;
};

/**
 * No will-change in here on purpose: this content is painted inside each liquid slice, and
 * nested GPU layers get clipped with soft edges there (visible hairline seams).
 */
const GPU: CSSProperties = {};

/**
 * The card's contents. Three looks crossfade as it grows (logo, light, final panel);
 * every layer is pre-rendered and only opacity / transform change.
 * Text is sized in container units (cqw) so it scales with the card, not the screen.
 */
export function ReelCard({ content, progress: p, decorative = false }: ReelCardProps) {
  const [logoOk, setLogoOk] = useState(true);

  const lookA = useTransform(p, [0.26, 0.36], [1, 0]);
  const lookB = useTransform(p, [0.26, 0.36, 0.5, 0.6], [0, 1, 1, 0]);
  const lookC = useTransform(p, [0.5, 0.6], [0, 1]);

  // Final beat: the two words slide out from behind the centre pill.
  // Each word sits in its own mask and slides out from the pill side.
  const left = useTransform(p, [0.66, 0.84], ["105%", "0%"]);
  const right = useTransform(p, [0.66, 0.84], ["-105%", "0%"]);
  const pill = useTransform(p, [0.6, 0.72], [0.4, 1]);
  const pillOpacity = useTransform(p, [0.6, 0.68], [0, 1]);
  const corner = useTransform(p, [0.7, 0.8], [0, 1]);

  return (
    <div aria-hidden={decorative || undefined} className="absolute inset-0 overflow-hidden rounded-[inherit] @container">
      {/* Base colour field (static: this content is rendered once per liquid slice) */}
      <div aria-hidden className="absolute inset-0 bg-[#090a1f]" />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(55%_75%_at_22%_30%,rgb(123_97_255/0.55),transparent_70%),radial-gradient(50%_70%_at_80%_70%,rgb(34_216_255/0.32),transparent_70%),radial-gradient(40%_50%_at_60%_15%,rgb(44_245_176/0.16),transparent_70%)]"
      />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_50%,transparent,rgb(3_7_18/0.75))]" />

      {/* Look A: logo */}
      <motion.div style={{ ...GPU, opacity: lookA }} className="absolute inset-0 grid place-items-center">
        <div className="w-[46%]">
          {logoOk ? (
            // eslint-disable-next-line @next/next/no-img-element -- static brand asset
            <img src={content.logo.src} alt={decorative ? "" : content.logo.alt} draggable={false} onError={() => setLogoOk(false)} className="block h-auto w-full select-none" />
          ) : (
            <span className="block text-center font-footer-display text-[9cqw] font-bold tracking-[-0.04em] text-white">TechBuzz</span>
          )}
        </div>
      </motion.div>

      {/* Look B: a band of light */}
      <motion.div style={{ ...GPU, opacity: lookB }} className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgb(34_216_255/0.0)_20%,rgb(34_216_255/0.35)_45%,rgb(255_255_255/0.5)_50%,rgb(123_97_255/0.35)_56%,transparent_80%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(40%_50%_at_70%_40%,rgb(44_245_176/0.28),transparent_70%)]" />
      </motion.div>

      {/* Look C: final panel */}
      <motion.div style={{ ...GPU, opacity: lookC }} className="absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_100%,rgb(123_97_255/0.45),transparent_70%),linear-gradient(180deg,rgb(9_10_31/0.2),rgb(9_10_31/0.6))]">
        <div className="absolute inset-0 flex items-center justify-center gap-[2.2cqw] font-footer-display text-[11cqw] font-bold leading-none tracking-[-0.045em] text-white">
          <span className="inline-block overflow-hidden pb-[0.06em] pt-[0.02em]">
            <motion.span style={{ ...GPU, x: left }} className="inline-block">
              {content.panel[0]}
            </motion.span>
          </span>
          <motion.span
            style={{ ...GPU, scale: pill, opacity: pillOpacity }}
            className="grid h-[9cqw] w-[16cqw] place-items-center rounded-full bg-[linear-gradient(180deg,rgb(255_255_255/0.22),rgb(255_255_255/0.08))] shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_20px_60px_-20px_rgb(123_97_255/0.8)] ring-1 ring-white/25"
          >
            <ArrowDown className="size-[4cqw] text-white" strokeWidth={2} aria-hidden />
          </motion.span>
          <span className="inline-block overflow-hidden pb-[0.06em] pt-[0.02em]">
            <motion.span style={{ ...GPU, x: right }} className="inline-block">
              {content.panel[1]}
            </motion.span>
          </span>
        </div>
        {/* small logo in the corner once the panel settles */}
        <motion.div style={{ opacity: corner }} className="absolute left-[3cqw] top-[3cqw] w-[13cqw]">
          {logoOk && (
            // eslint-disable-next-line @next/next/no-img-element -- static brand asset
            <img src={content.logo.src} alt="" draggable={false} className="block h-auto w-full opacity-80" />
          )}
        </motion.div>
      </motion.div>

      {/* Glass rim */}
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgb(255_255_255/0.18),inset_0_0_0_1px_rgb(255_255_255/0.08)]" />
    </div>
  );
}
