"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type ChoiceChipsProps = {
  legend: string;
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
  /** single choice (radio) instead of many (checkbox) */
  single?: boolean;
  className?: string;
};

/**
 * Glass chips that fill with the brand gradient when chosen. The fill wipes in from the left
 * (clip-path), the plus turns into a check, the chip presses on tap. Real checkboxes / radios underneath,
 * so keyboard and screen readers work as normal.
 */
export function ChoiceChips({ legend, options, selected, onToggle, single, className }: ChoiceChipsProps) {
  const name = useId();

  return (
    <fieldset className={className}>
      <legend className="mb-3 text-[0.95rem] text-white/70">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const on = selected.includes(opt);
          return (
            <motion.label
              key={opt}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative inline-flex cursor-pointer select-none items-center gap-2 overflow-hidden whitespace-nowrap rounded-full px-4 py-2.5 text-[0.92rem]",
                "ring-1 transition-[color,box-shadow] duration-500 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#7ce9ff]",
                on ? "text-white ring-white/25" : "bg-white/[0.03] text-white/75 ring-white/10 hover:text-white hover:ring-white/25",
              )}
            >
              <input
                type={single ? "radio" : "checkbox"}
                name={name}
                value={opt}
                checked={on}
                onChange={() => onToggle(opt)}
                className="sr-only"
              />
              {/* gradient fill, wiped in from the left */}
              <span
                aria-hidden
                className="absolute inset-0 -z-0 bg-[linear-gradient(140deg,#7b61ff,#5b7cff_60%,#22a8ff)] transition-[clip-path] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ clipPath: on ? "inset(0 0% 0 0 round 999px)" : "inset(0 100% 0 0 round 999px)" }}
              />
              <span aria-hidden className="absolute inset-x-3 top-0 z-0 h-px bg-white/40 opacity-0 transition-opacity duration-500" style={{ opacity: on ? 1 : 0 }} />
              {/* fixed icon slot: plus turns into a check (no width change, no reflow) */}
              <span aria-hidden className="relative z-10 grid size-4 place-items-center">
                <Plus
                  className="absolute size-4 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  strokeWidth={1.8}
                  style={{ transform: on ? "rotate(90deg) scale(0.4)" : "none", opacity: on ? 0 : 0.6 }}
                />
                <Check
                  className="absolute size-4 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                  strokeWidth={2.4}
                  style={{ transform: on ? "scale(1)" : "scale(0.3)", opacity: on ? 1 : 0 }}
                />
              </span>
              <span className="relative z-10">{opt}</span>
            </motion.label>
          );
        })}
      </div>
    </fieldset>
  );
}
