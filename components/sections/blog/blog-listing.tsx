"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFinePointer } from "@/lib/use-fine-pointer";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import type { BlogCategory, BlogPost } from "@/lib/wp";
import { BLOG_COPY, BLOG_GRID, BLOG_MOTION } from "./blog.config";
import { CategoryFilter } from "./category-filter";
import { PostCard } from "./post-card";

type BlogListingProps = {
  posts: BlogPost[];
  categories: BlogCategory[];
  activeSlug: string | null;
  page: number;
  totalPages: number;
  failed: boolean;
};

/**
 * Filtering and paging go through the URL rather than client state.
 *
 * There are around 200 posts across 17 pages, so filtering a client-held array
 * would only ever filter the twelve already on screen. Each filter is a real
 * query against WordPress, which also keeps every category page linkable and
 * indexable. useTransition keeps the old grid on screen while the next one is
 * fetched, so the bar never flashes empty.
 */
export function BlogListing({
  posts,
  categories,
  activeSlug,
  page,
  totalPages,
  failed,
}: BlogListingProps) {
  const router = useRouter();
  const reduce = useReducedMotionSafe();
  const fine = useFinePointer();
  const [pending, startTransition] = useTransition();
  const [hovered, setHovered] = useState<number | null>(null);

  const go = (slug: string | null, nextPage: number): void => {
    const params = new URLSearchParams();
    if (slug) params.set("cat", slug);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/blog?${qs}` : "/blog", { scroll: false });
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <CategoryFilter
        categories={categories}
        active={activeSlug}
        onSelect={(slug) => go(slug, 1)}
        pending={pending}
      />

      <div
        style={{
          opacity: pending ? 0.5 : 1,
          transition: "opacity 0.3s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {failed ? (
          <p className="font-footer-text py-16 text-center text-white/50">
            {BLOG_COPY.offline}
          </p>
        ) : posts.length === 0 ? (
          <p className="font-footer-text py-16 text-center text-white/50">
            {BLOG_COPY.empty}
          </p>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${activeSlug ?? "all"}|${page}`}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: BLOG_MOTION.ease }}
              onMouseLeave={() => setHovered(null)}
              className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
              style={{ gridTemplateRows: "auto" }}
            >
              {posts.map((post, i) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={i}
                  hovered={fine ? hovered : null}
                  onHover={setHovered}
                  eager={i < BLOG_GRID.eagerCards}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {totalPages > 1 ? (
        <nav
          aria-label="Blog pagination"
          className="flex items-center justify-center gap-4 pt-2"
        >
          <PagerButton
            disabled={page <= 1 || pending}
            onClick={() => go(activeSlug, page - 1)}
          >
            Previous
          </PagerButton>
          <span className="font-footer-text whitespace-nowrap text-[0.8rem] text-white/45">
            Page {page} of {totalPages}
          </span>
          <PagerButton
            disabled={page >= totalPages || pending}
            onClick={() => go(activeSlug, page + 1)}
          >
            Next
          </PagerButton>
        </nav>
      ) : null}
    </div>
  );
}

type PagerButtonProps = {
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function PagerButton({ disabled, onClick, children }: PagerButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "font-footer-text rounded-full border border-white/12 bg-white/[0.03] px-5 py-2 outline-none transition-colors duration-300",
        "focus-visible:ring-2 focus-visible:ring-[#7b61ff]/50",
        disabled
          ? "cursor-not-allowed text-white/25"
          : "text-white/70 hover:border-white/25 hover:text-white",
      )}
      style={{ fontSize: "0.8rem" }}
    >
      {children}
    </button>
  );
}
