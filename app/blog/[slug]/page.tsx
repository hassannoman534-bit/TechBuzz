import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/sections/site-footer/site-footer";
import { ArticleBody } from "@/components/sections/blog/article-body";
import { BlogCta } from "@/components/sections/blog/blog-cta";
import { ReadingProgress } from "@/components/sections/blog/reading-progress";
import { BLOG_COPY, BLOG_GRID } from "@/components/sections/blog/blog.config";
import { getPostBySlug, getRelated, type BlogPost } from "@/lib/wp";

type ArticleProps = { params: Promise<{ slug: string }> };

/*
 * An article genuinely blocks on the CMS, so it is not an instant navigation
 * and is marked as such. Without this, instant-navigation validation fails the
 * build on `usePathname()` in a Client Component outside Suspense: that call
 * is in components/Navbar.tsx and components/atmosphere/atmosphere-controller
 * .tsx, both mounted by the root layout, and every other route in the app
 * avoids it only by being fully static.
 *
 * With validation off, the slug can be read in the page body rather than
 * inside Suspense, which is what makes an unknown slug return a real 404.
 * Streamed inside a boundary it returned 200 with the not found page in the
 * body, a soft 404. Verified both ways.
 */
export const instant = false;

/*
 * There is deliberately no generateStaticParams here.
 *
 * Under cacheComponents Next requires it to return at least one result, and it
 * fails the build when it returns none. Since the only source of slugs is the
 * WordPress API, that couples every deploy to the CMS being reachable: a
 * WordPress outage, or a firewall change on that box, breaks an unrelated
 * deploy with "all generateStaticParams functions must return at least one
 * result". Verified by building with the CMS unreachable.
 *
 * Articles therefore render on first request and are then held by the hour
 * profile on getPostBySlug, which costs one uncached render per post per hour
 * and makes the build independent of the CMS.
 */

export async function generateMetadata({
  params,
}: ArticleProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not found | TechBuzz" };

  return {
    title: `${post.title} | TechBuzz`,
    description: post.description ?? post.excerpt,
    openGraph: {
      title: post.title,
      description: post.description ?? post.excerpt,
      type: "article",
      publishedTime: post.dateISO,
      images: post.image ? [{ url: post.image.url }] : undefined,
    },
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function ArticlePage({ params }: ArticleProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  return (
    <main className="bg-[#030712] text-white">
      <ReadingProgress />
      <Article post={post} />
      <SiteFooter />
    </main>
  );
}

async function Article({ post }: { post: BlogPost }) {
  const related = await getRelated(post, 3);

  return (
    <>
      <article className="px-[clamp(1.25rem,6vw,8rem)] pb-[clamp(3rem,8vh,5rem)] pt-[clamp(7rem,16vh,10rem)]">
        <div className="mx-auto w-full max-w-[52rem]">
          <Link
            href="/blog"
            className="font-footer-text inline-flex items-center gap-2 text-[0.78rem] text-white/45 outline-none transition-colors duration-300 hover:text-white focus-visible:text-white"
          >
            <ArrowLeft aria-hidden className="size-3.5" />
            {BLOG_COPY.backToBlog}
          </Link>

          <p className="font-footer-text mt-8 truncate text-[0.72rem] uppercase tracking-[0.2em] text-[#c9c2ff]/70">
            {post.categoryNames[0] ?? "Insight"}
            <span className="px-2 text-white/25">/</span>
            {post.readMinutes} min read
            <span className="px-2 text-white/25">/</span>
            {post.dateLabel}
          </p>

          <h1 className="mt-4 text-balance">
            <span className="font-footer-display text-[clamp(1.8rem,4vw,3.1rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-white">
              {post.title}
            </span>
          </h1>

          {post.author ? (
            <p className="font-footer-text mt-5 text-[0.85rem] text-white/50">
              {post.author}
            </p>
          ) : null}

          {post.image ? (
            <div className="relative mt-9 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#070b16]">
              <Image
                src={post.image.url}
                alt={post.image.alt}
                width={post.image.width}
                height={post.image.height}
                priority
                sizes="(min-width: 1024px) 52rem, 92vw"
                className="h-auto w-full object-cover"
              />
            </div>
          ) : null}

          <div className="mt-10">
            <ArticleBody html={post.html} />
          </div>

          <div
            className="mt-14"
            style={{ maxWidth: `${BLOG_GRID.articleMaxWidthCh}ch` }}
          >
            <BlogCta />
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="px-[clamp(1.25rem,6vw,8rem)] pb-[clamp(4rem,10vh,7rem)]">
          <div className="mx-auto w-full max-w-[82rem]">
            <h2 className="mb-6">
              <span className="font-footer-display text-[1.15rem] font-semibold text-white/80">
                {BLOG_COPY.relatedTitle}
              </span>
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="group flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-5 outline-none transition-colors duration-300 hover:border-white/20 focus-visible:border-[#7b61ff]"
                >
                  <p className="font-footer-text truncate text-[0.68rem] uppercase tracking-[0.18em] text-[#c9c2ff]/60">
                    {r.categoryNames[0] ?? "Insight"}
                    <span className="px-2 text-white/25">/</span>
                    {r.readMinutes} min read
                  </p>
                  <h3 className="text-balance">
                    <span className="font-footer-display text-[0.98rem] font-semibold leading-snug text-white transition-colors duration-300 group-hover:text-[#c9c2ff]">
                      {r.title}
                    </span>
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
