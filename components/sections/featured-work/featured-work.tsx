"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform, useVelocity, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { WorkCard } from "./work-card";
import { featuredWork, type FeaturedWorkContent } from "./featured-work.config";

type FeaturedWorkProps = { content?: FeaturedWorkContent; className?: string };

/** Velocity (px/s) at which the jelly effects reach their maximum */
const V_MAX = 3200;
const MAX_SKEW = 2; // deg, whole grid
const MAX_STRETCH = 0.035; // +3.5% scaleY per card
const MAX_BLUR = 3; // px, images only
const VELOCITY_SPRING = { stiffness: 380, damping: 52, mass: 0.6 };

/** True on devices with a real hover pointer (desktop). Read after mount, so SSR always matches. */
function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = (): void => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return fine;
}

/**
 * Lusion-style Featured Work, DOM only.
 * Scroll velocity drives a skew of the whole grid, a vertical stretch of each card and
 * a motion blur on the images; all three spring back to rest when scrolling stops.
 * Cards tilt toward the cursor and their images parallax inside the frame.
 */
export function FeaturedWork({ content = featuredWork, className }: FeaturedWorkProps) {
  const reduce = useReducedMotionSafe();
  const fine = useFinePointer();
  const rich = !reduce;

  const { scrollY } = useScroll();
  const rawVelocity = useVelocity(scrollY);
  const velocity = useSpring(rawVelocity, VELOCITY_SPRING);
  const still = useMotionValue(0);
  const v: MotionValue<number> = rich ? velocity : still;

  const skewY = useTransform(v, [-V_MAX, 0, V_MAX], [MAX_SKEW, 0, -MAX_SKEW]);
  const stretch = useTransform(v, (val) => 1 + Math.min(Math.abs(val) / V_MAX, 1) * MAX_STRETCH);
  // Blur only on desktop (mobile GPUs pay a lot for it) and dropped entirely near rest.
  const blur = useTransform(v, (val) => {
    if (!fine) return "none";
    const b = Math.min(Math.abs(val) / V_MAX, 1) * MAX_BLUR;
    return b < 0.2 ? "none" : `blur(${b.toFixed(2)}px)`;
  });

  return (
    <section
      id="work"
      aria-labelledby="featured-work-heading"
      className={cn("relative bg-[#030712] px-[clamp(1.25rem,4vw,4rem)] pt-[clamp(5rem,12vh,9rem)] pb-[clamp(6rem,14vh,11rem)] text-white", className)}
    >
      {/* Header: one centred heading */}
      <h2
        id="featured-work-heading"
        className="mb-[clamp(3rem,8vh,6rem)] overflow-hidden pb-[0.08em] text-center font-footer-display text-[clamp(3rem,8.5vw,8.5rem)] font-bold leading-[0.9] tracking-[-0.045em]"
      >
        <motion.span
          className="inline-block"
          initial={rich ? { y: "105%" } : false}
          whileInView={{ y: "0%" }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ willChange: "transform" }}
        >
          {content.heading}
        </motion.span>
      </h2>

      {/* Grid: skews as a whole with scroll velocity */}
      <motion.div
        style={{ skewY, willChange: "transform" }}
        className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-x-10 md:gap-y-20"
      >
        {content.items.map((item, i) => (
          <WorkCard key={item.title} item={item} index={i} stretch={stretch} blur={blur} rich={rich} tilt={rich && fine} />
        ))}
      </motion.div>
    </section>
  );
}
