"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { BLOG_COPY, BLOG_MOTION } from "./blog.config";

/** Closing CTA at the foot of an article. */
export function BlogCta() {
  const reduce = useReducedMotionSafe();

  return (
    <motion.aside
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: BLOG_MOTION.ease }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.07)] md:p-9"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_15%_0%,rgb(123_97_255/0.16),transparent_70%)]"
      />
      <div className="relative flex flex-col gap-4">
        <h2 className="text-balance">
          <span className="font-footer-display text-[clamp(1.25rem,2vw,1.7rem)] font-semibold leading-tight text-white">
            {BLOG_COPY.ctaTitle}
          </span>
        </h2>
        <p className="font-footer-text max-w-[46ch] text-[0.95rem] leading-relaxed text-white/60">
          {BLOG_COPY.ctaSub}
        </p>
        <Link
          href={BLOG_COPY.ctaHref}
          className="font-footer-text mt-1 inline-flex w-fit items-center rounded-full border border-white/20 bg-white/[0.06] px-6 py-3 text-white outline-none transition-colors duration-300 hover:border-[#7b61ff] hover:bg-[#7b61ff]/15 focus-visible:ring-2 focus-visible:ring-[#7b61ff]/50"
          style={{ fontSize: "0.88rem" }}
        >
          {BLOG_COPY.ctaAction}
        </Link>
      </div>
    </motion.aside>
  );
}
