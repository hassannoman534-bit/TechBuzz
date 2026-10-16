"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { GlassButton } from "@/components/ui/GlassButton";
import { RollLink } from "./roll-link";
import { FooterWordmark } from "./footer-wordmark";
import { LocalTime } from "./local-time";
import { GlassPanel } from "./glass-panel";
import { SocialChip } from "./social-chip";
import { SocialIcon } from "./social-icons";
import { footerContent, type FooterContent } from "./footer.config";

type SiteFooterProps = { content?: FooterContent; className?: string };

const label = "text-[0.7rem] font-medium uppercase tracking-[0.18em] text-[#f4f3ff]/40";

/**
 * Curtain-reveal footer: the page scrolls away and uncovers this panel underneath.
 * One premium glass card (headline, contact, menu, studio, socials, copyright) above a
 * giant wordmark that turns to glass on hover. All motion is driven by one smoothed
 * scroll value, transform and opacity only.
 */
export function SiteFooter({ content = footerContent, className }: SiteFooterProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotionSafe();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 170, damping: 34, mass: 0.35, restDelta: 0.0002 });
  const settled = useMotionValue(1);
  const p: MotionValue<number> = reduce ? settled : smooth;

  const drift = useTransform(p, [0, 1], ["10vh", "0vh"]);
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
        "relative h-(--footer-h) [--footer-h:clamp(640px,100svh,1000px)]",
        "[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]",
        "[@media(max-height:599px)]:h-auto [@media(max-height:599px)]:[clip-path:none]",
        className,
      )}
    >
      <div data-footer-panel className="fixed inset-x-0 bottom-0 isolate flex h-(--footer-h) flex-col overflow-hidden bg-[#0a0b22] text-[#f4f3ff] [@media(max-height:599px)]:relative [@media(max-height:599px)]:h-auto">
        {/* Depth: shadow under the departing page, glows for the glass to refract */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-[linear-gradient(180deg,rgb(0_0_0/0.55),transparent)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_55%_at_50%_100%,rgb(123_97_255/0.24),rgb(34_216_255/0.05)_55%,transparent_100%)]" />
        <div aria-hidden className="pointer-events-none absolute -z-10 left-[8%] top-[18%] size-[36vmax] rounded-full bg-[radial-gradient(circle,rgb(123_97_255/0.16),transparent_65%)]" />
        <div aria-hidden className="pointer-events-none absolute -z-10 right-[4%] top-[30%] size-[28vmax] rounded-full bg-[radial-gradient(circle,rgb(34_216_255/0.08),transparent_65%)]" />

        <motion.div
          data-footer-content
          style={{ y: drift, opacity: fade }}
          className="flex flex-1 flex-col justify-end px-[clamp(0.75rem,2.5vw,2.5rem)] pt-[clamp(4.75rem,11svh,7rem)] font-footer-text will-change-transform"
        >
          <GlassPanel spotlight={!reduce} className="px-[clamp(1.1rem,2.6vw,2.5rem)] pt-[clamp(1.2rem,3svh,2.1rem)] pb-[clamp(0.9rem,2svh,1.35rem)]">
            {/* Upper: headline + contact | menu | studio */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-12 md:gap-y-8">
              <div className="col-span-2 md:col-span-6 lg:col-span-7">
                <p className={cn(label, "hidden md:block")}>( {content.eyebrow} )</p>
                <h2 className="font-footer-display text-[clamp(1.85rem,3.6vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-balance text-[#f4f3ff] md:mt-3">
                  {content.tagline.before}
                  {content.tagline.highlight}
                  {content.tagline.after}
                </h2>

                <div className="mt-[clamp(1rem,2.6svh,1.75rem)] flex flex-wrap items-end gap-x-10 gap-y-4">
                  <div>
                    <p className={label}>New business</p>
                    <a href={`mailto:${content.email}`} className="group mt-1.5 inline-flex items-center gap-1.5 text-[clamp(1.05rem,1.5vw,1.35rem)] font-medium tracking-[-0.01em]">
                      <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat transition-[background-size] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-[length:100%_1px]">
                        {content.email}
                      </span>
                      <ArrowUpRight aria-hidden className="size-4 opacity-50 transition-[translate,opacity] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                    </a>
                  </div>
                  <a
                    href={content.whatsapp.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2.5 rounded-full bg-white/[0.04] py-2 pl-2 pr-4 text-[0.875rem] ring-1 ring-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_8px_24px_-12px_rgb(0_0_0/0.9)] transition-[background-color,box-shadow,--tw-ring-color] duration-300 hover:bg-white/[0.07] hover:ring-[rgb(37_211_102/0.5)] hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.16),0_10px_30px_-10px_rgb(37_211_102/0.45)]"
                  >
                    <span className="grid size-7 place-items-center rounded-full bg-[rgb(37_211_102/0.16)] text-[rgb(90_230_140)]">
                      <SocialIcon name="whatsapp" className="size-3.5" />
                    </span>
                    {content.whatsapp.label}
                  </a>
                </div>

                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[0.75rem] text-[#f4f3ff]/60 md:gap-x-6 md:text-[0.85rem]">
                  {content.phones.map((ph) => (
                    <li key={ph.href}>
                      <span className="text-[#f4f3ff]/35">{ph.label}</span>{" "}
                      <a href={ph.href} className="tabular-nums transition-colors hover:text-[#f4f3ff]">{ph.display}</a>
                    </li>
                  ))}
                </ul>
              </div>

              <nav aria-label="Footer" className="md:col-span-2 md:col-start-8 md:pt-1 lg:col-start-9">
                <p className={label}>Menu</p>
                <ul className="mt-3 space-y-1 text-[0.95rem] text-[#f4f3ff]/80">
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
            <div aria-hidden className="mt-[clamp(1rem,2.6svh,1.75rem)] h-px bg-gradient-to-r from-white/0 via-white/15 to-white/0" />

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
