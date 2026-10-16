export type PortfolioIntroContent = {
  eyebrow: string;
  /** 2 to 3 bold words, centred */
  heading: string;
  /** Light version of the logo for dark backgrounds (SVG preferred) */
  logo: { src: string; alt: string };
  /** The two words that split apart on the final panel */
  panel: [string, string];
  scrollHint: string;
};

export const portfolioIntro: PortfolioIntroContent = {
  eyebrow: "Portfolio",
  heading: "Work That Talks.",
  logo: { src: "/images/techbuzz-logo.png", alt: "TechBuzz" },
  panel: ["OUR", "WORK"],
  scrollHint: "Scroll to explore",
};
