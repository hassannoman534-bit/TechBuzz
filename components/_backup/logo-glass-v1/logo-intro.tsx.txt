"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { ceoMessage, EASE } from "./ceo-message.config";

type LogoIntroProps = { onDone: () => void };

const { intro } = ceoMessage;

/**
 * Phase 1. The logo alone on the void, no plate and no container.
 *
 * It arrives slightly large and soft, then settles and sharpens. Blur carries the
 * entrance and the exit so the swap between the overlay and the page reads as one
 * movement rather than two layers crossfading. Nothing animates from scale 0.
 *
 * Scroll is locked for the hold on `document.body`, never on <html>: <html> is
 * h-full here, and overflow:hidden there turns it into its own scroll container,
 * which breaks every sticky section on the site.
 */
export function LogoIntro({ onDone }: LogoIntroProps): React.ReactElement {
  const reduce = useReducedMotionSafe();
  const lenis = useLenis();
  const hold = reduce ? intro.reducedHoldMs : intro.holdMs;

  useEffect(() => {
    const id = window.setTimeout(onDone, hold);
    return () => window.clearTimeout(id);
  }, [hold, onDone]);

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
      // stage below needs a fresh measurement before it is scrolled.
      lenis?.resize();
      window.dispatchEvent(new Event("resize"));
    };
  }, [lenis]);

  return (
    <motion.div
      key="ceo-logo-intro"
      role="presentation"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#030712]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0.3 : 0.55, ease: EASE }}
    >
      {/* Ambient bloom. Opacity and scale only, no filter on a full screen layer. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(123,97,255,0.22) 0%, rgba(91,124,255,0.09) 45%, rgba(3,7,18,0) 70%)",
        }}
        initial={{ opacity: 0, scale: reduce ? 1 : 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduce ? 0.3 : 1.5, ease: EASE }}
      />

      <motion.div
        className="relative"
        initial={
          reduce
            ? { opacity: 0 }
            : { opacity: 0, scale: 1.06, filter: "blur(14px)" }
        }
        animate={
          reduce
            ? { opacity: 1 }
            : { opacity: 1, scale: 1, filter: "blur(0px)" }
        }
        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.04, filter: "blur(10px)" }}
        transition={{ duration: reduce ? 0.3 : 1.2, ease: EASE }}
      >
        <Image
          src={intro.logoSrc}
          alt={intro.logoAlt}
          width={intro.logoWidth}
          height={intro.logoHeight}
          priority
          sizes="(max-width: 640px) 64vw, 26rem"
          className="h-auto w-[clamp(12rem,42vw,22rem)] select-none"
        />
      </motion.div>
    </motion.div>
  );
}
