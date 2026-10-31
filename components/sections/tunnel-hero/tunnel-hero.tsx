"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { tunnelHeroContent, type TunnelHeroContent } from "./tunnel-hero.config";

type TunnelHeroProps = {
  content?: TunnelHeroContent;
  /** Pinned scroll length in vh (the fly-through distance) */
  length?: number;
  /** Optional background layer (e.g. the hero sphere) rendered behind the tunnel */
  background?: ReactNode;
  className?: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;
/** CSS perspective (px). Cards are hidden before they reach it. */
const P = 1000;
/** Depth of the furthest card and how far the camera travels */
const FAR = -2900;
const NEAR_START = -450;
const TRAVEL = 3800;
const GOLDEN = 137.508 * (Math.PI / 180);

type Slot = { x: number; y: number; z: number; ry: number; rx: number; rz: number };

/** Places cards around the corridor: golden-angle spiral (even spread), staggered depths. */
function layout(count: number, w: number, h: number): Slot[] {
  // phones: the corridor uses more of the narrow width so cards clear the headline
  const R = w < 768 ? w * 0.5 : Math.min(w * 0.3, h * 0.52, 470);
  return Array.from({ length: count }, (_, i) => {
    const a = i * GOLDEN + 0.6;
    const r = R * (0.82 + ((i * 7) % 5) * 0.09); // 0.82R .. 1.18R
    const t = count > 1 ? i / (count - 1) : 0;
    return {
      x: Math.cos(a) * r * 1.25, // corridor is wider than tall
      y: Math.sin(a) * r * 0.78,
      z: NEAR_START + (FAR - NEAR_START) * t,
      ry: -Math.cos(a) * 24, // turn to face the middle of the corridor
      rx: Math.sin(a) * 14,
      rz: (((i * 5) % 7) - 3) * 1.6,
    };
  });
}

/**
 * Perspective tunnel hero (after the 21st.dev "Perspective Tunnel Hero"):
 * a centred two line headline, and image cards that start as a small cluster deep in the distance
 * around it. Scrolling flies the camera forward through a 3D corridor: cards grow, spread out, pass
 * in front of the headline and leave past the screen edges. At the end the headline fades out.
 * One scroll listener writes transforms straight to the cards (no React re-renders), spring smoothed.
 */
export function TunnelHero({ content = tunnelHeroContent, length = 300, background, className }: TunnelHeroProps) {
  const reduce = useReducedMotionSafe();
  const section = useRef<HTMLElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const title = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const slots = useRef<Slot[]>([]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.5, restDelta: 0.0002 });

  const apply = (p: number): void => {
    const travel = reduce ? TRAVEL * 0.35 : p * TRAVEL;
    slots.current.forEach((s, i) => {
      const el = cards.current[i];
      if (!el) return;
      const z = s.z + travel;
      // fade in from the deep fog, fade out just before passing the camera
      const fadeIn = Math.min(1, Math.max(0, (z - (FAR - 300)) / 900));
      const fadeOut = Math.min(1, Math.max(0, (P * 0.78 - z) / 380));
      const o = Math.min(fadeIn, fadeOut);
      if (o <= 0.001) {
        el.style.visibility = "hidden";
        return;
      }
      el.style.visibility = "visible";
      el.style.opacity = o.toFixed(3);
      el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${s.ry.toFixed(2)}deg) rotateX(${s.rx.toFixed(2)}deg) rotateZ(${s.rz}deg)`;
    });
    if (title.current) {
      const k = Math.min(1, Math.max(0, (p - 0.78) / 0.2));
      title.current.style.opacity = (1 - k * 0.92).toFixed(3);
      title.current.style.transform = `translateZ(${(k * 120).toFixed(1)}px)`;
    }
    if (cue.current) cue.current.style.opacity = Math.max(0, 1 - p * 8).toFixed(3);
  };

  useLayoutEffect(() => {
    const measure = (): void => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const count = w < 768 ? Math.min(10, content.cards.length) : content.cards.length;
      slots.current = layout(count, w, h);
      cards.current.forEach((el, i) => {
        if (el) el.style.display = i < count ? "" : "none";
      });
      apply(progress.get());
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.cards.length, reduce]);

  useMotionValueEvent(progress, "change", apply);

  return (
    <section
      ref={section}
      aria-label={content.lines.join(" ")}
      className={cn("relative isolate bg-[#030712] text-white", className)}
      style={{ height: reduce ? "100svh" : `${length}vh` }}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {background}
        {/* soft corridor glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(42%_38%_at_50%_50%,rgb(91_124_255/0.14),transparent_70%)]" />

        <div className="absolute inset-0 [perspective:1000px] [perspective-origin:50%_50%]">
          <div className="absolute left-1/2 top-1/2 size-0 [transform-style:preserve-3d]">
            {/* cards */}
            {content.cards.map((card, i) => (
              <div
                key={`${card.label}-${i}`}
                ref={(n) => {
                  cards.current[i] = n;
                }}
                aria-hidden
                style={{ visibility: "hidden" }}
                className="absolute left-0 top-0 h-[clamp(8rem,16vw,17.5rem)] w-[clamp(6.5rem,13vw,14rem)] -translate-x-1/2 -translate-y-1/2 [backface-visibility:hidden] will-change-transform"
              >
                <div className="relative size-full overflow-hidden rounded-[14px] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.9),inset_0_0_0_1px_rgb(255_255_255/0.12)]">
                  {card.src ? (
                    <Image src={card.src} alt="" fill sizes="(min-width: 768px) 16vw, 30vw" className="object-cover" priority={i < 6} />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(90% 70% at 70% 20%, ${card.tint?.[1] ?? "#7b61ff"}cc, transparent 70%), linear-gradient(160deg, ${card.tint?.[0] ?? "#13223f"}, #05070f)`,
                      }}
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgb(0_0_0/0.55),transparent)]" />
                  <span className="absolute bottom-3 left-3 right-3 truncate font-mono text-[clamp(0.55rem,0.7vw,0.7rem)] font-semibold uppercase tracking-[0.14em] text-white/90">
                    {card.label}
                  </span>
                </div>
              </div>
            ))}

            {/* headline: sits in the same 3D space at depth 0, so near cards pass in front of it */}
            <div ref={title} className="absolute left-0 top-0 w-[min(92vw,72rem)] -translate-x-1/2 -translate-y-1/2 text-center [transform-style:preserve-3d]">
              <div>
                <motion.p
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: EASE, delay: 0.15 }}
                  className="mb-[clamp(0.75rem,2svh,1.25rem)] font-mono text-[clamp(0.62rem,0.8vw,0.75rem)] font-medium uppercase tracking-[0.42em] text-[#9d8cff]"
                >
                  {content.eyebrow}
                </motion.p>
                <h1 className="font-footer-display text-[clamp(2.4rem,min(6.4vw,11svh),6.75rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
                  {content.lines.map((line, l) => (
                    <span key={line} className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
                      <motion.span
                        className="inline-block bg-[linear-gradient(180deg,#ffffff_30%,#a9adc4_100%)] bg-clip-text text-transparent"
                        initial={reduce ? false : { y: "110%" }}
                        animate={{ y: "0%" }}
                        transition={{ duration: 1.2, ease: EASE, delay: 0.25 + l * 0.12 }}
                      >
                        {line}
                      </motion.span>
                    </span>
                  ))}
                </h1>
                <motion.p
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.6 }}
                  className="mx-auto mt-[clamp(0.9rem,2.4svh,1.6rem)] max-w-[44ch] text-balance text-[clamp(0.92rem,1.05vw,1.1rem)] leading-relaxed text-white/60"
                >
                  {content.sub}
                </motion.p>
              </div>
            </div>
          </div>
        </div>

        {/* scroll cue */}
        <div ref={cue} className="pointer-events-none absolute inset-x-0 bottom-[clamp(1.25rem,4svh,2.5rem)] flex flex-col items-center gap-2">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="font-mono text-[0.62rem] uppercase tracking-[0.42em] text-white/45"
          >
            {content.cue}
          </motion.span>
          <span className="relative h-8 w-px overflow-hidden bg-white/10">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[tunnel-cue_1.8s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-[#9d8cff]" />
          </span>
        </div>
      </div>
      <style>{`@keyframes tunnel-cue{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}`}</style>
    </section>
  );
}
