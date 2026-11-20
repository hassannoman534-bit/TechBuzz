"use client";

import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { BlogFieldMount } from "./blog-field-mount";
import { BLOG_COPY, BLOG_MOTION } from "./blog.config";

type BlogMastheadProps = {
  /** Total posts in the archive. Omitted while the CMS is unreachable. */
  total: number;
  /** Topics shown in the filter bar. */
  topics: number;
};

/**
 * The blog's own masthead rather than the shared PageHero, because this one
 * carries the WebGL field and a live count of the archive. It also keeps the
 * heading in a single element: PageHero renders its title text twice, which
 * makes screen readers announce every page title twice.
 */
export function BlogMasthead({ total, topics }: BlogMastheadProps) {
  const reduce = useReducedMotionSafe();

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.85, ease: BLOG_MOTION.ease, delay },
        };

  return (
    <header className="relative isolate flex min-h-[clamp(30rem,74vh,46rem)] items-end overflow-hidden">
      <BlogFieldMount />

      <div className="relative z-10 w-full px-[clamp(1.25rem,6vw,8rem)] pb-[clamp(3rem,8vh,6rem)] pt-[clamp(8rem,18vh,12rem)]">
        <div className="mx-auto w-full max-w-[82rem]">
          <motion.p
            {...rise(0)}
            className="font-footer-text text-[0.7rem] uppercase tracking-[0.34em] text-[#7ce9ff]/75"
          >
            {BLOG_COPY.eyebrow}
          </motion.p>

          <motion.h1
            {...rise(0.08)}
            className="mt-6 max-w-[16ch] text-balance font-semibold leading-[0.94] tracking-[-0.03em] text-white"
            style={{ fontSize: "clamp(2.75rem, 8.5vw, 7rem)" }}
          >
            {BLOG_COPY.title}
          </motion.h1>

          <motion.div
            {...rise(0.16)}
            className="mt-9 flex flex-col gap-7 border-t border-white/10 pt-7 lg:flex-row lg:items-end lg:justify-between lg:gap-16"
          >
            <p className="font-footer-text max-w-[52ch] text-[clamp(0.95rem,1.25vw,1.1rem)] leading-relaxed text-white/60">
              {BLOG_COPY.sub}
            </p>

            {total > 0 ? (
              <dl className="flex shrink-0 gap-10">
                <Stat value={String(total)} label="Articles" />
                <Stat value={String(topics)} label="Topics" />
              </dl>
            ) : null}
          </motion.div>
        </div>
      </div>
    </header>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd>
        <span
          className="font-footer-display block font-semibold leading-none text-white"
          style={{ fontSize: "clamp(1.75rem,3vw,2.5rem)" }}
        >
          {value}
        </span>
        <span className="font-footer-text mt-2 block text-[0.68rem] uppercase tracking-[0.22em] text-white/40">
          {label}
        </span>
      </dd>
    </div>
  );
}
