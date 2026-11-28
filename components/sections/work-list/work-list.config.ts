export type WorkListImage = {
  /** Path in /public (e.g. "/images/work/sultan-pulao-1.webp") or an allowed remote URL */
  src: string;
  alt: string;
};

export type WorkListItem = {
  title: string;
  /** Short services line shown next to the title, e.g. "Branding & Social" */
  services: string;
  /** Empty string when there is no case study page yet: the row renders unlinked. */
  href: string;
  /** Tint used for the placeholder cards until real images are added (any CSS colour) */
  color: string;
  /**
   * Up to 3 images for the hover stack, in this order:
   * [0] front card (straight), [1] top card (behind, up and right), [2] bottom card (behind, down and right).
   * Missing ones show a tinted placeholder. Cards are square: use 1:1 images (1200 × 1200 works well).
   */
  images?: WorkListImage[];
};

export type WorkListContent = {
  /** Centred, 2 to 3 words (hidden when the page hero already has a heading) */
  heading: string;
  /** Small label above the list */
  label: string;
  items: WorkListItem[];
  /** Optional button under the list (leave out on the portfolio page itself) */
  more?: { label: string; href: string };
};

export const workList: WorkListContent = {
  heading: "Featured Work",
  label: "Recent work",
  items: [
    // href "" means the case study has no page yet, so the row renders without a link rather than
    // sending anyone to an empty URL. Restore the href as each study is turned on in
    // components/sections/case-study/case-studies.config.ts — the two lists have to agree.
    { title: "Sultan Yakhni Pulao", services: "Branding & Social", href: "/portfolio/sultan-yakhni-pulao", color: "#2a1d0d" },
    { title: "FoodBuzz", services: "Design & Development", href: "", color: "#1b1640" },
    { title: "SHAFAQ Surgical", services: "Branding & Print", href: "", color: "#0c2430" },
    { title: "Qissah", services: "Menu Design & Content", href: "", color: "#0d2a22" },
  ],
  // On the home page, add: more: { label: "More work", href: "/portfolio" },
};
