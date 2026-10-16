import type { Metadata } from "next";
import { PortfolioIntro } from "@/components/sections/portfolio-intro/portfolio-intro";
import { FeaturedWork } from "@/components/sections/featured-work/featured-work";
import { SiteFooter } from "@/components/sections/site-footer/site-footer";

export const metadata: Metadata = {
  title: "Portfolio | TechBuzz",
  description: "Selected brand, social, web and app work by TechBuzz, a digital agency in Lahore.",
};

export default function PortfolioPage() {
  return (
    <main className="bg-[#030712]">
      <PortfolioIntro />
      <FeaturedWork />
      <SiteFooter />
    </main>
  );
}
