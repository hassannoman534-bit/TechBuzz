import type { Metadata } from "next";
import { PricingConfigurator } from "@/components/sections/pricing/pricing-configurator";
import { SiteFooter } from "@/components/sections/site-footer/site-footer";

export const metadata: Metadata = {
  title: "Pricing | TechBuzz",
  description:
    "Digital marketing pricing packages: social media, paid ads, content production, branding, AI content, SEO, web development and YouTube. Bundle services and save up to 50%.",
};

export default function PricingPage() {
  return (
    <main className="bg-[#030712]">
      <PricingConfigurator />
      <SiteFooter />
    </main>
  );
}
