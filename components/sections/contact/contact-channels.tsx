"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { RollText } from "./roll-text";
import type { ContactChannel } from "./contact.config";

const EASE = [0.22, 1, 0.36, 1] as const;
const T = "duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]";

/**
 * Direct lines, set large. Hover: the value rolls letter by letter, a soft glass band fades in
 * behind the row, the arrow button fills with the brand gradient and turns, and a light line
 * sweeps under the row. Rows that are not hovered dim. CSS transforms and opacity only.
 */
export function ContactChannels({ channels, delay = 0 }: { channels: ContactChannel[]; delay?: number }) {
  const reduce = useReducedMotionSafe();

  return (
    <ul className="group/list flex flex-col">
      {channels.map((c, i) => (
        <motion.li
          key={c.label}
          initial={reduce ? false : { opacity: 0, y: 26, clipPath: "inset(0 0 100% 0)" }}
          animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 1.1, ease: EASE, delay: delay + i * 0.09 }}
          className={`transition-opacity ${T} md:group-hover/list:opacity-40 md:hover:!opacity-100`}
        >
          <a
            href={c.href}
            {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="group/row relative flex items-center justify-between gap-5 py-[clamp(0.8rem,1.8svh,1.1rem)] outline-none focus-visible:ring-1 focus-visible:ring-[#7ce9ff]/60"
          >
            {/* glass band */}
            <span
              aria-hidden
              className={`pointer-events-none absolute -inset-x-4 inset-y-0 rounded-2xl bg-white/[0.035] opacity-0 transition-opacity ${T} group-hover/row:opacity-100`}
            />
            <span className="relative min-w-0">
              <span className={`block text-[0.85rem] text-white/45 transition-colors ${T} group-hover/row:text-[#c9c2ff]`}>{c.label}</span>
              <RollText className="mt-0.5 max-w-full font-footer-display text-[clamp(1.25rem,2.1vw,1.9rem)] font-medium leading-[1.15] tracking-[-0.02em] text-white">
                {c.value}
              </RollText>
            </span>
            <span aria-hidden className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full ring-1 ring-white/15">
              <span
                className={`absolute inset-0 rounded-full bg-[linear-gradient(140deg,#7b61ff,#5b7cff_60%,#22a8ff)] transition-[clip-path] ${T} [clip-path:circle(0%_at_50%_100%)] group-hover/row:[clip-path:circle(75%_at_50%_100%)] group-focus-visible/row:[clip-path:circle(75%_at_50%_100%)]`}
              />
              <ArrowUpRight strokeWidth={1.6} className={`relative size-5 text-white/60 transition-[transform,color] ${T} group-hover/row:rotate-45 group-hover/row:text-white`} />
            </span>
            {/* resting line + hover sweep */}
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/[0.08]" />
            <span
              aria-hidden
              className={`absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[linear-gradient(90deg,#7b61ff,#22d8ff)] transition-transform ${T} group-hover/row:scale-x-100`}
            />
          </a>
        </motion.li>
      ))}
    </ul>
  );
}
