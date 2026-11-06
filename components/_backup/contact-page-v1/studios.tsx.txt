"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import type { ContactContent } from "./contact.config";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Three cities set large across the width. Each column rises in as the section enters.
 * Hover: the city slides, the address brightens and "Open in Maps" lifts in. Siblings dim.
 */
export function Studios({ content }: { content: ContactContent["studios"] }) {
  const reduce = useReducedMotionSafe();

  return (
    <section aria-labelledby="studios-h" className="px-[clamp(1.25rem,5vw,6rem)] pb-[clamp(6rem,16svh,12rem)] pt-[clamp(5rem,14svh,10rem)]">
      <h2 id="studios-h" className="text-white">
        <span className="font-footer-display text-[clamp(1.6rem,2.4vw,2.25rem)] font-medium tracking-[-0.03em]">{content.heading}</span>
      </h2>

      <ul className="group/list mt-[clamp(1.5rem,4svh,3rem)] grid grid-cols-1 gap-x-[clamp(1.5rem,3vw,3rem)] md:grid-cols-3">
        {content.items.map((s, i) => (
          <motion.li
            key={s.city}
            initial={reduce ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -15% 0px" }}
            transition={{ duration: 1.2, ease: EASE, delay: i * 0.1 }}
            className="transition-opacity duration-500 md:group-hover/list:opacity-45 md:hover:!opacity-100"
          >
            <a
              href={s.mapHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block py-[clamp(1.25rem,3svh,2rem)] outline-none focus-visible:ring-1 focus-visible:ring-[#7ce9ff]/60"
            >
              <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/[0.08]" />
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-[linear-gradient(90deg,#7b61ff,#22d8ff)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
              />
              <span className="flex items-baseline justify-between gap-4">
                <span className="block font-footer-display text-[clamp(2.4rem,4.6vw,4.5rem)] font-medium leading-none tracking-[-0.045em] text-white transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2">
                  {s.city}
                </span>
                {s.primary && <span className="whitespace-nowrap text-[0.85rem] text-[#7ce9ff]">Head office</span>}
              </span>
              <span className="mt-4 block text-[1rem] leading-[1.55] text-white/65 transition-colors duration-500 group-hover:text-white/90">
                {s.lines.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </span>
              <span
                className={cn(
                  "mt-4 inline-flex items-center gap-1.5 whitespace-nowrap text-[0.92rem] text-white/50 transition-[transform,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "group-hover:-translate-y-0.5 group-hover:text-[#c9c2ff]",
                )}
              >
                Open in Maps
                <ArrowUpRight aria-hidden className="size-4 transition-transform duration-500 group-hover:rotate-45" strokeWidth={1.6} />
              </span>
            </a>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
