"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { useFinePointer } from "@/lib/use-fine-pointer";
import type { BlogPost } from "@/lib/wp";
import { BLOG_COPY, BLOG_GRID, BLOG_MOTION } from "./blog.config";

type FeaturedPostProps = { post: BlogPost };

/**
 * The newest post, given the width it deserves. Asymmetric 7/5 split rather
 * than a halved row, so it reads as a lead feature and not as an oversized
 * grid card.
 */
export function FeaturedPost({ post }: FeaturedPostProps) {
  const reduce = useReducedMotionSafe();
  const fine = useFinePointer();
  const interactive = !reduce && fine;

  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(-9999);
  const py = useMotionValue(-9999);

  // A rim that follows the cursor around the border of the panel.
  const rim = useMotionTemplate`radial-gradient(${BLOG_MOTION.rimRadiusPx}px circle at ${px}px ${py}px, rgba(167,139,250,0.55), rgba(34,216,255,0.18) 42%, transparent 70%)`;

  const onPointerMove = (e: React.PointerEvent) => {
    if (!interactive) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set(e.clientX - r.left);
    py.set(e.clientY - r.top);
  };

  const onLeave = () => {
    px.set(-9999);
    py.set(-9999);
  };

  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: BLOG_MOTION.ease }}
      onPointerMove={onPointerMove}
      onPointerLeave={onLeave}
      className="group relative"
    >
      {/* The rim is a gradient layer behind the panel, revealed only through
          a one pixel inset. Cheaper and sharper than animating a box-shadow. */}
      {interactive ? (
        <motion.span
          aria-hidden
          style={{ background: rim }}
          className="pointer-events-none absolute -inset-px rounded-[1.75rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      ) : null}

      <Link
        href={`/blog/${post.slug}`}
        className="relative grid overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#070b16] shadow-[inset_0_1px_0_0_rgb(255_255_255/0.07)] outline-none transition-colors duration-500 hover:border-white/20 focus-visible:border-[#7b61ff] focus-visible:ring-2 focus-visible:ring-[#7b61ff]/45 lg:grid-cols-12"
      >
        <div
          className="relative overflow-hidden lg:col-span-7"
          style={{ minHeight: BLOG_GRID.featuredMinHeightPx }}
        >
          {post.image ? (
            <Image
              src={post.image.url}
              alt={post.image.alt}
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className={
                reduce
                  ? "object-cover"
                  : "object-cover transform-gpu transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
              }
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(145deg,#1b2b55,#05070f)]" />
          )}

          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(3,7,18,0) 55%, rgba(7,11,22,0.95) 100%)",
            }}
          />

          <span className="font-footer-text absolute left-5 top-5 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[0.62rem] uppercase tracking-[0.22em] text-[#7ce9ff]">
            {BLOG_COPY.featuredTag}
          </span>
        </div>

        <div className="flex flex-col justify-center gap-5 p-[clamp(1.5rem,3.2vw,3rem)] lg:col-span-5">
          <p className="font-footer-text flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-[#c9c2ff]/75">
            <span className="truncate">{post.categoryNames[0] ?? "Insight"}</span>
            <span className="text-white/20">/</span>
            <span className="shrink-0 text-white/45">{post.readMinutes} min read</span>
          </p>

          <h2 className="text-balance">
            <span
              className="font-footer-display font-semibold leading-[1.08] tracking-[-0.015em] text-white"
              style={{ fontSize: "clamp(1.6rem,3vw,2.5rem)" }}
            >
              {post.title}
            </span>
          </h2>

          {post.excerpt ? (
            <p className="font-footer-text max-w-[46ch] text-[0.95rem] leading-relaxed text-white/60">
              {post.excerpt}
            </p>
          ) : null}

          <div className="mt-2 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
            <p className="font-footer-text text-[0.74rem] text-white/45">
              {post.author ? `${post.author} / ` : ""}
              {post.dateLabel}
            </p>
            <span
              aria-hidden
              className="font-footer-text flex items-center gap-1.5 text-[0.78rem] text-white/70 transition-colors duration-300 group-hover:text-[#7ce9ff]"
            >
              {BLOG_COPY.readMore}
              <ArrowUpRight
                className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
