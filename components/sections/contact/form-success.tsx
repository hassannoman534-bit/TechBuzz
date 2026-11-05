"use client";

import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";

type FormSuccessProps = { heading: string; body: string; again: string; onAgain: () => void };

const EASE = [0.22, 1, 0.36, 1] as const;

/** Success: a ring and a check draw themselves, then the words rise. */
export function FormSuccess({ heading, body, again, onAgain }: FormSuccessProps) {
  const reduce = useReducedMotionSafe();
  const draw = (delay: number) =>
    reduce ? { initial: false as const } : { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: 0.9, ease: EASE, delay } };

  return (
    <div role="status" className="flex min-h-[26rem] flex-col items-start justify-center gap-6 py-6">
      <svg viewBox="0 0 64 64" className="size-16" aria-hidden>
        <defs>
          <linearGradient id="contact-ok" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7b61ff" />
            <stop offset="1" stopColor="#22d8ff" />
          </linearGradient>
        </defs>
        <motion.circle cx="32" cy="32" r="29" fill="none" stroke="url(#contact-ok)" strokeWidth="2" {...draw(0.05)} />
        <motion.path d="M20 33 l8 8 l16 -18" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" {...draw(0.5)} />
      </svg>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.7 }}
      >
        <h3 className="text-white">
          <span className="font-footer-display text-[clamp(2rem,3.4vw,3rem)] font-medium tracking-[-0.03em]">{heading}</span>
        </h3>
        <p className="mt-2 max-w-[36ch] text-[1.05rem] leading-[1.5] text-white/75">{body}</p>
      </motion.div>
      <motion.button
        type="button"
        onClick={onAgain}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        whileTap={{ scale: 0.97 }}
        className="rounded-full px-6 py-3 text-[0.95rem] text-white ring-1 ring-white/20 transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ce9ff]"
      >
        {again}
      </motion.button>
    </div>
  );
}
