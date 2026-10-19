export type WorkListImage = {
  /** Path in /public (e.g. "/images/work/sultan-pulao.webp") or an allowed remote URL */
  src: string;
  alt: string;
};

export type WorkListItem = {
  title: string;
  /** Short services line on the right, e.g. "Branding & Social" */
  services: string;
  href: string;
  /** Background colour of the floating preview while this project is shown (any CSS colour) */
  color: string;
  /** Leave undefined until the image is ready; the preview shows a tinted placeholder */
  image?: WorkListImage;
};

export type WorkListContent = {
  /** Centred, 2 to 3 words */
  heading: string;
  /** Small label above the list */
  label: string;
  items: WorkListItem[];
  /** Optional button under the list (leave out on the portfolio page itself) */
  more?: { label: string; href: string };
  /** Text inside the round cursor that follows the pointer */
  cursorLabel: string;
};

export const workList: WorkListContent = {
  heading: "Featured Work",
  label: "Recent work",
  cursorLabel: "View",
  items: [
    { title: "Sultan Yakhni Pulao", services: "Branding & Social", href: "/portfolio/sultan-yakhni-pulao", color: "#2a1d0d" },
    { title: "FoodBuzz", services: "Design & Development", href: "/portfolio/foodbuzz", color: "#1b1640" },
    { title: "SHAFAQ Surgical", services: "Branding & Print", href: "/portfolio/shafaq-surgical", color: "#0c2430" },
    { title: "Qissah", services: "Menu Design & Content", href: "/portfolio/qissah", color: "#0d2a22" },
  ],
  // On the home page, add: more: { label: "More work", href: "/portfolio" },
};
