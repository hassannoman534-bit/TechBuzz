import type { FolderSheet } from "@/components/ui/frosted-folder";

export type CaseFact = {
  /** The number as the client's own dashboard shows it. */
  value: string;
  label: string;
  /** Change over the same window, e.g. "+17.5%". */
  delta?: string;
};

export type CaseStudy = {
  slug: string;
  client: string;
  /** Hero heading, one string per line. Two lines reads best. */
  lines: string[];
  /** Short services line, matching work-list.config.ts. */
  services: string;
  /** One sentence under the heading. Grounded in what the work actually was. */
  sub: string;
  /** The folder cover. */
  file: { title: string; subtitle: string; line: string };
  tint: string;
  /** One to four. The folder shows as many artefacts as genuinely exist. */
  sheets: FolderSheet[];
  /** Numbers come from the client's own dashboard; `source` says which and when. */
  results?: { source: string; items: CaseFact[] };
  /**
   * Only a ready study gets a page; the rest stay 404 exactly as they are today.
   * Flip this once the sheets below are real work for that client, not placeholders.
   */
  ready: boolean;
};

const SULTAN_SHEETS: FolderSheet[] = [
  {
    image: "/assets/portfolio/case/sultan-yakhni-pulao/plates.webp",
    alt: "Three plated dishes photographed from above on a patterned green table: a garnished rice platter, a bowl of yakhni pulao and a skewer plate",
    code: "01",
    title: "Food shoot",
    detail: "Plates for the grid",
    fit: "cover",
  },
  {
    image: "/assets/portfolio/case/sultan-yakhni-pulao/profile.webp",
    alt: "The sultanyakhnipulao Instagram profile header, showing 359 posts and 4,749 followers",
    code: "02",
    title: "The grid",
    detail: "359 posts, 4,749 followers",
    fit: "contain",
  },
  {
    image: "/assets/portfolio/case/sultan-yakhni-pulao/insights.webp",
    alt: "Four Instagram insight charts for the account: content interactions, link clicks, profile visits and follows",
    code: "03",
    title: "Insights",
    detail: "Ninety days of account data",
    fit: "contain",
  },
];

export const caseStudies: CaseStudy[] = [
  {
    slug: "sultan-yakhni-pulao",
    client: "Sultan Yakhni Pulao",
    lines: ["Sultan Yakhni", "Pulao"],
    services: "Branding & Social",
    sub: "Branding and social for a pulao house feeding Sialkot, Daska and Lahore.",
    file: { title: "File 01", subtitle: "Branding and social", line: "Sialkot · Daska · Lahore" },
    tint: "#22a8ff",
    sheets: SULTAN_SHEETS,
    // TODO Malik: confirm the year of this window before it goes live. The insights screenshot in
    // the media library shows 10 Jun to 30 Aug on the axis but not the year.
    results: {
      source: "From the account's own Instagram insights, 10 June to 30 August.",
      items: [
        { value: "795.2K", label: "Content interactions", delta: "+17.5%" },
        { value: "24.3K", label: "Profile visits", delta: "+184.2%" },
        { value: "1.5K", label: "New follows", delta: "+147%" },
        { value: "180", label: "Link clicks", delta: "+100%" },
      ],
    },
    ready: true,
  },

  /* The three below are wired and waiting on artwork. Each needs two to four images of real work
     for that client, in /public/assets/portfolio/case/<slug>/, landscape, at least 1200px wide for
     photography and native size for a screenshot. Add them to `sheets`, then set ready: true. The
     page builds itself from there. Until then these slugs 404 exactly as they do today. */
  {
    slug: "foodbuzz",
    client: "FoodBuzz",
    lines: ["FoodBuzz"],
    services: "Design & Development",
    // TODO Malik: one factual sentence about the engagement, in your own voice.
    sub: "Design and development for the restaurant arm of TechBuzz.",
    file: { title: "File 02", subtitle: "Design and development", line: "Lahore" },
    tint: "#7b61ff",
    // TODO Malik: foodbuzzpk.com screens, the brand sheet, a social set.
    sheets: [],
    ready: false,
  },
  {
    slug: "shafaq-surgical",
    client: "SHAFAQ Surgical",
    lines: ["SHAFAQ", "Surgical"],
    services: "Branding & Print",
    // TODO Malik: one factual sentence about the engagement.
    sub: "Branding and print for a surgical instruments maker.",
    file: { title: "File 03", subtitle: "Branding and print", line: "Sialkot" },
    tint: "#5b7cff",
    // TODO Malik: catalogue spreads, the mark, packaging or print.
    sheets: [],
    ready: false,
  },
  {
    slug: "qissah",
    client: "Qissah",
    lines: ["Qissah"],
    services: "Menu Design & Content",
    // TODO Malik: one factual sentence about the engagement.
    sub: "Menu design and content for a Lahore restaurant.",
    file: { title: "File 04", subtitle: "Menu design and content", line: "Lahore" },
    tint: "#2cf5b0",
    // The profile capture is already converted and sitting in /assets/portfolio/case/qissah/.
    // TODO Malik: add the menu spreads, then uncomment the sheet below and set ready: true.
    // {
    //   image: "/assets/portfolio/case/qissah/profile.webp",
    //   alt: "The qissahpk Instagram profile header, showing 470 posts and 5,121 followers",
    //   code: "01",
    //   title: "The grid",
    //   detail: "470 posts, 5,121 followers",
    //   fit: "contain",
    // },
    sheets: [],
    ready: false,
  },
];

export const readyCaseStudies = caseStudies.filter((c) => c.ready && c.sheets.length > 0);

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return readyCaseStudies.find((c) => c.slug === slug);
}
