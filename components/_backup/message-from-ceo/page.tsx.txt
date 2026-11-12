import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero/page-hero";
import { SiteFooter } from "@/components/sections/site-footer/site-footer";

export const metadata: Metadata = {
  title: "Message From CEO | TechBuzz",
  description: "A message from the CEO of TechBuzz, a digital marketing agency in Lahore.",
};

// Placeholder: only the hero for now. The message itself comes next.
export default function MessageFromCeo() {
  return (
    <main className="bg-[#030712]">
      <PageHero
        content={{
          eyebrow: "Message from CEO",
          lines: ["Why we do", "what we do"],
          sub: "A few words from our founder on how TechBuzz started and where we are going.",
        }}
      />
      <SiteFooter />
    </main>
  );
}
