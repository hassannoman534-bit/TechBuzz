"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import type { BlogPost } from "@/lib/wp";
import { BLOG_GRID, BLOG_MOTION } from "./blog.config";

type PostCardProps = {
  post: BlogPost;
  index: number;
  /** Null when nothing is hovered. Set by the grid, fine pointers only. */
  hovered: number | null;
  onHover: (index: number | null) => void;
  /** True for the first row, which is above the fold. */
  eager?: boolean;
};

export function PostCard({
  post,
  index,
  hovered,
  onHover,
  eager = false,
}: PostCardProps) {
  const reduce = useReducedMotionSafe();
  const dimmed = hovered !== null && hovered !== index;
  const delay =
    Math.min(index, BLOG_MOTION.staggerCap) * BLOG_MOTION.stagger;

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: BLOG_MOTION.cardDuration,
        ease: BLOG_MOTION.ease,
        delay,
      }}
      onHoverStart={() => onHover(index)}
      onHoverEnd={() => onHover(null)}
      style={{
        opacity: dimmed && !reduce ? BLOG_MOTION.dimOpacity : undefined,
        transition: "opacity 0.35s cubic-bezier(0.22,1,0.36,1)",
      }}
      className="group relative"
    >
      <Link
        href={`/blog/${post.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-[inset_0_1px_0_0_rgb(255_255_255/0.06)] outline-none transition-colors duration-300 hover:border-white/20 focus-visible:border-[#7b61ff] focus-visible:ring-2 focus-visible:ring-[#7b61ff]/40"
      >
        <div
          className="relative w-full overflow-hidden bg-[#070b16]"
          style={{ aspectRatio: BLOG_GRID.cardImageAspect }}
        >
          {post.image ? (
            <Image
              src={post.image.url}
              alt={post.image.alt}
              fill
              sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 92vw"
              loading={eager ? "eager" : "lazy"}
              className={cn(
                "object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu",
                !reduce && "group-hover:scale-[1.06]",
              )}
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(150deg,#13223f,#05070f)]" />
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,rgb(3_7_18/0.85),transparent)]" />
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <p className="font-footer-text truncate text-[0.7rem] uppercase tracking-[0.18em] text-[#c9c2ff]/70">
            {post.categoryNames[0] ?? "Insight"}
            <span className="px-2 text-white/25">/</span>
            {post.readMinutes} min read
          </p>

          <h3 className="text-balance">
            <span className="font-footer-display text-[1.05rem] font-semibold leading-snug text-white transition-colors duration-300 group-hover:text-[#c9c2ff]">
              {post.title}
            </span>
          </h3>

          {post.excerpt ? (
            <p className="font-footer-text line-clamp-3 text-[0.88rem] leading-relaxed text-white/55">
              {post.excerpt}
            </p>
          ) : null}

          <p className="font-footer-text mt-auto pt-2 text-[0.72rem] text-white/40">
            {post.author ? `${post.author} / ` : ""}
            {post.dateLabel}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
