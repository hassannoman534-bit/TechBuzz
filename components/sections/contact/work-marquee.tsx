"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";

type WorkMarqueeProps = { text: string; href: string };

const BASE = 2.2; // % of one copy per second
const COPIES = 4;

const wrap = (min: number, max: number, v: number): number => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

/**
 * A slow, endless line set very large, alternating solid and outlined. It drifts on its own,
 * speeds up with scroll velocity and turns with the scroll direction; hovering slows it to a
 * crawl. One motion value drives the transform, nothing re-renders. Static for reduced motion.
 * The whole band is a link to the form.
 */
export function WorkMarquee({ text, href }: WorkMarqueeProps) {
  const reduce = useReducedMotionSafe();
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const vel = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(vel, [-2000, 0, 2000], [-5, 0, 5], { clamp: false });
  const dir = useRef(1);
  const slow = useRef(1);
  const slowTarget = useRef(1);
  const x = useTransform(base, (v) => `${wrap(-100 / COPIES, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    slow.current += (slowTarget.current - slow.current) * 0.06;
    const b = boost.get();
    if (b < 0) dir.current = -1;
    else if (b > 0) dir.current = 1;
    const move = dir.current * BASE * (delta / 1000) * (1 + Math.abs(b)) * slow.current;
    base.set(base.get() - move / COPIES);
  });

  const items = Array.from({ length: COPIES * 2 }, (_, i) => i);

  return (
    <a
      href={href}
      aria-label={text}
      onPointerEnter={() => (slowTarget.current = 0.18)}
      onPointerLeave={() => (slowTarget.current = 1)}
      className="group/mq relative block overflow-hidden py-[clamp(2.5rem,8svh,5rem)] outline-none focus-visible:ring-1 focus-visible:ring-[#7ce9ff]/50"
      style={{
        maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
      }}
    >
      <motion.div aria-hidden style={{ x: reduce ? "0%" : x }} className="flex w-max whitespace-nowrap will-change-transform">
        {items.map((i) => (
          <span key={i} className="flex items-center">
            <span
              className={
                i % 2 === 0
                  ? "font-footer-display text-[clamp(3.5rem,11vw,10rem)] font-medium leading-none tracking-[-0.05em] text-white/90 transition-colors duration-700 group-hover/mq:text-white"
                  : "font-footer-display text-[clamp(3.5rem,11vw,10rem)] font-medium leading-none tracking-[-0.05em] text-transparent [-webkit-text-stroke:1px_rgb(201_194_255/0.45)] transition-[-webkit-text-stroke-color] duration-700 group-hover/mq:[-webkit-text-stroke:1px_rgb(124_233_255/0.9)]"
              }
            >
              {text}
            </span>
            <span className="mx-[clamp(1.5rem,4vw,4rem)] inline-block size-[clamp(0.9rem,1.6vw,1.5rem)] rounded-full bg-[linear-gradient(140deg,#7b61ff,#5b7cff_60%,#22a8ff)] transition-transform duration-700 group-hover/mq:scale-125" />
          </span>
        ))}
      </motion.div>
    </a>
  );
}
