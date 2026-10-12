// components/ServicesSection.tsx
"use client";

import { useRef, useState } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

/* ─── Data ───────────────────────────────────────────────────────────────────── */

type Service = {
  num:         string;
  title:       string;
  description: string;
  href:        string;
};

const SERVICES: Service[] = [
  { num: "01", title: "Search Engine Optimization",     href: "/services/seo",                    description: "Rank higher, convert faster. We build technical SEO foundations and content strategies that compound over time." },
  { num: "02", title: "Paid Advertising",               href: "/services/ppc-advertising",        description: "Performance-obsessed Meta & Google ad campaigns engineered for ROAS, not just reach." },
  { num: "03", title: "Social Media Marketing",         href: "/services/social-media-marketing", description: "Platform-native content, community growth, and brand voice that stops the scroll and drives action." },
  { num: "04", title: "Web Development",                href: "/services/website-development",    description: "Pixel-perfect, blazing-fast websites and web apps built on Next.js and modern stacks — no WordPress bloat." },
  { num: "05", title: "Mobile App Development",         href: "/services/app-development",        description: "Cross-platform Flutter applications with Firebase backends, shipped from concept to App Store." },
  { num: "06", title: "AI Automations",                 href: "/services/digital-marketing",      description: "Custom AI workflows and agents that eliminate repetitive tasks, reduce overhead, and scale your operations." },
  { num: "07", title: "YouTube Automation",             href: "/services/youtube-automation",     description: "End-to-end faceless YouTube channel systems — research, scripting, voiceovers, editing, and publishing pipelines." },
  { num: "08", title: "Content Production",             href: "/services/content-creation",       description: "High-quality video, photography, and graphic content built for the feed — scroll-stopping by design." },
  { num: "09", title: "Branding & Identity",            href: "/services/graphic-design",         description: "Strategy-led brand identities: logos, visual systems, brand guidelines, and positioning that commands premium." },
  { num: "10", title: "Email Marketing",                href: "/services/digital-marketing",      description: "Segmented, automated email sequences that nurture leads and recover revenue for e-commerce and services." },
  { num: "11", title: "Restaurant Marketing (The Buzz System™)", href: "/services/digital-marketing", description: "Our full-stack restaurant growth engine covering ads, menus, social, delivery, and reputation management." },
];

/* ─── Decorative SVG shapes ──────────────────────────────────────────────────── */

const SHAPES = [
  <svg key="circle" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="80" stroke="white" strokeOpacity="0.15" strokeWidth="1.5"/>
    <circle cx="100" cy="100" r="50" stroke="white" strokeOpacity="0.08" strokeWidth="1"/>
  </svg>,
  <svg key="tri" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="100,20 180,170 20,170" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>,
  <svg key="hex" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="100,10 180,55 180,145 100,190 20,145 20,55" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>,
  <svg key="dia" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="100,10 190,100 100,190 10,100" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>,
  <svg key="cross" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="100" y1="20" x2="100" y2="180" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="20" y1="100" x2="180" y2="100" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" strokeLinecap="round"/>
    <rect x="60" y="60" width="80" height="80" stroke="white" strokeOpacity="0.08" strokeWidth="1" rx="4"/>
  </svg>,
  <svg key="spiral" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M100 100 m-60 0 a60 60 0 1 1 60 60" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M100 100 m-35 0 a35 35 0 1 1 35 35" stroke="white" strokeOpacity="0.10" strokeWidth="1" strokeLinecap="round"/>
    <circle cx="100" cy="100" r="4" fill="white" fillOpacity="0.15"/>
  </svg>,
  <svg key="star" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="100,15 120,75 185,75 133,114 154,175 100,136 46,175 67,114 15,75 80,75" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>,
  <svg key="oct" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="70,15 130,15 185,70 185,130 130,185 70,185 15,130 15,70" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>,
  <svg key="sq" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="20" width="160" height="160" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" rx="2"/>
    <rect x="50" y="50" width="100" height="100" stroke="white" strokeOpacity="0.10" strokeWidth="1" rx="2"/>
    <rect x="80" y="80" width="40" height="40" stroke="white" strokeOpacity="0.07" strokeWidth="1" rx="2"/>
  </svg>,
  <svg key="wave" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    {[40, 70, 100, 130, 160].map((y, i) => (
      <path key={y} d={`M10 ${y} Q55 ${y - 20} 100 ${y} Q145 ${y + 20} 190 ${y}`}
        stroke="white" strokeOpacity={0.15 - i * 0.02} strokeWidth="1.5" strokeLinecap="round"/>
    ))}
  </svg>,
  <svg key="arrow" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="30" y1="170" x2="150" y2="50" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" strokeLinecap="round"/>
    <polyline points="110,50 150,50 150,90" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="150" cy="50" r="8" stroke="white" strokeOpacity="0.12" strokeWidth="1"/>
  </svg>,
];

/* ─── Animation Variants ─────────────────────────────────────────────────────── */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const sectionEntrance: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const rowEntrance: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/* Blur word reveal for description */
const wordContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
};

const wordReveal: Variants = {
  hidden:  { opacity: 0, filter: "blur(8px)", y: 6 },
  visible: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.4, ease: EASE } },
};

/* ─── ServiceRow ─────────────────────────────────────────────────────────────── */

function ServiceRow({ service, index, isLast }: { service: Service; index: number; isLast: boolean }) {
  const [hovered, setHovered] = useState(false);
  const words = service.description.split(" ");

  return (
    <motion.div
      variants={rowEntrance}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      data-cursor="explore"
      style={{
        borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.08)",
        borderTop: index === 0 ? "1px solid rgba(255,255,255,0.08)" : "none",
        position: "relative",
        overflow: "hidden",
        cursor: "none",
      }}
    >
      {/* Hover background */}
      <motion.div
        aria-hidden
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "rgba(255,255,255,0.025)",
        }}
      />

      {/* Cyan left border bar */}
      <motion.div
        aria-hidden
        animate={{ scaleY: hovered ? 1 : 0 }}
        initial={{ scaleY: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: "2px",
          background: "#38bdf8",
          transformOrigin: "top",
        }}
      />

      {/* Row inner layout */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "2rem",
          padding: "1.75rem 1.5rem 1.75rem 2rem",
          minHeight: "80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* LEFT: number + title + description */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "1.25rem" }}>
            {/* Number */}
            <motion.span
              animate={{ opacity: hovered ? 0.7 : 0.2 }}
              transition={{ duration: 0.5, ease: EASE }}
              style={{
                fontFamily: '"Inter", system-ui, sans-serif',
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "rgba(255,255,255,1)",
                flexShrink: 0,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "0.04em",
              }}
            >
              {service.num}
            </motion.span>

            {/* Title */}
            <motion.h3
              animate={{
                color: hovered ? "#e2e8f0" : "rgba(255,255,255,0.75)",
                x: hovered ? 12 : 0,
              }}
              transition={{ duration: 0.5, ease: EASE }}
              style={{
                fontFamily: '"Syne", system-ui, sans-serif',
                fontSize: "clamp(1.5rem, 3.5vw, 3rem)",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              {service.title}
            </motion.h3>
          </div>

          {/* Description — CSS grid expand, blur word reveal */}
          <div
            style={{
              display: "grid",
              gridTemplateRows: hovered ? "1fr" : "0fr",
              transition: "grid-template-rows 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div style={{ overflow: "hidden", minHeight: 0 }}>
              <motion.p
                variants={wordContainer}
                initial="hidden"
                animate={hovered ? "visible" : "hidden"}
                style={{
                  marginTop: "0.875rem",
                  marginLeft: "calc(0.75rem + 1.25rem + 2px)",
                  color: "rgba(255,255,255,0.45)",
                  fontSize: "0.9375rem",
                  lineHeight: 1.65,
                  maxWidth: "560px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0 0.3em",
                }}
                aria-label={service.description}
              >
                {words.map((word, i) => (
                  <motion.span key={i} variants={wordReveal} style={{ display: "inline-block" }}>
                    {word}
                  </motion.span>
                ))}
              </motion.p>
            </div>
          </div>
        </div>

        {/* RIGHT: decorative SVG + action button */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexShrink: 0,
            gap: "1rem",
            alignSelf: "stretch",
          }}
        >
          {/* SVG shape — will-change only on this element */}
          <motion.div
            animate={{
              scale:   hovered ? 1 : 0.85,
              opacity: hovered ? 0.35 : 0.15,
            }}
            transition={{ duration: 0.5, ease: EASE }}
            style={{ width: "120px", height: "120px", flexShrink: 0, willChange: "transform" }}
            aria-hidden
          >
            {SHAPES[index % SHAPES.length]}
          </motion.div>

          {/* Arrow button */}
          <motion.a
            href={service.href}
            animate={{
              opacity: hovered ? 1 : 0,
              x: hovered ? 0 : -8,
            }}
            transition={{ duration: 0.5, ease: EASE }}
            className="group"
            style={{
              width: "36px", height: "36px",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.20)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.60)",
              flexShrink: 0,
              transition: "color 0.2s ease, border-color 0.2s ease",
              textDecoration: "none",
              pointerEvents: hovered ? "auto" : "none",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = "rgba(255,255,255,1)";
              el.style.borderColor = "rgba(255,255,255,0.6)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = "rgba(255,255,255,0.60)";
              el.style.borderColor = "rgba(255,255,255,0.20)";
            }}
            aria-label={`Go to ${service.title}`}
            data-cursor="magnetic"
          >
            <ArrowUpRight size={16} strokeWidth={2} />
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── ServicesSection ────────────────────────────────────────────────────────── */

export default function ServicesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px 0px" });

  return (
    <section id="services" data-atmo="services" className="relative py-28 overflow-hidden">
      {/* Ambient blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[120px]"
        style={{ background: "rgba(139,92,246,0.08)" }}
      />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-16"
        >
          <p
            style={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
              marginBottom: "1rem",
              fontFamily: '"Inter", system-ui, sans-serif',
            }}
          >
            What We Do
          </p>
          <h2
            style={{
              fontFamily: '"Syne", system-ui, sans-serif',
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#e2e8f0",
              margin: 0,
            }}
          >
            Services Built to{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #38bdf8 0%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Scale Results
            </span>
          </h2>
        </motion.div>

        {/* Accordion list */}
        <motion.div
          variants={sectionEntrance}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{ display: "flex", flexDirection: "column" }}
        >
          {SERVICES.map((service, i) => (
            <ServiceRow
              key={service.num}
              service={service}
              index={i}
              isLast={i === SERVICES.length - 1}
            />
          ))}
        </motion.div>

      </div>
    </section>
  );
}
