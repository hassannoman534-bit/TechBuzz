"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { GlassIconReveal } from "@/components/ui/liquid-glass-logo-reveal";
import { ceoMessage, EASE } from "./ceo-message.config";
import { LOGO_REVEAL } from "./logo-reveal.config";

type LogoIntroProps = {
  /** Mount the hero's own WebGL behind the still-opaque plate. */
  onPrewarm: () => void;
  /** Start the plate leaving. */
  onDone: () => void;
};

const { intro } = ceoMessage;
const F = LOGO_REVEAL.field;

/**
 * Phase 1. The mark revealed in glass, on a frosted field, handing over to the
 * page.
 *
 * ── Why this is on a light field ────────────────────────────────────────────
 *
 * It ran on the page void first, and the glass was invisible. That was not a
 * tuning problem. Refraction only shows you what is behind it, and behind it
 * was rgb(3,7,18): the glass had nothing to bend, nothing to disperse and
 * nothing to catch, so the only part of the effect with any luminance was the
 * rim light, and the only thing anyone saw was an outline. Hence a logo that
 * appeared to be sitting in a box, and hence a box that survived every attempt
 * to tune it away, because the box WAS the effect.
 *
 * On a light field the same shader has something to work with. The corners
 * bend the mark and split it into colour, the bevel catches, the rim stops
 * being the brightest thing on screen, and the tile reads as a piece of glass
 * laid over a surface. Nothing about the optics changed; the thing behind them
 * did.
 *
 * ── Why the canvas covers everything ────────────────────────────────────────
 *
 * It used to be a square box in the middle of the overlay, which meant the
 * canvas's flat fill had an edge, and any texture on the page either stopped
 * at that edge or crossed it. Full screen, there is no edge to line anything
 * up with: the frosted texture simply lies over the whole plate, canvas
 * included, and the two cannot come apart. The expensive branch of the shader
 * still only runs inside the tile, so what this costs is the cheap path over
 * more pixels, on a canvas that lives for two and a half seconds.
 *
 * ── Why the exit is staged ──────────────────────────────────────────────────
 *
 * See LOGO_REVEAL.prewarmMs. The old handover stuttered because the fade and
 * the hero's WebGL setup landed on the same frames. The work now happens
 * behind an opaque plate, and only then does anything move.
 */
export function LogoIntro({ onPrewarm, onDone }: LogoIntroProps): React.ReactElement {
  const reduce = useReducedMotionSafe();
  const lenis = useLenis();

  const glass = LOGO_REVEAL.enabled && !reduce;
  const [released, setReleased] = useState(false);
  const [ready, setReady] = useState(false);
  const [patienceGone, setPatienceGone] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);

  /*
    Hand over in two steps. First the reveal's canvas is dropped and the hero
    is told to build itself, both while the plate is still opaque and hiding
    everything. Only after prewarmMs does the plate begin to leave.
  */
  const finish = useCallback(() => {
    setReleased(true);
    onPrewarm();
    window.setTimeout(onDone, LOGO_REVEAL.prewarmMs);
  }, [onDone, onPrewarm]);

  useEffect(() => {
    if (!glass) {
      const id = window.setTimeout(finish, reduce ? intro.reducedHoldMs : intro.holdMs);
      return () => window.clearTimeout(id);
    }
    const ceiling = window.setTimeout(finish, LOGO_REVEAL.maxHoldMs);
    return () => window.clearTimeout(ceiling);
  }, [finish, glass, reduce]);

  useEffect(() => {
    if (!glass || !ready) return;
    const id = window.setTimeout(finish, LOGO_REVEAL.holdMs);
    return () => window.clearTimeout(id);
  }, [finish, glass, ready]);

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
      // Measured while the body was locked, so the scroll driven stages below
      // need a fresh measurement before anything scrolls them.
      lenis?.resize();
      window.dispatchEvent(new Event("resize"));
    };
  }, [lenis]);

  const stillVisible = !glass || released || (patienceGone && !ready);
  const exit = LOGO_REVEAL.exitMs / 1000;

  return (
    <motion.div
      key="ceo-logo-intro"
      role="presentation"
      className="fixed inset-0 z-[70] overflow-hidden"
      initial={{ opacity: 1 }}
      /*
        The plate lifts and softens rather than simply switching off. Scale and
        blur carry the movement; opacity only finishes it, late, so the page is
        already visible underneath by the time the plate is gone.
      */
      exit={
        reduce
          ? { opacity: 0 }
          : { opacity: 0, scale: 1.05, filter: "blur(14px)" }
      }
      transition={{
        duration: reduce ? 0.3 : exit,
        ease: EASE,
        opacity: { duration: reduce ? 0.3 : exit * 0.55, delay: reduce ? 0 : exit * 0.45, ease: "linear" },
      }}
      style={{ backgroundColor: LOGO_REVEAL.background }}
    >
      {/*
        The field under the glass. It crossfades to the page void as the plate
        leaves, so the journey from a light intro to a dark site happens inside
        one movement instead of as a cut between two.
      */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundColor: LOGO_REVEAL.background }}
        exit={reduce ? {} : { backgroundColor: "#030712" }}
        transition={{ duration: reduce ? 0.3 : exit * 0.6, ease: EASE }}
      >
        {/* Two wide blooms, far behind the tile, giving the frost its colour. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: [
              `radial-gradient(60% 55% at 18% 22%, ${F.bloomA}, rgba(0,0,0,0) 70%)`,
              `radial-gradient(55% 50% at 84% 78%, ${F.bloomB}, rgba(0,0,0,0) 72%)`,
              `radial-gradient(42% 40% at 72% 16%, ${F.bloomC}, rgba(0,0,0,0) 70%)`,
            ].join(","),
            filter: "blur(36px)",
          }}
        />
        <div className="absolute inset-0" style={{ background: F.vignette }} />
      </motion.div>

      {/*
        The reveal, covering the whole plate. Below the blooms in the stacking
        order would hide them; above the grain would wash it out. Here it sits
        between the two, which is also what makes the grain read as a surface
        the glass is under rather than a texture printed on top of the page.
      */}
      {glass && !released && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <GlassIconReveal
            logo={LOGO_REVEAL.logoSrc}
            label={intro.logoAlt}
            look={LOGO_REVEAL.look}
            className="h-full w-full"
            background={LOGO_REVEAL.background}
            logoColor={LOGO_REVEAL.logoColor}
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
              edgeMelt: LOGO_REVEAL.edgeMelt,
            }}
            onReady={handleReady}
            replayOnClick
          />
        </motion.div>
      )}

      {/*
        The still mark. Reduced motion, no WebGL2, a machine too slow to have
        built the field yet, and the moment the canvas is released. Inked
        rather than white, because white does not exist on this field.
      */}
      <motion.div
        className="pointer-events-none absolute inset-0 grid place-items-center"
        initial={{ opacity: glass ? 0 : 1 }}
        animate={{ opacity: stillVisible ? 1 : 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <Image
          src={LOGO_REVEAL.stillSrc}
          alt={glass ? "" : intro.logoAlt}
          aria-hidden={glass ? true : undefined}
          width={intro.logoWidth}
          height={intro.logoHeight}
          priority
          sizes="(max-width: 640px) 64vw, 26rem"
          className="h-auto select-none"
          style={{
            // Exactly what the reveal ends on, or the handover pops.
            width: glass
              ? `min(82vw, ${LOGO_REVEAL.tileSize * LOGO_REVEAL.logoScale * LOGO_REVEAL.finalScale}px)`
              : "clamp(12rem, 42vw, 22rem)",
          }}
        />
      </motion.div>

      {/*
        Grain, over everything including the canvas. This is what sells the
        frost, and it is also why no canvas edge can be found: the same texture
        lies across the glass and the field at the same strength.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url(${F.grainSrc})`,
          backgroundSize: `${F.grainTilePx}px ${F.grainTilePx}px`,
          backgroundRepeat: "repeat",
          opacity: F.grainOpacity,
          mixBlendMode: "overlay",
        }}
      />
    </motion.div>
  );
}
