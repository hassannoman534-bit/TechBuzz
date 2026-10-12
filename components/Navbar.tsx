"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import LiquidGlassCard from "@/components/ui/LiquidGlassCard";

/* ─── Nav data ───────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: "Home",      href: "/" },
  { label: "Services",  href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About",     href: "/about" },
  { label: "Blog",      href: "/blog" },
  { label: "Contact",   href: "/contact" },
];

/* ─── Navbar ─────────────────────────────────────────────────────────────── */

export default function Navbar() {
  const pathname      = usePathname();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const navRef        = useRef<HTMLDivElement>(null);

  /* Scroll listener */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Lock body scroll when mobile drawer is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  /* Liquid glass params shift subtly on scroll */
  const strength   = scrolled ? 110 : 80;
  const brightness = scrolled ? 1.2  : 1.1;
  const saturate   = scrolled ? 1.8  : 1.5;

  return (
    <>
      {/* ── Fixed centering wrapper ── */}
      <div
        style={{
          position:       "fixed",
          top:            "16px",
          left:            0,
          right:           0,
          zIndex:          50,
          display:        "flex",
          justifyContent: "center",
          pointerEvents:  "none",
        }}
      >
        <motion.div
          ref={navRef}
          initial={{ opacity: 0, y: -24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0,   scale: 1 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{
            pointerEvents: "auto",
            width:         "auto",
            minWidth:      "min(560px, calc(100vw - 32px))",
            maxWidth:      "800px",
            borderRadius:  "22px",
          }}
        >
          <LiquidGlassCard
            radius={22}
            depth={12}
            strength={strength}
            chromaticAberration={2}
            blur={0}
            saturate={saturate}
            brightness={brightness}
            overlayColor={
              scrolled
                ? "rgba(8,10,20,0.82)"
                : "rgba(8,10,20,0.60)"
            }
            style={{
              border:    "1px solid rgba(255,255,255,0.13)",
              boxShadow: scrolled
                ? "0 16px 48px rgba(0,0,0,0.60), 0 1px 0 rgba(255,255,255,0.10) inset"
                : "0 8px 32px rgba(0,0,0,0.40), 0 1px 0 rgba(255,255,255,0.08) inset",
              transition: "box-shadow 0.35s ease",
            }}
          >
            {/* ── Inner layout ── */}
            <div
              style={{
                display:        "flex",
                alignItems:     "center",
                justifyContent: "space-between",
                gap:            "1.25rem",
                padding:        "0.5rem 1rem 0.5rem 1.125rem",
              }}
            >
              {/* Logo */}
              <Link
                href="/"
                style={{ flexShrink: 0, display: "flex", alignItems: "center" }}
              >
                <Image
                  src="/logo.png"
                  alt="TechBuzz"
                  width={110}
                  height={34}
                  className="h-[34px] w-auto object-contain"
                  priority
                />
              </Link>

              {/* Desktop nav links */}
              <nav
                className="hidden md:flex"
                style={{
                  display:    "flex",
                  alignItems: "center",
                  gap:        "2px",
                  position:   "relative",
                }}
                onMouseLeave={() => setHoveredLink(null)}
                aria-label="Main navigation"
              >
                {NAV_LINKS.map((link) => {
                  const active  = isActive(link.href);
                  const hovered = hoveredLink === link.label;

                  return (
                    <div
                      key={link.href}
                      style={{ position: "relative" }}
                      onMouseEnter={() => setHoveredLink(link.label)}
                    >
                      {/* Sliding liquid glass pill highlight */}
                      <AnimatePresence>
                        {hovered && (
                          <motion.span
                            layoutId="nav-pill"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.15 } }}
                            transition={{ type: "spring", stiffness: 450, damping: 32 }}
                            style={{
                              position:      "absolute",
                              inset:          0,
                              borderRadius:  "10px",
                              background:    "rgba(255,255,255,0.11)",
                              boxShadow:     "inset 0 0.5px 0 rgba(255,255,255,0.30), 0 1px 4px rgba(0,0,0,0.25)",
                              zIndex:         0,
                              pointerEvents: "none",
                            }}
                          />
                        )}
                      </AnimatePresence>

                      <motion.div
                        whileTap={{ scale: 0.91 }}
                        style={{ position: "relative", zIndex: 1 }}
                      >
                        <Link
                          href={link.href}
                          style={{
                            display:        "block",
                            padding:        "0.35rem 0.8rem",
                            borderRadius:   "10px",
                            fontSize:       "0.875rem",
                            fontWeight:     500,
                            letterSpacing:  "0.01em",
                            color:          active || hovered
                              ? "rgba(255,255,255,1)"
                              : "rgba(255,255,255,0.58)",
                            textDecoration: "none",
                            transition:     "color 0.15s ease",
                            whiteSpace:     "nowrap",
                          }}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    </div>
                  );
                })}
              </nav>

              {/* Right — CTA + hamburger */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexShrink: 0 }}>
                {/* CTA — liquid glass button */}
                <Link
                  href="/contact"
                  style={{
                    display:        "inline-flex",
                    alignItems:     "center",
                    padding:        "0.38rem 1rem",
                    borderRadius:   "12px",
                    fontSize:       "0.8125rem",
                    fontWeight:     600,
                    color:          "#ffffff",
                    textDecoration: "none",
                    background:     "rgba(255,255,255,0.13)",
                    border:         "1px solid rgba(255,255,255,0.22)",
                    boxShadow:      "inset 0 0.5px 0 rgba(255,255,255,0.25)",
                    transition:     "background 0.2s ease, border-color 0.2s ease, transform 0.18s ease",
                    whiteSpace:     "nowrap",
                    letterSpacing:  "0.01em",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background  = "rgba(255,255,255,0.22)";
                    el.style.borderColor = "rgba(255,255,255,0.40)";
                    el.style.transform   = "scale(1.03)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background  = "rgba(255,255,255,0.13)";
                    el.style.borderColor = "rgba(255,255,255,0.22)";
                    el.style.transform   = "scale(1)";
                  }}
                  onMouseDown={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(0.94)"; }}
                  onMouseUp={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
                >
                  Book a Call
                </Link>

                {/* Hamburger — mobile only */}
                <motion.button
                  className="flex md:hidden"
                  whileTap={{ scale: 0.90 }}
                  onClick={() => setMobileOpen((v) => !v)}
                  style={{
                    background:  "rgba(255,255,255,0.08)",
                    border:      "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "10px",
                    padding:     "6px",
                    color:       "rgba(255,255,255,0.75)",
                    lineHeight:   1,
                    display:     "flex",
                    alignItems:  "center",
                    justifyContent: "center",
                  }}
                  aria-label="Toggle menu"
                  aria-expanded={mobileOpen}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {mobileOpen ? (
                      <motion.span key="x"
                        initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                        <X size={17} strokeWidth={2} />
                      </motion.span>
                    ) : (
                      <motion.span key="m"
                        initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                        <Menu size={17} strokeWidth={2} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>
          </LiquidGlassCard>
        </motion.div>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "fixed", inset: 0, zIndex: 40,
                background: "rgba(3,7,18,0.70)",
                backdropFilter: "blur(4px)",
              }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer — also uses LiquidGlassCard */}
            <motion.div
              key="drawer"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0,      opacity: 1 }}
              exit={{ x: "100%",   opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "fixed", top: 0, right: 0, bottom: 0,
                zIndex: 50, width: "min(320px, 90vw)",
              }}
            >
              <LiquidGlassCard
                radius={0}
                depth={10}
                strength={70}
                overlayColor="rgba(8,8,18,0.70)"
                style={{
                  height: "100%",
                  borderLeft: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  {/* Header */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "1rem 1.25rem",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                  }}>
                    <Image src="/logo.png" alt="TechBuzz" width={100} height={30}
                      className="h-[30px] w-auto object-contain" />
                    <button
                      onClick={() => setMobileOpen(false)}
                      style={{
                        background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)",
                        borderRadius: "8px", padding: "6px", color: "rgba(255,255,255,0.6)",
                        display: "flex", lineHeight: 1,
                      }}
                      aria-label="Close menu"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Links */}
                  <nav style={{ flex: 1, overflowY: "auto", padding: "1rem 0.75rem" }}>
                    {NAV_LINKS.map((link, i) => (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + i * 0.04, duration: 0.25 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          style={{
                            display: "block",
                            padding: "0.75rem 1rem",
                            borderRadius: "12px",
                            fontSize: "1rem",
                            fontWeight: 600,
                            color: isActive(link.href) ? "#38bdf8" : "rgba(255,255,255,0.80)",
                            textDecoration: "none",
                            fontFamily: '"Syne", system-ui, sans-serif',
                            transition: "background 0.15s ease, color 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                          }}
                        >
                          {link.label}
                        </Link>
                        <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "0 1rem" }} />
                      </motion.div>
                    ))}
                  </nav>

                  {/* CTA */}
                  <div style={{ padding: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                    <Link
                      href="/contact"
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: "0.875rem",
                        borderRadius: "14px",
                        fontSize: "0.9375rem",
                        fontWeight: 600,
                        color: "#000",
                        textDecoration: "none",
                        background: "#ffffff",
                      }}
                    >
                      Book a Call
                    </Link>
                  </div>
                </div>
              </LiquidGlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
