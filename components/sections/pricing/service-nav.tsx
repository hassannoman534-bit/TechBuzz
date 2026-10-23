"use client";

import { motion } from "framer-motion";
import { BarChart3, Code2, Share2, Layers, Search, Sparkles, Video, MonitorPlay, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PricingService, ServiceIcon } from "./pricing.config";

export const SERVICE_ICONS: Record<ServiceIcon, LucideIcon> = {
  smm: Share2,
  ads: BarChart3,
  content: Video,
  brand: Layers,
  ai: Sparkles,
  seo: Search,
  web: Code2,
  yt: MonitorPlay,
};

type ServiceNavProps = {
  services: PricingService[];
  active: number;
  /** service indexes that have a package picked */
  selected: Set<number>;
  /** "20% OFF" / "50% OFF" teaser for the next bundled service */
  nextDiscount: number;
  onSelect: (index: number) => void;
};

const SPRING = { type: "spring", stiffness: 380, damping: 34, mass: 0.7 } as const;

/**
 * Service list. Desktop: a vertical list with a highlight that glides to the active service.
 * Phones and tablets: a horizontal row of chips you can swipe.
 */
export function ServiceNav({ services, active, selected, nextDiscount, onSelect }: ServiceNavProps) {
  return (
    <nav aria-label="Services">
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-white/45">All services</p>
        {nextDiscount > 0 && (
          <span className="rounded-full bg-[linear-gradient(120deg,rgb(123_97_255/0.25),rgb(34_168_255/0.2))] px-2.5 py-1 text-[0.68rem] font-semibold text-[#c9c2ff] ring-1 ring-[#7b61ff]/40">
            {Math.round(nextDiscount * 100)}% OFF
          </span>
        )}
      </div>

      <ul className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0">
        {services.map((svc, i) => {
          const Icon = SERVICE_ICONS[svc.id];
          const isActive = i === active;
          const isPicked = selected.has(i);
          return (
            <li key={svc.id} className="shrink-0 snap-start">
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "group relative isolate flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[#7b61ff]/70",
                  "max-lg:rounded-full max-lg:py-2 max-lg:pr-4 max-lg:ring-1 max-lg:ring-white/10",
                  isActive ? "text-white" : "text-white/60 hover:text-white",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="pricing-service-active"
                    transition={SPRING}
                    className="absolute inset-0 -z-10 rounded-[inherit] bg-[linear-gradient(120deg,rgb(123_97_255/0.18),rgb(91_124_255/0.08))] shadow-[inset_0_0_0_1px_rgb(123_97_255/0.45),0_12px_30px_-18px_rgb(123_97_255/0.8)]"
                  />
                )}
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-lg ring-1 transition-colors duration-300 max-lg:size-7 max-lg:rounded-full",
                    isActive ? "bg-[#7b61ff]/20 text-white ring-[#7b61ff]/50" : "bg-white/[0.03] text-white/60 ring-white/10 group-hover:text-white",
                  )}
                >
                  <Icon className="size-[0.95rem] max-lg:size-3.5" strokeWidth={1.7} />
                </span>
                <span className="min-w-0">
                  <span className="block whitespace-nowrap text-[0.85rem] lg:whitespace-normal font-medium leading-tight">{svc.label}</span>
                  {isPicked && (
                    <motion.span
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-0.5 block text-[0.7rem] font-medium text-[#22d8ff] max-lg:hidden"
                    >
                      Selected
                    </motion.span>
                  )}
                </span>
                {isPicked && <span aria-hidden className="ml-auto size-1.5 shrink-0 rounded-full bg-[#22d8ff] shadow-[0_0_10px_#22d8ff] lg:hidden" />}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
