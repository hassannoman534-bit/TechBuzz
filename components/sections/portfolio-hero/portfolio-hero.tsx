import { PageHero, type PageHeroContent } from "@/components/sections/page-hero/page-hero";

export const portfolioHero: PageHeroContent = {
  eyebrow: "Portfolio",
  lines: ["Work that talks", "& brands that grow"],
  sub: "Brands, websites and campaigns we have built for businesses ready to stand out and grow.",
};

type PortfolioHeroProps = { content?: PageHeroContent; className?: string };

/** Portfolio opening: the shared page hero (two line heading and a one liner). */
export function PortfolioHero({ content = portfolioHero, className }: PortfolioHeroProps) {
  return <PageHero content={content} className={className} />;
}
