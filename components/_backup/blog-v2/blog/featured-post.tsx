"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFinePointer } from "@/lib/use-fine-pointer";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import type { BlogPost } from "@/lib/wp";
import { BLOG_COPY, BLOG_GRID, BLOG_MOTION } from "./blog.config";

type FeaturedPostProps = { post: BlogPost };

/**
 * The newest post, with a rim glow that tracks the pointer.
 *
 * The glow is a motion template on a child layer, not React state, so a
 * pointermove never re-renders this component. The layer is inset-0 and would
 * otherwise eat every click on the card, hence pointer-events-none on it.
 */
export function FeaturedPost({ post }: FeaturedPostProps) {
  const reduce = useReducedMotionSafe();
  const fine = useFinePointer();
  const box = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(-9999);
  const my = useMotionValue(-9999);

  const glow = useMotionTemplate`radial-gradient(${BLOG_MOTION.rimRadiusPx}px circle at ${mx}px ${my}px, rgb(123 97 255 / 0.22), transparent 70%)`;

  const track = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (!fine || reduce) return;
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  const leave = (): void => {
    mx.set(-9999);
    my.set(-9999);
  };

  return (
    <motion.div
      ref={box}
      onPointerMove={track}
      onPointerLeave={leave}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: BLOG_MOTION.ease }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_0_rgb(255_255_255/0.07)]"
    >
      {fine && !reduce ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: glow }}
        />
      ) : null}

      <Link
        href={`/blog/${post.slug}`}
        className="relative z-20 grid gap-0 outline-none md:grid-cols-2 focus-visible:ring-2 focus-visible:ring-[#7b61ff]/40"
      >
        <div
          className="relative w-full overflow-hidden bg-[#070b16]"
          style={{ minHeight: BLOG_GRID.featuredMinHeightPx }}
        >
          {post.image ? (
            <Image
              src={post.image.url}
              alt={post.image.alt}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 92vw"
              className={cn(
                "object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu",
                !reduce && "group-hover:scale-[1.04]",
              )}
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(150deg,#251d5c,#05070f)]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgb(3_7_18/0.35))]" />
        </div>

        <div className="flex flex-col justify-center gap-4 p-6 md:p-9">
          <p className="font-footer-text truncate text-[0.7rem] uppercase tracking-[0.2em] text-[#7ce9ff]/80">
            {BLOG_COPY.featuredTag}
            <span className="px-2 text-white/25">/</span>
            {post.categoryNames[0] ?? "Insight"}
            <span className="px-2 text-white/25">/</span>
            {post.readMinutes} min read
          </p>

          <h2 className="text-balance">
            <span className="font-footer-display text-[clamp(1.4rem,2.4vw,2.1rem)] font-semibold leading-[1.15] text-white">
              {post.title}
            </span>
          </h2>

          {post.excerpt ? (
            <p className="font-footer-text max-w-[52ch] text-[0.95rem] leading-relaxed text-white/60">
              {post.excerpt}
            </p>
          ) : null}

          <p className="font-footer-text text-[0.75rem] text-white/40">
            {post.author ? `${post.author} / ` : ""}
            {post.dateLabel}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
