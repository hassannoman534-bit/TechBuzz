export type TunnelCard = {
  /** Small caption on the card, e.g. the project name */
  label: string;
  /** Image in /public (any ratio, it is cropped to the card). Leave out for a brand gradient placeholder. */
  src?: string;
  /** Placeholder gradient [from, to] when there is no image */
  tint?: [string, string];
};

export type TunnelHeroContent = {
  eyebrow: string;
  /** Headline, one string per line (2 lines like the reference) */
  lines: string[];
  sub: string;
  /** Small cue at the bottom */
  cue: string;
  cards: TunnelCard[];
};

export const tunnelHeroContent: TunnelHeroContent = {
  eyebrow: "( Brand · Build · Growth )",
  lines: ["Brands & experiences", "worth remembering."],
  sub: "Strategy, design, engineering and growth marketing for restaurants, retail and technology brands. Lahore to worldwide, since 2019.",
  cue: "Scroll to explore",
  // 14 cards fly through the corridor. Replace with real work images (portrait or square crops look best).
  cards: [
    { label: "Sultan Yakhni Pulao", src: "/assets/portfolio/sultan-yakhni-pulao.webp" },
    { label: "FoodBuzz", tint: ["#251d5c", "#7b61ff"] },
    { label: "SHAFAQ Surgical", tint: ["#0f3242", "#22a8ff"] },
    { label: "Qissah", tint: ["#0f3a2e", "#2cf5b0"] },
    { label: "Branding", tint: ["#2a1840", "#c86bff"] },
    { label: "Social Media", tint: ["#13223f", "#5b7cff"] },
    { label: "Web Development", tint: ["#0e2e2a", "#22d8ff"] },
    { label: "Paid Ads", tint: ["#30121f", "#ff5a8a"] },
    { label: "Content Production", tint: ["#2b1d12", "#ffb347"] },
    { label: "SEO", tint: ["#122a1c", "#2cf5b0"] },
    { label: "AI Content", tint: ["#1d1846", "#22d8ff"] },
    { label: "YouTube", tint: ["#30121a", "#ff4d4d"] },
    { label: "App Development", tint: ["#13223f", "#7b61ff"] },
    { label: "Product Photography", tint: ["#2a2410", "#e8c26b"] },
  ],
};
