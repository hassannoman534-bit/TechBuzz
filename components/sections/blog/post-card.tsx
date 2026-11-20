"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { useFinePointer } from "@/lib/use-fine-pointer";
import type { BlogPost } from "@/lib/wp";
import { BLOG_COPY, BLOG_GRID, BLOG_MOTION } from "./blog.config";

type PostCardProps = {
  post: BlogPost;
  index: number;
  /** Wide cards open each run of the magazine rhythm. See BLOG_GRID.rhythm. */
  wide?: boolean;
  /** Null when nothing is hovered. Set by the grid, fine pointers only. */
  hovered: number | null;
  onHover: (index: number | null) => void;
};

const SPRING = { stiffness: 150, damping: 18, mass: 0.6 } as const;

export function PostCard({
  post,
  index,
  wide = false,
  hovered,
  onHover,
}: PostCardProps) {
  const reduce = useReducedMotionSafe();
  const fine = useFinePointer();
  const interactive = !reduce && fine;

  const ref = useRef<HTMLElement>(null);

  // Pointer state lives in motion values, so moving the mouse across a grid of
  // twelve cards costs no React renders at all.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  // The raw targets are what the pointer writes to; the springs are what the
  // transform reads, so the tilt settles instead of snapping.
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const tiltX = useSpring(rawX, SPRING);
  const tiltY = useSpring(rawY, SPRING);

  const spotlight = useMotionTemplate`radial-gradient(${BLOG_MOTION.rimRadiusPx}px circle at ${px}px ${py}px, rgba(123,97,255,0.18), rgba(34,216,255,0.07) 38%, transparent 68%)`;
  const transform = useMotionTemplate`perspective(1100px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

  const onPointerMove = (e: React.PointerEvent) => {
    if (!interactive) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    px.set(x);
    py.set(y);
    rawX.set(-(y / r.height - 0.5) * 2 * BLOG_MOTION.tiltDeg);
    rawY.set((x / r.width - 0.5) * 2 * BLOG_MOTION.tiltDeg);
  };

  const reset = () => {
    rawX.set(0);
    rawY.set(0);
    onHover(null);
  };

  const dimmed = interactive && hovered !== null && hovered !== index;
  const delay = Math.min(index, BLOG_MOTION.staggerCap) * BLOG_MOTION.stagger;

  return (
    <motion.article
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: BLOG_MOTION.cardDuration,
        ease: BLOG_MOTION.ease,
        delay,
      }}
      onPointerMove={onPointerMove}
      onPointerEnter={() => onHover(index)}
      onPointerLeave={reset}
      style={{
        opacity: dimmed ? BLOG_MOTION.dimOpacity : undefined,
        transition: "opacity 0.4s cubic-bezier(0.22,1,0.36,1)",
      }}
      className="group relative h-full"
    >
      <motion.div
        style={interactive ? { transform } : undefined}
        className="h-full will-change-transform"
      >
        <Link
          href={`/blog/${post.slug}`}
          className={cn(
            "relative flex h-full overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/[0.025]",
            "shadow-[inset_0_1px_0_0_rgb(255_255_255/0.07)] outline-none",
            "transition-colors duration-500 hover:border-white/22",
            "focus-visible:border-[#7b61ff] focus-visible:ring-2 focus-visible:ring-[#7b61ff]/45",
            wide ? "flex-col sm:flex-row" : "flex-col",
          )}
        >
          {/* Cursor-tracked wash. Painted above the card surface and below the
              content, so text never dims with it. */}
          {interactive ? (
            <motion.span
              aria-hidden
              style={{ background: spotlight }}
              className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          ) : null}

          <div
            className={cn(
              "relative shrink-0 overflow-hidden bg-[#070b16]",
              wide ? "w-full sm:w-[46%]" : "w-full",
            )}
            style={{
              aspectRatio: wide
                ? BLOG_GRID.wideImageAspect
                : BLOG_GRID.cardImageAspect,
            }}
          >
            {post.image ? (
              <Image
                src={post.image.url}
                alt={post.image.alt}
                fill
                sizes={
                  wide
                    ? "(min-width: 1280px) 46vw, (min-width: 640px) 50vw, 92vw"
                    : "(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 92vw"
                }
                className={cn(
                  "object-cover transform-gpu transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                  !reduce && "group-hover:scale-[1.07]",
                )}
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(150deg,#16254a,#05070f)]" />
            )}

            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(3,7,18,0.9) 0%, rgba(3,7,18,0.12) 46%, rgba(3,7,18,0) 100%)",
              }}
            />
          </div>

          <div
            className={cn(
              "relative z-[2] flex flex-1 flex-col gap-3",
              wide ? "p-6 sm:p-7" : "p-5",
            )}
          >
            <p className="font-footer-text flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-[#c9c2ff]/70">
              <span className="truncate">{post.categoryNames[0] ?? "Insight"}</span>
              <span className="text-white/20">/</span>
              <span className="shrink-0 text-white/40">{post.readMinutes} min</span>
            </p>

            <h3 className="text-balance">
              <span
                className={cn(
                  "font-footer-display font-semibold leading-[1.18] text-white transition-colors duration-300 group-hover:text-[#c9c2ff]",
                  wide ? "text-[clamp(1.2rem,1.9vw,1.6rem)]" : "text-[1.06rem]",
                )}
              >
                {post.title}
              </span>
            </h3>

            {post.excerpt ? (
              <p
                className={cn(
                  "font-footer-text text-[0.88rem] leading-relaxed text-white/55",
                  wide ? "line-clamp-3" : "line-clamp-2",
                )}
              >
                {post.excerpt}
              </p>
            ) : null}

            <div className="mt-auto flex items-end justify-between gap-4 pt-3">
              <p className="font-footer-text text-[0.72rem] text-white/40">
                {post.author ? `${post.author} / ` : ""}
                {post.dateLabel}
              </p>

              <span
                aria-hidden
                className="font-footer-text flex items-center gap-1 text-[0.72rem] text-white/0 transition-all duration-300 group-hover:text-[#7ce9ff]"
              >
                {BLOG_COPY.readMore}
                <ArrowUpRight className="size-3.5" strokeWidth={2} />
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.article>
  );
}
