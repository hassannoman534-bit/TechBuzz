import type { Metadata } from "next";
import { CareersPage } from "@/components/sections/careers/careers-page";
import { SiteFooter } from "@/components/sections/site-footer/site-footer";

export const metadata: Metadata = {
  title: "Careers | TechBuzz",
  description: "Join TechBuzz, a digital marketing agency in Lahore. See open roles in marketing, design, SEO, PPC, content and more.",
};

export default function Careers() {
  return (
    <main className="bg-[#030712]">
      <CareersPage />
      <SiteFooter />
    </main>
  );
}
