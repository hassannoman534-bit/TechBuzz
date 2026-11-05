"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import type { ContactChannel } from "./contact.config";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Direct lines, set large. Hover: the value slides, the arrow straightens and a light line sweeps
 * under the row. CSS transforms only.
 */
export function ContactChannels({ channels, delay = 0 }: { channels: ContactChannel[]; delay?: number }) {
  const reduce = useReducedMotionSafe();

  return (
    <ul className="flex flex-col">
      {channels.map((c, i) => (
        <motion.li
          key={c.label}
          initial={reduce ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: delay + i * 0.08 }}
        >
          <a
            href={c.href}
            {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="group relative flex items-end justify-between gap-6 py-[clamp(0.7rem,1.6svh,1rem)] outline-none focus-visible:ring-1 focus-visible:ring-[#7ce9ff]/60"
          >
            <span className="min-w-0">
              <span className="block text-[0.85rem] text-white/45">{c.label}</span>
              <span className="block truncate font-footer-display text-[clamp(1.25rem,2.1vw,1.9rem)] font-medium tracking-[-0.02em] text-white transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2">
                {c.value}
              </span>
            </span>
            <ArrowUpRight
              aria-hidden
              strokeWidth={1.5}
              className="mb-1 size-6 shrink-0 text-white/40 transition-[transform,color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-45 group-hover:text-[#7ce9ff]"
            />
            {/* resting line + hover sweep */}
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/[0.08]" />
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[linear-gradient(90deg,#7b61ff,#22d8ff)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
            />
          </a>
        </motion.li>
      ))}
    </ul>
  );
}
