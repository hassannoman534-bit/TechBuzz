"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import type { BlogCategory, BlogPost } from "@/lib/wp";
import { CategoryFilter } from "./category-filter";
import { PostCard } from "./post-card";
import { BlogState } from "./blog-state";
import { BLOG_GRID, BLOG_MOTION } from "./blog.config";

type BlogListingProps = {
  posts: BlogPost[];
  categories: BlogCategory[];
  activeSlug: string | null;
  page: number;
  totalPages: number;
  total: number;
  failed: boolean;
  reason?: string;
};

export function BlogListing({
  posts,
  categories,
  activeSlug,
  page,
  totalPages,
  total,
  failed,
  reason,
}: BlogListingProps) {
  const router = useRouter();
  const reduce = useReducedMotionSafe();
  const [pending, startTransition] = useTransition();
  const [hovered, setHovered] = useState<number | null>(null);

  /**
   * Filtering and paging are URL changes, not local array filtering.
   *
   * There are around 200 posts across 17 pages and only twelve are ever in
   * memory, so filtering what is on screen would silently filter a twelfth of
   * the archive. Going through the URL also means every topic and every page
   * is a real address someone can link to, share, or land on from search.
   */
  const go = (next: { cat?: string | null; page?: number }) => {
    const params = new URLSearchParams();
    const cat = next.cat === undefined ? activeSlug : next.cat;
    const target = next.page ?? 1;

    if (cat) params.set("cat", cat);
    if (target > 1) params.set("page", String(target));

    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/blog?${qs}` : "/blog", { scroll: false });
    });
  };

  return (
    <div className="flex flex-col">
      <CategoryFilter
        categories={categories}
        activeSlug={activeSlug}
        total={total}
        pending={pending}
        onSelect={(slug) => go({ cat: slug, page: 1 })}
      />

      <div className="pt-10">
        {failed ? (
          <BlogState kind="offline" reason={reason} />
        ) : posts.length === 0 ? (
          <BlogState kind="empty" />
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${activeSlug ?? "all"}|${page}`}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.38, ease: BLOG_MOTION.ease }}
              className={cn(
                "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-6",
                pending && "pointer-events-none opacity-60",
              )}
            >
              {posts.map((post, i) => {
                // Magazine rhythm: two wide, then three narrow, repeating.
                const wide = i % BLOG_GRID.rhythm < BLOG_GRID.wideInRhythm;
                return (
                  <div
                    key={post.id}
                    className={wide ? "xl:col-span-3" : "xl:col-span-2"}
                  >
                    <PostCard
                      post={post}
                      index={i}
                      wide={wide}
                      hovered={hovered}
                      onHover={setHovered}
                    />
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {!failed && totalPages > 1 ? (
        <Pagination
          page={page}
          totalPages={totalPages}
          pending={pending}
          onGo={(p) => go({ page: p })}
        />
      ) : null}
    </div>
  );
}

type PaginationProps = {
  page: number;
  totalPages: number;
  pending: boolean;
  onGo: (page: number) => void;
};

/** Windowed page numbers, so 17 pages do not become 17 buttons. */
function pageWindow(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const out: (number | "gap")[] = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(totalPages - 1, page + 1);

  if (from > 2) out.push("gap");
  for (let p = from; p <= to; p++) out.push(p);
  if (to < totalPages - 1) out.push("gap");
  out.push(totalPages);
  return out;
}

function Pagination({ page, totalPages, pending, onGo }: PaginationProps) {
  const items = pageWindow(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "mt-14 flex items-center justify-center gap-1.5 transition-opacity duration-300",
        pending && "opacity-50",
      )}
    >
      <Arrow
        label="Previous page"
        disabled={page <= 1}
        onClick={() => onGo(page - 1)}
      >
        <ChevronLeft className="size-4" strokeWidth={2} />
      </Arrow>

      {items.map((item, i) =>
        item === "gap" ? (
          <span
            key={`gap-${i}`}
            aria-hidden
            className="px-1 text-[0.8rem] text-white/25"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === page ? "page" : undefined}
            onClick={() => onGo(item)}
            className={cn(
              "font-footer-text size-9 rounded-full text-[0.82rem] tabular-nums outline-none transition-colors duration-300",
              "focus-visible:ring-2 focus-visible:ring-[#7b61ff]/50",
              item === page
                ? "border border-white/15 bg-white/[0.07] text-white"
                : "text-white/45 hover:bg-white/[0.04] hover:text-white",
            )}
          >
            {item}
          </button>
        ),
      )}

      <Arrow
        label="Next page"
        disabled={page >= totalPages}
        onClick={() => onGo(page + 1)}
      >
        <ChevronRight className="size-4" strokeWidth={2} />
      </Arrow>
    </nav>
  );
}

function Arrow({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-9 items-center justify-center rounded-full border outline-none transition-colors duration-300",
        "focus-visible:ring-2 focus-visible:ring-[#7b61ff]/50",
        disabled
          ? "cursor-not-allowed border-white/[0.06] text-white/20"
          : "border-white/12 text-white/65 hover:border-white/25 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}
