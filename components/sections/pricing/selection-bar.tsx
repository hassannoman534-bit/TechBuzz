"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "./animated-number";
import { money, type CartSummary } from "./pricing-logic";

type SelectionBarProps = {
  cart: CartSummary;
  visible: boolean;
  emptyLabel: string;
  reviewLabel: string;
  onReview: () => void;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/** Floating plan bar: item count, savings and total, opens the checkout. One line, never wraps. */
export function SelectionBar({ cart, visible, emptyLabel, reviewLabel, onReview }: SelectionBarProps) {
  const has = cart.items.length > 0;
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="bar"
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex justify-center px-4"
        >
          <div className="pointer-events-auto flex w-full max-w-[36rem] items-center gap-3 whitespace-nowrap rounded-full bg-[#0d0f24]/90 py-2 pl-5 pr-2 text-white shadow-[inset_0_0_0_1px_rgb(123_97_255/0.35),inset_0_1px_0_rgb(255_255_255/0.08),0_24px_60px_-20px_rgb(0_0_0/0.95)]">
            <Layers className="size-4 shrink-0 text-[#22d8ff]" />
            {has ? (
              <span className="flex min-w-0 flex-1 items-baseline gap-2.5 overflow-hidden">
                <span className="text-[0.85rem] text-white/70">
                  {cart.items.length} {cart.items.length === 1 ? "item" : "items"}
                </span>
                <span className="font-footer-display text-[1.05rem] font-semibold tracking-[-0.02em]">
                  <AnimatedNumber value={cart.total} />
                  {cart.hasCustom ? "+" : ""}
                </span>
                {cart.savings > 0 && <span className="hidden truncate text-[0.75rem] text-[#7ce9ff] sm:inline">you save {money(cart.savings)}</span>}
              </span>
            ) : (
              <span className="min-w-0 flex-1 truncate text-[0.85rem] text-white/55">{emptyLabel}</span>
            )}
            <button
              type="button"
              onClick={onReview}
              disabled={!has}
              className={cn(
                "group inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-[0.82rem] font-semibold outline-none transition-[transform,opacity] duration-300 focus-visible:ring-2 focus-visible:ring-white/60",
                has ? "bg-[linear-gradient(120deg,#7b61ff,#5b7cff_55%,#22a8ff)] text-white hover:scale-[1.03]" : "bg-white/[0.06] text-white/40",
              )}
            >
              {reviewLabel}
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
