"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  type Variants,
  type MotionValue,
} from "framer-motion";

/* ─── Word-blur reveal ───────────────────────────────────────────────────── */

const wordContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const wordReveal: Variants = {
  hidden:  { opacity: 0, filter: "blur(10px)", y: 16 },
  visible: { opacity: 1, filter: "blur(0px)",  y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

/* ─── Headline ───────────────────────────────────────────────────────────── */

const HEADLINE       = "Make Your Brand Impossible to Ignore";
const HEADLINE_WORDS = HEADLINE.split(" ");
const IMPOSSIBLE_IDX = HEADLINE_WORDS.indexOf("Impossible");

/* ─── Stats row ──────────────────────────────────────────────────────────── */

const STATS = [
  { value: "11+",   label: "Years Exp." },
  { value: "10/10", label: "Rating" },
  { value: "Free",  label: "Consultation" },
];

/* ─── FloatingCTASection ─────────────────────────────────────────────────── */

export default function FloatingCTASection() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  /* Card A — top-left */
  const cardAX       = useTransform(scrollYProgress, [0.05, 0.35], [-80,  0]);
  const cardAY       = useTransform(scrollYProgress, [0.05, 0.35], [ 60,  0]);
  const cardAScale   = useTransform(scrollYProgress, [0.05, 0.35], [0.65, 1]);
  const cardAOpacity = useTransform(scrollYProgress, [0.05, 0.30], [  0,  1]);

  /* Card B — top-right */
  const cardBX       = useTransform(scrollYProgress, [0.10, 0.40], [ 80,  0]);
  const cardBY       = useTransform(scrollYProgress, [0.10, 0.40], [ 60,  0]);
  const cardBScale   = useTransform(scrollYProgress, [0.10, 0.40], [0.65, 1]);
  const cardBOpacity = useTransform(scrollYProgress, [0.10, 0.35], [  0,  1]);

  /* Card C — bottom-left */
  const cardCX       = useTransform(scrollYProgress, [0.15, 0.45], [-80,  0]);
  const cardCY       = useTransform(scrollYProgress, [0.15, 0.45], [-50,  0]);
  const cardCScale   = useTransform(scrollYProgress, [0.15, 0.45], [0.65, 1]);
  const cardCOpacity = useTransform(scrollYProgress, [0.15, 0.40], [  0,  1]);

  /* Card D — bottom-right */
  const cardDX       = useTransform(scrollYProgress, [0.20, 0.50], [ 80,  0]);
  const cardDY       = useTransform(scrollYProgress, [0.20, 0.50], [-50,  0]);
  const cardDScale   = useTransform(scrollYProgress, [0.20, 0.50], [0.65, 1]);
  const cardDOpacity = useTransform(scrollYProgress, [0.20, 0.45], [  0,  1]);

  return (
    <section
      ref={sectionRef}
      style={{ position: "relative" }}
      className="min-h-screen bg-[#030712] overflow-hidden flex items-center justify-center"
    >
      {/* Ambient glow */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full"
          style={{ background: "rgba(139,92,246,0.08)", filter: "blur(100px)" }}
        />
      </div>

      {/* ── Card A — top-left ── */}
      <motion.div
        style={{
          x: cardAX, y: cardAY, scale: cardAScale, opacity: cardAOpacity,
          position: "absolute", top: "8%", left: "5%", zIndex: 1,
          width: "210px",
          borderRadius: "20px",
          padding: "20px 22px",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          background: "rgba(9,9,11,0.35)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.07) inset",
        }}
        className="hidden lg:block"
      >
        <div aria-hidden style={{
          position: "absolute", left: 0, top: "12px", bottom: "12px",
          width: "2px", borderRadius: "2px", background: "#22d3ee",
        }} />
        <p style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.13em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "6px", paddingLeft: "10px" }}>
          Avg. ROAS
        </p>
        <p style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.95)", lineHeight: 1, fontVariantNumeric: "tabular-nums", paddingLeft: "10px" }}>
          4.8×
        </p>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.28)", marginTop: "4px", paddingLeft: "10px" }}>
          across paid campaigns
        </p>
      </motion.div>

      {/* ── Card B — top-right ── */}
      <motion.div
        style={{
          x: cardBX, y: cardBY, scale: cardBScale, opacity: cardBOpacity,
          position: "absolute", top: "10%", right: "6%", zIndex: 1,
          width: "196px",
          borderRadius: "20px",
          padding: "20px 22px",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          background: "rgba(9,9,11,0.35)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.07) inset",
        }}
        className="hidden lg:block"
      >
        <div aria-hidden style={{
          position: "absolute", left: 0, top: "12px", bottom: "12px",
          width: "2px", borderRadius: "2px", background: "#a78bfa",
        }} />
        <p style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.13em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "6px", paddingLeft: "10px" }}>
          SEO Traffic
        </p>
        <p style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.95)", lineHeight: 1, fontVariantNumeric: "tabular-nums", paddingLeft: "10px" }}>
          +312%
        </p>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.28)", marginTop: "4px", paddingLeft: "10px" }}>
          in 6 months
        </p>
      </motion.div>

      {/* ── Card C — bottom-left ── */}
      <motion.div
        style={{
          x: cardCX, y: cardCY, scale: cardCScale, opacity: cardCOpacity,
          position: "absolute", bottom: "18%", left: "4%", zIndex: 1,
          width: "220px",
          borderRadius: "20px",
          padding: "20px 22px",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          background: "rgba(9,9,11,0.35)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.07) inset",
        }}
        className="hidden lg:block"
      >
        <div aria-hidden style={{
          position: "absolute", left: 0, top: "12px", bottom: "12px",
          width: "2px", borderRadius: "2px", background: "#34d399",
        }} />
        <p style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.13em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "6px", paddingLeft: "10px" }}>
          Projects Delivered
        </p>
        <p style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.95)", lineHeight: 1, fontVariantNumeric: "tabular-nums", paddingLeft: "10px" }}>
          150+
        </p>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.28)", marginTop: "4px", paddingLeft: "10px" }}>
          since 2019
        </p>
      </motion.div>

      {/* ── Card D — bottom-right ── */}
      <motion.div
        style={{
          x: cardDX, y: cardDY, scale: cardDScale, opacity: cardDOpacity,
          position: "absolute", bottom: "14%", right: "5%", zIndex: 1,
          width: "204px",
          borderRadius: "20px",
          padding: "20px 22px",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          background: "rgba(9,9,11,0.35)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.07) inset",
        }}
        className="hidden lg:block"
      >
        <div aria-hidden style={{
          position: "absolute", left: 0, top: "12px", bottom: "12px",
          width: "2px", borderRadius: "2px", background: "#f472b6",
        }} />
        <p style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.13em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "6px", paddingLeft: "10px" }}>
          Client Rating
        </p>
        <p style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.95)", lineHeight: 1, fontVariantNumeric: "tabular-nums", paddingLeft: "10px" }}>
          10/10
        </p>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.28)", marginTop: "4px", paddingLeft: "10px" }}>
          avg satisfaction
        </p>
      </motion.div>

      {/* ── Center content — z-10, in front of all cards ── */}
      <div
        className="relative text-center max-w-3xl mx-auto px-6"
        style={{ zIndex: 10 }}
      >
        {/* Pill label */}
        <div
          className="inline-block mb-8 px-4 py-1 rounded-full"
          style={{
            fontSize:      "0.6875rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color:         "rgba(255,255,255,0.4)",
            border:        "1px solid rgba(255,255,255,0.10)",
          }}
        >
          READY TO GROW?
        </div>

        {/* Headline — blur-word reveal */}
        <motion.h2
          variants={wordContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-wrap justify-center"
          style={{
            fontFamily:    "var(--font-urbanist), 'Syne', system-ui, sans-serif",
            fontSize:      "clamp(3rem, 7vw, 5.5rem)",
            fontWeight:    800,
            color:         "#ffffff",
            lineHeight:    1.0,
            letterSpacing: "-0.04em",
            gap:           "0 0.22em",
            rowGap:        "0.08em",
          }}
          aria-label={HEADLINE}
        >
          {HEADLINE_WORDS.map((word, i) => (
            <motion.span
              key={i}
              variants={wordReveal}
              style={{ display: "inline-block" }}
            >
              {i === IMPOSSIBLE_IDX ? (
                <span style={{
                  background:           "linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.50))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor:  "transparent",
                  backgroundClip:       "text",
                }}>
                  {word}
                </span>
              ) : word}
            </motion.span>
          ))}
        </motion.h2>

        {/* Subtext */}
        <p
          className="mt-6 max-w-xl mx-auto"
          style={{ fontSize: "1.125rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}
        >
          From strategy to execution — we handle the full stack of digital growth for ambitious brands.
        </p>

        {/* CTA buttons */}
        <div className="flex gap-4 justify-center flex-wrap mt-10">
          <motion.div whileHover={{ scale: 1.04 }} transition={{ duration: 0.2 }}>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full text-sm font-semibold tracking-wide"
              data-cursor="magnetic"
              style={{ padding: "1rem 2rem", background: "#ffffff", color: "#000000" }}
            >
              Get Started →
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
            <Link
              href="/pricings"
              className="inline-flex items-center rounded-full text-sm font-medium"
              data-cursor="magnetic"
              style={{
                padding:    "1rem 2rem",
                border:     "1px solid rgba(255,255,255,0.20)",
                color:      "rgba(255,255,255,0.80)",
                transition: "border-color 0.2s ease, color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(255,255,255,0.60)";
                el.style.color       = "#ffffff";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(255,255,255,0.20)";
                el.style.color       = "rgba(255,255,255,0.80)";
              }}
            >
              View Pricing
            </Link>
          </motion.div>
        </div>

        {/* Stats row */}
        <div className="flex gap-12 justify-center flex-wrap mt-14">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span style={{
                fontFamily:         "var(--font-urbanist), 'Syne', system-ui, sans-serif",
                fontSize:           "1.5rem",
                fontWeight:         700,
                color:              "#ffffff",
                fontVariantNumeric: "tabular-nums",
                letterSpacing:      "-0.02em",
              }}>
                {stat.value}
              </span>
              <span style={{
                fontSize:      "0.6875rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color:         "rgba(255,255,255,0.40)",
                marginTop:     "4px",
              }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
