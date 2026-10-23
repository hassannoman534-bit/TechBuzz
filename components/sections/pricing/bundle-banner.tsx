"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Zap } from "lucide-react";
import { discountForIndex, planLabel, type PricingState } from "./pricing-logic";
import type { PricingContent } from "./pricing.config";

type BundleBannerProps = { content: PricingContent; state: PricingState };

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Bundle savings strip. Before anything is picked it explains the rule; after that it lists the
 * picked plans with their discount and teases the next one (same rule and wording as the current site).
 */
export function BundleBanner({ content, state }: BundleBannerProps) {
  const order = state.order.filter((k) => state.picked[k] !== undefined);
  const next = discountForIndex(order.length, content.discount);
  const t1 = Math.round(content.discount.tier1 * 100);
  const t2 = Math.round(content.discount.tier2 * 100);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(100deg,rgb(123_97_255/0.14),rgb(34_168_255/0.08)_60%,rgb(44_245_176/0.06))] px-4 py-3 shadow-[inset_0_0_0_1px_rgb(123_97_255/0.3)]">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.85rem]">
        <Zap aria-hidden className="size-4 shrink-0 text-[#22d8ff]" strokeWidth={2} />
        <span className="rounded-full bg-[linear-gradient(120deg,#7b61ff,#5b7cff)] px-2.5 py-0.5 text-[0.72rem] font-bold text-white">
          {Math.round((next || content.discount.tier1) * 100)}% OFF
        </span>

        <AnimatePresence mode="popLayout" initial={false}>
          {order.length === 0 ? (
            <motion.span key="rule" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-white/70">
              Bundle and save: your 2nd service is {t1}% off, every service after that is {t2}% off.
            </motion.span>
          ) : (
            order.map((key, idx) => {
              const pct = Math.round(discountForIndex(idx, content.discount) * 100);
              return (
                <motion.span
                  key={key}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="flex items-center gap-2"
                >
                  {idx > 0 && <span className="text-white/35">+</span>}
                  <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[0.78rem] text-white ring-1 ring-white/10">
                    {planLabel(content, key, state.picked[key])}
                    {pct > 0 && <span className="ml-1 text-[#7ce9ff]">−{pct}%</span>}
                  </span>
                </motion.span>
              );
            })
          )}
        </AnimatePresence>

        {order.length > 0 && (
          <motion.span layout className="text-white/60">
            Add another service for {Math.round(next * 100)}% off
          </motion.span>
        )}
      </div>
    </div>
  );
}
