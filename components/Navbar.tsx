"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, LayoutGrid, Tag, Users, PenLine, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { LiquidNavbar, NimbusIcons, type LiquidNavItem } from "@/components/ui/liquid-glass-navbar";

/* ─── Nav data ───────────────────────────────────────────────────────────── */

/* "About" opens a dropdown with these sub-pages */
const ABOUT_LINKS = [
  { label: "Our Team",         href: "/our-team" },
  { label: "Careers",          href: "/careers" },
  { label: "Message From CEO", href: "/message-from-ceo" },
];

/* The water pill is the whole navbar. About has no href, it opens the dropdown.
   Labels collapse to icons below 1280px (handled inside LiquidNavbar). */
const ICON = { size: 18, strokeWidth: 1.8 } as const;
const NAV_ITEMS: LiquidNavItem[] = [
  { label: "Home",      href: "/",          icon: NimbusIcons.home,        fx: "glow" },
  { label: "Services",  href: "/services",  icon: <Sparkles {...ICON} />,  fx: "spin" },
  { label: "Portfolio", href: "/portfolio", icon: <LayoutGrid {...ICON} />, fx: "pop" },
  { label: "Pricing",   href: "/pricing",   icon: <Tag {...ICON} />,       fx: "wave" },
  { label: "About",                         icon: <Users {...ICON} />,     fx: "pop" },
  { label: "Blog",      href: "/blog",      icon: <PenLine {...ICON} />,   fx: "wave" },
  { label: "Contact",   href: "/contact",   icon: <Send {...ICON} />,      fx: "plane" },
];
const ABOUT_INDEX = NAV_ITEMS.findIndex((i) => i.label === "About");

const MENU_HALF = 112; // half the dropdown width (w-56), keeps it on screen on phones
const EDGE = 12;

/* ─── Navbar ─────────────────────────────────────────────────────────────── */

export default function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  /* About dropdown (portaled to body) */
  const [aboutOpen, setAboutOpen] = useState(false);
  const [aboutPos,  setAboutPos]  = useState<{ top: number; left: number } | null>(null);
  const aboutTriggerRef = useRef<HTMLElement | null>(null);
  const aboutCloseTimer = useRef<number | undefined>(undefined);
  const aboutJustClosed = useRef(false); // guards the Escape-refocus from reopening via onFocus

  const positionAbout = () => {
    const el = aboutTriggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const center = r.left + r.width / 2;
    const left = Math.min(Math.max(center, MENU_HALF + EDGE), window.innerWidth - MENU_HALF - EDGE);
    setAboutPos({ top: r.bottom + 12, left });
  };
  const openAbout = () => {
    if (aboutJustClosed.current) return;
    window.clearTimeout(aboutCloseTimer.current);
    positionAbout();
    setAboutOpen(true);
  };
  const closeAbout = () => {
    window.clearTimeout(aboutCloseTimer.current);
    // small delay so moving the cursor into the panel across the gap doesn't close it
    aboutCloseTimer.current = window.setTimeout(() => setAboutOpen(false), 120);
  };
  /* Hover opening only on real hover devices; on touch, tap toggles via onSelect */
  const canHover = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  useEffect(() => setMounted(true), []);

  /* Scrolling closes the About dropdown (the navbar itself slides away) */
  useEffect(() => {
    const close = () => setAboutOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, []);

  /* Tap outside closes the dropdown (touch has no pointer leave) */
  useEffect(() => {
    if (!aboutOpen) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (aboutTriggerRef.current?.contains(t)) return;
      if ((t as Element).closest?.("[data-about-menu]")) return;
      setAboutOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [aboutOpen]);

  /* Escape closes the About dropdown and returns focus to its trigger */
  useEffect(() => {
    if (!aboutOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAboutOpen(false);
        aboutJustClosed.current = true; // suppress the onFocus that the refocus fires
        aboutTriggerRef.current?.focus();
        window.setTimeout(() => { aboutJustClosed.current = false; }, 0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aboutOpen]);

  useEffect(() => () => window.clearTimeout(aboutCloseTimer.current), []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  /* Which pill item holds the water drop (-1 = route not in the menu, no drop) */
  const aboutRouteActive = ABOUT_LINKS.some((l) => isActive(l.href));
  const activeIndex = aboutRouteActive
    ? ABOUT_INDEX
    : NAV_ITEMS.findIndex((item) => item.href !== undefined && isActive(item.href));

  return (
    <>
      {/* ── The pill, centered (positioning handled by the HideOnScroll wrapper) ── */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        style={{ paddingTop: "16px", display: "flex", justifyContent: "center", pointerEvents: "none" }}
      >
        <div style={{ pointerEvents: "auto", maxWidth: "calc(100vw - 24px)" }}>
          <LiquidNavbar
            tone="dark"
            dropInset={3}
            items={NAV_ITEMS}
            active={activeIndex}
            expanded={{ [ABOUT_INDEX]: aboutOpen }}
            onSelect={(i, _item, el) => {
              if (i !== ABOUT_INDEX) return setAboutOpen(false);
              aboutTriggerRef.current = el;
              if (aboutOpen) setAboutOpen(false);
              else openAbout();
            }}
            onItemEnter={(i, el) => {
              if (i !== ABOUT_INDEX || !canHover()) return;
              aboutTriggerRef.current = el;
              openAbout();
            }}
            onItemLeave={(i) => {
              if (i === ABOUT_INDEX && canHover()) closeAbout();
            }}
          />
        </div>
      </motion.div>

      {/* ── About dropdown, portaled to <body> so the transformed header can't clip it ── */}
      {mounted && aboutPos && createPortal(
        <AnimatePresence>
          {aboutOpen && (
            <motion.div
              data-about-menu
              role="menu"
              aria-label="About"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => window.clearTimeout(aboutCloseTimer.current)}
              onMouseLeave={() => { if (canHover()) closeAbout(); }}
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
