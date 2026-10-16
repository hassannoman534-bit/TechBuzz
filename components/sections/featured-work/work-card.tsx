"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type CSSProperties, type PointerEvent } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { WorkItem } from "./featured-work.config";

type WorkCardProps = {
  item: WorkItem;
  index: number;
  /** Shared, spring-smoothed scroll velocity effects from the section */
  stretch: MotionValue<number>;
  blur: MotionValue<string>;
  /** False for reduced motion / touch: disables tilt, parallax and blur */
  rich: boolean;
  tilt: boolean;
};

const GPU: CSSProperties = { willChange: "transform" };
const MAX_TILT = 6; // degrees
const TILT_SPRING = { stiffness: 160, damping: 20, mass: 0.5 };
const PARALLAX_SPRING = { stiffness: 120, damping: 26, mass: 0.4 };

/**
 * One cinematic project card.
 * Layers (outside in): reveal wrapper → velocity stretch → 3D tilt → image window
 * (rounded, clips) → parallax layer (taller than the window, moves on scroll) → image.
 * Every animated value is a spring and every animated property is transform or filter.
 */
export function WorkCard({ item, index, stretch, blur, rich, tilt }: WorkCardProps) {
  const ref = useRef<HTMLElement>(null);
  const rect = useRef<DOMRect | null>(null);

  // 3D tilt: normalised pointer position (-0.5 → 0.5), smoothed.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, TILT_SPRING);
  const sy = useSpring(py, TILT_SPRING);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-MAX_TILT, MAX_TILT]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [MAX_TILT, -MAX_TILT]);
  // Glare follows the pointer (a moved layer, never a repainted gradient).
  const glareX = useTransform(sx, [-0.5, 0.5], ["-30%", "30%"]);
  const glareY = useTransform(sy, [-0.5, 0.5], ["-30%", "30%"]);

  // Inner parallax: the image travels against the card while it crosses the viewport.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const smoothProgress = useSpring(scrollYProgress, PARALLAX_SPRING);
  const parallaxY = useTransform(smoothProgress, [0, 1], rich ? ["-9%", "9%"] : ["0%", "0%"]);

  const onEnter = (e: PointerEvent<HTMLAnchorElement>): void => {
    if (!tilt || e.pointerType !== "mouse") return;
    rect.current = e.currentTarget.getBoundingClientRect();
  };
  const onMove = (e: PointerEvent<HTMLAnchorElement>): void => {
    if (!tilt || e.pointerType !== "mouse") return;
    const r = rect.current ?? e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = (): void => {
    rect.current = null;
    px.set(0);
    py.set(0);
  };

  return (
    <motion.article
      ref={ref}
      initial={rich ? { opacity: 0, y: 70 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: (index % 2) * 0.12 }}
      style={GPU}
    >
      <Link
        href={item.href}
        onPointerEnter={onEnter}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="group block rounded-2xl outline-none [perspective:1400px] focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-4 focus-visible:ring-offset-[#030712]"
      >
        {/* Velocity stretch ("jelly"), anchored at the top so the card drags behind the scroll */}
        <motion.div style={{ ...GPU, scaleY: stretch, originY: 0 }}>
          {/* 3D tilt */}
          <motion.div style={{ ...GPU, rotateX, rotateY, transformPerspective: 1400 }} className="[transform-style:preserve-3d]">
            {/* IMAGE WINDOW. The image slot lives inside the parallax layer below. */}
            <div className="relative w-full aspect-[4/3] md:aspect-video overflow-hidden rounded-2xl bg-white/5 border border-white/10 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9)] [isolation:isolate]">
              {/* Parallax layer: 118% tall so the moving image never reveals an edge */}
              <motion.div
                style={{ ...GPU, y: parallaxY, filter: rich ? blur : "none" }}
                className="absolute inset-x-0 -top-[9%] h-[118%]"
              >
                <div className="relative size-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]" style={GPU}>
                  {item.image ? (
                    <Image
                      src={item.image.src}
                      alt={item.image.alt}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                      priority={index < 2}
                    />
                  ) : (
                    /* ↓↓ EMPTY IMAGE PLACEHOLDER: set `image` in featured-work.config.ts to fill it ↓↓ */
                    <div
                      aria-hidden
                      data-image-placeholder
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(80% 70% at 30% 20%, rgb(${item.tint} / 0.16), transparent 60%), radial-gradient(70% 60% at 85% 90%, rgb(${item.tint} / 0.08), transparent 65%)`,
                      }}
                    />
                  )}
                </div>
              </motion.div>

              {/* Glare: soft light that follows the tilt */}
              <motion.div
                aria-hidden
                style={{ ...GPU, x: glareX, y: glareY }}
                className="pointer-events-none absolute -inset-1/4 opacity-0 transition-opacity duration-700 group-hover:opacity-100 bg-[radial-gradient(40%_40%_at_50%_50%,rgb(255_255_255/0.10),transparent_70%)]"
              />
              {/* Inner rim for a glassy edge */}
              <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgb(255_255_255/0.08),inset_0_0_0_1px_rgb(255_255_255/0.03)]" />
            </div>
          </motion.div>
        </motion.div>

        {/* Meta */}
        <div className="mt-5 md:mt-6">
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-white/45">{item.tags.join("  •  ")}</p>
          <h3 className="relative mt-2 overflow-hidden text-[clamp(1.6rem,2.6vw,2.4rem)] font-medium leading-[1.1] tracking-[-0.03em] text-white">
            <ArrowRight
              aria-hidden
              className="absolute left-0 top-1/2 size-[0.85em] -translate-x-full -translate-y-1/2 opacity-0 transition-[translate,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
              strokeWidth={1.75}
            />
            <span className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[1.15em] group-focus-visible:translate-x-[1.15em]">
              {item.title}
            </span>
          </h3>
        </div>
      </Link>
    </motion.article>
  );
}
