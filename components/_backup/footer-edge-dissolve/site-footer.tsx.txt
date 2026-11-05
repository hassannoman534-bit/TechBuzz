"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowDownLeft, ArrowUp, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { GlassButton } from "@/components/ui/GlassButton";
import { RollLink } from "./roll-link";
import { FooterWordmark } from "./footer-wordmark";
import { LocalTime } from "./local-time";
import { GlassPanel } from "./glass-panel";
import { SocialChip } from "./social-chip";
import { SocialIcon } from "./social-icons";
import { FooterCurve } from "./footer-curve";
import { footerContent, type FooterContent } from "./footer.config";

type SiteFooterProps = {
  content?: FooterContent;
  className?: string;
  /** Background of the section directly above the footer (the curved edge uses it) */
  curveColor?: string;
};

const label = "text-[0.7rem] font-medium uppercase tracking-[0.18em] text-[#f4f3ff]/40";
const pill =
  "group inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white/[0.04] px-3.5 py-2 text-[0.8rem] md:px-4 md:py-2.5 md:text-[0.85rem] text-[#f4f3ff]/90 ring-1 ring-white/12 shadow-[inset_0_1px_0_rgb(255_255_255/0.10)] transition-[background-color,box-shadow,color] duration-300 hover:bg-white/[0.08] hover:text-white hover:ring-white/30";

/**
 * Curtain-reveal footer: the page scrolls away and uncovers this panel underneath.
 * One premium glass card (headline, contact, menu, studio, socials, copyright) above a
 * giant wordmark that turns to glass on hover. All motion is driven by one smoothed
 * scroll value, transform and opacity only.
 */
export function SiteFooter({ content = footerContent, className, curveColor = "#030712" }: SiteFooterProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotionSafe();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 170, damping: 34, mass: 0.35, restDelta: 0.0002 });
  const settled = useMotionValue(1);
  const p: MotionValue<number> = reduce ? settled : smooth;

  const drift = useTransform(p, [0, 1], ["14vh", "0vh"]);
  const fade = useTransform(p, [0, 0.6], [0.2, 1]);

  // Read the year after mount: `new Date()` during render blocks the prerender under
  // Next's Cache Components. The fallback keeps server/client markup identical.
  const [year, setYear] = useState(2026);
  useEffect(() => setYear(new Date().getFullYear()), []);
  const n = content.socials.length;

  return (
    <footer
      ref={ref}
      aria-label="Site footer"
      className={cn(
        "relative h-(--footer-h) [--footer-h:clamp(560px,100svh,1000px)]",
        "[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]",
        "[@media(max-height:599px)]:h-auto [@media(max-height:599px)]:[clip-path:none]",
        className,
      )}
    >
      {!reduce && <FooterCurve progress={p} color={curveColor} />}
      <div data-footer-panel className="fixed inset-x-0 bottom-0 isolate flex h-(--footer-h) flex-col overflow-hidden bg-[#0a0b22] text-[#f4f3ff] [@media(max-height:599px)]:relative [@media(max-height:599px)]:h-auto">
        {/* Depth: shadow under the departing page, glows for the glass to refract */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-[linear-gradient(180deg,rgb(0_0_0/0.55),transparent)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_55%_at_50%_100%,rgb(123_97_255/0.24),rgb(34_216_255/0.05)_55%,transparent_100%)]" />
        <div aria-hidden className="pointer-events-none absolute -z-10 left-[8%] top-[18%] size-[36vmax] rounded-full bg-[radial-gradient(circle,rgb(123_97_255/0.16),transparent_65%)]" />
        <div aria-hidden className="pointer-events-none absolute -z-10 right-[4%] top-[30%] size-[28vmax] rounded-full bg-[radial-gradient(circle,rgb(34_216_255/0.08),transparent_65%)]" />

        <motion.div
          data-footer-content
          style={{ y: drift, opacity: fade }}
          className="flex flex-1 flex-col justify-end px-[clamp(0.75rem,2.5vw,2.5rem)] pt-[clamp(0.75rem,2.5svh,1.75rem)] font-footer-text will-change-transform"
        >
          <GlassPanel spotlight={!reduce} className="px-[clamp(1.1rem,2.6vw,2.5rem)] pt-[clamp(1.1rem,3svh,2rem)] pb-[clamp(0.8rem,1.8svh,1.2rem)]">
            {/* Upper: headline + contact | menu | studio */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-12 md:gap-y-8">
              <div className="col-span-2 md:col-span-6 lg:col-span-7">
                {/* Headline: two lines, with the small arrow pointing at the contact row */}
                <div className="flex items-start justify-between gap-6">
                  <h2 className="max-w-[9.5em] font-footer-display text-[clamp(2rem,4.1vw,4.25rem)] font-semibold leading-[1] tracking-[-0.04em] text-[#f4f3ff]">
                    {content.tagline.before}
                    {content.tagline.highlight}
                    {content.tagline.after}
                  </h2>
                  <ArrowDownLeft aria-hidden className="mt-2 hidden size-[clamp(1.25rem,1.8vw,1.75rem)] shrink-0 text-[#f4f3ff]/60 md:block" strokeWidth={1.5} />
                </div>

                {/* Divider */}
                <div className="mt-[clamp(1.75rem,5svh,3.25rem)] h-px bg-gradient-to-r from-white/20 via-white/15 to-white/0" />

                {/* Contact pills */}
                <div className="mt-[clamp(1.75rem,5svh,3.25rem)] flex flex-wrap gap-2 md:max-w-[calc(100%-clamp(8rem,13vw,12.5rem))] md:gap-2.5">
                  <a href={`mailto:${content.email}`} className={pill}>
                    <Mail aria-hidden className="size-3.5 text-[#f4f3ff]/60" />
                    {content.email}
                  </a>
                  <a href={content.whatsapp.href} target="_blank" rel="noopener noreferrer" className={cn(pill, "hover:ring-[rgb(37_211_102/0.5)]")}>
                    <SocialIcon name="whatsapp" className="size-3.5 text-[rgb(90_230_140)]" />
                    {content.whatsapp.label}
                  </a>
                  {content.phones.map((ph) => (
                    <a key={ph.href} href={ph.href} className={pill}>
                      <span className="text-[#f4f3ff]/45">{ph.label}</span>
                      <span className="tabular-nums">{ph.display}</span>
                    </a>
                  ))}
                </div>
              </div>

              <nav aria-label="Footer" className="md:col-span-2 md:col-start-8 md:pt-1 lg:col-start-9">
                <p className={label}>Menu</p>
                <ul className="mt-3 space-y-0.5 text-[0.95rem] text-[#f4f3ff]/80">
                  {content.nav.map((l) => (
                    <li key={l.label}>
                      <RollLink href={l.href} className="hover:text-[#f4f3ff]">{l.label}</RollLink>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="md:col-span-3 md:col-start-10 md:pt-1 lg:col-span-2 lg:col-start-11">
                <p className={label}>{content.studio.label}</p>
                <a href={content.studio.mapHref} target="_blank" rel="noopener noreferrer" className="mt-3 block text-[0.9rem] leading-[1.55] text-[#f4f3ff]/80 transition-colors hover:text-[#f4f3ff]">
                  {content.studio.lines.map((line) => (
                    <span key={line} className="block">{line}</span>
                  ))}
                </a>
                <p className="mt-3 flex items-center gap-2 text-[0.8rem] text-[#f4f3ff]/50">
                  <span aria-hidden className="relative flex size-1.5">
                    <span className="absolute inset-0 animate-ping rounded-full bg-[#2cf5b0]/60 motion-reduce:animate-none" />
                    <span className="relative size-1.5 rounded-full bg-[#2cf5b0]" />
                  </span>
                  <LocalTime timeZone={content.studio.timeZone} zoneLabel={content.studio.zoneLabel} />
                </p>
              </div>
            </div>

            {/* Hairline divider */}
            <div aria-hidden className="mt-[clamp(1.1rem,3svh,2rem)] h-px bg-gradient-to-r from-white/0 via-white/12 to-white/0" />

            {/* Lower: socials | copyright | back to top */}
            <div className="mt-[clamp(0.8rem,1.8svh,1.2rem)] flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
              <ul aria-label="Social media" className="flex flex-wrap gap-2.5 md:gap-3">
                {content.socials.map((s, i) => (
                  <SocialChip key={s.label} social={s} progress={p} range={[0.5 + (i * 0.3) / n, 0.72 + (i * 0.3) / n]} />
                ))}
              </ul>
              <div className="flex w-full items-center justify-between gap-6 lg:w-auto lg:justify-end lg:gap-8">
                <p className="text-[0.8rem] text-[#f4f3ff]/45">
                  © {content.copyright.since} to {year} {content.copyright.name}.<span className="hidden sm:inline"> {content.copyright.suffix}</span>
                </p>
                <GlassButton
                  variant="outline"
                  size="sm"
                  trailingIcon={<ArrowUp className="size-3.5" aria-hidden />}
                  onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })}
                >
                  Back to top
                </GlassButton>
              </div>
            </div>
          </GlassPanel>
        </motion.div>

        {/* Giant wordmark, turns to glass on hover */}
        <div className="overflow-hidden px-[clamp(0.25rem,0.6vw,0.75rem)] pt-[clamp(0.4rem,1.2svh,0.8rem)] pb-[clamp(0.2rem,0.6vw,0.5rem)]">
          <FooterWordmark text={content.wordmark} progress={p} />
        </div>
      </div>
    </footer>
  );
}
