"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { GlassIconReveal } from "@/components/ui/liquid-glass-logo-reveal";
import { ceoMessage, EASE } from "./ceo-message.config";
import { LOGO_REVEAL } from "./logo-reveal.config";

type LogoIntroProps = { onDone: () => void };

const { intro } = ceoMessage;

/**
 * Phase 1. The logo alone on the void, no plate and no container.
 *
 * The mark arrives as a liquid glass reveal: a droplet grows and lands, spreads
 * into a glass tile that holds the mark while a band of light crosses it, then
 * the glass lets go and leaves the mark. See logo-reveal.config.ts for the
 * timing and for the one thing that limits how good it looks, which is that the
 * only TechBuzz logo in the repo is a wide wordmark and the tile is square.
 *
 * Blur still carries the exit, so the swap between the overlay and the page
 * reads as one movement rather than two layers crossfading. Nothing animates
 * from scale 0.
 *
 * ── Three things keep this from costing the intro anything ──────────────────
 *
 * 1. The distance field the shader needs is built in time slices, so no single
 *    task blocks a frame. That build is the only expensive part of this effect
 *    and it used to be one synchronous ~100ms pass, which would have landed
 *    directly on top of LiquidText initialising the hero's own WebGL2 context.
 * 2. The hold starts when the reveal is ready rather than on mount, so a slow
 *    machine gets the whole reveal instead of the overlay leaving halfway
 *    through it. `maxHoldMs` is the ceiling that makes waiting safe.
 * 3. Reduced motion never mounts the canvas at all. It gets the still logo, the
 *    same fallback the rest of this page uses, and builds no field for it.
 *
 * The context this mounts is also transient: the overlay unmounts through
 * AnimatePresence, so the reveal's canvas is disposed before the page's own
 * surfaces matter. It does not add to the count this page was trimmed down to.
 *
 * Scroll is locked for the hold on `document.body`, never on <html>: <html> is
 * h-full here, and overflow:hidden there turns it into its own scroll container,
 * which breaks every sticky section on the site.
 */
export function LogoIntro({ onDone }: LogoIntroProps): React.ReactElement {
  const reduce = useReducedMotionSafe();
  const lenis = useLenis();

  const glass = LOGO_REVEAL.enabled && !reduce;
  const [ready, setReady] = useState(false);
  const [patienceGone, setPatienceGone] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);

  /*
    The hold. Two timers, and whichever fires first wins, because onDone only
    ever flips one boolean.

    The first is the real one and does not start until the reveal can play. The
    second is the ceiling: if the field never arrives, or arrives very late on a
    throttled machine, the intro still hands over on time rather than holding
    the page on a blank overlay.
  */
  useEffect(() => {
    if (!glass) {
      const id = window.setTimeout(onDone, reduce ? intro.reducedHoldMs : intro.holdMs);
      return () => window.clearTimeout(id);
    }
    const ceiling = window.setTimeout(onDone, LOGO_REVEAL.maxHoldMs);
    return () => window.clearTimeout(ceiling);
  }, [glass, onDone, reduce]);

  useEffect(() => {
    if (!glass || !ready) return;
    const id = window.setTimeout(onDone, LOGO_REVEAL.holdMs);
    return () => window.clearTimeout(id);
  }, [glass, onDone, ready]);

  /** If the reveal is slow to arrive, show the still logo rather than nothing. */
  useEffect(() => {
    if (!glass) return;
    const id = window.setTimeout(() => setPatienceGone(true), LOGO_REVEAL.patienceMs);
    return () => window.clearTimeout(id);
  }, [glass]);

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

  const stillVisible = !glass || (patienceGone && !ready);

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
        {/*
          Both layers share one square box so neither can shift the other. The
          box is sized off the tile, not off a viewport clamp: the engine fits
          the tile into the smaller side divided by 1.75, and that margin is
          what the halo and the lift shadow are drawn into.
        */}
        <div
          className="relative grid place-items-center"
          style={{
            width: `min(82vw, ${LOGO_REVEAL.tileSize * 1.75}px)`,
            height: `min(82vw, ${LOGO_REVEAL.tileSize * 1.75}px)`,
          }}
        >
          {glass && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: ready ? 1 : 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <GlassIconReveal
                logo={LOGO_REVEAL.logoSrc}
                label={intro.logoAlt}
                look="dark"
                className="h-full w-full"
                background={LOGO_REVEAL.background}
                logoColor={LOGO_REVEAL.logoColor}
                /*
                  No plate: the glass sits on the void and lets go of the mark,
                  rather than settling into an app icon. The upstream dark preset
                  turns the plate on, which is the one thing about it that does
                  not suit a page whose whole opening is the logo alone.
                */
                iconPlate={false}
                keepPlate={false}
                tileSize={LOGO_REVEAL.tileSize}
                logoScale={LOGO_REVEAL.logoScale}
                finalScale={LOGO_REVEAL.finalScale}
                texSize={LOGO_REVEAL.texSize}
                spectralSamples={LOGO_REVEAL.spectralSamples}
                dprMax={LOGO_REVEAL.dprMax}
                tuning={{
                  present: LOGO_REVEAL.present,
                  glide: LOGO_REVEAL.glide,
                  startZoom: LOGO_REVEAL.startZoom,
                  halo: LOGO_REVEAL.halo,
                  shadow: LOGO_REVEAL.shadow,
                  bevelWidth: LOGO_REVEAL.bevelWidth,
                  specular: LOGO_REVEAL.specular,
                  ripple: LOGO_REVEAL.ripple,
                }}
                onReady={handleReady}
                replayOnClick
              />
            </motion.div>
          )}

          {/*
            The still logo. It is the reduced motion path, the no-WebGL2 path and
            the slow-machine path, so it stays mounted and is only faded out once
            there is a reveal to hand over to.
          */}
          <motion.div
            className="absolute inset-0 grid place-items-center"
            initial={{ opacity: glass ? 0 : 1 }}
            animate={{ opacity: stillVisible ? 1 : 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            style={{ pointerEvents: "none" }}
          >
            <Image
              src={intro.logoSrc}
              alt={glass ? "" : intro.logoAlt}
              aria-hidden={glass ? true : undefined}
              width={intro.logoWidth}
              height={intro.logoHeight}
              priority
              sizes="(max-width: 640px) 64vw, 26rem"
              className="h-auto w-[clamp(12rem,42vw,22rem)] select-none"
            />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
