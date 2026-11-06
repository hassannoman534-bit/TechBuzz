"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SubmitButtonProps = { label: string; sendingLabel: string; sending: boolean; className?: string };

/**
 * Full gradient pill. Hover: a light sweeps across and the arrow nudges forward.
 * Sending: the sweep loops and the label changes; the button keeps its size.
 */
export function SubmitButton({ label, sendingLabel, sending, className }: SubmitButtonProps) {
  return (
    <motion.button
      type="submit"
      disabled={sending}
      aria-busy={sending}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "group relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden whitespace-nowrap rounded-full px-8 text-[1rem] font-medium text-white",
        "bg-[linear-gradient(140deg,#7b61ff,#5b7cff_60%,#22a8ff)] shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_18px_40px_-18px_rgb(123_97_255/0.9)]",
        "outline-none focus-visible:ring-2 focus-visible:ring-[#7ce9ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030712] disabled:cursor-progress",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.35),transparent)]",
          "translate-x-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[320%]",
          sending && "animate-[contact-sweep_1.4s_cubic-bezier(0.22,1,0.36,1)_infinite] motion-reduce:animate-none",
        )}
      />
      <span className="relative">{sending ? sendingLabel : label}</span>
      <ArrowRight
        aria-hidden
        className="relative size-5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
        strokeWidth={1.8}
      />
      <style>{`@keyframes contact-sweep{from{transform:translateX(0) skewX(-12deg)}to{transform:translateX(320%) skewX(-12deg)}}`}</style>
    </motion.button>
  );
}
