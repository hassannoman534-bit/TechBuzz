/**
 * Folio showcase (Portfolio page, under the recent work list).
 * One pinned chapter per folio: the cover grows from a small card to full screen while the two title
 * words slide apart, then the rest of the folio drifts past as a film strip.
 *
 * Images come from the portfolio downloader output copied to /public/assets/folio/
 * (its section folders plus manifest.csv). Nothing to list by hand: each image is sorted into a
 * chapter by the page and section it came from on the old techbuzz.com.pk portfolio.
 */

export type FolioRule = {
  /** Old site page slugs, e.g. "portfolio-page-4" */
  pages?: string[];
  /** Words that the section (or folder) name must contain, e.g. "shoot" */
  sections?: string[];
};

export type FolioChapterConfig = {
  id: string;
  /** Two parts that slide apart as the cover expands: ["Web", "folio"] */
  title: [string, string];
  /** Small line under the card, e.g. "Website designs" */
  caption: string;
  /** First matching rule wins (chapters are matched in `matchOrder`, shown in array order) */
  match: FolioRule;
  /** Optional cover file name (as in the folder). Default: the first image. */
  cover?: string;
};

export type FolioShowcaseContent = {
  /** Folder under /public that holds the downloader output */
  root: string;
  /** Folder under /public holding one background image per folio, named by its label (e.g. "Creative Designs.jpg", "Webfolio.jpg") */
  backgroundRoot: string;
  eyebrow: string;
  chapters: FolioChapterConfig[];
  /** Chapter ids in the order they claim images (specific rules first) */
  matchOrder: string[];
  /** Sections that are site chrome on every old portfolio page, never portfolio work */
  ignoreSections: string[];
  /** Max images in each chapter's film strip */
  stripLimit: number;
};

export const folioContent: FolioShowcaseContent = {
  root: "assets/folio",
  backgroundRoot: "assets/BG folios",
  eyebrow: "The folios",
  chapters: [
    { id: "creative", title: ["Creative", "Designs"], caption: "Logos and brand creatives", match: { pages: ["portfolio-page-2"], sections: ["logo", "creative"] } },
    { id: "smm", title: ["SMM", "Creatives"], caption: "UGC, AI and paid ads", match: { pages: ["portfolio-page-3"], sections: ["ugc", "ai-marketing", "google-ads", "smm"] } },
    { id: "shoot", title: ["Shoot", "folio"], caption: "Food, product and corporate shoots", match: { sections: ["shoot"] } },
    { id: "web", title: ["Web", "folio"], caption: "Website designs", match: { pages: ["portfolio-page-4"], sections: ["webfolio", "web-design", "website"] } },
    { id: "seo", title: ["SEO", "Results"], caption: "Rankings, traffic and leads", match: { pages: ["portfolio-page-5"], sections: ["seo"] } },
    { id: "yt", title: ["YouTube", "Automation"], caption: "Channels, thumbnails and growth", match: { pages: ["portfolio-page-6"], sections: ["youtube"] } },
  ],
  matchOrder: ["shoot", "creative", "smm", "web", "seo", "yt"],
  ignoreSections: ["our-clients", "what-we-do", "imagine", "founder", "director", "vision", "about", "backgrounds", "contact", "our-services"],
  stripLimit: 14,
};
