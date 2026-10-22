"use client";

import { motion, type Variants } from "framer-motion";
import { GlassButton } from "@/components/ui/GlassButton";
import { MetalButton } from "@/components/ui/MetalButton";
import { USE_METAL_BUTTONS } from "@/lib/feature-flags";
import { HeroSphere } from "@/components/sections/hero-sphere/hero-sphere";

/* ─── Animation variants ─────────────────────────────────────────────────── */

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

/* ─── Hero ───────────────────────────────────────────────────────────────── */

export default function Hero() {
  return (
    <section className="relative isolate w-full min-h-svh flex flex-col items-center justify-center overflow-hidden pt-[calc(var(--nav-offset,5.5rem)+2rem)] pb-[clamp(3rem,8vh,6rem)]">

      {/* ── 3D geodesic sphere (-z-10 inside this section's stacking context) ── */}
      <HeroSphere />

      {/* ── Deep-space background (-z-20, so the sphere draws above it and below the content) ── */}
      <div className="absolute inset-0 -z-20 pointer-events-none">

        {/* Base deep-space gradient — blue fades to the global void (#030712) before the section ends */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 130% 100% at 50% 160%, #1a3a6e 0%, #0d1f4a 20%, #060d24 45%, #030712 75%)",
          }}
        />

        {/* Subtle center glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] md:w-[50vw] h-[30vh] rounded-full"
          style={{
            background: "rgba(22,78,99,0.10)",
            // PERF: halved from blur(120px) — imperceptible delta, halves rasterization cost
            filter: "blur(72px)",
          }}
        />

        {/* Faint stars */}
        <div className="absolute top-[10%] left-[15%] w-[2px] h-[2px] rounded-full bg-white opacity-20" />
        <div className="absolute top-[7%]  left-[68%] w-[2px] h-[2px] rounded-full bg-white opacity-20" />
        <div className="absolute top-[20%] left-[82%] w-[2px] h-[2px] rounded-full bg-white opacity-20" />
        <div className="absolute top-[33%] left-[6%]  w-[2px] h-[2px] rounded-full bg-white opacity-20" />
        <div className="absolute top-[15%] left-[50%] w-[2px] h-[2px] rounded-full bg-white opacity-20" />
        <div className="absolute top-[45%] left-[90%] w-[2px] h-[2px] rounded-full bg-white opacity-20" />
        <div className="absolute top-[5%]  left-[35%] w-[2px] h-[2px] rounded-full bg-white opacity-20" />
        <div className="absolute top-[28%] left-[75%] w-[2px] h-[2px] rounded-full bg-white opacity-20" />
      </div>

      {/* ── Foreground Content (z-10) ── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto px-4"
      >
        {/* Eyebrow pill */}
        <motion.div variants={fadeIn}>
          <div
            style={{
              display:      "inline-flex",
              alignItems:   "center",
              gap:          "8px",
              padding:      "6px 18px",
              borderRadius: "999px",
              background:   "rgba(6,182,212,0.07)",
              border:       "1px solid rgba(6,182,212,0.20)",
            }}
          >
            <span style={{
              width: "5px", height: "5px", borderRadius: "50%",
              background: "#06b6d4", boxShadow: "0 0 8px rgba(6,182,212,0.9)",
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: "10px", fontWeight: 600, letterSpacing: "0.16em",
              textTransform: "uppercase", color: "#22d3ee",
            }}>
              Award-Winning Digital Studio&nbsp;&nbsp;&#183;&nbsp;&nbsp;Lahore
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="mt-6 text-5xl md:text-7xl font-extrabold tracking-tight leading-tight"
          style={{
            fontFamily: "var(--font-urbanist), 'Syne', system-ui, sans-serif",
          }}
        >
          <span style={{
            background:           "linear-gradient(110deg, #67e8f9 0%, #ffffff 60%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor:  "transparent",
            backgroundClip:       "text",
          }}>
            Digital Experiences
          </span>
          <br />
          <span className="text-white">Built to Scale.</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={fadeUp}
          className="mt-[clamp(1.25rem,3vh,2rem)] max-w-[44ch] text-gray-400 text-lg md:text-xl"
          style={{ lineHeight: 1.7 }}
        >
          We partner with ambitious brands to design, engineer, and launch
          high-performance web applications and digital platforms.
        </motion.p>

        {/* CTA buttons */}
        <motion.div variants={fadeIn} className="mt-[clamp(1.75rem,4vh,2.5rem)] flex gap-4 flex-wrap justify-center">
          {USE_METAL_BUTTONS ? (
            <MetalButton href="/contact" size="lg" preset="chromatic" className="self-center" data-cursor="magnetic">
              Start a Project
            </MetalButton>
          ) : (
            <GlassButton href="/contact" variant="glow" size="lg" data-cursor="magnetic">
              Start a Project
            </GlassButton>
          )}
          <GlassButton href="/portfolio" variant="secondary" size="lg" data-cursor="magnetic">
            View Our Work
          </GlassButton>
        </motion.div>
      </motion.div>

      {/* ── Bottom fade ── */}
      <div
        aria-hidden
        style={{
          position:      "absolute",
          bottom:        0, left: 0, right: 0,
          height:        "280px",
          background:    "linear-gradient(to bottom, transparent 0%, #030712 100%)",
          pointerEvents: "none",
          zIndex:        5,
        }}
      />
    </section>
  );
}
