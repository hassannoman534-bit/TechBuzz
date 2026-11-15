import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero/page-hero";
import { ServicesShowcase } from "@/components/sections/services-showcase/services-showcase";
import { showcaseContent } from "@/components/sections/services-showcase/services-showcase.config";
import { SiteFooter } from "@/components/sections/site-footer/site-footer";

export const metadata: Metadata = {
  title: "Services | TechBuzz",
  description:
    "Social media, paid ads, content production, branding, AI content, SEO, web development and YouTube by TechBuzz, a digital marketing agency in Lahore.",
};

export default function ServicesPage() {
  return (
    <main className="bg-[#030712]">
      <PageHero content={showcaseContent.hero} />
      <ServicesShowcase className="pt-0" />
      <SiteFooter />
    </main>
  );
}
