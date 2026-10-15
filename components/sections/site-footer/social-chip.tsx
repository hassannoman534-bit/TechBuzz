"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { CSSProperties } from "react";
import { SocialIcon } from "./social-icons";
import type { FooterSocial } from "./footer.config";

type SocialChipProps = {
  social: FooterSocial;
  progress: MotionValue<number>;
  /** progress window for this chip's entrance */
  range: [number, number];
};

/**
 * Glass orb with a brand glyph. Entrance is driven by the footer's scroll progress
 * (IntersectionObserver can't see a fixed, clipped panel). Hover lifts the orb and
 * tints its rim and glow with the brand colour. No backdrop blur here: it sits inside
 * a blurred panel, and nested blurs are expensive.
 */
export function SocialChip({ social, progress, range }: SocialChipProps) {
  const y = useTransform(progress, range, [14, 0]);
  const opacity = useTransform(progress, range, [0, 1]);

  return (
    <motion.li style={{ y, opacity }}>
      <a
        href={social.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`TechBuzz on ${social.label}`}
        style={{ "--brand": social.rgb } as CSSProperties}
        className="group/chip relative grid size-10 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_25%,rgb(255_255_255/0.14),rgb(255_255_255/0.03)_60%)] text-[#f4f3ff]/70 ring-1 ring-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.18),inset_0_-2px_6px_rgb(0_0_0/0.35),0_8px_24px_-10px_rgb(0_0_0/0.9)] outline-none transform-gpu transition-[transform,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:text-white focus-visible:ring-[rgb(var(--brand)/0.7)] motion-reduce:transition-none md:size-12"
      >
        {/* Brand ring + glow + top highlight on a layer we fade with opacity (GPU) instead of animating box-shadow/ring-color */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 ring-1 ring-[rgb(var(--brand)/0.55)] shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_10px_30px_-8px_rgb(var(--brand)/0.55)] transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/chip:opacity-100 motion-reduce:transition-none"
        />
        <SocialIcon name={social.icon} className="size-[18px] transform-gpu transition-transform duration-300 group-hover/chip:scale-110 motion-reduce:transition-none" />
      </a>
    </motion.li>
  );
}
