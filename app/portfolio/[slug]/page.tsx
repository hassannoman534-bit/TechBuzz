import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/sections/page-hero/page-hero";
import { CaseFile } from "@/components/sections/case-study/case-file";
import { CaseResults } from "@/components/sections/case-study/case-results";
import { GlassButton } from "@/components/ui/GlassButton";
import { SiteFooter } from "@/components/sections/site-footer/site-footer";
import { getCaseStudy } from "@/components/sections/case-study/case-studies.config";

type CaseStudyProps = { params: Promise<{ slug: string }> };

/*
 * There is deliberately no generateStaticParams here, for the same reason the blog article route
 * has none, arrived at the same way: by measuring the status codes.
 *
 * With generateStaticParams, Next prerenders a partial shell for the [slug] segment and flushes it
 * with HTTP 200 before the dynamic part gets to call notFound(). Measured on `next start`:
 * /portfolio/not-a-client, /portfolio/foodbuzz and /portfolio/qissah all answered 200 with an empty
 * page, and `instant = false` on its own did not change that. Those unready slugs are linked from
 * work-list.config.ts on two pages, so every one of them is crawlable: a soft 200 on an empty page
 * is worse than the 404 they serve today.
 *
 * Without it the route renders on first request and notFound() returns a real 404. The data is a
 * local module, not a network call, so an uncached render costs nothing like a blog article does.
 *
 * `instant = false` is still required: usePathname() in Navbar and atmosphere-controller fails
 * instant-navigation validation on any route that is not fully static.
 */
export const instant = false;

export async function generateMetadata({ params }: CaseStudyProps): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return { title: "Work | TechBuzz" };
  return {
    title: `${study.client} | TechBuzz`,
    description: study.sub,
  };
}

export default async function CaseStudyPage({ params }: CaseStudyProps) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  return (
    /* a <div>, not a <main>: the root layout already renders one around every page */
    <div className="bg-[#030712]">
      <PageHero
        content={{
          eyebrow: study.services,
          lines: study.lines,
          sub: study.sub,
        }}
      />

      <CaseFile study={study} />

      {study.results && <CaseResults results={study.results} />}

      <section className="relative bg-[#030712] px-[clamp(1.25rem,6vw,8rem)] pb-[clamp(5rem,12vh,8rem)]">
        <div className="mx-auto flex max-w-[min(100%,78rem)] flex-col items-start gap-[clamp(1.25rem,3vh,2rem)]">
          <h2 className="max-w-[20ch] text-[clamp(1.75rem,4vw,2.75rem)] font-medium leading-[1.05] tracking-[-0.03em] text-white">
            <span className="font-footer-display">Want a file like this one</span>
          </h2>
          <div className="flex flex-wrap items-center gap-[clamp(0.75rem,1.5vw,1.25rem)]">
            <GlassButton href="/contact" variant="glow" size="lg" data-cursor="magnetic">
              Start a project
            </GlassButton>
            <GlassButton href="/portfolio" variant="secondary" size="lg" data-cursor="magnetic">
              See all work
            </GlassButton>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
