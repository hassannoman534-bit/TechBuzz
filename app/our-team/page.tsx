import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero/page-hero";
import { SiteFooter } from "@/components/sections/site-footer/site-footer";

export const metadata: Metadata = {
  title: "Our Team | TechBuzz",
  description: "Meet the designers, developers and marketers behind TechBuzz, a digital marketing agency in Lahore.",
};

// Placeholder: only the hero for now. The team section comes next.
export default function OurTeam() {
  return (
    <main className="bg-[#030712]">
      <PageHero
        content={{
          eyebrow: "Our team",
          lines: ["The people", "behind the buzz"],
          sub: "Designers, developers and marketers who care about your brand as much as you do.",
        }}
      />
      <SiteFooter />
    </main>
  );
}
