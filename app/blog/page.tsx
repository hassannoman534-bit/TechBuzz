import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/sections/page-hero/page-hero";
import { SiteFooter } from "@/components/sections/site-footer/site-footer";
import { BlogListing } from "@/components/sections/blog/blog-listing";
import { FeaturedPost } from "@/components/sections/blog/featured-post";
import {
  BLOG_COPY,
  BLOG_FILTER,
} from "@/components/sections/blog/blog.config";
import { getCategories, getPosts } from "@/lib/wp";

export const metadata: Metadata = {
  title: "Insights | TechBuzz",
  description:
    "Notes on SEO, paid ads, social media, web development and brand growth from TechBuzz, a digital marketing agency in Lahore.",
};

type BlogPageProps = {
  searchParams: Promise<{ cat?: string; page?: string }>;
};

/**
 * The hero is static and renders instantly. Everything that depends on
 * searchParams, and therefore on the request, sits inside Suspense, which is
 * what cacheComponents requires and what lets the shell be prerendered.
 */
export default function BlogPage({ searchParams }: BlogPageProps) {
  return (
    <main className="bg-[#030712]">
      <PageHero
        content={{
          eyebrow: BLOG_COPY.eyebrow,
          lines: [BLOG_COPY.title],
          sub: BLOG_COPY.sub,
        }}
      />
      <section className="px-[clamp(1.25rem,6vw,8rem)] pb-[clamp(4rem,10vh,8rem)] pt-0">
        <div className="mx-auto w-full max-w-[82rem]">
          <Suspense fallback={<ListingSkeleton />}>
            <BlogIndex searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

async function BlogIndex({ searchParams }: BlogPageProps) {
  const sp = await searchParams;

  const all = await getCategories();
  const categories = all.filter(
    (c) =>
      c.count >= BLOG_FILTER.minCount &&
      !(BLOG_FILTER.excludeSlugs as readonly string[]).includes(c.slug),
  );

  // An unknown ?cat= falls back to All rather than showing an empty grid.
  const active = sp.cat ? (categories.find((c) => c.slug === sp.cat) ?? null) : null;
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const { posts, totalPages, failed } = await getPosts(page, active?.id);

  // The spotlight is the newest post overall, so it only makes sense on the
  // unfiltered first page. Elsewhere every post goes to the grid.
  const showFeatured = !active && page === 1 && posts.length > 0;
  const featured = showFeatured ? posts[0] : null;
  const rest = showFeatured ? posts.slice(1) : posts;

  return (
    <div className="flex flex-col gap-10">
      {featured ? <FeaturedPost post={featured} /> : null}
      <BlogListing
        posts={rest}
        categories={categories}
        activeSlug={active?.slug ?? null}
        page={page}
        totalPages={totalPages}
        failed={failed}
      />
    </div>
  );
}

function ListingSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-10">
      <div className="h-[300px] w-full rounded-3xl border border-white/10 bg-white/[0.02]" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="h-[22rem] rounded-2xl border border-white/10 bg-white/[0.02]"
          />
        ))}
      </div>
    </div>
  );
}
