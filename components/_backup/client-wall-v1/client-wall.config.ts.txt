/** How a client name is drawn while there is no logo file yet */
export type WordmarkStyle = "display" | "serif" | "caps" | "mono" | "light";
/** Small mark drawn before a placeholder wordmark, so placeholders read like logos */
export type WordmarkMark = "dot" | "ring" | "square" | "spark" | "none";

export type ClientLogo = {
  name: string;
  /**
   * Logo file in /public (SVG, or PNG with a transparent background).
   * width and height are the file's real pixel size (used for the aspect ratio only).
   * Leave out to show the name as a styled wordmark.
   */
  logo?: { src: string; width: number; height: number };
  /** Turn the logo pure white so every logo matches the wall (default true). Set false for logos that must keep their colours. */
  mono?: boolean;
  /** Placeholder wordmark look (only used when there is no logo file) */
  style?: WordmarkStyle;
  mark?: WordmarkMark;
  /** Optional link, e.g. the client's case study */
  href?: string;
};

export type ClientWallContent = {
  eyebrow: string;
  /** Heading, one string per line */
  lines: string[];
  sub: string;
  /**
   * Number of tiles on the wall (4 per row on desktop, 2 on phones). 8 or 12 work best.
   * When there are more clients than tiles, tiles flip one at a time to show the rest.
   */
  tiles: number;
  clients: ClientLogo[];
};

export const clientWall: ClientWallContent = {
  eyebrow: "Clients",
  lines: ["Brands that", "trust us"],
  sub: "From local favourites to businesses growing abroad, a few of the brands we have built and grown.",
  tiles: 12,
  clients: [
    // Strongest / clearest wordmarks first — these fill the wall before any flipping starts.
    { name: "iTechTics",                   logo: { src: "/assets/logos/iTechTics.png",                 width: 500, height: 500 } },
    { name: "WebTech.dev",                 logo: { src: "/assets/logos/WebTech.dev.png",               width: 500, height: 500 } },
    { name: "AK Studios",                  logo: { src: "/assets/logos/client-15.png",                 width: 500, height: 500 } },
    { name: "Bold Security Group",         logo: { src: "/assets/logos/client-17.png",                 width: 150, height: 150 } },
    { name: "West End Technical Services", logo: { src: "/assets/logos/client-18.png",                 width: 500, height: 500 } },
    { name: "Window Price Online",         logo: { src: "/assets/logos/Window%20Price%20Online.png",   width: 500, height: 500 } },
    { name: "AMTS Dubai",                  logo: { src: "/assets/logos/AMTS%20dubai.png",              width: 500, height: 500 } },
    { name: "AMA Energy Solar",            logo: { src: "/assets/logos/Ama%20Energy%20Solar.png",      width: 500, height: 500 } },
    { name: "Secure Glaze",                logo: { src: "/assets/logos/Secure%20Glaze.png",            width: 500, height: 500 } },
    { name: "Mall One Wazirabad",          logo: { src: "/assets/logos/Mall%20One%20Wazirabad.png",    width: 500, height: 500 } },
    { name: "Stronger Forever",            logo: { src: "/assets/logos/Stronger%20Forverer.png",       width: 500, height: 500 } },
    { name: "Apex Cart",                   logo: { src: "/assets/logos/Apex%20Cart.png",               width: 500, height: 500 } },
    // The rest flip in one at a time.
    { name: "Ertex Cart LLC",              logo: { src: "/assets/logos/Ertex%20Cart%20LLC.png",        width: 500, height: 500 } },
    { name: "Earn Flex",                   logo: { src: "/assets/logos/Earn%20Flex.png",               width: 500, height: 500 } },
    { name: "A1A Global Ground",           logo: { src: "/assets/logos/A1A%20Global%20Ground.png",     width: 500, height: 500 } },
    { name: "Zircoon Solutions",           logo: { src: "/assets/logos/client-19.png",                 width: 135, height: 135 } },
    { name: "LoveNils",                    logo: { src: "/assets/logos/LoveNils.png",                  width: 135, height: 135 } },
    { name: "YK",                          logo: { src: "/assets/logos/YK.png",                        width: 500, height: 500 } },
    { name: "HS",                          logo: { src: "/assets/logos/client-12.png",                 width: 500, height: 500 } },
  ],
};
