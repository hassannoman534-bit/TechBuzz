import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero/page-hero";
import { PricingConfigurator } from "@/components/sections/pricing/pricing-configurator";
import { pricingContent } from "@/components/sections/pricing/pricing.config";
import { SiteFooter } from "@/components/sections/site-footer/site-footer";

export const metadata: Metadata = {
  title: "Pricing | TechBuzz",
  description:
    "Digital marketing pricing packages: social media, paid ads, content production, branding, AI content, SEO, web development and YouTube. Bundle services and save up to 50%.",
};

export default function PricingPage() {
  return (
    <main className="bg-[#030712]">
      <PageHero content={pricingContent.hero} className="md:min-h-[clamp(26rem,60svh,40rem)]" />
      <PricingConfigurator />
      <SiteFooter />
    </main>
  );
}
