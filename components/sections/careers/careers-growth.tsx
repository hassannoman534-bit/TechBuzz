"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import type { CareersContent } from "./careers.config";

type CareersGrowthProps = { content: CareersContent["growth"] };

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * "Grow with us": a two line heading and short paragraph on the left, the perks as a quiet
 * ruled list on the right. Lines and rows ease in as they scroll into view.
 */
export function CareersGrowth({ content }: CareersGrowthProps) {
  const reduce = useReducedMotionSafe();
  return (
    <section aria-labelledby="careers-growth-heading" className="relative bg-[#030712] px-[clamp(1.25rem,6vw,8rem)] py-[clamp(4rem,11vh,8rem)] text-white">
      <div className="grid gap-[clamp(2.5rem,6vw,6rem)] md:grid-cols-[1.1fr_1fr] md:px-[clamp(1rem,4vw,4rem)]">
        <div>
          <motion.p
            className="mb-5 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-white/45"
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: EASE }}
          >
            {content.eyebrow}
          </motion.p>
          <motion.h2
            id="careers-growth-heading"
            className="font-footer-display text-[clamp(2.1rem,4.4vw,4.25rem)] font-medium leading-[1.04] tracking-[-0.04em]"
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          >
            {content.lines.map((line, l) => (
              <span key={line} className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
                {/* the trigger sits on the h2: a fully masked span never counts as "in view" */}
                <motion.span
                  className="inline-block"
                  variants={{ hidden: { y: "110%" }, show: { y: "0%", transition: { duration: 1.2, ease: EASE, delay: l * 0.12 } } }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </motion.h2>
          <motion.p
            className="mt-6 max-w-[42ch] text-[clamp(0.98rem,1.1vw,1.15rem)] leading-relaxed text-white/60"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.3 }}
          >
            {content.body}
          </motion.p>
        </div>

        <ul className="self-end border-b border-white/10">
          {content.perks.map((perk, i) => (
            <motion.li
              key={perk}
              className="flex items-center gap-4 border-t border-white/10 py-[clamp(0.95rem,1.8vw,1.35rem)]"
              initial={reduce ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -6% 0px" }}
              transition={{ duration: 1, ease: EASE, delay: i * 0.07 }}
            >
              <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-[linear-gradient(140deg,rgb(123_97_255/0.35),rgb(34_168_255/0.25))] ring-1 ring-white/15">
                <Check className="size-3.5 text-white" strokeWidth={2.4} />
              </span>
              <span className="text-[clamp(1rem,1.25vw,1.25rem)] text-white/85">{perk}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
