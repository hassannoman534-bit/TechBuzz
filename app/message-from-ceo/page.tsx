import type { Metadata } from "next";
import { CeoMessage } from "@/components/sections/ceo-message/ceo-message";
import { SiteFooter } from "@/components/sections/site-footer/site-footer";

export const metadata: Metadata = {
  title: "Message From CEO | TechBuzz",
  description:
    "A message from Usman Shabbir, Chief Executive Officer of TechBuzz, a digital marketing and software agency in Lahore.",
};

export default function MessageFromCeo() {
  return (
    <main className="bg-[#030712]">
      <CeoMessage />
      <SiteFooter />
    </main>
  );
}
