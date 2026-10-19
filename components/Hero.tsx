"use client";

import { motion, type Variants } from "framer-motion";
import { GlassButton } from "@/components/ui/GlassButton";
import { MetalButton } from "@/components/ui/MetalButton";
import { USE_METAL_BUTTONS } from "@/lib/feature-flags";

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
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#030712] pt-32 pb-16">

      {/* ── Dim Cosmic Arc Background (z-0) ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">

        {/* Base deep-space gradient — blue fades to the global void (#030712) before the section ends */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 130% 100% at 50% 160%, #1a3a6e 0%, #0d1f4a 20%, #060d24 45%, #030712 75%)",
          }}
        />

        {/* The Faint Arc */}
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-40vw] md:top-[-50vw] left-1/2 -translate-x-1/2 w-[250vw] md:w-[150vw] h-[60vw] rounded-[100%]"
          style={{
            borderBottom: "1px solid rgba(6,182,212,0.20)",
            background: "linear-gradient(to bottom, transparent, rgba(8,47,73,0.05))",
            boxShadow: "0 40px 120px rgba(6,182,212,0.05)",
            // PERF: promote to compositor layer so arc float never triggers paint
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            willChange: "transform",
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
        className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto px-4 gap-8"
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
          className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight"
          style={{
            fontFamily: "var(--font-urbanist), 'Syne', system-ui, sans-serif",
            margin: 0,
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
          className="text-gray-400 max-w-2xl text-lg md:text-xl"
          style={{ lineHeight: 1.7 }}
        >
          We partner with ambitious brands to design, engineer, and launch
          high-performance web applications and digital platforms.
        </motion.p>

        {/* CTA buttons */}
        <motion.div variants={fadeIn} className="flex gap-4 flex-wrap justify-center">
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
