"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { money } from "./pricing-logic";
import type { PricingPackage } from "./pricing.config";

type PackageCardProps = {
  pkg: PricingPackage;
  selected: boolean;
  /** Bundle discount this package gets (or would get) in its position, 0 to 1 */
  discount: number;
  index: number;
  onToggle: () => void;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * A package as a glass card. Shows the bundle price when a discount applies (old price struck
 * through). Selected: violet rim, soft glow and a check. Lifts slightly on hover.
 */
export function PackageCard({ pkg, selected, discount, index, onToggle }: PackageCardProps) {
  const custom = pkg.price === null;
  const discounted = !custom && discount > 0 ? Math.round((pkg.price as number) * (1 - discount)) : null;

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.05 + index * 0.06 }}
      className={cn(
        "group relative flex h-full flex-col rounded-[22px] p-5 text-left outline-none transition-[transform,box-shadow,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[#7b61ff]/70",
        "bg-[linear-gradient(170deg,rgb(255_255_255/0.05),rgb(255_255_255/0.012)_60%)]",
        selected
          ? "bg-[linear-gradient(170deg,rgb(123_97_255/0.16),rgb(91_124_255/0.05)_60%)] shadow-[inset_0_0_0_1px_rgb(123_97_255/0.7),0_24px_60px_-28px_rgb(123_97_255/0.9)]"
          : "shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08),inset_0_1px_0_rgb(255_255_255/0.08)] hover:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.16),inset_0_1px_0_rgb(255_255_255/0.1),0_20px_50px_-30px_rgb(0_0_0/0.9)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-footer-display text-[1.15rem] font-semibold tracking-[-0.02em] text-white">{pkg.name}</h4>
        <span
          aria-hidden
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-full ring-1 transition-all duration-500",
            selected ? "scale-100 bg-[linear-gradient(140deg,#7b61ff,#22a8ff)] ring-transparent" : "scale-90 ring-white/20",
          )}
        >
          <Check className={cn("size-3.5 text-white transition-opacity duration-300", selected ? "opacity-100" : "opacity-0")} strokeWidth={2.6} />
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {custom ? (
          <span className="font-footer-display text-[1.6rem] font-semibold tracking-[-0.03em] text-white">{pkg.desc}</span>
        ) : discounted !== null ? (
          <>
            <span className="font-footer-display text-[1.75rem] font-semibold tracking-[-0.03em] text-white">{money(discounted)}</span>
            <span className="text-[0.95rem] text-white/40 line-through">{money(pkg.price as number)}</span>
            <span className="rounded-full bg-[#22d8ff]/15 px-2 py-0.5 text-[0.68rem] font-semibold text-[#7ce9ff] ring-1 ring-[#22d8ff]/30">
              −{Math.round(discount * 100)}%
            </span>
          </>
        ) : (
          <span className="font-footer-display text-[1.75rem] font-semibold tracking-[-0.03em] text-white">{money(pkg.price as number)}</span>
        )}
      </div>
      <p className="mt-1 text-[0.85rem] text-white/50">{custom ? "Custom quote" : pkg.desc}</p>

      <ul className="mt-5 flex flex-col gap-2 border-t border-white/[0.07] pt-4">
        {pkg.feats.map((f) => {
          const inherits = /^All in .+\+$/.test(f);
          return (
            <li key={f} className={cn("flex items-start gap-2.5 text-[0.88rem] leading-snug", inherits ? "font-medium text-[#c9c2ff]" : "text-white/75")}>
              <span aria-hidden className={cn("mt-[0.45em] size-1.5 shrink-0 rounded-full", inherits ? "bg-[#7b61ff]" : "bg-[#22d8ff]/80")} />
              {f}
            </li>
          );
        })}
      </ul>
    </motion.button>
  );
}
