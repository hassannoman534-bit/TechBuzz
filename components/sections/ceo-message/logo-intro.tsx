"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { ceoMessage, EASE } from "./ceo-message.config";

type LogoIntroProps = {
  /** Called once the hold is over, so the parent can unmount this through AnimatePresence. */
  onDone: () => void;
};

const { intro } = ceoMessage;

/**
 * Phase 1. A full screen opening over the page while the logo settles.
 *
 * Scroll is locked for the hold: Lenis is stopped and `document.body` gets
 * `overflow: hidden`. The lock is on body and never on <html>, because <html>
 * is h-full on this site and overflow:hidden there turns it into its own scroll
 * container, which breaks every sticky section on the page.
 *
 * The overlay is `fixed` and is never placed inside a transformed parent, so it
 * is not clipped by the `overflow-x-clip` wrapper in the layout.
 */
export function LogoIntro({ onDone }: LogoIntroProps): React.ReactElement {
  const reduce = useReducedMotionSafe();
  const lenis = useLenis();
  const hold = reduce ? intro.reducedHoldMs : intro.holdMs;

  // Hold, then hand control back to the parent.
  useEffect(() => {
    const id = window.setTimeout(onDone, hold);
    return () => window.clearTimeout(id);
  }, [hold, onDone]);

  // Lock scroll for the duration and start the page from the top.
  useEffect(() => {
    const body = document.body;
    const previous = body.style.overflow;
    body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    lenis?.stop();
    lenis?.scrollTo(0, { immediate: true });

    return () => {
      body.style.overflow = previous;
      lenis?.start();
      // The page was measured while the body was locked, so the scroll driven
      // sections below need a fresh measurement before they are scrolled.
      lenis?.resize();
      window.dispatchEvent(new Event("resize"));
    };
  }, [lenis]);

  return (
    <motion.div
      key="ceo-logo-intro"
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#030712]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0.3 : 0.7, ease: EASE }}
    >
      {/* Ambient violet bloom behind the plate. Opacity only, no blur filter. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(123,97,255,0.20) 0%, rgba(91,124,255,0.08) 45%, rgba(3,7,18,0) 70%)",
        }}
        initial={{ opacity: 0, scale: reduce ? 1 : 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduce ? 0.3 : 1.6, ease: EASE }}
      />

      {/* Glass plate holding the logo. */}
      <motion.div
        className="relative isolate overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.05] px-[clamp(2rem,7vw,4.5rem)] py-[clamp(1.6rem,5vw,3rem)]"
        style={{
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.14) inset, 0 30px 90px -20px rgba(123,97,255,0.45), 0 0 120px -40px rgba(34,216,255,0.35)",
        }}
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: reduce ? 0.3 : 1.1, ease: EASE }}
      >
        {/* Top sheen. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)",
          }}
        />

        <Image
          src={intro.logoSrc}
          alt={intro.logoAlt}
          width={intro.logoWidth}
          height={intro.logoHeight}
          priority
          sizes="(max-width: 640px) 60vw, 28rem"
          className="relative z-10 h-auto w-[clamp(11rem,38vw,20rem)] select-none"
        />

        {/* Light sweep across the plate. Transform only. */}
        {!reduce && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 z-20 w-1/2"
            style={{
              background:
                "linear-gradient(105deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0) 100%)",
            }}
            initial={{ x: "-180%" }}
            animate={{ x: "320%" }}
            transition={{ duration: 1.8, ease: EASE, delay: 0.45 }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
