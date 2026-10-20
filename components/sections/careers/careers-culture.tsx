"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { GlassPanel } from "@/components/sections/site-footer/glass-panel";
import type { CareersContent } from "./careers.config";

type CareersCultureProps = { content: CareersContent["culture"] };

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Culture values as glass cards in a staggered three column grid (the middle column sits lower
 * for a layered, asymmetric rhythm). Cards rise in one after another; the cursor spotlight comes
 * from the shared GlassPanel.
 */
export function CareersCulture({ content }: CareersCultureProps) {
  const reduce = useReducedMotionSafe();
  return (
    <section aria-labelledby="careers-culture-heading" className="relative bg-[#030712] px-[clamp(1.25rem,6vw,8rem)] pb-[clamp(7rem,16vh,11rem)] pt-[clamp(1rem,4vh,3rem)] text-white">
      <div className="md:px-[clamp(1rem,4vw,4rem)]">
        <motion.p
          className="mb-5 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-white/45"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: EASE }}
        >
          {content.eyebrow}
        </motion.p>
        {/* the trigger sits on the h2: a fully masked span never counts as "in view" */}
        <motion.h2
          id="careers-culture-heading"
          className="mb-[clamp(2.5rem,7vh,4.5rem)] overflow-hidden pb-[0.1em] font-footer-display text-[clamp(2.1rem,4.4vw,4.25rem)] font-medium leading-[1.04] tracking-[-0.04em]"
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        >
          <motion.span
            className="inline-block"
            variants={{ hidden: { y: "110%" }, show: { y: "0%", transition: { duration: 1.2, ease: EASE } } }}
          >
            {content.heading}
          </motion.span>
        </motion.h2>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {content.values.map((value, i) => (
            <motion.li
              key={value.title}
              className={cn(i % 3 === 1 && "lg:translate-y-14")}
              initial={reduce ? false : { opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 1.15, ease: EASE, delay: (i % 3) * 0.1 }}
            >
              <GlassPanel className="h-full rounded-[24px] p-[clamp(1.5rem,2.2vw,2.25rem)]">
                <span className="text-[0.75rem] tabular-nums text-white/40">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-[clamp(2.5rem,5vw,4.5rem)] font-footer-display text-[clamp(1.5rem,2vw,2rem)] font-medium tracking-[-0.03em]">{value.title}</h3>
                <p className="mt-2 max-w-[34ch] text-[0.95rem] leading-relaxed text-white/55">{value.text}</p>
              </GlassPanel>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
