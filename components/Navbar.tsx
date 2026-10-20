"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import LiquidGlassCard from "@/components/ui/LiquidGlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { MetalButton } from "@/components/ui/MetalButton";
import { USE_METAL_BUTTONS } from "@/lib/feature-flags";

/* ─── Nav data ───────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: "Home",      href: "/" },
  { label: "Services",  href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About",     href: "/about" },
  { label: "Blog",      href: "/blog" },
  { label: "Contact",   href: "/contact" },
];

/* "About" opens a dropdown with these sub-pages */
const ABOUT_LINKS = [
  { label: "Our Team",         href: "/our-team" },
  { label: "Careers",          href: "/careers" },
  { label: "Message From CEO", href: "/message-from-ceo" },
];

/* ─── Navbar ─────────────────────────────────────────────────────────────── */

export default function Navbar() {
  const pathname      = usePathname();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [mounted,     setMounted]     = useState(false);

  /* About dropdown (desktop portal + mobile accordion) */
  const [aboutOpen,       setAboutOpen]       = useState(false);
  const [aboutMobileOpen, setAboutMobileOpen] = useState(false);
  const [aboutPos,        setAboutPos]        = useState<{ top: number; left: number } | null>(null);
  const aboutTriggerRef = useRef<HTMLButtonElement>(null);
  const aboutCloseTimer = useRef<number | undefined>(undefined);
  const aboutJustClosed = useRef(false); // guards the Escape-refocus from reopening via onFocus

  const positionAbout = () => {
    const el = aboutTriggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setAboutPos({ top: r.bottom + 12, left: r.left + r.width / 2 });
  };
  const openAbout  = () => { if (aboutJustClosed.current) return; window.clearTimeout(aboutCloseTimer.current); positionAbout(); setAboutOpen(true); };
  const closeAbout = () => {
    window.clearTimeout(aboutCloseTimer.current);
    // small delay so moving the cursor into the panel across the gap doesn't close it
    aboutCloseTimer.current = window.setTimeout(() => setAboutOpen(false), 120);
  };

  /* Portal target for the mobile overlay (the header is now inside a transformed
     HideOnScroll wrapper, so fixed overlays must escape to <body> to fill the screen) */
  useEffect(() => setMounted(true), []);
  const navRef        = useRef<HTMLDivElement>(null);

  /* Scroll listener — initialised on mount so the first frame already has the right state.
     Scrolling also closes the About dropdown (the navbar itself slides away). */
  useEffect(() => {
    const update = () => { setScrolled(window.scrollY > 24); setAboutOpen(false); };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  /* Escape closes the About dropdown and returns focus to its trigger */
  useEffect(() => {
    if (!aboutOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAboutOpen(false);
        aboutJustClosed.current = true;        // suppress the onFocus that the refocus fires
        aboutTriggerRef.current?.focus();
        window.setTimeout(() => { aboutJustClosed.current = false; }, 0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aboutOpen]);

  useEffect(() => () => window.clearTimeout(aboutCloseTimer.current), []);

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
      {/* ── Centering wrapper (positioning handled by the HideOnScroll wrapper) ── */}
      <div
        style={{
          paddingTop:     "16px",
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
              border:    scrolled
                ? "1px solid rgba(255,255,255,0.10)"
                : "1px solid rgba(255,255,255,0.06)",
              boxShadow: scrolled
                ? "0 16px 48px rgba(0,0,0,0.60), 0 1px 0 rgba(255,255,255,0.10) inset"
                : "0 8px 32px rgba(0,0,0,0.40), 0 1px 0 rgba(255,255,255,0.08) inset",
              transition: "box-shadow 0.35s ease, border-color 0.35s ease",
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
                className="hidden lg:flex"
                style={{
                  alignItems: "center",
                  gap:        "2px",
                  position:   "relative",
                }}
                onMouseLeave={() => setHoveredLink(null)}
                aria-label="Main navigation"
              >
                {NAV_LINKS.map((link) => {
                  const active   = isActive(link.href);
                  const hovered  = hoveredLink === link.label;
                  const isAbout  = link.label === "About";
                  const aboutActive = isAbout && ABOUT_LINKS.some((l) => isActive(l.href));
                  const lit      = active || hovered || aboutActive;

                  const linkStyle = {
                    display:        "block",
                    padding:        "0.35rem 0.8rem",
                    borderRadius:   "10px",
                    fontSize:       "0.875rem",
                    fontWeight:     500,
                    letterSpacing:  "0.01em",
                    color:          lit ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.58)",
                    textDecoration: "none",
                    transition:     "color 0.15s ease",
                    whiteSpace:     "nowrap",
                  } as const;

                  return (
                    <div
                      key={link.href}
                      style={{ position: "relative" }}
                      onMouseEnter={() => { setHoveredLink(link.label); if (isAbout) openAbout(); }}
                      onMouseLeave={isAbout ? closeAbout : undefined}
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
                        {isAbout ? (
                          <button
                            ref={aboutTriggerRef}
                            type="button"
                            aria-haspopup="menu"
                            aria-expanded={aboutOpen}
                            onFocus={openAbout}
                            onClick={() => (aboutOpen ? setAboutOpen(false) : openAbout())}
                            style={{ ...linkStyle, background: "transparent", border: "none", cursor: "pointer", font: "inherit", color: linkStyle.color }}
                          >
                            {link.label}
                          </button>
                        ) : (
                          <Link href={link.href} style={linkStyle}>
                            {link.label}
                          </Link>
                        )}
                      </motion.div>
                    </div>
                  );
                })}
              </nav>

              {/* Right — CTA + hamburger */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexShrink: 0 }}>
                {/* CTA — glass button (or metal when the flag is on) */}
                {USE_METAL_BUTTONS ? (
                  <MetalButton href="/contact" size="md" preset="chromatic">
                    Book a Call
                  </MetalButton>
                ) : (
                  <GlassButton href="/contact" variant="primary" size="md">
                    Book a Call
                  </GlassButton>
                )}

                {/* Hamburger — shown until the links fit (below lg) */}
                <motion.button
                  className="flex lg:hidden"
                  whileTap={{ scale: 0.90 }}
                  onClick={() => setMobileOpen((v) => !v)}
                  style={{
                    background:  "rgba(255,255,255,0.08)",
                    border:      "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "10px",
                    padding:     "6px",
                    color:       "rgba(255,255,255,0.75)",
                    lineHeight:   1,
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

      {/* ── Mobile drawer (portaled to <body> so it fills the viewport, not the transformed header) ── */}
      {mounted && createPortal(
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
                    {NAV_LINKS.map((link, i) => {
                      const linkStyle = {
                        display: "block",
                        padding: "0.75rem 1rem",
                        borderRadius: "12px",
                        fontSize: "1rem",
                        fontWeight: 600,
                        textDecoration: "none",
                        fontFamily: '"Syne", system-ui, sans-serif',
                        transition: "background 0.15s ease, color 0.15s ease",
                      } as const;
                      const divider = <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "0 1rem" }} />;

                      if (link.label === "About") {
                        const aboutActive = ABOUT_LINKS.some((l) => isActive(l.href));
                        return (
                          <motion.div
                            key={link.href}
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 + i * 0.04, duration: 0.25 }}
                          >
                            <button
                              type="button"
                              aria-haspopup="menu"
                              aria-expanded={aboutMobileOpen}
                              onClick={() => setAboutMobileOpen((v) => !v)}
                              style={{
                                ...linkStyle,
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: aboutActive ? "#38bdf8" : "rgba(255,255,255,0.80)",
                              }}
                            >
                              {link.label}
                              <ChevronDown size={16} style={{ transition: "transform 0.2s ease", transform: aboutMobileOpen ? "rotate(180deg)" : "none" }} />
                            </button>
                            <AnimatePresence initial={false}>
                              {aboutMobileOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                  style={{ overflow: "hidden" }}
                                >
                                  {ABOUT_LINKS.map((l) => (
                                    <Link
                                      key={l.href}
                                      href={l.href}
                                      onClick={() => setMobileOpen(false)}
                                      aria-current={isActive(l.href) ? "page" : undefined}
                                      style={{
                                        ...linkStyle,
                                        padding: "0.6rem 1rem 0.6rem 1.75rem",
                                        fontSize: "0.95rem",
                                        fontWeight: 500,
                                        color: isActive(l.href) ? "#38bdf8" : "rgba(255,255,255,0.68)",
                                      }}
                                    >
                                      {l.label}
                                    </Link>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                            {divider}
                          </motion.div>
                        );
                      }

                      return (
                        <motion.div
                          key={link.href}
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 + i * 0.04, duration: 0.25 }}
                        >
                          <Link
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            style={{ ...linkStyle, color: isActive(link.href) ? "#38bdf8" : "rgba(255,255,255,0.80)" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                          >
                            {link.label}
                          </Link>
                          {divider}
                        </motion.div>
                      );
                    })}
                  </nav>

                  {/* CTA */}
                  <div style={{ padding: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                    <GlassButton href="/contact" variant="primary" size="md" fullWidth onClick={() => setMobileOpen(false)}>
                      Book a Call
                    </GlassButton>
                  </div>
                </div>
              </LiquidGlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body,
      )}

      {/* ── About dropdown (desktop) — portaled to <body> so the navbar's glass clip can't cut it ── */}
      {mounted && aboutPos && createPortal(
        <AnimatePresence>
          {aboutOpen && (
            <motion.div
              role="menu"
              aria-label="About"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => window.clearTimeout(aboutCloseTimer.current)}
              onMouseLeave={closeAbout}
              className="fixed z-[60] w-56 -translate-x-1/2 rounded-2xl border border-white/10 bg-white/[0.04] p-2 backdrop-blur-md shadow-[0_24px_60px_-20px_rgba(0,0,0,0.85)]"
              style={{ top: aboutPos.top, left: aboutPos.left }}
            >
              {ABOUT_LINKS.map((l) => {
                const active = isActive(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    role="menuitem"
                    aria-current={active ? "page" : undefined}
                    onClick={() => setAboutOpen(false)}
                    className={cn(
                      "block rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/[0.06] hover:text-white",
                    )}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
