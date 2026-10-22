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
  logo?: { src: string; width?: number; height?: number };
  /** Optical size fine tune for one logo (1 = default). */
  scale?: number;
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
    // All logos use the trimmed copies (cropped tight to the artwork); width/height are the trimmed sizes.
    // Badge-style logos (solid fill): keep their own colours, otherwise the white filter makes a white box.
    { name: "iTechTics",                   logo: { src: "/assets/logos/trimmed/itechtics.png",            width: 383, height: 87 },  mono: false },
    { name: "WebTech.dev",                 logo: { src: "/assets/logos/trimmed/webtech-dev.png",          width: 401, height: 85 } },
    { name: "AK Studios",                  logo: { src: "/assets/logos/trimmed/client-15.png",            width: 303, height: 251 } },
    { name: "Bold Security Group",         logo: { src: "/assets/logos/trimmed/client-17.png",            width: 121, height: 52 } },
    { name: "West End Technical Services", logo: { src: "/assets/logos/trimmed/client-18.png",            width: 389, height: 104 } },
    { name: "Window Price Online",         logo: { src: "/assets/logos/trimmed/window-price-online.png",  width: 371, height: 131 } },
    { name: "AMTS Dubai",                  logo: { src: "/assets/logos/trimmed/amts-dubai.png",           width: 362, height: 98 } },
    { name: "AMA Energy Solar",            logo: { src: "/assets/logos/trimmed/ama-energy-solar.png",     width: 322, height: 169 } },
    { name: "Secure Glaze",                logo: { src: "/assets/logos/trimmed/secure-glaze.png",         width: 339, height: 200 } },
    { name: "Mall One Wazirabad",          logo: { src: "/assets/logos/trimmed/mall-one-wazirabad.png",   width: 357, height: 103 } },
    { name: "Stronger Forever",            logo: { src: "/assets/logos/trimmed/stronger-forverer.png",    width: 326, height: 327 } },
    { name: "Apex Cart",                   logo: { src: "/assets/logos/trimmed/apex-cart.png",            width: 339, height: 341 } },
    // The rest flip in one at a time.
    { name: "Ertex Cart LLC",              logo: { src: "/assets/logos/trimmed/ertex-cart-llc.png",       width: 394, height: 101 } },
    { name: "Earn Flex",                   logo: { src: "/assets/logos/trimmed/earn-flex.png",            width: 392, height: 78 } },
    { name: "A1A Global Ground",           logo: { src: "/assets/logos/trimmed/a1a-global-ground.png",    width: 352, height: 208 }, mono: false },
    { name: "Zircoon Solutions",           logo: { src: "/assets/logos/trimmed/client-19.png",            width: 125, height: 42 } },
    { name: "LoveNils",                    logo: { src: "/assets/logos/trimmed/lovenils.png",             width: 135, height: 85 } },
    { name: "YK",                          logo: { src: "/assets/logos/trimmed/yk.png",                   width: 262, height: 299 } },
    { name: "HS",                          logo: { src: "/assets/logos/trimmed/client-12.png",            width: 250, height: 297 } },
  ],
};
