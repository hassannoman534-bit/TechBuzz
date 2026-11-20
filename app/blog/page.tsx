import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteFooter } from "@/components/sections/site-footer/site-footer";
import { BlogMasthead } from "@/components/sections/blog/blog-masthead";
import { BlogListing } from "@/components/sections/blog/blog-listing";
import { FeaturedPost } from "@/components/sections/blog/featured-post";
import { BlogCta } from "@/components/sections/blog/blog-cta";
import { BLOG_FILTER } from "@/components/sections/blog/blog.config";
import { getCategories, getPosts, type BlogCategory } from "@/lib/wp";

export const metadata: Metadata = {
  title: "Insights | TechBuzz",
  description:
    "Notes on SEO, paid ads, social media, web development and brand growth from TechBuzz, a digital marketing agency in Lahore.",
};

type BlogPageProps = {
  searchParams: Promise<{ cat?: string; page?: string }>;
};

/**
 * The live taxonomy is lopsided, so the bar only shows topics with enough
 * posts behind them to be worth a tab. Shared by the masthead count and the
 * filter bar so the two can never disagree.
 */
function visibleCategories(all: BlogCategory[]): BlogCategory[] {
  return all.filter(
    (c) =>
      c.count >= BLOG_FILTER.minCount &&
      !(BLOG_FILTER.excludeSlugs as readonly string[]).includes(c.slug),
  );
}

/**
 * Two independent Suspense boundaries. The masthead depends only on cached
 * data, so it streams as soon as WordPress answers; the listing additionally
 * depends on searchParams, which cacheComponents requires to sit inside a
 * boundary of its own.
 */
export default function BlogPage({ searchParams }: BlogPageProps) {
  return (
    <main className="bg-[#030712]">
      <Suspense fallback={<BlogMasthead total={0} topics={0} />}>
        <Masthead />
      </Suspense>

      <section className="px-[clamp(1.25rem,6vw,8rem)] pb-[clamp(4rem,10vh,8rem)]">
        <div className="mx-auto w-full max-w-[82rem]">
          <Suspense fallback={<ListingSkeleton />}>
            <BlogIndex searchParams={searchParams} />
          </Suspense>
        </div>
      </section>

      {/* BlogCta is a self-contained panel, so it needs the page gutter. */}
      <div className="px-[clamp(1.25rem,6vw,8rem)] pb-[clamp(4rem,9vh,7rem)]">
        <div className="mx-auto w-full max-w-[82rem]">
          <BlogCta />
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}

async function Masthead() {
  // Both are cached, and getPosts(1) is the same call the unfiltered first
  // page makes, so in the common case this costs nothing extra.
  const [all, first] = await Promise.all([getCategories(), getPosts(1)]);
  return (
    <BlogMasthead total={first.total} topics={visibleCategories(all).length} />
  );
}

async function BlogIndex({ searchParams }: BlogPageProps) {
  const sp = await searchParams;

  const categories = visibleCategories(await getCategories());

  // An unknown ?cat= falls back to All rather than showing an empty grid.
  const active = sp.cat
    ? (categories.find((c) => c.slug === sp.cat) ?? null)
    : null;
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const { posts, totalPages, total, failed, reason } = await getPosts(
    page,
    active?.id,
  );

  // The spotlight is the newest post overall, so it only makes sense on the
  // unfiltered first page. Elsewhere every post goes to the grid.
  const showFeatured = !active && page === 1 && posts.length > 0;
  const featured = showFeatured ? posts[0] : null;
  const rest = showFeatured ? posts.slice(1) : posts;

  return (
    <div className="flex flex-col gap-12">
      {featured ? <FeaturedPost post={featured} /> : null}
      <BlogListing
        posts={rest}
        categories={categories}
        activeSlug={active?.slug ?? null}
        page={page}
        totalPages={totalPages}
        total={total}
        failed={failed}
        reason={reason}
      />
    </div>
  );
}

function ListingSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-12">
      <div className="h-[clamp(20rem,38vw,26rem)] w-full rounded-[1.7rem] border border-white/10 bg-white/[0.02]" />
      <div className="h-14 w-full rounded-full border border-white/[0.07] bg-white/[0.015]" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={cnSkeleton(i)}
            style={{ height: i < 2 ? "20rem" : "22rem" }}
          />
        ))}
      </div>
    </div>
  );
}

/** Mirrors the grid rhythm so the skeleton has the same shape as the result. */
function cnSkeleton(i: number): string {
  const span = i < 2 ? "xl:col-span-3" : "xl:col-span-2";
  return `rounded-[1.25rem] border border-white/10 bg-white/[0.02] ${span}`;
}
