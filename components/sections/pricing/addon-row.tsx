"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { money } from "./pricing-logic";
import type { PricingAddon } from "./pricing.config";

type AddonRowProps = {
  addon: PricingAddon;
  qty: number;
  onChange: (delta: number) => void;
};

/** One add-on with a quantity stepper. The count rolls up or down when it changes. */
export function AddonRow({ addon, qty, onChange }: AddonRowProps) {
  const on = qty > 0;
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-2xl px-4 py-3 transition-[background-color,box-shadow] duration-500",
        on
          ? "bg-[#7b61ff]/[0.09] shadow-[inset_0_0_0_1px_rgb(123_97_255/0.45)]"
          : "bg-white/[0.02] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.07)] hover:bg-white/[0.035]",
      )}
    >
      <div className="min-w-0">
        <p className="text-[0.92rem] font-medium text-white">{addon.name}</p>
        <p className="mt-0.5 text-[0.8rem] text-white/45">
          {money(addon.price)} / {addon.unit}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1 rounded-full bg-white/[0.04] p-1 ring-1 ring-white/10">
        <button
          type="button"
          onClick={() => onChange(-1)}
          disabled={!on}
          aria-label={`Remove one ${addon.name}`}
          className="grid size-8 place-items-center rounded-full text-white/70 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#7b61ff]/70 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="relative grid h-8 w-7 place-items-center overflow-hidden text-[0.9rem] font-semibold tabular-nums text-white" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={qty}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {qty}
            </motion.span>
          </AnimatePresence>
        </span>
        <button
          type="button"
          onClick={() => onChange(1)}
          aria-label={`Add one ${addon.name}`}
          className="grid size-8 place-items-center rounded-full bg-[linear-gradient(140deg,#7b61ff,#5b7cff)] text-white outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
