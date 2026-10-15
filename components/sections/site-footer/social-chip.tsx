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
        className="group/chip relative grid size-10 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_25%,rgb(255_255_255/0.14),rgb(255_255_255/0.03)_60%)] text-[#f4f3ff]/70 ring-1 ring-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.18),inset_0_-2px_6px_rgb(0_0_0/0.35),0_8px_24px_-10px_rgb(0_0_0/0.9)] outline-none transition-[translate,color,box-shadow,--tw-ring-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:text-white hover:ring-[rgb(var(--brand)/0.55)] hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.25),inset_0_-2px_6px_rgb(0_0_0/0.35),0_10px_30px_-8px_rgb(var(--brand)/0.55)] focus-visible:ring-[rgb(var(--brand)/0.7)] md:size-12"
      >
        <SocialIcon name={social.icon} className="size-[18px] transition-transform duration-300 group-hover/chip:scale-110" />
      </a>
    </motion.li>
  );
}
