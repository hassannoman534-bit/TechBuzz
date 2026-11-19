"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import type { BlogCategory } from "@/lib/wp";
import { BLOG_FILTER, BLOG_MOTION } from "./blog.config";

type CategoryFilterProps = {
  categories: BlogCategory[];
  /** Slug of the active category, or null for All. */
  active: string | null;
  onSelect: (slug: string | null) => void;
  pending: boolean;
};

/**
 * The active pill is a layoutId element, so it slides between tabs instead of
 * cross-fading. Under reduced motion the layout animation is dropped and the
 * pill simply appears under the active tab.
 */
export function CategoryFilter({
  categories,
  active,
  onSelect,
  pending,
}: CategoryFilterProps) {
  const reduce = useReducedMotionSafe();

  const tabs: { key: string; slug: string | null; label: string }[] = [
    { key: "__all", slug: null, label: BLOG_FILTER.allLabel },
    ...categories.map((c) => ({ key: c.slug, slug: c.slug, label: c.name })),
  ];

  return (
    <div
      role="tablist"
      aria-label="Filter posts by category"
      aria-busy={pending}
      className="flex flex-wrap items-center gap-2"
    >
      {tabs.map((tab) => {
        const isActive = tab.slug === active;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(tab.slug)}
            className={cn(
              "relative rounded-full px-4 py-2 outline-none transition-colors duration-300",
              "focus-visible:ring-2 focus-visible:ring-[#7b61ff]/50",
              isActive ? "text-white" : "text-white/50 hover:text-white/80",
            )}
          >
            {isActive ? (
              <motion.span
                aria-hidden
                layoutId={reduce ? undefined : "blog-filter-pill"}
                transition={{ duration: 0.45, ease: BLOG_MOTION.ease }}
                className="absolute inset-0 rounded-full border border-white/15 bg-white/[0.06] shadow-[inset_0_1px_0_0_rgb(255_255_255/0.08)]"
              />
            ) : null}
            <span
              className="font-footer-text relative z-10 whitespace-nowrap"
              style={{ fontSize: "0.82rem", letterSpacing: "0.02em" }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
