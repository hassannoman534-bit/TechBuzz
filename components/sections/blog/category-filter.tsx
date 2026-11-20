"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import type { BlogCategory } from "@/lib/wp";
import { BLOG_FILTER, BLOG_MOTION } from "./blog.config";

type CategoryFilterProps = {
  categories: BlogCategory[];
  /** Null means All. */
  activeSlug: string | null;
  total: number;
  pending: boolean;
  onSelect: (slug: string | null) => void;
};

/**
 * Sticky topic bar. Selection goes through the URL rather than local state —
 * see blog-listing.tsx for why — so every tab here is a real, linkable page.
 */
export function CategoryFilter({
  categories,
  activeSlug,
  total,
  pending,
  onSelect,
}: CategoryFilterProps) {
  const reduce = useReducedMotionSafe();

  const tabs: { slug: string | null; name: string; count: number }[] = [
    { slug: null, name: BLOG_FILTER.allLabel, count: total },
    ...categories.map((c) => ({ slug: c.slug, name: c.name, count: c.count })),
  ];

  return (
    <div
      className={cn(
        "sticky top-[4.5rem] z-30 -mx-[clamp(1.25rem,6vw,8rem)] px-[clamp(1.25rem,6vw,8rem)] py-3",
        "border-y border-white/[0.07] bg-[#030712]/82 backdrop-blur-md",
        "transition-opacity duration-300",
        pending && "opacity-60",
      )}
    >
      <div
        role="tablist"
        aria-label="Filter insights by topic"
        // Edges fade instead of being cut, so an overflowing row reads as
        // scrollable without a scrollbar on top of the design.
        className="mx-auto flex w-full max-w-[82rem] gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0, #000 18px, #000 calc(100% - 18px), transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0, #000 18px, #000 calc(100% - 18px), transparent 100%)",
        }}
      >
        {tabs.map((tab) => {
          const active = tab.slug === activeSlug;
          return (
            <button
              key={tab.slug ?? "all"}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(tab.slug)}
              className={cn(
                "relative shrink-0 rounded-full px-4 py-2 outline-none transition-colors duration-300",
                "focus-visible:ring-2 focus-visible:ring-[#7b61ff]/50",
                active ? "text-white" : "text-white/50 hover:text-white/80",
              )}
            >
              {active ? (
                <motion.span
                  // No shared layoutId under reduced motion, so the pill
                  // appears in place instead of sliding across the bar.
                  layoutId={reduce ? undefined : "blog-filter-pill"}
                  transition={{ duration: 0.38, ease: BLOG_MOTION.ease }}
                  className="absolute inset-0 rounded-full border border-white/15 bg-white/[0.07] shadow-[inset_0_1px_0_0_rgb(255_255_255/0.1)]"
                />
              ) : null}

              <span className="font-footer-text relative flex items-center gap-1.5 whitespace-nowrap text-[0.82rem]">
                {tab.name}
                <span
                  className={cn(
                    "text-[0.62rem] tabular-nums transition-colors duration-300",
                    active ? "text-[#7ce9ff]" : "text-white/25",
                  )}
                >
                  {tab.count}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
