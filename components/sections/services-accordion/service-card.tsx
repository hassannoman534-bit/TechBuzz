"use client";

import Link from "next/link";
import { motion, type Transition } from "framer-motion";
import { cn } from "@/lib/utils";
import { ServiceArt } from "./service-art";
import type { Service } from "./services.config";

const FADE: Transition = { duration: 0.45, ease: [0.22, 1, 0.36, 1] };
/** Soft spring with a little overshoot for the artwork (transform only). */
const JELLY: Transition = { type: "spring", stiffness: 190, damping: 21, mass: 0.9 };

type ServiceCardProps = {
  service: Service;
  index: number;
  active: boolean;
  /** Click, tap or keyboard focus */
  onSelect: (index: number) => void;
};

/**
 * Height switches between two fixed sizes (--svc-row / --svc-open) via a CSS transition.
 * Opening uses an overshooting curve (the jelly feel); closing settles without overshoot.
 * The list's total height never changes, so nothing outside the list re-lays out.
 */
export function ServiceCard({ service, index, active, onSelect }: ServiceCardProps) {
  const number = String(index + 1).padStart(2, "0");
  const panelId = `service-panel-${index}`;

  return (
    <li
      className={cn(
        "relative isolate shrink-0 overflow-hidden rounded-[26px] border border-white/[0.07] bg-white/[0.03] [contain:paint]",
        "transition-[height]",
        active
          ? "h-[var(--svc-open)] duration-[760ms] ease-[cubic-bezier(0.34,1.32,0.64,1)]"
          : "h-[var(--svc-row)] duration-[560ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
      )}
      data-index={index}
    >
      {/* Expanded surface: deep gradient + glow, faded in (opacity only) */}
      <motion.div
        aria-hidden
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={FADE}
        className="absolute inset-x-0 top-0 -z-10 h-[var(--svc-open)] will-change-[opacity] bg-[linear-gradient(118deg,#0c0a26_0%,#171247_38%,#251c74_66%,#12365c_100%)]"
      >
        <div className="absolute -left-[10%] -top-1/2 h-[160%] w-[60%] bg-[radial-gradient(closest-side,rgb(123_97_255/0.35),transparent)]" />
        <div className="absolute -bottom-1/2 right-[5%] h-[150%] w-[55%] bg-[radial-gradient(closest-side,rgb(34_216_255/0.22),transparent)]" />
      </motion.div>

      {/* Artwork on the right, sized to the open card so it never stretches */}
      <motion.div
        aria-hidden
        initial={false}
        animate={{ opacity: active ? 1 : 0, x: active ? 0 : 60, scale: active ? 1 : 0.94 }}
        transition={active ? { ...JELLY, opacity: FADE } : FADE}
        className="pointer-events-none absolute right-0 top-0 -z-10 h-[var(--svc-open)] w-[62%] origin-right will-change-transform max-md:w-full max-md:opacity-40"
      >
        <ServiceArt kind={service.art} />
      </motion.div>

      <button
        type="button"
        aria-expanded={active}
        aria-controls={panelId}
        onClick={() => onSelect(index)}
        onFocus={() => onSelect(index)}
        className="flex h-[var(--svc-row)] w-full items-center gap-5 px-[clamp(1.25rem,3vw,2.75rem)] text-left outline-none focus-visible:ring-1 focus-visible:ring-ion/60"
      >
        <span
          className={cn(
            "font-signature text-[0.8rem] font-medium tabular-nums tracking-[0.08em] transition-colors duration-500",
            active ? "text-ion-soft" : "text-ink-faint",
          )}
        >
          {number}
        </span>
        <span
          className={cn(
            "font-signature text-[clamp(1.2rem,2.6vw,2.4rem)] font-bold leading-[1.1] tracking-[-0.03em] transition-colors duration-500",
            active ? "text-ink" : "text-ink/55",
          )}
        >
          {service.title}
        </span>
      </button>

      <motion.div
        id={panelId}
        role="region"
        aria-hidden={!active}
        initial={false}
        animate={{ opacity: active ? 1 : 0, y: active ? 0 : 14 }}
        transition={{ ...FADE, delay: active ? 0.14 : 0 }}
        // PERF: y+opacity are GPU-composited; willChange keeps it on compositor layer
        style={{ willChange: "transform, opacity" }}
        className="max-w-[44ch] px-[clamp(1.25rem,3vw,2.75rem)] pl-[calc(clamp(1.25rem,3vw,2.75rem)+2.6rem)] max-md:pl-[clamp(1.25rem,3vw,2.75rem)]"
      >
        <p className="font-signature text-[clamp(0.98rem,1.15vw,1.1rem)] leading-[1.65] text-ink/75">{service.description}</p>
        <Link
          href={service.href}
          tabIndex={active ? 0 : -1}
          className="group mt-6 inline-flex items-center gap-3 font-signature text-[0.9rem] font-semibold text-ink"
        >
          Explore
          <span className="grid size-9 place-items-center rounded-full bg-[linear-gradient(135deg,#f4f2ff,#c9f4ff)] text-[#0b0e1f] transition-transform duration-300 ease-out group-hover:translate-x-1">
            <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
              <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </Link>
      </motion.div>
    </li>
  );
}
