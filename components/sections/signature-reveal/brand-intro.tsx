"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { SignatureLogo } from "./signature-reveal.config";

type BrandIntroProps = {
  logo?: SignatureLogo;
  /** 0 → 1 while the section scrolls into view (before pinning) */
  enter: MotionValue<number>;
  /** Main pinned progress */
  progress: MotionValue<number>;
  /** Window for the light sweep across the card */
  sweep: [number, number];
  /** Window in which the logo hands over to the quote */
  out: [number, number];
};

/**
 * Opening beat inside the card: the logo reveals left-to-right as the section arrives,
 * a single diagonal light sweep crosses the card, then the logo steps back for the quote.
 * Transform / opacity / clip-path only.
 */
export function BrandIntro({ logo, enter, progress, sweep, out }: BrandIntroProps) {
  const reveal = useTransform(enter, [0.25, 1], ["inset(-10% 100% -10% -2%)", "inset(-10% -2% -10% -2%)"]);
  const logoIn = useTransform(enter, [0.25, 0.7], [0, 1]);
  const logoOut = useTransform(progress, out, [1, 0]);
  const logoOpacity = useTransform([logoIn, logoOut], ([a, b]: number[]) => a * b);
  const logoScale = useTransform(enter, [0.25, 1], [0.94, 1]);
  const logoLift = useTransform(progress, out, ["0%", "-14%"]);
  const glow = useTransform([logoIn, logoOut], ([a, b]: number[]) => a * b * 0.9);

  const bandX = useTransform(progress, sweep, ["-110%", "110%"]);
  const bandOpacity = useTransform(progress, [sweep[0], sweep[0] + 0.01, sweep[1] - 0.01, sweep[1]], [0, 1, 1, 0]);

  return (
    <>
      {/* Soft halo behind the logo */}
      <motion.div
        aria-hidden
        style={{ opacity: glow }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(34%_40%_at_50%_50%,rgb(123_97_255/0.35),transparent_70%)]"
      />

      {/* Logo */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <motion.div style={{ opacity: logoOpacity, scale: logoScale, y: logoLift, clipPath: reveal }} className="w-[34%] max-w-[460px] portrait:w-[64%]">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- static brand asset
            <img src={logo.src} alt={logo.alt} draggable={false} className="block h-auto w-full select-none" />
          ) : (
            <span className="block text-center font-signature text-[clamp(1.5rem,3.2vw,3.25rem)] font-extrabold tracking-[-0.04em] text-ink">
              TechBuzz
            </span>
          )}
        </motion.div>
      </div>

      {/* Light sweep — one diagonal band across the whole card */}
      <motion.div
        aria-hidden
        style={{ x: bandX, opacity: bandOpacity }}
        className="pointer-events-none absolute inset-y-[-10%] left-0 w-full will-change-transform bg-[linear-gradient(105deg,transparent_32%,rgb(255_255_255/0.05)_42%,rgb(255_255_255/0.42)_49.5%,rgb(255_255_255/0.5)_50%,rgb(155_239_255/0.18)_54%,transparent_66%)]"
      />
    </>
  );
}
