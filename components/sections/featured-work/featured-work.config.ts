export type WorkImage = {
  /** Path in /public (e.g. "/images/work/sultan-pulao.webp") or an allowed remote URL */
  src: string;
  alt: string;
};

export type WorkItem = {
  title: string;
  /** Short service tags, rendered uppercase and joined with a bullet */
  tags: string[];
  href: string;
  /** Leave undefined until the image is ready; the card shows a styled empty slot */
  image?: WorkImage;
  /** RGB triplet that tints the empty slot so each card has its own mood */
  tint: string;
};

export type FeaturedWorkContent = {
  /** Centred, 2 to 3 words */
  heading: string;
  items: WorkItem[];
};

export const featuredWork: FeaturedWorkContent = {
  heading: "Featured Work",
  items: [
    {
      title: "Sultan Yakhni Pulao",
      tags: ["Branding", "Social", "Web", "App"],
      href: "/portfolio/sultan-yakhni-pulao",
      tint: "245 166 35",
    },
    {
      title: "FoodBuzz",
      tags: ["Strategy", "Design", "Development"],
      href: "/portfolio/foodbuzz",
      tint: "123 97 255",
    },
    {
      title: "SHAFAQ Surgical",
      tags: ["Branding", "Catalogue", "Print"],
      href: "/portfolio/shafaq-surgical",
      tint: "34 216 255",
    },
    {
      title: "Qissah",
      tags: ["Menu Design", "Content", "Social"],
      href: "/portfolio/qissah",
      tint: "44 245 176",
    },
  ],
};
