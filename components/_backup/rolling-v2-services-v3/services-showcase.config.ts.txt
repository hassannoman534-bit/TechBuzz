import { pricingContent, type ServiceIcon } from "@/components/sections/pricing/pricing.config";
import type { PageHeroContent } from "@/components/sections/page-hero/page-hero";

/**
 * Services page: the 8 services from the pricing page, shown as a 2 column perspective scroll grid.
 * `id` matches the pricing service id, so labels and "from" prices always follow pricing.config.ts.
 */

export type ShowcaseService = {
  id: ServiceIcon;
  /** One short line under the title */
  blurb: string;
  /** Three short tags shown on the card */
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
    {
      id: "smm",
      blurb: "Feeds people stop for. Daily content, reels and community care that keep your brand in the conversation.",
      tags: ["Reels", "Community", "Analytics"],
      accent: ["#7b61ff", "#22d8ff"],
    },
    {
      id: "ads",
      blurb: "Meta, Google and TikTok campaigns built around orders, bookings and leads, not likes.",
      tags: ["Meta", "Google", "TikTok"],
      accent: ["#5b7cff", "#2cf5b0"],
    },
    {
      id: "content",
      blurb: "Food shoots, product photography and short video produced in house, made for the scroll.",
      tags: ["Photo", "Video", "UGC"],
      accent: ["#22a8ff", "#7b61ff"],
    },
    {
      id: "brand",
      blurb: "Names, logos, menus and visual systems that make your business instantly recognisable.",
      tags: ["Identity", "Menus", "Guidelines"],
      accent: ["#c9c2ff", "#5b7cff"],
    },
    {
      id: "ai",
      blurb: "AI avatars, voiceovers and generated visuals that multiply your content without multiplying cost.",
      tags: ["Avatars", "Voice", "Visuals"],
      accent: ["#2cf5b0", "#7b61ff"],
    },
    {
      id: "seo",
      blurb: "Local and global search that puts your brand first when hungry, ready customers look.",
      tags: ["Local", "Technical", "Content"],
      accent: ["#22d8ff", "#5b7cff"],
    },
    {
      id: "web",
      blurb: "Fast websites, ordering flows and automations that turn visits into sales while you sleep.",
      tags: ["Websites", "CMS", "Automation"],
      accent: ["#7b61ff", "#22a8ff"],
    },
    {
      id: "yt",
      blurb: "Full channel management, long videos, shorts, thumbnails and scripts that grow real audiences.",
      tags: ["Long form", "Shorts", "Scripts"],
      accent: ["#ff5c7a", "#7b61ff"],
    },
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
      title: pricing?.label ?? service.id,
      fromPrice: prices.length ? Math.min(...prices) : null,
    };
  });
}
