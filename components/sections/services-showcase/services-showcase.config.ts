import { pricingContent, type ServiceIcon } from "@/components/sections/pricing/pricing.config";
import type { PageHeroContent } from "@/components/sections/page-hero/page-hero";

/**
 * Services page: the 8 services from the pricing page, shown as a 2 column perspective scroll grid.
 * `id` matches the pricing service id, so labels and "from" prices always follow pricing.config.ts.
 */

export type ShowcaseService = {
  id: ServiceIcon;
  /** Shorter card title when the pricing label is too long for one line */
  name?: string;
  /** Three one word tags, shown on one line under the title */
  tags: [string, string, string];
  /** Portrait image, 4:5 (1200x1500 works best). Leave empty to show the built in art. */
  image?: string;
  /** Two accent colours for the built in art and the hover glow */
  accent: [string, string];
};

export type ShowcaseContent = {
  /** Services page hero */
  hero: PageHeroContent;
  /** Stacked small label above the grid, one word per line */
  label: string[];
  services: ShowcaseService[];
  cta: { lead: string; button: string; href: string };
};

export const showcaseContent: ShowcaseContent = {
  hero: {
    eyebrow: "Services",
    lines: ["Everything your", "brand needs to grow"],
    sub: "Eight services planned together, produced in house and priced in the open.",
  },
  label: ["Eight", "services", "one", "team"],
  services: [
    { id: "smm", tags: ["Reels", "Community", "Analytics"], accent: ["#7b61ff", "#22d8ff"] },
    { id: "ads", tags: ["Meta", "Google", "TikTok"], accent: ["#5b7cff", "#2cf5b0"] },
    { id: "content", tags: ["Photo", "Video", "UGC"], accent: ["#22a8ff", "#7b61ff"] },
    { id: "brand", tags: ["Identity", "Menus", "Guidelines"], accent: ["#c9c2ff", "#5b7cff"] },
    { id: "ai", tags: ["Avatars", "Voice", "Visuals"], accent: ["#2cf5b0", "#7b61ff"] },
    { id: "seo", tags: ["Local", "Technical", "Content"], accent: ["#22d8ff", "#5b7cff"] },
    { id: "web", name: "Web & Automation", tags: ["Websites", "CMS", "Automation"], accent: ["#7b61ff", "#22a8ff"] },
    { id: "yt", tags: ["Videos", "Shorts", "Scripts"], accent: ["#ff5c7a", "#7b61ff"] },
  ],
  cta: { lead: "Know what you need?", button: "Build your package", href: "/pricing" },
};

export type ShowcaseCardData = ShowcaseService & { index: string; title: string; fromPrice: number | null };

/** Joins the showcase copy with the live pricing label and lowest package price. Server side only. */
export function buildShowcaseCards(content: ShowcaseContent = showcaseContent): ShowcaseCardData[] {
  return content.services.map((service, i) => {
    const pricing = pricingContent.services.find((s) => s.id === service.id);
    const prices =
      pricing?.subs.flatMap((sub) => sub.pkgs.map((p) => p.price).filter((p): p is number => p !== null)) ?? [];
    return {
      ...service,
      index: String(i + 1).padStart(2, "0"),
      title: service.name ?? pricing?.label ?? service.id,
      fromPrice: prices.length ? Math.min(...prices) : null,
    };
  });
}
